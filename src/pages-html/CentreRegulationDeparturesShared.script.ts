export const departuresSharedScript = String.raw`
(function(){
  "use strict";

  var records = {};
  var loading = false;
  var announcedError = false;
  var rowKeys = {
    "R1|Sevierville":"d-r1",
    "IC2|Nashville":"d-ic2",
    "T|Hôpital TMC":"d-t1",
    "R2|Mascot":"d-r2",
    "BUS|Quartier résid.":"d-bus",
    "IC1|Nashville":"d-ic1",
    "R4|Chattanooga":"d-r4"
  };
  var urbanCounter = 0;

  function notifyShared(message, type){
    var toast = document.getElementById("toast");
    if(!toast) return;
    toast.className = "toast show " + (type || "");
    toast.textContent = message;
    clearTimeout(window.__tteDepartureToastTimer);
    window.__tteDepartureToastTimer = setTimeout(function(){
      toast.classList.remove("show");
    }, 3000);
  }

  function classFor(status){
    if(/Supprim/.test(status)) return "alert";
    if(/Retard|Quai modifi/.test(status)) return "warn";
    return "";
  }

  function saveCache(){
    try {
      localStorage.setItem(
        "tte_depart_overrides",
        JSON.stringify(Object.keys(records).map(function(id){
          return { id:id, st:records[id].st };
        }))
      );
    } catch(e) {}
  }

  async function api(options){
    var response = await fetch("/api/departures", options || {
      headers:{ "Accept":"application/json" },
      cache:"no-store"
    });
    var json = await response.json().catch(function(){ return {}; });
    if(!response.ok || !json.ok) throw new Error(json.reason || "request_failed");
    return json;
  }

  function resolveRows(){
    var rows = document.querySelectorAll("#depBody tr");
    urbanCounter = 0;
    rows.forEach(function(row){
      var code = row.children[1] ? row.children[1].textContent.trim() : "";
      var destination = row.children[2] && row.children[2].querySelector("b")
        ? row.children[2].querySelector("b").textContent.trim()
        : "";
      var key = rowKeys[code + "|" + destination];
      if(code === "T" && destination === "Hôpital TMC"){
        urbanCounter += 1;
        key = urbanCounter === 1 ? "d-t1" : "d-t2";
      }
      if(key) row.dataset.departureKey = key;
    });
  }

  function bindRows(){
    resolveRows();
    document.querySelectorAll("#depBody tr[data-departure-key]").forEach(function(row){
      var id = row.dataset.departureKey;
      var oldSelect = row.querySelector("select");
      if(!oldSelect) return;
      var status = records[id] ? records[id].st : "À l'heure";

      if(oldSelect.dataset.sharedDeparture !== "1"){
        var select = oldSelect.cloneNode(true);
        select.dataset.sharedDeparture = "1";
        oldSelect.replaceWith(select);
        oldSelect = select;
        select.addEventListener("change", async function(){
          var previous = records[id] ? records[id].st : "À l'heure";
          select.disabled = true;
          try {
            var json = await api({
              method:"PATCH",
              headers:{ "Content-Type":"application/json" },
              body:JSON.stringify({ id:id, status:select.value })
            });
            records[id] = json.record;
            saveCache();
            select.className = "st-sel " + classFor(select.value);
            notifyShared("État du départ partagé avec tous les agents", "ok");
          } catch(error) {
            console.error("[departures/update]", error);
            select.value = previous;
            notifyShared("Impossible de partager l’état du départ", "err");
          } finally {
            select.disabled = false;
          }
        });
      }

      oldSelect.value = status;
      oldSelect.className = "st-sel " + classFor(status);
      if(records[id] && row.children[4]){
        oldSelect.title = "Mis à jour par " + records[id].author + " le " +
          new Date(records[id].updatedAt).toLocaleString("fr-FR");
      }
    });
  }

  async function loadRecords(){
    if(loading) return;
    loading = true;
    try {
      var json = await api();
      records = {};
      (json.records || []).forEach(function(record){ records[record.id] = record; });
      saveCache();
      bindRows();
      announcedError = false;
    } catch(error) {
      console.error("[departures/list]", error);
      if(!announcedError){
        notifyShared("Impossible de charger les départs partagés", "err");
        announcedError = true;
      }
    } finally {
      loading = false;
    }
  }

  document.querySelectorAll('aside.side nav a[data-view="dep"]').forEach(function(link){
    link.addEventListener("click", loadRecords);
  });

  clearInterval(window.__tteDeparturesSharedTimer);
  window.__tteDeparturesSharedTimer = setInterval(loadRecords, 7000);
  loadRecords();
})();
`;
