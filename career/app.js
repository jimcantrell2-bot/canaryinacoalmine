(function () {
  'use strict';
  const form=document.getElementById('careerForm');
  const box=document.getElementById('resultBox');
  const error=document.getElementById('formError');
  const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
  function read(){
    const a={q1:Array.from(form.querySelectorAll('input[name="q1"]:checked'),i=>i.value)};
    Object.keys(CanaryCheck.choices).forEach(q=>{const input=form.querySelector('input[name="'+q+'"]:checked');a[q]=input?input.value:null;});
    return a;
  }
  function missing(a){return ['q1',...Object.keys(CanaryCheck.choices)].filter(q=>q==='q1'?!a.q1.length:!a[q]);}
  function go(el){el.focus();el.scrollIntoView({behavior:reduceMotion.matches?'auto':'smooth',block:'start'});}
  function list(id,rows){
    const target=document.getElementById(id); target.replaceChildren();
    rows.forEach(text=>{const li=document.createElement('li');li.textContent=text;target.append(li);});
  }
  form.addEventListener('change',function(){
    const a=read();
    form.querySelectorAll('input[name="q1"]').forEach(i=>{i.disabled=a.q1.length>=3&&!i.checked;});
    const gaps=missing(a);
    document.getElementById('progress').textContent=(9-gaps.length)+' of 9 answered'+(a.q1.length===3?' · Three tasks selected; deselect one to choose another.':'');
    form.querySelectorAll('.q-card').forEach(card=>{if(!gaps.includes(card.id)){card.classList.remove('missing');card.removeAttribute('aria-describedby');}});
    if(!gaps.length) error.hidden=true;
    // Old results must never remain visible under changed answers.
    box.classList.remove('show');
  });
  form.addEventListener('submit',function(event){
    event.preventDefault();
    const a=read(),gaps=missing(a);
    if(gaps.length){
      error.textContent='Please answer question'+(gaps.length===1?' ':'s ')+gaps.map(q=>q.slice(1)).join(', ')+'. “Not sure” is available for questions 2–9.';
      error.hidden=false;
      gaps.forEach(q=>{const card=document.getElementById(q);card.classList.add('missing');card.setAttribute('aria-describedby','formError');});
      go(document.querySelector('#'+gaps[0]+' input'));return;
    }
    error.hidden=true;
    const result=CanaryCheck.assess(a);
    document.getElementById('posName').textContent=result.title;
    document.getElementById('posText').textContent=result.intro;
    list('mainReasons',result.assessment.reasons);
    document.getElementById('mainAction').textContent=result.assessment.action;
    document.getElementById('rsExposed').textContent=result.exposure;
    list('taskDetails',result.selected.map(t=>t.label+': '+t.detail));
    list('holdDetails',result.holds);
    document.getElementById('holdNote').textContent=result.holdNote+' '+result.review+' '+result.cost;
    document.getElementById('rsForward').textContent=result.observed;
    list('nextSteps',result.next);
    box.classList.add('show');go(box);
  });
  document.getElementById('editAnswers').addEventListener('click',()=>go(form.querySelector('input')));
})();
