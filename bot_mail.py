"""
Bot Discord <-> DeoMail

- En DM : un employé peut envoyer un email via !mail (assistant pas à pas)
- Un admin (permission "Administrateur" sur le serveur) peut lier un membre
  Discord à une adresse DeoMail avec !register @membre adresse@domaine.com
- !whoami affiche l'adresse email actuellement liée à l'utilisateur
- Toutes les 30 secondes, le bot vérifie les nouveaux mails non lus via
  GET /v1/emails (poll_inbox) et les transmet en DM à l'employé concerné,
  puis les marque comme lus.
"""
import asyncio
import base64
import io
import os
import re
import threading

import discord
from discord.ext import commands, tasks
from dotenv import load_dotenv

import employees
from mail_templates import TEMPLATES, LABELS, get_template
from deomail_client import (
    send_email,
    list_unread_inbox,
    get_email,
    download_attachment,
    mark_email_read,
    DeoMailError,
)

load_dotenv()

DISCORD_TOKEN = os.environ.get("DISCORD_TOKEN")
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

intents = discord.Intents.default()
intents.message_content = True
intents.members = True

bot = commands.Bot(command_prefix="!", intents=intents)

# Dernier mail reçu par employé (discord_id -> {"from", "subject"}),
# utilisé par !reply. Perdu si le bot redémarre (en mémoire uniquement).
LAST_RECEIVED = {}


def is_dm(ctx):
    return isinstance(ctx.channel, discord.DMChannel)


async def _ask_attachments_and_send(ctx, check, from_addr, to_addr, subject, body):
    """Demande si l'employé veut joindre un fichier, puis envoie le mail.
    Factorisé pour être utilisé par !mail et !reply."""
    await ctx.send(
        "📎 Veux-tu joindre un fichier ou une image ? Envoie-le maintenant "
        "(jusqu'à 5 fichiers, 10 Mo au total) ou tape `non`."
    )
    try:
        msg = await bot.wait_for("message", check=check, timeout=300)
    except asyncio.TimeoutError:
        await ctx.send("⏱️ Temps écoulé, envoi annulé.")
        return

    attachments_payload = []
    if msg.attachments:
        if len(msg.attachments) > 5:
            await ctx.send("⚠️ 5 fichiers maximum, envoi annulé.")
            return
        total_size = sum(a.size for a in msg.attachments)
        if total_size > 10 * 1024 * 1024:
            await ctx.send("⚠️ 10 Mo maximum au total, envoi annulé.")
            return
        for att in msg.attachments:
            try:
                content_bytes = await att.read()
            except discord.HTTPException as e:
                await ctx.send(f"⚠️ Impossible de récupérer {att.filename} : {e}")
                return
            attachments_payload.append({
                "filename": att.filename,
                "content": base64.b64encode(content_bytes).decode("ascii"),
                "contentType": att.content_type or "application/octet-stream",
            })

    await ctx.send("⏳ Envoi en cours...")
    try:
        await asyncio.to_thread(send_email, from_addr, to_addr, subject, body, attachments_payload or None)
    except DeoMailError as e:
        await ctx.send(f"❌ Échec de l'envoi : {e}")
        return
    await ctx.send(f"✅ Mail envoyé à **{to_addr}** !")


@bot.event
async def on_ready():
    print(f"Connecté en tant que {bot.user} (id: {bot.user.id})")
    if not poll_inbox.is_running():
        poll_inbox.start()


@bot.command(name="whoami")
async def whoami(ctx):
    email = employees.get_email_by_discord_id(ctx.author.id)
    if email:
        await ctx.send(f"Ton adresse mail liée est : **{email}**")
    else:
        await ctx.send(
            "Aucune adresse mail n'est liée à ton compte Discord. "
            "Demande à un administrateur de t'enregistrer avec `!register`."
        )


