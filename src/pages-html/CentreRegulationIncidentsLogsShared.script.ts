// Ce préambule doit être exécuté avant le script historique. Il transforme
// chaque écriture du journal local existant en entrée d'audit serveur signée.
export const auditLogBridgePrelude = String.raw`
(function(){
  "use strict";
  if(window.__tteAuditStorageBridgeInstalled) return;
  window.__tteAuditStorageBridgeInstalled = true;

  var nativeSetItem = Storage.prototype.setItem;
  Storage.prototype.setItem = function(key, value){
    var previous = null;
    if(key === "tte_log"){
      try { previous = this.getItem(key); } catch(e) {}
    }

    var result = nativeSetItem.call(this, key, value);
    if(key !== "tte_log") return result;

    try {
      var before = JSON.parse(previous || "[]");
      var after = JSON.parse(String(value || "[]"));
      if(!Array.isArray(before) || !Array.isArray(after)) return result;

      var known = {};
      before.forEach(function(entry){
        known[String(entry.ts || "") + "|" + String(entry.who || "") + "|" + String(entry.text || "")] = true;
      });

      after.slice(0, 10).forEach(function(entry){
        var signature =
          String(entry.ts || "") + "|" + String(entry.who || "") + "|" + String(entry.text || "");
        if(known[signature] || !entry.text) return;
        fetch("/api/audit-logs", {
          method:"POST",
          headers:{ "Content-Type":"application/json" },
          body:JSON.stringify({
            text:String(entry.text),
            source:"centre_regulation"
          })
        }).catch(function(error){
          console.error("[audit-logs/bridge]", error);
        });
      });
    } catch(error) {
      console.error("[audit-logs/bridge]", error);
    }
    return result;
  };
})();
`;

