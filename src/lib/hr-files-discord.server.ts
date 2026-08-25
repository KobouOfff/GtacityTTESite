// Crée / met à jour le fil Discord ("Dossier RH - NOM PRENOM") associé à
// un dossier RH dans le salon "dossier personnel" (DISCORD_HR_CHANNEL_ID).
//
// Patron identique à blacklist-discord.server.ts : appels REST directs à
// l'API Discord avec le bot token, pas de dépendance discord.js.

import type { HrEmployeeFileRow } from "./hr-files.server";

export type HrDiscordSyncResult =
  | { status: "sent"; threadId: string; messageId: string }
  | { status: "skipped" }
  | { status: "failed" };

function truncate(value: string, length: number) {
  return value.length > length ? `${value.slice(0, length - 1)}…` : value;
}

function field(value: string | null | undefined) {
  const v = (value ?? "").trim();
  return v.length > 0 ? truncate(v, 1024) : "—";
}

function displayDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function safeThreadName(row: HrEmployeeFileRow) {
  const nom = (row.nom || "").trim().toUpperCase();
  const prenom = (row.prenom || "").trim();
  const fallback = row.employee_display_name || row.employee_username || row.employee_discord_id;
  const label = nom || prenom ? `${prenom} ${nom}`.trim() : fallback;
  // Discord limite les noms de fil à 100 caractères.
  return truncate(`Dossier RH - ${label}`, 100);
}

function section(title: string) {
  // Séparateur de section : occupe toute la largeur de l'embed (inline:false)
  // et sert uniquement de titre visuel, sans valeur.
  return { name: title, value: "\u200b", inline: false };
}

function buildEmbed(row: HrEmployeeFileRow) {
  return {
    allowed_mentions: { parse: [] },
    embeds: [
      {
        title: `📁 Dossier RH — ${row.prenom ?? ""} ${(row.nom ?? "").toUpperCase()}`.trim(),
        color: 0x2563eb,
        fields: [
          section("🪪 1) État Civil"),
          { name: "Prénom", value: field(row.prenom), inline: true },
          { name: "Nom", value: field(row.nom), inline: true },
          { name: "Genre", value: field(row.genre), inline: true },
          { name: "Date de naissance", value: displayDate(row.date_naissance), inline: true },
          { name: "Situation familiale", value: field(row.situation_familiale), inline: true },
          { name: "Discord", value: field(row.employee_username) + `\nID : ${row.employee_discord_id}`, inline: true },

          section("📞 2) Coordonnées"),
          { name: "Téléphone(s)", value: field(row.telephones), inline: true },
          { name: "Adresse", value: field(row.adresse), inline: true },

          section("🔑 3) Historique dans l'Entreprise"),
          { name: "Date d'entrée", value: displayDate(row.date_entree), inline: true },
          { name: "Poste(s) actuel(s)", value: field(row.postes_actuels), inline: false },

          section("🗓️ 4) Congés et Absences"),
          { name: "Congés pris", value: field(row.conges_pris), inline: true },
          { name: "Congés restants", value: row.conges_restants != null ? String(row.conges_restants) : "—", inline: true },
          { name: "Absences", value: field(row.absences), inline: false },
          { name: "Arrêts maladie", value: field(row.arrets_maladie), inline: false },

          section("📑 5) Discipline et Incidents"),
          { name: "Avertissements", value: field(row.avertissements), inline: false },
          { name: "Sanctions", value: field(row.sanctions), inline: false },

          section("🗒️ 6) Notes Internes"),
          { name: "Appréciation RH", value: field(row.appreciation_rh), inline: false },
          { name: "Observation RH", value: field(row.observation_rh), inline: false },
          { name: "Objectifs", value: field(row.objectifs), inline: false },
          { name: "Règlement intérieur", value: row.reglement_interne_ack ? "✅ Signé" : "❌ Non signé", inline: true },

          section("✅ 7) Signatures et Tampon"),
          { name: "Signataire RH", value: field(row.signature_rh_nom), inline: true },
          { name: "Date de signature", value: displayDate(row.signature_rh_date), inline: true },
          { name: "Tampon", value: row.tampon ? "✅" : "❌", inline: true },
        ],
        footer: {
          text: `Mis à jour par ${row.updated_by_username ?? "?"} • Townsend Transit Express`,
        },
        timestamp: row.updated_at,
      },
    ],
  };
}

