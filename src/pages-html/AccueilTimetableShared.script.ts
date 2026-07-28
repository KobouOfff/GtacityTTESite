export const timetablePublicScript = String.raw`
(function(){
  "use strict";
  var lineColors={R1:"#2A9D5B",R2:"#2979C9",R3:"#7A51B5",R4:"#E25B37",IC1:"#163D7A",IC2:"#B02A72",T:"#E6007E",BUS:"#E09A12"};
  var stationAliases={"quartier-residentiel":"quartier-arlington","gare-centrale-de-townsend":"townsend"};
  function esc(value){var n=document.createElement("div");n.textContent=String(value==null?"":value);return n.innerHTML;}
  function slug(value){
    var result=String(value||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase()
      .replace(/\s*\(townsend\)\s*/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
    return stationAliases[result]||result;
  }
  function today(){var d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
  function status(record){
    if(record.status==="cancelled") return '<span class="dt-st warn">Supprimé</span>';
    if(record.status==="delayed") return '<span class="dt-st warn">Retard '+esc(record.delayMinutes)+' min</span>';
    if(record.status==="boarding") return '<span class="dt-st">Embarquement</span>';
    if(record.status==="platform_changed") return '<span class="dt-st warn">Quai modifié</span>';
    return '<span class="dt-st">À l’heure</span>';
  }
  async function api(query){
    var response=await fetch("/api/departures?"+query,{headers:{Accept:"application/json"},cache:"no-store"});
    var json=await response.json().catch(function(){return {};});
    if(!response.ok||!json.ok) throw new Error(json.reason||"list_failed");
    return json.records||[];
  }
  function row(record){
    var time=record.status==="cancelled"?record.scheduledDeparture:record.departure;
    var old=record.delayMinutes?'<small style="display:block;text-decoration:line-through;color:#8fb3ec">'+esc(record.scheduledDeparture)+'</small>':"";
    return '<tr><td><span class="dt-tm">'+esc(time)+'</span>'+old+'</td>'+
      '<td><span class="dt-line" style="background:'+(lineColors[record.line]||"#17458a")+'">'+esc(record.line)+'</span></td>'+
      '<td><span class="dt-dest">'+esc(record.destination)+'</span><div class="dt-via">'+
        (record.via&&record.via.length?"via "+esc(record.via.join(" · ")):esc(record.serviceName))+
        (record.message?'<br><b>'+esc(record.message)+'</b>':"")+'</div></td>'+
      '<td class="dt-plat">'+esc(record.platform)+'</td><td style="text-align:right">'+status(record)+'</td></tr>';
  }
  async function refreshBoard(){
    var body=document.getElementById("depBody"); if(!body) return;
    try{
      var records=await api("date="+today()+"&station=townsend&limit=8");
      var now=new Date(), current=now.getHours()*60+now.getMinutes();
      var future=records.filter(function(record){
        var parts=record.departure.split(":"); return Number(parts[0])*60+Number(parts[1])>=current-5;
      });
      body.innerHTML=(future.length?future:records).slice(0,6).map(row).join("")||
        '<tr><td colspan="5" style="text-align:center">Aucun autre départ aujourd’hui.</td></tr>';
    }catch(error){
      console.error("[timetable/public-board]",error);
      body.innerHTML='<tr><td colspan="5" style="text-align:center">Horaires temporairement indisponibles.</td></tr>';
    }
  }
  async function search(){
    var from=document.getElementById("fFrom"),to=document.getElementById("fTo");
    var date=document.getElementById("fDate"),time=document.getElementById("fTime"),results=document.getElementById("fResults");
    if(!from||!to||!results) return;
    var origin=slug(from.value),destination=slug(to.value),travelDate=(date&&date.value)||today();
    results.style.display="block";
    results.innerHTML='<div style="padding:18px">Recherche des trains programmés…</div>';
    try{
      var records=await api("date="+encodeURIComponent(travelDate)+"&origin="+encodeURIComponent(origin)+"&destination="+encodeURIComponent(destination));
      if(time&&time.value){
        records=records.filter(function(record){return record.departure>=time.value;});
      }
      if(!records.length){
        results.innerHTML='<div style="padding:20px"><b>Aucun train direct trouvé.</b><br><small>Essayez une autre heure ou consultez la page trafic.</small></div>';
        return;
      }
      results.innerHTML='<div style="padding:18px 20px;border-top:1px solid var(--line)"><b>Prochains trains programmés</b>'+
        records.slice(0,5).map(function(record){
          return '<div style="margin-top:12px;padding:12px;border:1px solid var(--line);border-radius:9px;background:var(--bg-alt)">'+
            '<div style="display:flex;align-items:center;gap:9px;flex-wrap:wrap"><span class="dt-line" style="background:'+(lineColors[record.line]||"#17458a")+'">'+esc(record.line)+'</span>'+
            '<b>'+esc(record.departure)+' → '+esc(record.arrival)+'</b><span>· '+esc(record.durationMinutes)+' min</span><span>· voie '+esc(record.platform)+'</span></div>'+
            '<div style="font-size:12px;margin-top:5px;color:var(--muted)">'+esc(record.serviceName)+(record.via.length?" · via "+esc(record.via.join(", ")):"")+'</div>'+
            '<div style="margin-top:6px">'+status(record)+(record.message?' <span style="font-size:12px">'+esc(record.message)+'</span>':"")+'</div></div>';
        }).join("")+'<a href="/trafic" style="display:inline-block;margin-top:12px;font-weight:700">Consulter toute l’info trafic →</a></div>';
    }catch(error){
      console.error("[timetable/public-search]",error);
      results.innerHTML='<div style="padding:20px"><b>Horaires temporairement indisponibles.</b></div>';
    }
  }

  var oldBody=document.getElementById("depBody");
  if(oldBody){var newBody=oldBody.cloneNode(false);oldBody.replaceWith(newBody);}
  var oldButton=document.getElementById("fGo");
  if(oldButton){var newButton=oldButton.cloneNode(true);oldButton.replaceWith(newButton);newButton.addEventListener("click",search);}
  var finder=document.getElementById("finder");
  if(finder) finder.addEventListener("keydown",function(event){
    if(event.key==="Enter"){event.preventDefault();event.stopImmediatePropagation();search();}
  },true);
  clearInterval(window.__ttePublicTimetableTimer);
  window.__ttePublicTimetableTimer=setInterval(refreshBoard,30000);
  refreshBoard();
})();
`;
