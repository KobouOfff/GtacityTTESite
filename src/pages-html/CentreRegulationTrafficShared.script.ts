export const trafficSharedScript = String.raw`
(function(){
  "use strict";

  var records = [];
  var loading = false;
  var form = document.getElementById("quickForm");
  var oldPublish = document.getElementById("quickPublish");

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
    clearTimeout(window.__tteTrafficToastTimer);
    window.__tteTrafficToastTimer = setTimeout(function(){
      toast.classList.remove("show");
    }, 3000);
  }

  function severityMeta(severity){
    if(severity === "alert") return { cls:"alert", label:"Alerte" };
    if(severity === "warn") return { cls:"warn", label:"Info trafic" };
    return { cls:"info", label:"Information" };
  }

  function active(record){
    return !record.until || new Date(record.until).getTime() > Date.now();
  }

  function saveCache(){
    try {
      localStorage.setItem("tte_publications", JSON.stringify(records));
    } catch(e) {}
  }

  async function api(url, options){
    var response = await fetch(url, options || {
      headers: { "Accept":"application/json" },
      cache: "no-store"
    });
    var json = await response.json().catch(function(){ return {}; });
    if(!response.ok || !json.ok) throw new Error(json.reason || "request_failed");
    return json;
  }

  function publicationElement(record){
    var meta = severityMeta(record.severity);
    var expired = !active(record);
    var lineColor = record.line
      ? "var(--l-" + String(record.line).toLowerCase() + ")"
      : "var(--muted)";
    var until = record.until
      ? "jusqu'au " + new Date(record.until).toLocaleString("fr-FR", {
          day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit"
        })
      : "sans échéance";
    var channels = [];
    if(record.channels){
      if(record.channels.web) channels.push("Web");
      if(record.channels.screen) channels.push("Panneaux");
      if(record.channels.app) channels.push("App");
      if(record.channels.audio) channels.push("Audio");
    }

    var element = document.createElement("div");
    element.className = "pub sev-" + meta.cls;
    element.style.opacity = expired ? ".55" : "1";
    element.innerHTML =
      '<span class="ln" style="background:' + lineColor + '">' +
        esc(record.line || "RÉSEAU") +
      '</span>' +
      '<div class="body">' +
        '<div class="tt">' + esc(record.title) +
          (expired ? ' <span style="font-size:11px;color:var(--muted);font-weight:600">· EXPIRÉ</span>' : '') +
        '</div>' +
        '<div class="ms">' + esc(record.message) + '</div>' +
        '<div class="meta">' +
          '<span><b>Gravité :</b> ' + esc(meta.label) + '</span>' +
          '<span><b>Validité :</b> ' + esc(until) + '</span>' +
          '<span><b>Canaux :</b> ' + esc(channels.join(", ") || "—") + '</span>' +
          '<span><b>Par :</b> ' + esc(record.author) + '</span>' +
          '<span><b>Émise :</b> ' +
            esc(new Date(record.createdAt).toLocaleString("fr-FR", {
              day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit"
            })) +
          '</span>' +
        '</div>' +
      '</div>' +
      '<div class="acts">' +
        (expired ? '' : '<button class="btn ghost sm" data-shared-extend>+ 1 h</button>') +
        '<button class="btn danger sm" data-shared-remove>Retirer</button>' +
      '</div>';

    var remove = element.querySelector("[data-shared-remove]");
    if(remove) remove.addEventListener("click", async function(){
      if(!confirm("Retirer cette publication pour tous les utilisateurs ?")) return;
      remove.disabled = true;
      try {
        await api("/api/traffic?id=" + encodeURIComponent(record.id), { method:"DELETE" });
        notifyShared("Publication retirée pour tous les utilisateurs", "ok");
        await loadRecords();
      } catch(error) {
        console.error("[traffic/delete]", error);
        notifyShared("Impossible de retirer la publication", "err");
        remove.disabled = false;
      }
    });

    var extend = element.querySelector("[data-shared-extend]");
    if(extend) extend.addEventListener("click", async function(){
      extend.disabled = true;
      var base = record.until ? new Date(record.until).getTime() : Date.now();
      try {
        await api("/api/traffic", {
          method:"PATCH",
          headers:{ "Content-Type":"application/json" },
          body:JSON.stringify({
            id:record.id,
            until:new Date(base + 3600000).toISOString()
          })
        });
        notifyShared("Publication prolongée d'une heure", "ok");
        await loadRecords();
      } catch(error) {
        console.error("[traffic/update]", error);
        notifyShared("Impossible de prolonger la publication", "err");
        extend.disabled = false;
      }
    });

    return element;
  }

  function renderList(container, list, emptyText){
    if(!container) return;
    container.innerHTML = "";
    if(!list.length){
      container.innerHTML = '<div class="pub-empty">' + esc(emptyText) + '</div>';
      return;
    }
    list.forEach(function(record){
      container.appendChild(publicationElement(record));
    });
  }

  function renderKpis(){
    var current = records.filter(active);
    var lines = {};
    current.forEach(function(record){
      if(record.line) lines[record.line] = true;
    });
    var last = records[0];
    var pubs = document.getElementById("kpiPubs");
    var lineCount = document.getElementById("kpiLines");
    var lineBadge = document.getElementById("kpiLinesBadge");
    var lastTime = document.getElementById("kpiLast");
    var lastBadge = document.getElementById("kpiLastBadge");
    if(pubs) pubs.textContent = String(current.length);
    if(lineCount) lineCount.textContent = String(Object.keys(lines).length);
    if(lineBadge) lineBadge.textContent = Object.keys(lines).length ? "À surveiller" : "RAS";
    if(last && lastTime && lastBadge){
      lastTime.textContent = new Date(last.createdAt).toLocaleTimeString("fr-FR", {
        hour:"2-digit", minute:"2-digit"
      });
      lastBadge.textContent = (last.line || "Réseau") + " · " + severityMeta(last.severity).label;
    } else {
      if(lastTime) lastTime.textContent = "—";
      if(lastBadge) lastBadge.textContent = "—";
    }
  }

  function render(){
    renderList(
      document.getElementById("dashPubs"),
      records.filter(active),
      "Aucune publication active. Le trafic est nominal."
    );
    renderList(
      document.getElementById("allPubs"),
      records,
      "Aucune publication."
    );
    renderKpis();
  }

  async function loadRecords(){
    if(loading) return;
    loading = true;
    try {
      var json = await api("/api/traffic");
      records = Array.isArray(json.records) ? json.records : [];
      saveCache();
      render();
    } catch(error) {
      console.error("[traffic/list]", error);
      var dashboard = document.getElementById("dashPubs");
      var all = document.getElementById("allPubs");
      var message = '<div class="pub-empty" style="color:var(--alert)">Impossible de charger les infos trafic partagées.</div>';
      if(dashboard) dashboard.innerHTML = message;
      if(all) all.innerHTML = message;
    } finally {
      loading = false;
    }
  }

  if(oldPublish && form){
    var publish = oldPublish.cloneNode(true);
    oldPublish.replaceWith(publish);
    publish.addEventListener("click", async function(){
      var data = new FormData(form);
      var title = String(data.get("title") || "").trim();
      var message = String(data.get("message") || "").trim();
      if(!title || !message){
        notifyShared("Titre et message requis", "err");
        return;
      }
      var untilValue = String(data.get("until") || "");
      publish.disabled = true;
      try {
        var json = await api("/api/traffic", {
          method:"POST",
          headers:{ "Content-Type":"application/json" },
          body:JSON.stringify({
            line:String(data.get("line") || ""),
            severity:String(data.get("severity") || "warn"),
            title:title,
            message:message,
            until:untilValue ? new Date(untilValue).toISOString() : "",
            channels:{
              web:form.querySelector('[name="ch-web"]').checked,
              screen:form.querySelector('[name="ch-screen"]').checked,
              app:form.querySelector('[name="ch-app"]').checked,
              audio:form.querySelector('[name="ch-audio"]').checked
            }
          })
        });
        notifyShared("Publication diffusée et partagée", "ok");
        form.reset();
        records.unshift(json.record);
        saveCache();
        render();
      } catch(error) {
        console.error("[traffic/create]", error);
        notifyShared("Impossible de diffuser l'info trafic", "err");
      } finally {
        publish.disabled = false;
      }
    });
  }

  document.querySelectorAll('aside.side nav a[data-view="pub"]').forEach(function(link){
    link.addEventListener("click", function(){ loadRecords(); });
  });

  clearInterval(window.__tteTrafficCenterTimer);
  window.__tteTrafficCenterTimer = setInterval(loadRecords, 15000);
  loadRecords();
})();
`;
