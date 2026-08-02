export const script = `
(function(){
  "use strict";

  var burger=document.getElementById('burger'), hdr=document.getElementById('hdr');
  if(burger){ burger.addEventListener('click', function(){ hdr.classList.toggle('open'); }); }

  function isEn(){ return document.documentElement.getAttribute('data-lang')==='en'; }
  function L(fr,en){ return isEn()?en:fr; }

  var LABELS_FR={remboursement:'Remboursement',info:'Information voyageur',presse:'Presse & médias',objets:'Objets trouvés',accessibilite:'Accessibilité / PMR',reclamation:'Réclamation',suggestion:'Suggestion',autre:'Autre demande'};
  var LABELS_EN={remboursement:'Refund',info:'Traveller information',presse:'Press & media',objets:'Lost & found',accessibilite:'Accessibility',reclamation:'Complaint',suggestion:'Suggestion',autre:'Other request'};
  var DELAYS_FR={remboursement:'sous 15 jours ouvrés',info:'sous 3 jours ouvrés',presse:'sous 24 à 48 heures',objets:'sous 5 jours ouvrés',accessibilite:'sous 5 jours ouvrés',reclamation:'sous 10 jours ouvrés',suggestion:'sous 10 jours ouvrés',autre:'sous 5 jours ouvrés'};
  var DELAYS_EN={remboursement:'within 15 business days',info:'within 3 business days',presse:'within 24-48 hours',objets:'within 5 business days',accessibilite:'within 5 business days',reclamation:'within 10 business days',suggestion:'within 10 business days',autre:'within 5 business days'};
  var HINTS_FR={
    remboursement:'Indiquez la référence de votre billet et le motif (retard, annulation…).',
    info:'Posez votre question sur les horaires, les lignes ou les tarifs.',
    presse:'Précisez votre média et l\\u2019objet de votre sollicitation.',
    objets:'Décrivez l\\u2019objet oublié et le lieu concerné.',
    accessibilite:'Indiquez le type d\\u2019assistance ou d\\u2019aménagement souhaité.',
    reclamation:'Décrivez l\\u2019incident : ligne, date et déroulé.',
    suggestion:'Partagez votre idée d\\u2019amélioration du service.',
    autre:'Décrivez librement votre demande.'
  };
  var HINTS_EN={
    remboursement:'Give your ticket reference and reason (delay, cancellation…).',
    info:'Ask your question about timetables, lines or fares.',
    presse:'Tell us about your outlet and the purpose of your request.',
    objets:'Describe the lost item and where it was left.',
    accessibilite:'Tell us what assistance or arrangements you need.',
    reclamation:'Describe the incident: line, date and what happened.',
    suggestion:'Share your idea for improving the service.',
    autre:'Describe your request freely.'
  };
  function LABELS(){ return isEn()?LABELS_EN:LABELS_FR; }
  function DELAYS(){ return isEn()?DELAYS_EN:DELAYS_FR; }
  function HINTS(){ return isEn()?HINTS_EN:HINTS_FR; }

  var cards=document.querySelectorAll('.cat');
  var selType=document.getElementById('selType');
  var formTitle=document.getElementById('formTitle');
  var formHint=document.getElementById('formHint');
  var blocks={remboursement:'blkRefund',objets:'blkLost',presse:'blkPress'};

  function syncBlocks(cat){
    ['blkRefund','blkLost','blkPress'].forEach(function(id){
      var el=document.getElementById(id); if(el) el.classList.remove('show');
    });
    if(blocks[cat]){ var b=document.getElementById(blocks[cat]); if(b) b.classList.add('show'); }
  }
  function setCat(cat,scroll){
    cards.forEach(function(c){ c.classList.toggle('active', c.getAttribute('data-cat')===cat); });
    if(selType) selType.value=cat||'';
    syncBlocks(cat);
    var labels=LABELS(), hints=HINTS();
    if(cat && labels[cat]){
      formTitle.textContent=L('Demande · ','Request · ')+labels[cat];
      formHint.innerHTML=hints[cat]||'';
    }else{
      formTitle.textContent=L('Nouvelle demande','New request');
      formHint.textContent=L('Sélectionnez un motif ci-dessus, puis remplissez le formulaire.','Select a reason above, then fill in the form.');
    }
    if(scroll){ var f=document.getElementById('reqForm'); if(f) f.scrollIntoView({behavior:'smooth',block:'start'}); }
  }

  cards.forEach(function(c){ c.addEventListener('click', function(){ setCat(c.getAttribute('data-cat'), true); }); });
  if(selType){ selType.addEventListener('change', function(){ setCat(selType.value, false); }); }

  var h=(location.hash||'').replace('#','');
  if(h && LABELS()[h]){ setCat(h, true); }

  var form=document.getElementById('reqForm');
  var err=document.getElementById('formErr');
  var errTxt=document.getElementById('formErrTxt');
  function mark(el,bad){ if(!el) return; el.classList.toggle('bad', bad); }

  function collectExtra(cat){
    var extra={};
    if(cat==='remboursement'){
      extra.reference=(document.getElementById('rfRef')||{}).value||'';
      extra.date_trajet=(document.getElementById('rfDate')||{}).value||'';
      extra.ligne=(document.getElementById('rfLine')||{}).value||'';
    } else if(cat==='objets'){
      extra.date_oubli=(document.getElementById('lsDate')||{}).value||'';
      extra.lieu=(document.getElementById('lsPlace')||{}).value||'';
      extra.description_objet=(document.getElementById('lsDesc')||{}).value||'';
    } else if(cat==='presse'){
      extra.media=(document.getElementById('prMedia')||{}).value||'';
      extra.fonction=(document.getElementById('prRole')||{}).value||'';
      extra.deadline=(document.getElementById('prDeadline')||{}).value||'';
    }
    return extra;
  }

  if(form){
    form.addEventListener('submit', async function(e){
      e.preventDefault();
      var cat=selType.value;
      var sujet=document.getElementById('sujet');
      var message=document.getElementById('message');
      var consent=document.getElementById('consent');
      var consentWrap=document.getElementById('consentWrap');
      var discordUser=window.__tteContactUser||null;

      var problems=[];
      if(!discordUser) problems.push('discord');
      mark(selType,!cat); if(!cat) problems.push('motif');
      mark(sujet,!sujet.value.trim()); if(!sujet.value.trim()) problems.push('sujet');
      mark(message,!message.value.trim()); if(!message.value.trim()) problems.push('message');
      consentWrap.classList.toggle('bad', !consent.checked); if(!consent.checked) problems.push('consent');

      if(problems.length){
        if(problems.indexOf('discord')>-1){
          errTxt.textContent=L('Connectez-vous avec Discord pour envoyer votre demande.','Sign in with Discord to send your request.');
          err.classList.add('show');
          var gate=document.getElementById('steamGate');
          if(gate) gate.scrollIntoView({behavior:'smooth',block:'center'});
        } else {
          errTxt.textContent=L('Merci de compléter les champs obligatoires marqués d\\u2019un astérisque.','Please fill in the required fields marked with an asterisk.');
          err.classList.add('show');
          err.scrollIntoView({behavior:'smooth',block:'center'});
        }
        return;
      }
      err.classList.remove('show');

      var submitBtn=form.querySelector('button[type="submit"]');
      if(submitBtn){ submitBtn.disabled=true; submitBtn.dataset.origText=submitBtn.textContent; submitBtn.textContent=L('Envoi en cours…','Sending…'); }

      try{
        var res=await fetch('/api/public/contact/submit', {
          method:'POST',
          credentials:'same-origin',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({
            category: cat,
            subject: sujet.value.trim(),
            message: message.value.trim(),
            extra: collectExtra(cat)
          })
        });
        var payload=await res.json().catch(function(){ return {ok:false, reason:'bad_response'}; });
        if(!res.ok || !payload.ok){
          errTxt.textContent = payload && payload.reason === 'not_logged_in'
            ? L('Ta session Discord a expiré. Reconnecte-toi pour envoyer la demande.','Your Discord session has expired. Sign in again to send your request.')
            : L('Impossible d\\u2019enregistrer la demande (','Could not save the request (')+((payload&&payload.reason)||res.status)+').';
          err.classList.add('show');
          err.scrollIntoView({behavior:'smooth',block:'center'});
          return;
        }
        document.getElementById('refNumber').textContent = payload.ref;
        document.getElementById('sumUser').textContent=discordUser.name+' (Discord)';
        document.getElementById('sumCat').textContent=LABELS()[cat]||'—';
        document.getElementById('sumSubject').textContent=sujet.value.trim();
        document.getElementById('sumDelay').textContent=DELAYS()[cat]||L('sous 5 jours ouvrés','within 5 business days');

        form.style.display='none';
        var s=document.getElementById('success'); s.classList.add('show');
        s.scrollIntoView({behavior:'smooth',block:'start'});
      } catch(ex){
        errTxt.textContent=L('Erreur réseau : ','Network error: ')+ex.message;
        err.classList.add('show');
      } finally {
        if(submitBtn){ submitBtn.disabled=false; if(submitBtn.dataset.origText) submitBtn.textContent=submitBtn.dataset.origText; }
      }
    });
  }

  var newReq=document.getElementById('newReq');
  if(newReq){
    newReq.addEventListener('click', function(){
      form.reset();
      document.querySelectorAll('.ctl').forEach(function(c){ c.classList.remove('bad'); });
      document.getElementById('consentWrap').classList.remove('bad');
      setCat('', false);
      document.getElementById('success').classList.remove('show');
      form.style.display='';
      form.scrollIntoView({behavior:'smooth',block:'start'});
    });
  }
})();
`;
