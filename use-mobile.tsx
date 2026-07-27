
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --navy:#0E2A5E; --navy-2:#0A2148;
  --blue:#1A50B0; --blue-700:#143F8C; --blue-300:#4B92DD; --blue-50:#EAF1FB;
  --ink:#16202E; --ink-2:#27333F; --muted:#5C6B7D;
  --line:#DCE4EE; --line-2:#EBF0F6; --bg:#FFFFFF; --bg-alt:#F4F8FC;
  --ok:#1E7E45; --ok-bg:#E5F3EA; --alert:#C5362B; --alert-bg:#FBE7E4;
  --ff-head:'Libre Franklin','Franklin Gothic Medium',system-ui,sans-serif;
  --ff-body:'Source Sans 3',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;
  --shadow:0 1px 2px rgba(16,32,62,.06),0 8px 24px rgba(16,32,62,.07);
}
body{font-family:var(--ff-body);color:var(--ink);background:var(--bg-alt);min-height:100vh;display:flex;flex-direction:column;-webkit-font-smoothing:antialiased;line-height:1.55}
a{color:var(--blue-700);text-decoration:none}
a:hover{text-decoration:underline}
svg{display:block}
:focus-visible{outline:3px solid var(--blue-300);outline-offset:2px;border-radius:3px}

