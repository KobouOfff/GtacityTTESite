export const trafficPublicScript = String.raw`
(function(){
  "use strict";

  function esc(value){
    var node = document.createElement("div");
    node.textContent = String(value == null ? "" : value);
    return node.innerHTML;
  }

  function styleFor(severity){
    if(severity === "alert") return {
      bg:"var(--alert-bg)", fg:"#7E261C", tag:"var(--alert)", label:"Alerte"
    };
    if(severity === "warn") return {
      bg:"var(--warn-bg)", fg:"#6E4A0E", tag:"var(--warn)", label:"Info trafic"
    };
    return {
      bg:"var(--blue-50)", fg:"var(--navy)", tag:"var(--blue)", label:"Information"
    };
  }

  function active(record){
    return (!record.until || new Date(record.until).getTime() > Date.now()) &&
      (!record.channels || record.channels.web !== false);
  }

  function removeOldInjectedArticles(){
    document.querySelectorAll("[data-shared-traffic]").forEach(function(node){
      node.remove();
    });
    if(window.__tteRemovedLegacyTraffic) return;
    window.__tteRemovedLegacyTraffic = true;
    var previous = [];
    try {
      previous = JSON.parse(localStorage.getItem("tte_publications") || "[]")
        .filter(active)
        .slice(0, 3);
    } catch(e) {}
    var grid = document.querySelector("#actus .news");
    if(!grid) return;
    for(var i = 0; i < previous.length; i += 1){
      var first = grid.querySelector("article.na");
      if(first) first.remove();
    }
  }

  function render(records){
    var publications = records.filter(active);
    var order = { alert:0, warn:1, info:2 };
    publications.sort(function(a, b){
      return (order[a.severity] - order[b.severity]) ||
        (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    });

    removeOldInjectedArticles();
    try {
      localStorage.setItem("tte_publications", JSON.stringify(records));
      window.dispatchEvent(new StorageEvent("storage", { key:"tte_publications" }));
    } catch(e) {}

    var bar = document.getElementById("alertBar");
    if(bar){
      if(!publications.length){
        bar.style.display = "none";
      } else {
        var top = publications[0];
        var topStyle = styleFor(top.severity);
        var inner = bar.querySelector(".alert-in");
        bar.style.display = "";
        bar.style.background = topStyle.bg;
        if(inner){
          inner.style.color = topStyle.fg;
          inner.innerHTML =
            '<span class="tag" style="background:' + topStyle.tag + '">⚠ ' +
              esc(topStyle.label) +
            '</span>' +
            '<p><b>' + (top.line ? "Ligne " + esc(top.line) + " — " : "") +
              esc(top.title) + '.</b> ' + esc(top.message) + '</p>' +
            '<a href="#actus" style="color:' + topStyle.fg + '">Voir tout le trafic</a>' +
            '<button class="alert-x" aria-label="Fermer" style="color:' +
              topStyle.fg + '">×</button>';
          var close = inner.querySelector(".alert-x");
          if(close) close.addEventListener("click", function(){
            bar.style.display = "none";
          });
        }
      }
    }

    var grid = document.querySelector("#actus .news");
    if(!grid) return;
    publications.slice(0, 3).reverse().forEach(function(record){
      var meta = styleFor(record.severity);
      var article = document.createElement("article");
      var color = record.line
        ? window.getComputedStyle(document.documentElement)
            .getPropertyValue("--l-" + String(record.line).toLowerCase()).trim()
        : meta.tag;
      article.className = "na";
      article.setAttribute("data-shared-traffic", "1");
      article.innerHTML =
        '<div class="ni" style="background:' + (color || meta.tag) + '"></div>' +
        '<div class="nb"><div class="meta">' +
          '<span class="tag" style="background:' + meta.bg + ';color:' + meta.fg + '">' +
            esc(meta.label) +
          '</span>' +
          '<span class="date">' +
            esc(new Date(record.createdAt).toLocaleDateString("fr-FR", {
              day:"numeric", month:"long", year:"numeric"
            })) +
          '</span>' +
        '</div><h3>' + (record.line ? "[" + esc(record.line) + "] " : "") +
          esc(record.title) +
        '</h3><p>' + esc(record.message) + '</p>' +
        '<span class="more">Publié par le Centre de Régulation</span></div>';
      grid.insertAdjacentElement("afterbegin", article);
    });
  }

  async function refresh(){
    try {
      var response = await fetch("/api/traffic", {
        headers:{ "Accept":"application/json" },
        cache:"no-store"
      });
      var json = await response.json().catch(function(){ return {}; });
      if(!response.ok || !json.ok) throw new Error(json.reason || "list_failed");
      render(Array.isArray(json.records) ? json.records : []);
    } catch(error) {
      console.error("[traffic/public-list]", error);
    }
  }

  clearInterval(window.__tteTrafficPublicTimer);
  window.__tteTrafficPublicTimer = setInterval(refresh, 15000);
  refresh();
})();
`;
