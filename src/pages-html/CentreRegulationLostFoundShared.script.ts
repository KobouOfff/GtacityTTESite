export const lostFoundSharedScript = String.raw`
(function(){
  "use strict";

  var records = [];
  var loading = false;
  var form = document.getElementById("lstForm");
  var legacySave = document.getElementById("lstSave");
  if(!form || !legacySave) return;

  var quiMeBtn = document.getElementById("lstQuiMe");
  var quiInput = form.querySelector('[name="qui"]');
  if(quiMeBtn && quiInput){
    quiMeBtn.addEventListener("click", function(){
      var name = "";
      try { name = localStorage.getItem("tte_agent_name") || ""; } catch(e) {}
      quiInput.value = name || "Agent TTE";
      quiInput.focus();
    });
  }

  function esc(value){
    var node = document.createElement("div");
    node.textContent = String(value == null ? "" : value);
    return node.innerHTML;
  }

  function notifyShared(message, type){
    var toast = document.getElementById("toast");
    if(!toast) return;
    toast.className = "toast show " + (type || "");
    toast.textContent = message;
    clearTimeout(window.__tteLostFoundToastTimer);
    window.__tteLostFoundToastTimer = setTimeout(function(){
      toast.classList.remove("show");
    }, 3000);
  }

  async function api(url, options){
    var response = await fetch(url, options || {
      headers:{ "Accept":"application/json" },
      cache:"no-store"
    });
    var json = await response.json().catch(function(){ return {}; });
    if(!response.ok || !json.ok){
      var err = new Error(json.reason || "request_failed");
      err.status = response.status;
      err.reason = json.reason || "request_failed";
      throw err;
    }
    return json;
  }

  // Traduit une erreur API en message compréhensible pour l'agent, au lieu
  // d'un message générique qui masque la vraie cause (ex. session expirée,
  // champ invalide, erreur serveur…).
  function apiErrorMessage(error, fallback){
    var reason = error && error.reason;
    var status = error && error.status;
    if(status === 401 || reason === "not_logged_in"){
      return "Session expirée — reconnecte-toi avec Discord puis réessaie.";
    }
    if(reason === "invalid_fields"){
      return "Champs invalides — vérifie la catégorie, le lieu et la description.";
    }
    if(reason === "bad_json" || reason === "bad_id"){
      return "Requête invalide — recharge la page et réessaie.";
    }
    return fallback + (reason ? " (" + reason + ")" : "");
  }

  function statusColors(status){
    if(status === "Restitué") return { fg:"var(--ok)", bg:"var(--ok-bg)" };
    if(status === "Transféré") return { fg:"var(--muted)", bg:"var(--bg-alt)" };
    return { fg:"#8A5A12", bg:"var(--warn-bg)" };
  }

  function render(){
    var body = document.getElementById("lstBody");
    if(!body) return;
    body.innerHTML = "";

    if(loading){
      body.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--muted);padding:1.5rem">Chargement des objets partagés…</td></tr>';
      return;
    }
    if(!records.length){
      body.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--muted);padding:1.5rem">Aucun objet enregistré.</td></tr>';
      return;
    }

    records.forEach(function(item){
      var date = new Date(item.ts);
      var colors = statusColors(item.st);
      var row = document.createElement("tr");
      row.innerHTML =
        '<td style="font-family:var(--ff-mono);font-size:12.5px">' +
          esc(date.toLocaleDateString("fr-FR")) +
        '</td>' +
        '<td><b>' + esc(item.cat) + '</b></td>' +
        '<td>' + esc(item.desc) +
          '<div style="font-size:11.5px;color:var(--muted)">trouvé par ' +
            esc(item.qui) +
          '</div>' +
        '</td>' +
        '<td>' + esc(item.lieu) + '</td>' +
        '<td style="font-family:var(--ff-mono)">' + esc(item.cas) + '</td>' +
        '<td><span style="background:' + colors.bg + ';color:' + colors.fg +
          ';font-weight:700;font-size:12px;padding:3px 8px;border-radius:6px">' +
          esc(item.st) +
        '</span></td>' +
        '<td>' +
          (item.st === "Restitué" ? "" : '<button class="btn ok sm" data-shared-rest>Restitué</button> ') +
          '<button class="btn ghost sm" data-shared-delete>×</button>' +
        '</td>';

      var rest = row.querySelector("[data-shared-rest]");
      if(rest) rest.addEventListener("click", async function(){
        rest.disabled = true;
        try {
          await api("/api/lost-found", {
            method:"PATCH",
            headers:{ "Content-Type":"application/json" },
            body:JSON.stringify({ id:item.id, status:"Restitué" })
          });
          notifyShared("Objet marqué restitué pour tous les agents", "ok");
          await loadRecords();
        } catch(error) {
          console.error("[lost-found/update]", error);
          notifyShared(apiErrorMessage(error, "Impossible de modifier cet objet"), "err");
          rest.disabled = false;
        }
      });

      var remove = row.querySelector("[data-shared-delete]");
      if(remove) remove.addEventListener("click", async function(){
        if(!confirm("Supprimer cet objet pour tous les agents ?")) return;
        remove.disabled = true;
        try {
          await api("/api/lost-found?id=" + encodeURIComponent(item.id), {
            method:"DELETE"
          });
          notifyShared("Objet supprimé pour tous les agents", "ok");
          await loadRecords();
        } catch(error) {
          console.error("[lost-found/delete]", error);
          notifyShared(apiErrorMessage(error, "Impossible de supprimer cet objet"), "err");
          remove.disabled = false;
        }
      });
      body.appendChild(row);
    });
  }

  async function loadRecords(){
    if(loading) return;
    loading = true;
    render();
    try {
      var json = await api("/api/lost-found");
      records = Array.isArray(json.records) ? json.records : [];
      try {
        localStorage.setItem("tte_lost", JSON.stringify(records));
      } catch(e) {}
    } catch(error) {
      console.error("[lost-found/list]", error);
      notifyShared(apiErrorMessage(error, "Impossible de charger les objets partagés"), "err");
    } finally {
      loading = false;
      render();
    }
  }

  var sharedSave = legacySave.cloneNode(true);
  legacySave.parentNode.replaceChild(sharedSave, legacySave);
  sharedSave.addEventListener("click", async function(event){
    event.preventDefault();
    var data = new FormData(form);
    var description = String(data.get("desc") || "").trim();
    if(!description){
      notifyShared("Description requise", "err");
      return;
    }

    sharedSave.disabled = true;
    try {
      await api("/api/lost-found", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({
          cat:data.get("cat"),
          lieu:data.get("lieu"),
          qui:data.get("qui"),
          cas:data.get("cas"),
          desc:description
        })
      });
      form.reset();
      notifyShared("Objet enregistré pour tous les agents", "ok");
      await loadRecords();
    } catch(error) {
      console.error("[lost-found/create]", error);
      notifyShared(apiErrorMessage(error, "Impossible d’enregistrer cet objet"), "err");
    } finally {
      sharedSave.disabled = false;
    }
  });

  document.querySelectorAll('aside.side nav a[data-view="lost"]').forEach(function(link){
    link.addEventListener("click", function(){ loadRecords(); });
  });

  loadRecords();
  window.__tteLostFoundRefreshTimer = setInterval(function(){
    var view = document.getElementById("v-lost");
    if(view && view.classList.contains("show")) loadRecords();
  }, 15000);
})();
`;