@bot.command(name="register")
@commands.has_permissions(administrator=True)
async def register(ctx, member: discord.Member, email: str):
    """Usage (admin, dans un salon du serveur) : !register @membre adresse@domaine.com"""
    email = email.strip().lower()
    if not EMAIL_RE.match(email):
        await ctx.send("⚠️ Adresse email invalide.")
        return
    emp = employees.upsert_employee(member.id, member.display_name, email)
    await ctx.send(f"✅ {member.mention} est maintenant lié à **{emp['email']}**")


@register.error
async def register_error(ctx, error):
    if isinstance(error, commands.MissingPermissions):
        await ctx.send("⛔ Seul un administrateur peut utiliser cette commande.")
    elif isinstance(error, commands.BadArgument):
        await ctx.send("⚠️ Usage : `!register @membre adresse@domaine.com`")
    else:
        await ctx.send(f"⚠️ Erreur : {error}")


@bot.command(name="unregister")
@commands.has_permissions(administrator=True)
async def unregister(ctx, member: discord.Member):
    ok = employees.remove_employee(member.id)
    if ok:
        await ctx.send(f"✅ {member.mention} a été délié.")
    else:
        await ctx.send("Cet utilisateur n'était pas enregistré.")


@bot.command(name="mail")
async def mail(ctx):
    """Assistant pas à pas pour envoyer un email depuis Discord (DM uniquement)."""
    if not is_dm(ctx):
        await ctx.send("📩 Envoie-moi cette commande en message privé pour rédiger un mail.")
        return

    from_addr = employees.get_email_by_discord_id(ctx.author.id)
    if not from_addr:
        await ctx.send(
            "Aucune adresse mail n'est liée à ton compte Discord. "
            "Demande à un administrateur de t'enregistrer avec `!register`."
        )
        return

    def check(m):
        return m.author == ctx.author and isinstance(m.channel, discord.DMChannel)

    await ctx.send(f"✉️ Tu écris depuis **{from_addr}**.\nÀ quelle adresse veux-tu envoyer ? (ou `annuler`)")
    try:
        msg = await bot.wait_for("message", check=check, timeout=300)
    except asyncio.TimeoutError:
        await ctx.send("⏱️ Temps écoulé, envoi annulé.")
        return
    if msg.content.strip().lower() == "annuler":
        await ctx.send("Envoi annulé.")
        return
    to_addr = msg.content.strip().lower()
    if not EMAIL_RE.match(to_addr):
        await ctx.send("⚠️ Adresse invalide, envoi annulé. Relance `!mail` pour recommencer.")
        return

    template_list = "\n".join(f"**{t['id']}.** {t['title']}" for t in TEMPLATES)
    await ctx.send(
        f"📋 Choisis un modèle de mail (tape le numéro), ou tape `0` pour "
        f"rédiger un mail libre :\n\n{template_list}\n\n**0.** Mail libre (rédiger moi-même)"
    )
    try:
        msg = await bot.wait_for("message", check=check, timeout=300)
    except asyncio.TimeoutError:
        await ctx.send("⏱️ Temps écoulé, envoi annulé.")
        return

    choice = msg.content.strip()
    if not choice.isdigit():
        await ctx.send("⚠️ Réponds avec un numéro. Envoi annulé, relance `!mail` pour recommencer.")
        return
    choice = int(choice)

    if choice == 0:
        await ctx.send("Quel est l'objet du mail ?")
        try:
            msg = await bot.wait_for("message", check=check, timeout=300)
        except asyncio.TimeoutError:
            await ctx.send("⏱️ Temps écoulé, envoi annulé.")
            return
        subject = msg.content.strip()

        await ctx.send("Écris le corps du message (un seul message, tout le texte) :")
        try:
            msg = await bot.wait_for("message", check=check, timeout=600)
        except asyncio.TimeoutError:
            await ctx.send("⏱️ Temps écoulé, envoi annulé.")
            return
        body = msg.content
    else:
        template = get_template(choice)
        if not template:
            await ctx.send("⚠️ Numéro de modèle inconnu. Envoi annulé, relance `!mail` pour recommencer.")
            return

        # Trouve tous les {placeholders} du modèle (objet + corps), dans l'ordre.
        combined = template["subject"] + "\n" + template["body"]
        placeholders = list(dict.fromkeys(re.findall(r"\{(\w+)\}", combined)))

        values = {}
        for ph in placeholders:
            label = LABELS.get(ph, ph.replace("_", " ").capitalize())
            await ctx.send(f"✏️ {label} ?")
            try:
                msg = await bot.wait_for("message", check=check, timeout=300)
            except asyncio.TimeoutError:
                await ctx.send("⏱️ Temps écoulé, envoi annulé.")
                return
            values[ph] = msg.content.strip()

        subject = template["subject"].format(**values)
        body = template["body"].format(**values)

        await ctx.send(f"📄 **Aperçu :**\n**Objet :** {subject}\n\n{body}")

    await _ask_attachments_and_send(ctx, check, from_addr, to_addr, subject, body)


