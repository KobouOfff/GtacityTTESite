export const departuresSharedScript = String.raw`
(function(){
  "use strict";
  var loading = false;
  var canWriteTrain = window.__tteCanManageTrainDepartures === true;
  var canWriteBus = window.__tteCanManageBusDepartures === true;
  function isBusLine(line){ return typeof line==="string" && line.charAt(0).toUpperCase()==="B"; }
  function canWriteLine(line){ return isBusLine(line) ? canWriteBus : canWriteTrain; }
  var statusLabels = {
    on_time:"À l'heure",
    boarding:"Embarquement",
    delayed:"Retard",
    platform_changed:"Quai modifié",
    cancelled:"Supprimé"
  };
  var lineColors = {
    R1:"#2A9D5B",R2:"#2979C9",R3:"#7A51B5",R4:"#E25B37",
    IC1:"#163D7A",IC2:"#B02A72",T:"#E6007E",BUS:"#E09A12",
    B1:"#C68A1C",B2:"#3E7D2C"
  };
  var motifPresets = [
    "Incident de signalisation",
    "Panne de matériel roulant",
    "Incident sur la voie",
    "Malaise voyageur",
    "Colis ou bagage suspect",
    "Affluence exceptionnelle de voyageurs",
    "Conditions météorologiques",
    "Retard d'un train précédent / occupation de quai",
    "Travaux ou maintenance des infrastructures",
    "Accident de personne",
    "Défaut d'aiguillage",
    "Grève ou mouvement social"
  ];

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
  function render(records,pastHidden){
    var body=document.getElementById("depBody"); if(!body) return;
    if(!records.length){
      body.innerHTML='<tr><td colspan="7" style="text-align:center;padding:1.5rem;color:var(--muted)">'+
        (pastHidden?"Tous les trains d’aujourd’hui sont déjà partis.":"Aucun service programmé ce jour.")+'</td></tr>';
      return;
    }
    body.innerHTML=records.map(function(record){
      var statusClass=record.status==="cancelled"?"alert":(record.status==="delayed"||record.status==="platform_changed"?"warn":"");
      return '<tr data-service="'+esc(record.id)+'" data-line="'+esc(record.line)+'">'+
        '<td><b style="font-family:var(--ff-mono)">'+esc(record.scheduledDeparture)+'</b></td>'+
        '<td><span class="ln-tag" style="background:'+(lineColors[record.line]||"#17458A")+'">'+esc(record.line)+'</span></td>'+
        '<td><b>'+esc(record.destination)+'</b><div style="font-size:11px;color:var(--muted)">'+esc(record.serviceName)+'</div>'+
          (record.propagated?'<div style="font-size:11px;color:var(--warn);font-weight:700;margin-top:3px">Retard propagé automatiquement · quai unique</div>':"")+'</td>'+
        '<td><input data-field="platform" value="'+esc(record.platform==="—"?"":record.platform)+'" placeholder="—" style="width:58px;padding:6px;border:1px solid var(--line);border-radius:6px"></td>'+
        '<td><select data-field="status" class="st-sel '+statusClass+'">'+options(record.status)+'</select></td>'+
        '<td><input data-field="delay" type="number" min="0" max="360" value="'+esc(record.delayMinutes||0)+'" style="width:68px;padding:6px;border:1px solid var(--line);border-radius:6px"> min</td>'+
        '<td><select data-field="motifPreset" style="width:100%;padding:6px;border:1px solid var(--line);border-radius:6px;margin-bottom:5px"><option value="">Motif prédéfini…</option>'+
          motifPresets.map(function(m){return '<option value="'+esc(m)+'">'+esc(m)+'</option>';}).join("")+'</select>'+
        '<input data-field="message" value="'+esc(record.message||"")+'" placeholder="Message voyageurs" style="min-width:190px;width:100%;padding:6px;border:1px solid var(--line);border-radius:6px">'+
        '<div style="margin-top:6px;display:flex;gap:5px;align-items:center;flex-wrap:wrap">'+
          '<button class="btn sm" data-action="save">Enregistrer</button>'+
          '<button class="btn ghost sm" data-action="reset">Réinitialiser</button>'+
          '<label style="display:flex;align-items:center;gap:4px;font-size:11px;color:var(--muted);cursor:pointer" title="Si coché, cette régulation ne sera plus comptée dans le récap mensuel après réinitialisation.">'+
            '<input type="checkbox" data-field="excludeRecap" style="margin:0"> Retirer du récap'+
          '</label>'+
        '</div></td>'+
      '</tr>';
    }).join("");
    body.querySelectorAll("tr[data-service]").forEach(function(row){
      if(!canWriteLine(row.dataset.line)){
        row.querySelectorAll("input,select,button").forEach(function(el){el.disabled=true;});
      }
    });
  }
  async function load(){
    if(loading) return; loading=true;
    var dateInput=document.getElementById("depDate");
    var lineInput=document.getElementById("depLineFilter");
    var date=(dateInput&&dateInput.value)||today();
    var line=(lineInput&&lineInput.value)||"";
    try{
      var json=await api("/api/departures?date="+encodeURIComponent(date)+"&limit=200"+(line?"&line="+encodeURIComponent(line):""));
      var records=json.records||[];
      var pastHidden=false;
      if(date===today()){
        var now=new Date(), current=now.getHours()*60+now.getMinutes();
        var totalBefore=records.length;
        records=records.filter(function(record){
          if(record.status!=="on_time"&&record.status!=="boarding") return true;
          var reference=record.departure||record.scheduledDeparture;
          var parts=reference.split(":");
          return Number(parts[0])*60+Number(parts[1])>=current;
        });
        pastHidden=totalBefore>0&&records.length===0;
      }
      render(records,pastHidden);
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
    var excludeCheckbox=row.querySelector('[data-field="excludeRecap"]');
    var excludeFromRecap=!!(excludeCheckbox&&excludeCheckbox.checked);
    try{
      await api("/api/departures?serviceId="+encodeURIComponent(row.dataset.service)+"&date="+encodeURIComponent(date)+"&excludeFromRecap="+(excludeFromRecap?"1":"0"),{method:"DELETE"});
      notify(excludeFromRecap?"Le train est revenu à son horaire normal (retiré du récap mensuel).":"Le train est revenu à son horaire normal.","ok");
      await load();
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
    var button=event.target.closest("button"); if(!button) return;
    var row=button.closest("tr[data-service]"); if(!row||!canWriteLine(row.dataset.line)) return;
    if(button.dataset.action==="save") saveRow(row);
    if(button.dataset.action==="reset") resetRow(row);
  });
  if(body) body.addEventListener("change",function(event){
    var select=event.target.closest('[data-field="motifPreset"]'); if(!select||!select.value) return;
    var row=select.closest("tr[data-service]"); if(!row) return;
    var message=row.querySelector('[data-field="message"]');
    if(message) message.value=select.value;
    select.value="";
  });
  document.querySelectorAll('aside.side nav a[data-view="dep"]').forEach(function(link){link.addEventListener("click",load);});
  clearInterval(window.__tteDeparturesSharedTimer);
  window.__tteDeparturesSharedTimer=setInterval(load,20000);
  load();

  // ===== Récap mensuel =====
  var recapLoading=false;
  function currentMonth(){
    var d=new Date();
    return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0");
  }
  function kpi(label,value,detail,tone){
    return '<div class="kpi'+(tone?" "+tone:"")+'" style="min-width:150px"><span class="lab">'+esc(label)+'</span><div class="v">'+esc(value)+'</div>'+(detail?'<div class="d">'+esc(detail)+'</div>':'')+'</div>';
  }
  function renderRecap(data){
    var kpis=document.getElementById("recapKpis");
    if(kpis){
      kpis.innerHTML=
        kpi("Retards",data.totals.delayed,"circulations concernées","warn")+
        kpi("Suppressions",data.totals.cancelled,"trains supprimés","alert")+
        kpi("Changements de voie",data.totals.platformChanged,"")+
        kpi("Retard moyen",data.totals.averageDelayMinutes+" min","sur les circulations retardées")+
        kpi("Jours impactés",data.totals.affectedDays,"jour(s) avec au moins une régulation");
    }
    var lineBody=document.getElementById("recapLineBody");
    if(lineBody){
      if(!data.lines.length){
        lineBody.innerHTML='<tr><td colspan="6" style="text-align:center;padding:1.2rem;color:var(--muted)">Aucune régulation enregistrée sur ce mois.</td></tr>';
      }else{
        lineBody.innerHTML=data.lines.map(function(l){
          var avg=l.delayed?Math.round((l.totalDelayMinutes/l.delayed)*10)/10:0;
          return '<tr><td><span class="ln-tag" style="background:'+(lineColors[l.line]||"#17458A")+'">'+esc(l.line)+'</span></td>'+
            '<td>'+esc(l.delayed)+'</td><td>'+esc(l.cancelled)+'</td><td>'+esc(l.platformChanged)+'</td>'+
            '<td>'+esc(avg)+' min</td><td>'+esc(l.worstDelayMinutes)+' min</td></tr>';
        }).join("");
      }
    }
    var motifs=document.getElementById("recapMotifs");
    if(motifs){
      motifs.innerHTML=data.topMotifs.length
        ? data.topMotifs.map(function(m){
            return '<li style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--line)"><span>'+esc(m.motif)+'</span><b>'+esc(m.count)+'</b></li>';
          }).join("")
        : '<li style="color:var(--muted)">Aucun message de régulation enregistré sur ce mois.</li>';
    }
  }
  async function loadRecap(){
    if(recapLoading) return; recapLoading=true;
    var monthInput=document.getElementById("recapMonth");
    if(monthInput&&!monthInput.value) monthInput.value=currentMonth();
    var month=(monthInput&&monthInput.value)||currentMonth();
    try{
      var json=await api("/api/departures-recap?month="+encodeURIComponent(month));
      renderRecap(json);
    }catch(error){
      console.error("[departures/recap]",error);
      notify("Impossible de charger le récap mensuel.","err");
    }finally{recapLoading=false;}
  }
  var recapMonthInput=document.getElementById("recapMonth");
  if(recapMonthInput&&!recapMonthInput.value) recapMonthInput.value=currentMonth();
  if(recapMonthInput) recapMonthInput.addEventListener("change",loadRecap);
  var recapRefresh=document.getElementById("recapRefresh");
  if(recapRefresh) recapRefresh.addEventListener("click",loadRecap);
  document.querySelectorAll('aside.side nav a[data-view="recap"]').forEach(function(link){link.addEventListener("click",loadRecap);});
})();
`;
