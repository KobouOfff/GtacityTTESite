export const departuresSharedScript = String.raw`
(function(){
  "use strict";
  var loading = false;
  var canWrite = window.__tteCanManageDepartures === true;
  var statusLabels = {
    on_time:"À l'heure",
    boarding:"Embarquement",
    delayed:"Retard",
    platform_changed:"Quai modifié",
    cancelled:"Supprimé"
  };
  var lineColors = {
    R1:"#2A9D5B",R2:"#2979C9",R3:"#7A51B5",R4:"#E25B37",
    IC1:"#163D7A",IC2:"#B02A72",T:"#E6007E",BUS:"#E09A12"
  };

  function esc(value){
    var node=document.createElement("div");
    node.textContent=String(value==null?"":value);
    return node.innerHTML;
  }
  function notify(message,type){
    var toast=document.getElementById("toast"); if(!toast) return;
    toast.className="toast show "+(type||"");
    toast.textContent=message;
    clearTimeout(window.__tteDepartureToastTimer);
    window.__tteDepartureToastTimer=setTimeout(function(){toast.classList.remove("show");},3200);
  }
  async function api(url,options){
    var response=await fetch(url,options||{headers:{Accept:"application/json"},cache:"no-store"});
    var json=await response.json().catch(function(){return {};});
    if(!response.ok||!json.ok) throw new Error(json.reason||"request_failed");
    return json;
  }
  function today(){
    var d=new Date(),m=String(d.getMonth()+1).padStart(2,"0"),day=String(d.getDate()).padStart(2,"0");
    return d.getFullYear()+"-"+m+"-"+day;
  }
  function options(selected){
    return Object.keys(statusLabels).map(function(value){
      return '<option value="'+value+'"'+(selected===value?" selected":"")+'>'+statusLabels[value]+'</option>';
    }).join("");
  }
  function render(records){
    var body=document.getElementById("depBody"); if(!body) return;
    if(!records.length){
      body.innerHTML='<tr><td colspan="7" style="text-align:center;padding:1.5rem;color:var(--muted)">Aucun service programmé ce jour.</td></tr>';
      return;
    }
    body.innerHTML=records.map(function(record){
      var statusClass=record.status==="cancelled"?"alert":(record.status==="delayed"||record.status==="platform_changed"?"warn":"");
      return '<tr data-service="'+esc(record.id)+'">'+
        '<td><b style="font-family:var(--ff-mono)">'+esc(record.scheduledDeparture)+'</b></td>'+
        '<td><span class="ln-tag" style="background:'+(lineColors[record.line]||"#17458A")+'">'+esc(record.line)+'</span></td>'+
        '<td><b>'+esc(record.destination)+'</b><div style="font-size:11px;color:var(--muted)">'+esc(record.serviceName)+'</div>'+
          (record.propagated?'<div style="font-size:11px;color:var(--warn);font-weight:700;margin-top:3px">Retard propagé automatiquement · quai unique</div>':"")+'</td>'+
        '<td><input data-field="platform" value="'+esc(record.platform==="—"?"":record.platform)+'" placeholder="—" style="width:58px;padding:6px;border:1px solid var(--line);border-radius:6px"></td>'+
        '<td><select data-field="status" class="st-sel '+statusClass+'">'+options(record.status)+'</select></td>'+
        '<td><input data-field="delay" type="number" min="0" max="360" value="'+esc(record.delayMinutes||0)+'" style="width:68px;padding:6px;border:1px solid var(--line);border-radius:6px"> min</td>'+
        '<td><input data-field="message" value="'+esc(record.message||"")+'" placeholder="Message voyageurs" style="min-width:190px;width:100%;padding:6px;border:1px solid var(--line);border-radius:6px">'+
        '<div style="margin-top:6px;display:flex;gap:5px"><button class="btn sm" data-action="save">Enregistrer</button><button class="btn ghost sm" data-action="reset">Réinitialiser</button></div></td>'+
      '</tr>';
    }).join("");
    if(!canWrite){
      body.querySelectorAll("input,select,button").forEach(function(el){el.disabled=true;});
    }
  }
  async function load(){
    if(loading) return; loading=true;
    var dateInput=document.getElementById("depDate");
    var lineInput=document.getElementById("depLineFilter");
    var date=(dateInput&&dateInput.value)||today();
    var line=(lineInput&&lineInput.value)||"";
    try{
      var json=await api("/api/departures?date="+encodeURIComponent(date)+"&limit=200"+(line?"&line="+encodeURIComponent(line):""));
      render(json.records||[]);
    }catch(error){
      console.error("[departures/list]",error);
      notify("Impossible de charger l'horaire partagé. Vérifiez la migration Supabase.","err");
    }finally{loading=false;}
  }
  async function saveRow(row){
    var date=document.getElementById("depDate").value;
    var status=row.querySelector('[data-field="status"]').value;
    var delay=Number(row.querySelector('[data-field="delay"]').value||0);
    var platform=row.querySelector('[data-field="platform"]').value;
    var message=row.querySelector('[data-field="message"]').value;
    try{
      await api("/api/departures",{
        method:"PATCH",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({serviceId:row.dataset.service,date:date,status:status,delayMinutes:delay,platform:platform,message:message})
      });
      notify("Horaire publié sur le site voyageurs.","ok"); await load();
    }catch(error){console.error("[departures/update]",error);notify("Impossible d'enregistrer cet horaire.","err");}
  }
  async function resetRow(row){
    var date=document.getElementById("depDate").value;
    try{
      await api("/api/departures?serviceId="+encodeURIComponent(row.dataset.service)+"&date="+encodeURIComponent(date),{method:"DELETE"});
      notify("Le train est revenu à son horaire normal.","ok"); await load();
    }catch(error){console.error("[departures/reset]",error);notify("Impossible de réinitialiser cet horaire.","err");}
  }

  var dateInput=document.getElementById("depDate");
  if(dateInput&&!dateInput.value) dateInput.value=today();
  ["depDate","depLineFilter"].forEach(function(id){
    var el=document.getElementById(id); if(el) el.addEventListener("change",load);
  });
  var refresh=document.getElementById("depRefresh"); if(refresh) refresh.addEventListener("click",load);
  var body=document.getElementById("depBody");
  if(body) body.addEventListener("click",function(event){
    var button=event.target.closest("button"); if(!button||!canWrite) return;
    var row=button.closest("tr[data-service]"); if(!row) return;
    if(button.dataset.action==="save") saveRow(row);
    if(button.dataset.action==="reset") resetRow(row);
  });
  document.querySelectorAll('aside.side nav a[data-view="dep"]').forEach(function(link){link.addEventListener("click",load);});
  clearInterval(window.__tteDeparturesSharedTimer);
  window.__tteDeparturesSharedTimer=setInterval(load,20000);
  load();
})();
`;