@bot.command(name="reply")
async def reply(ctx):
    """Répond directement au dernier mail reçu (DM uniquement)."""
    if not is_dm(ctx):
        await ctx.send("📩 Envoie-moi cette commande en message privé pour répondre à un mail.")
        return

    from_addr = employees.get_email_by_discord_id(ctx.author.id)
    if not from_addr:
        await ctx.send(
            "Aucune adresse mail n'est liée à ton compte Discord. "
            "Demande à un administrateur de t'enregistrer avec `!register`."
        )
        return

    last = LAST_RECEIVED.get(str(ctx.author.id))
    if not last or not last.get("from"):
        await ctx.send("Tu n'as reçu aucun mail pour l'instant, impossible de répondre.")
        return

    to_addr = last["from"].strip().lower()
    original_subject = last.get("subject") or ""
    subject = original_subject if original_subject.lower().startswith("re:") else f"Re: {original_subject}"

    def check(m):
        return m.author == ctx.author and isinstance(m.channel, discord.DMChannel)

    await ctx.send(
        f"↩️ Réponse à **{to_addr}** — objet : *{subject}*.\n"
        "Écris le corps du message (un seul message, tout le texte) :"
    )
    try:
        msg = await bot.wait_for("message", check=check, timeout=600)
    except asyncio.TimeoutError:
        await ctx.send("⏱️ Temps écoulé, envoi annulé.")
        return
    body = msg.content

    await _ask_attachments_and_send(ctx, check, from_addr, to_addr, subject, body)


def _extract_email_fields(email_obj: dict):
    """Essaie plusieurs noms de champs possibles pour un objet email DeoMail."""
    def first(keys, default=""):
        for k in keys:
            if k in email_obj and email_obj[k]:
                return email_obj[k]
        return default

    to_field = first(["to", "recipient", "to_addrs"])
    if isinstance(to_field, list):
        to_addr = to_field[0] if to_field else ""
    else:
        to_addr = to_field

    from_field = first(["from", "sender", "from_addr"])
    subject = first(["subject"])
    body = first(["text", "body", "plain", "body_text"]) or first(["html", "body_html"])
    email_id = first(["id", "email_id", "_id"])
    raw_attachments = first(["attachments"], default=[]) or []
    return email_id, to_addr, from_field, subject, body, raw_attachments