/* Barre haute */
.bar{background:var(--navy);color:#fff}
.bar-in{max-width:1180px;margin:0 auto;padding:11px 1.6rem;display:flex;align-items:center;justify-content:space-between;gap:1rem}
.bar .brand{display:flex;align-items:center;gap:12px}
.bar .logo{width:104px;height:30px}
.bar .who{font-family:var(--ff-head);font-weight:800;font-size:13px;letter-spacing:.4px;border-left:1px solid rgba(255,255,255,.22);padding-left:12px}
.bar .back{font-size:13px;color:rgba(255,255,255,.85);display:inline-flex;align-items:center;gap:7px}
.bar .back:hover{color:#fff;text-decoration:none}

/* Bandeau accès réservé */
.restricted{background:var(--alert-bg);border-bottom:1px solid #F2CFCB;color:#7E261C;font-size:13px}
.restricted-in{max-width:1180px;margin:0 auto;padding:8px 1.6rem;display:flex;align-items:center;gap:9px}
.restricted svg{flex-shrink:0}

/* Corps */
main{flex:1;display:flex;align-items:center;justify-content:center;padding:2.6rem 1.6rem}
.panel{width:100%;max-width:1000px;background:#fff;border:1px solid var(--line);border-radius:18px;overflow:hidden;box-shadow:var(--shadow);display:grid;grid-template-columns:1.1fr 1fr}

/* Présentation (gauche) */
.intro{background:linear-gradient(150deg,#0A2148,#143F8C);color:#fff;padding:2.6rem 2.4rem;position:relative;overflow:hidden}
.intro::after{content:"";position:absolute;right:-80px;top:-80px;width:320px;height:320px;border-radius:50%;background:radial-gradient(circle,rgba(75,146,221,.28),transparent 65%)}
.intro .eyebrow{position:relative;font-family:var(--ff-head);font-weight:700;font-size:12px;letter-spacing:1.4px;text-transform:uppercase;color:#8FB3EC;display:inline-flex;align-items:center;gap:8px}
.intro .eyebrow::before{content:"";width:20px;height:3px;border-radius:2px;background:currentColor}
.intro h1{position:relative;font-family:var(--ff-head);font-weight:800;font-size:1.85rem;letter-spacing:-.5px;margin:.8rem 0;line-height:1.1}
.intro p{position:relative;font-size:14.5px;color:#C9D8EF;line-height:1.6;max-width:42ch}
.mods{position:relative;display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:1.8rem}
.mod{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);border-radius:11px;padding:13px 14px;display:flex;gap:11px;align-items:flex-start}
.mod svg{flex-shrink:0;color:#8FB3EC;margin-top:1px}
.mod b{font-family:var(--ff-head);font-weight:700;font-size:13.5px;color:#fff;display:block}
.mod span{font-size:11.5px;color:#AFC8F0}
.intro .foot-note{position:relative;margin-top:1.8rem;font-size:12px;color:#9FB8E0;display:flex;align-items:center;gap:8px}

/* Formulaire (droite) */
.login{padding:2.6rem 2.4rem;display:flex;flex-direction:column;justify-content:center}
.login .lock{width:50px;height:50px;border-radius:13px;background:var(--blue-50);color:var(--blue);display:flex;align-items:center;justify-content:center;margin-bottom:1.1rem}
.login h2{font-family:var(--ff-head);font-weight:800;font-size:1.5rem;color:var(--navy)}
.login .sub{font-size:14px;color:var(--muted);margin:.4rem 0 1.6rem}
.field{margin-bottom:1rem}
.field label{display:block;font-family:var(--ff-head);font-size:12px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:var(--muted);margin-bottom:6px}
.in{position:relative}
.in .ic{position:absolute;left:13px;top:50%;transform:translateY(-50%);color:var(--muted)}
.in input{width:100%;border:1.5px solid var(--line);border-radius:10px;background:#fff;padding:12px 13px 12px 40px;font:inherit;font-size:15px;color:var(--ink);outline:none;transition:border-color .16s}
.in input:focus{border-color:var(--blue)}
.in .toggle{position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--muted);padding:6px;border-radius:6px}
.in .toggle:hover{background:var(--bg-alt)}
.row{display:flex;align-items:center;justify-content:space-between;gap:1rem;margin:.2rem 0 1.3rem}
.remember{display:inline-flex;align-items:center;gap:8px;font-size:13.5px;color:var(--ink-2);cursor:pointer;user-select:none}
.remember input{width:16px;height:16px;accent-color:var(--blue)}
.row a{font-size:13.5px;font-weight:600}
.btn{font-family:var(--ff-head);font-weight:700;cursor:pointer;border:none;border-radius:10px;background:var(--blue);color:#fff;font-size:15px;padding:13px;width:100%;display:inline-flex;align-items:center;justify-content:center;gap:8px;transition:background .16s}
.btn:hover{background:var(--blue-700)}
.msg{display:none;margin-top:1rem;border-radius:10px;padding:11px 13px;font-size:13.5px;align-items:flex-start;gap:9px}
.msg.show{display:flex}
.msg.err{background:var(--alert-bg);color:#7E261C;border:1px solid #F2CFCB}
.msg.info{background:var(--blue-50);color:var(--navy);border:1px solid #CFE0F7}
.msg svg{flex-shrink:0;margin-top:1px}
.help{margin-top:1.5rem;padding-top:1.2rem;border-top:1px solid var(--line-2);font-size:12.5px;color:var(--muted)}
.help a{font-weight:600}

footer{background:var(--navy-2);color:#9FB8E0;font-size:12.5px}
footer .f-in{max-width:1180px;margin:0 auto;padding:1.2rem 1.6rem;display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap}
footer a{color:#C9D8EF}

@media (max-width:820px){
  .panel{grid-template-columns:1fr;max-width:460px}
  .intro{display:none}
}
@media (max-width:480px){
  .bar .who{display:none}
  .login{padding:2rem 1.5rem}
}

/* Session Discord */
.discord-prof{display:flex;align-items:center;gap:13px;border:1.5px solid #BFE0C9;background:var(--ok-bg);border-radius:13px;padding:1rem 1.1rem;margin-bottom:1.1rem}
.discord-prof .av{width:46px;height:46px;border-radius:10px;flex-shrink:0;overflow:hidden;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.2);object-fit:cover}
.discord-prof .av.fallback{display:grid;place-items:center;background:var(--blue);color:#fff;font-family:var(--ff-head);font-weight:800;font-size:18px}
.discord-prof .meta{flex:1;min-width:0}
.discord-prof .meta .nm{font-family:var(--ff-head);font-weight:800;font-size:15px;color:var(--navy)}
.discord-prof .meta .st{font-size:12px;color:#157A40;font-weight:700;display:inline-flex;align-items:center;gap:5px}
.discord-prof .meta .sid{font-size:12px;color:var(--muted);font-variant-numeric:tabular-nums;margin-top:1px}
.discord-prof .dx{background:#fff;border:1px solid var(--line);border-radius:8px;color:var(--muted);font-size:12px;font-weight:600;padding:7px 11px;cursor:pointer;white-space:nowrap}
.discord-prof .dx:hover{border-color:var(--blue);color:var(--blue-700);text-decoration:none}
.staff-actions{display:grid;gap:10px;margin-top:.5rem}
.tool-btn{font-family:var(--ff-head);font-weight:700;cursor:pointer;border:1px solid var(--line);border-radius:10px;background:#fff;color:var(--navy);font-size:14px;padding:12px;width:100%;text-align:left;transition:border-color .16s,background .16s}
.tool-btn:hover{border-color:var(--blue-300);background:var(--blue-50)}
.discord-tip{font-size:11.5px;color:var(--muted);margin-top:1rem;display:flex;gap:7px;align-items:flex-start;line-height:1.5}
.discord-tip svg{flex-shrink:0;margin-top:1px;color:var(--blue)}