/**
 * Crée (si besoin) le fil Discord du dossier et y poste/actualise le
 * message récapitulatif. Retourne les IDs à persister sur la ligne
 * hr_employee_files (discord_thread_id / discord_summary_message_id).
 */
export async function syncHrFileToDiscord(
  row: HrEmployeeFileRow,
): Promise<HrDiscordSyncResult> {
  const token = process.env.DISCORD_BOT_TOKEN?.trim();
  const channelId = process.env.DISCORD_HR_CHANNEL_ID?.trim();

  if (!token || !channelId) {
    console.warn(
      "[hr-files/discord] Synchro ignorée : DISCORD_BOT_TOKEN ou DISCORD_HR_CHANNEL_ID absent.",
    );
    return { status: "skipped" };
  }

  const authHeaders = {
    Authorization: `Bot ${token}`,
    "Content-Type": "application/json",
  };

  try {
    let threadId = row.discord_thread_id ?? null;
    let messageId = row.discord_summary_message_id ?? null;

    // 1) Fil déjà existant : on vérifie rapidement qu'il est toujours valide
    //    (sinon on retombe sur la création ci-dessous).
    if (threadId) {
      const check = await fetch(`https://discord.com/api/v10/channels/${threadId}`, {
        headers: { Authorization: `Bot ${token}` },
      });
      if (!check.ok) {
        threadId = null;
        messageId = null;
      }
    }

    const embedPayload = buildEmbed(row);

    // 2) Pas de fil (premier enregistrement, ou fil invalide) : le salon
    //    1484614182946082898 est un salon de FORUM (poster un message brut
    //    dedans est refusé par Discord — erreur 50008). Sur un forum, un
    //    nouveau sujet = un nouveau fil créé directement, message d'ouverture
    //    inclus dans le même appel.
    if (!threadId) {
      const threadRes = await fetch(
        `https://discord.com/api/v10/channels/${encodeURIComponent(channelId)}/threads`,
        {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            name: safeThreadName(row),
            auto_archive_duration: 10080, // 7 jours
            message: embedPayload,
          }),
        },
      );
      if (!threadRes.ok) {
        console.error(
          `[hr-files/discord] Échec création fil forum: ${threadRes.status} ${await threadRes.text()}`,
        );
        return { status: "failed" };
      }
      const thread = (await threadRes.json()) as { id: string; message?: { id: string } };
      threadId = thread.id;
      // La création d'un fil forum renvoie le channel + le message de départ
      // (champ "message"). On le récupère pour pouvoir l'éditer plus tard.
      messageId = thread.message?.id ?? null;

      return {
        status: "sent",
        threadId,
        messageId: messageId ?? "",
      };
    }

    // 3) Fil déjà existant : on édite (ou reposte si besoin) le message récap.
    if (messageId) {
      const editRes = await fetch(
        `https://discord.com/api/v10/channels/${threadId}/messages/${messageId}`,
        { method: "PATCH", headers: authHeaders, body: JSON.stringify(embedPayload) },
      );
      if (!editRes.ok) messageId = null; // on retombe sur un nouveau message ci-dessous
    }

    if (!messageId) {
      const postRes = await fetch(
        `https://discord.com/api/v10/channels/${threadId}/messages`,
        { method: "POST", headers: authHeaders, body: JSON.stringify(embedPayload) },
      );
      if (!postRes.ok) {
        console.error(
          `[hr-files/discord] Échec envoi récap: ${postRes.status} ${await postRes.text()}`,
        );
        return { status: "failed" };
      }
      const posted = (await postRes.json()) as { id: string };
      messageId = posted.id;
    }

    return { status: "sent", threadId, messageId };
  } catch (error) {
    console.error("[hr-files/discord] Échec de la synchro :", error);
    return { status: "failed" };
  }
}