async def notify_incoming_email(to_email: str, from_email: str, subject: str, body: str, attachments=None):
    """Envoie un DM à l'employé correspondant à l'adresse destinataire.

    attachments (optionnel) : liste de discord.File déjà téléchargées, jointes
    au DM pour que l'employé puisse les voir (images) et les télécharger.
    """
    discord_id = employees.get_discord_id_by_email(to_email)
    if not discord_id:
        print(f"[inbox] Aucun employé trouvé pour l'adresse {to_email}, mail ignoré.")
        return

    LAST_RECEIVED[discord_id] = {"from": from_email, "subject": subject}

    try:
        user = await bot.fetch_user(int(discord_id))
    except (discord.NotFound, discord.HTTPException) as e:
        print(f"[inbox] Impossible de trouver l'utilisateur Discord {discord_id} : {e}")
        return

    embed = discord.Embed(title=subject or "(sans objet)", description=(body or "(vide)")[:4000])
    embed.add_field(name="De", value=from_email or "?", inline=True)
    embed.add_field(name="À", value=to_email, inline=True)
    if attachments:
        embed.add_field(
            name="📎 Pièce(s) jointe(s)",
            value=f"{len(attachments)} fichier(s) joint(s) ci-dessous",
            inline=False,
        )
    embed.set_footer(text="Nouveau mail reçu · Réponds avec !reply")
    try:
        await user.send(embed=embed, files=attachments or None)
    except discord.Forbidden:
        print(f"[inbox] Impossible d'envoyer un DM à {discord_id} (DMs fermés ?).")


@tasks.loop(seconds=30)
async def poll_inbox():
    """Vérifie périodiquement les nouveaux mails non lus et les transmet sur Discord."""
    try:
        new_emails = await asyncio.to_thread(list_unread_inbox, 50)
    except DeoMailError as e:
        print(f"[inbox] Erreur lors de la récupération des mails : {e}")
        return

    for email_obj in new_emails:
        email_id, to_addr, from_addr, subject, body, _ = _extract_email_fields(email_obj)
        if not to_addr:
            print(f"[inbox] Email sans destinataire reconnu, ignoré : {email_obj}")
            continue

        # La liste ne contient pas le corps ni les pièces jointes du mail :
        # on va chercher l'email complet pour avoir le vrai texte et savoir
        # s'il y a des fichiers/images à transmettre.
        raw_attachments = []
        if email_id:
            try:
                full_email = await asyncio.to_thread(get_email, email_id)
                _, _, _, full_subject, full_body, raw_attachments = _extract_email_fields(full_email)
                subject = full_subject or subject
                body = full_body or body
            except DeoMailError as e:
                print(f"[inbox] Impossible de récupérer le détail de l'email {email_id} : {e}")

        discord_files = []
        for att in raw_attachments:
            att_id = att.get("id") or att.get("attachment_id")
            if not att_id:
                continue
            try:
                filename, mime_type, content_bytes = await asyncio.to_thread(
                    download_attachment, email_id, att_id
                )
                discord_files.append(discord.File(io.BytesIO(content_bytes), filename=filename))
            except DeoMailError as e:
                print(f"[inbox] Impossible de télécharger la pièce jointe {att_id} : {e}")

        await notify_incoming_email(to_addr, from_addr, subject, body, attachments=discord_files)
        if email_id:
            try:
                await asyncio.to_thread(mark_email_read, email_id)
            except DeoMailError as e:
                print(f"[inbox] Impossible de marquer l'email {email_id} comme lu : {e}")


@poll_inbox.before_loop
async def before_poll_inbox():
    await bot.wait_until_ready()


def start_webhook_server_in_thread():
    """
    Lance un petit serveur Flask (juste /health) dans un thread séparé.
    Utile pour que Render considère le service comme "up" (il attend un
    port HTTP ouvert). Peut aussi recevoir un vrai webhook DeoMail si tu
    en configures un un jour (route /webhook/deomail déjà prête).
    """
    from webhook_server import create_app

    def run():
        app = create_app(bot_loop=bot.loop, notify_coro=notify_incoming_email)
        port = int(os.environ.get("PORT", 5000))
        app.run(host="0.0.0.0", port=port)

    t = threading.Thread(target=run, daemon=True)
    t.start()


if __name__ == "__main__":
    if not DISCORD_TOKEN:
        raise SystemExit("DISCORD_TOKEN manquant dans le fichier .env")

    @bot.event
    async def on_connect():
        start_webhook_server_in_thread()

    bot.run(DISCORD_TOKEN)