export const incidentsLogsSharedScript = String.raw`
(function(){
  "use strict";

  var incidents = [];
  var auditLogs = [];
  var incidentsLoading = false;
  var logsLoading = false;
  var canViewLogs = window.__tteCanViewAuditLogs === true;
  var incForm = document.getElementById("incForm");
  var legacyIncSave = document.getElementById("incSave");
  var legacyLogClear = document.getElementById("logClear");

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
    clearTimeout(window.__tteIncidentsLogsToastTimer);
    window.__tteIncidentsLogsToastTimer = setTimeout(function(){
      toast.classList.remove("show");
    }, 3000);
  }

  async function api(url, options){
    var response = await fetch(url, options || {
      headers:{ "Accept":"application/json" },
      cache:"no-store"
    });
    var json = await response.json().catch(function(){ return {}; });
    if(!response.ok || !json.ok) throw new Error(json.reason || "request_failed");
    return json;
  }

  var incidentLabels = {
    incivilite:"Incivilité",
    agression:"Agression",
    accident:"Accident voyageur",
    malaise:"Malaise médical",
    degradation:"Dégradation",
    intrusion:"Intrusion voies",
    bagage:"Bagage suspect",
    fraude:"Tentative de fraude",
    materiel:"Avarie matériel",
    autre:"Autre"
  };

  function renderIncidents(){
    var container = document.getElementById("incList");
    if(!container) return;
    container.innerHTML = "";

    if(incidentsLoading){
      container.innerHTML = '<div class="pub-empty">Chargement de la main courante partagée…</div>';
      return;
    }
    if(!incidents.length){
      container.innerHTML = '<div class="pub-empty">Aucun évènement consigné.</div>';
      return;
    }

    incidents.slice(0, 100).forEach(function(item){
      var severity = item.grav === "alert" ? "alert" : (item.grav === "warn" ? "warn" : "info");
      var label = incidentLabels[item.type] || item.type || "Évènement";
      var date = new Date(item.ts);
      var element = document.createElement("div");
      element.className = "pub sev-" + severity;
      element.innerHTML =
        '<span class="ln" style="background:var(--' +
          (severity === "alert" ? "alert" : severity === "warn" ? "warn" : "blue") +
        ')">' + esc(label.slice(0, 5).toUpperCase()) + '</span>' +
        '<div class="body">' +
          '<div class="tt">' + esc(label) + ' · ' + esc(item.lieu) + '</div>' +
          '<div class="ms">' + esc(item.desc) + '</div>' +
          '<div class="meta">' +
            '<span><b>Mesures :</b> ' + esc(item.mes) + '</span>' +
            '<span><b>Secours :</b> ' + esc(item.sec) + '</span>' +
            '<span><b>Suite :</b> ' + esc(item.suit) + '</span>' +
            '<span><b>Voyageurs :</b> ' + esc(item.pax) + '</span>' +
            '<span><b>Agent :</b> ' + esc(item.agent) + '</span>' +
            '<span>' + esc(date.toLocaleString("fr-FR")) + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="acts"><button class="btn danger sm" data-shared-delete>Retirer</button></div>';

      var remove = element.querySelector("[data-shared-delete]");
      remove.addEventListener("click", async function(){
        if(!confirm("Retirer cet évènement pour tous les agents ?")) return;
        remove.disabled = true;
        try {
          await api("/api/incidents?id=" + encodeURIComponent(item.id), {
            method:"DELETE"
          });
          notifyShared("Évènement retiré de la main courante partagée", "ok");
          await loadIncidents();
        } catch(error) {
          console.error("[incidents/delete]", error);
          notifyShared("Impossible de retirer cet évènement", "err");
          remove.disabled = false;
        }
      });
      container.appendChild(element);
    });
  }

  async function loadIncidents(){
    if(incidentsLoading) return;
    incidentsLoading = true;
    renderIncidents();
    try {
      var json = await api("/api/incidents");
      incidents = Array.isArray(json.records) ? json.records : [];
    } catch(error) {
      console.error("[incidents/list]", error);
      notifyShared("Impossible de charger la main courante partagée", "err");
    } finally {
      incidentsLoading = false;
      renderIncidents();
    }
  }

  if(incForm && legacyIncSave){
    var sharedIncSave = legacyIncSave.cloneNode(true);
    legacyIncSave.parentNode.replaceChild(sharedIncSave, legacyIncSave);
    sharedIncSave.addEventListener("click", async function(event){
      event.preventDefault();
      var data = new FormData(incForm);
      var description = String(data.get("desc") || "").trim();
      if(!description){
        notifyShared("Description requise", "err");
        return;
      }

      sharedIncSave.disabled = true;
      try {
        await api("/api/incidents", {
          method:"POST",
          headers:{ "Content-Type":"application/json" },
          body:JSON.stringify({
            type:data.get("type"),
            grav:data.get("grav"),
            lieu:data.get("lieu"),
            pax:Number(data.get("pax") || 0),
            desc:description,
            mes:data.get("mes") || "",
            sec:data.get("sec"),
            suit:data.get("suit")
          })
        });
        incForm.reset();
        notifyShared("Évènement visible par tous les agents", "ok");
        await loadIncidents();
      } catch(error) {
        console.error("[incidents/create]", error);
        notifyShared("Impossible d’enregistrer l’évènement partagé", "err");
      } finally {
        sharedIncSave.disabled = false;
      }
    });
  }

  function populateEmployeeFilter(){
    var select = document.getElementById("logEmployeeFilter");
    if(!select) return;
    var selected = select.value;
    var employees = {};
    auditLogs.forEach(function(item){
      employees[item.agentId || item.who] = item.who;
    });
    select.innerHTML = '<option value="">Tous les employés</option>';
    Object.keys(employees)
      .sort(function(a, b){ return employees[a].localeCompare(employees[b], "fr"); })
      .forEach(function(id){
        var option = document.createElement("option");
        option.value = id;
        option.textContent = employees[id];
        select.appendChild(option);
      });
    select.value = selected;
  }

  function renderLogs(){
    var list = document.getElementById("logList");
    if(!list || !canViewLogs) return;
    var select = document.getElementById("logEmployeeFilter");
    var employee = select ? select.value : "";
    var rows = employee
      ? auditLogs.filter(function(item){ return (item.agentId || item.who) === employee; })
      : auditLogs;

    if(logsLoading){
      list.innerHTML = '<li style="grid-template-columns:1fr;color:var(--muted);text-align:center;padding:1.5rem">Chargement du journal partagé…</li>';
      return;
    }
    if(!rows.length){
      list.innerHTML = '<li style="grid-template-columns:1fr;color:var(--muted);text-align:center;padding:1.5rem">Aucune action enregistrée.</li>';
      return;
    }

    list.innerHTML = rows.map(function(item){
      var date = new Date(item.ts);
      return '<li>' +
        '<span class="t" title="' + esc(date.toLocaleString("fr-FR")) + '">' +
          esc(date.toLocaleDateString("fr-FR") + " " +
            String(date.getHours()).padStart(2, "0") + ":" +
            String(date.getMinutes()).padStart(2, "0")) +
        '</span>' +
        '<span class="who">' + esc(item.who) + '</span>' +
        '<span class="ev">' + esc(item.text) + '</span>' +
      '</li>';
    }).join("");
  }

  async function loadLogs(){
    if(!canViewLogs || logsLoading) return;
    logsLoading = true;
    renderLogs();
    try {
      var json = await api("/api/audit-logs");
      auditLogs = Array.isArray(json.records) ? json.records : [];
      populateEmployeeFilter();
    } catch(error) {
      console.error("[audit-logs/list]", error);
      notifyShared("Impossible de charger le journal partagé", "err");
    } finally {
      logsLoading = false;
      renderLogs();
    }
  }

  var employeeFilter = document.getElementById("logEmployeeFilter");
  if(employeeFilter){
    employeeFilter.addEventListener("change", renderLogs);
  }
  var logRefresh = document.getElementById("logRefresh");
  if(logRefresh){
    logRefresh.addEventListener("click", loadLogs);
  }

  if(legacyLogClear){
    var sharedLogClear = legacyLogClear.cloneNode(true);
    legacyLogClear.parentNode.replaceChild(sharedLogClear, legacyLogClear);
    sharedLogClear.addEventListener("click", async function(){
      if(!canViewLogs || !confirm("Vider tout le journal partagé ?")) return;
      sharedLogClear.disabled = true;
      try {
        await api("/api/audit-logs", { method:"DELETE" });
        notifyShared("Journal partagé vidé", "ok");
        await loadLogs();
      } catch(error) {
        console.error("[audit-logs/clear]", error);
        notifyShared("Impossible de vider le journal partagé", "err");
      } finally {
        sharedLogClear.disabled = false;
      }
    });
  }

  document.querySelectorAll('aside.side nav a[data-view="incid"]').forEach(function(link){
    link.addEventListener("click", loadIncidents);
  });
  document.querySelectorAll('aside.side nav a[data-view="log"]').forEach(function(link){
    link.addEventListener("click", loadLogs);
  });

  loadIncidents();
  if(canViewLogs) loadLogs();

  clearInterval(window.__tteIncidentsSharedTimer);
  window.__tteIncidentsSharedTimer = setInterval(function(){
    var view = document.getElementById("v-incid");
    if(view && view.classList.contains("show")) loadIncidents();
  }, 12000);

  clearInterval(window.__tteAuditLogsSharedTimer);
  window.__tteAuditLogsSharedTimer = setInterval(function(){
    var view = document.getElementById("v-log");
    if(canViewLogs && view && view.classList.contains("show")) loadLogs();
  }, 12000);
})();
`;
