(function(){
  'use strict';
  const C=window.Canary, $=id=>document.getElementById(id);
  const names=['Your work','The people','Your workplace'];
  const examples=['Writing reports','Handling customer questions','Updating records','Writing or checking code','Planning work','Teaching or advising','Troubleshooting equipment','Hands-on work'];
  let state=C.empty(), step=0, result=null;
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function view(id){['intro','check','result'].forEach(x=>$(x).hidden=x!==id);$('clear-prompt').hidden=true;$('copy-fallback').hidden=true;}
  function scrollFocus(el){el.focus({preventScroll:true});el.scrollIntoView({block:'start',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}
  function options(list,name,multi=false){return '<div class="options">'+list.map(([v,l])=>'<label class="option"><input type="'+(multi?'checkbox':'radio')+'" name="'+name+'" value="'+v+'"'+((multi?state[name].includes(v):state[name]===v)?' checked':'')+'><span>'+esc(l)+'</span></label>').join('')+'</div>';}
  function reason(){return '<fieldset><legend>What reason was given for that staffing change?</legend>'+options(C.REASONS,'reason')+'</fieldset><p class="task-help">Record what you heard. The check won’t assume it proves the cause.</p>';}
  function render(focus=true){
    view('check');$('step-count').textContent='Step '+(step+1)+' of 3';$('step-name').textContent=names[step];$('progress').value=step+1;$('progress').setAttribute('aria-valuetext',names[step]+', step '+(step+1)+' of 3');
    $('step-nav').innerHTML=names.map((n,i)=>'<li'+(i===step?' class="current" aria-current="step"':'')+'><span>'+(i<step?'✓':i+1)+'</span>'+n+'</li>').join('');
    $('errors').hidden=true;$('next').innerHTML=step===2?'See my next step <span aria-hidden="true">→</span>':'Continue <span aria-hidden="true">→</span>';
    let html;
    if(step===0)html='<h2 class="question-title" id="question-title" tabindex="-1">What work do you want to check?</h2><p class="question-intro">Choose a recurring task that takes a meaningful part of your week. You can check another task afterward.</p><label for="task" class="field-label">One task I do often</label><input type="text" id="task" name="task" maxlength="100" value="'+esc(state.task)+'" placeholder="For example, preparing the weekly report" aria-describedby="task-hint" autocomplete="off"><p class="task-help" id="task-hint">Be specific if you can. Leave out names and confidential details.</p><div class="examples" role="group" aria-label="Task examples">'+examples.map(x=>'<button type="button" class="example" data-example="'+esc(x)+'">'+esc(x)+'</button>').join('')+'</div><fieldset><legend>At your workplace, what have you seen AI do with this task?</legend>'+options(C.USE,'use')+'</fieldset><p class="task-help">Include checking and corrections when deciding whether it does “most.”</p>';
    if(step===1)html='<h2 class="question-title" id="question-title" tabindex="-1">What still needs a person?</h2><p class="question-intro">Select what this task needs today. These are parts of the work to examine, not guarantees about staffing.</p><p class="context-task">Your task: <strong>'+esc(state.task)+'</strong></p><fieldset><legend>Choose all that apply.</legend>'+options(C.NEEDS,'needs',true)+'</fieldset>';
    if(step===2)html='<h2 class="question-title" id="question-title" tabindex="-1">What has changed at work?</h2><p class="question-intro">Think about staffing for work like yours over the past 12 months. Choose the closest pattern you’ve seen.</p><fieldset><legend>For this kind of work, my employer is…</legend>'+options(C.STAFF,'staff')+'</fieldset><div id="reason-block"'+(!C.needsReason(state.staff)?' hidden':'')+'>'+reason()+'</div>';
    $('question-body').innerHTML=html;
    if(focus)scrollFocus($('question-title'));
  }
  $('start').addEventListener('click',()=>{step=0;render();});
  $('question-body').addEventListener('input',e=>{if(e.target.name==='task'){state.task=e.target.value;$('task').removeAttribute('aria-invalid');}});
  $('question-body').addEventListener('change',e=>{
    const name=e.target.name, value=e.target.value;
    if(name==='needs'){state.needs=C.toggle(state.needs,value);document.querySelectorAll('input[name="needs"]').forEach(el=>el.checked=state.needs.includes(el.value));}
    if(['use','reason'].includes(name))state[name]=value;
    if(name==='staff'){state.staff=value;state.reason='';$('reason-block').innerHTML=reason();$('reason-block').hidden=!C.needsReason(value);}
    $('errors').hidden=true;
  });
  $('question-body').addEventListener('click',e=>{const el=e.target.closest('[data-example]');if(el){state.task=el.dataset.example;$('task').value=state.task;$('task').focus();$('task').removeAttribute('aria-invalid');}});
  $('form').addEventListener('submit',e=>{
    e.preventDefault();const errors=C.errors(state,step);
    if(errors.length){$('errors').innerHTML=errors.map(x=>'<p>'+esc(x)+'</p>').join('');$('errors').hidden=false;if(step===0&&C.clean(state.task).length<3){$('task').setAttribute('aria-invalid','true');$('task').focus();}else $('errors').focus();return;}
    state.task=C.clean(state.task);
    if(step<2){step++;render();}else showResult();
  });
  $('back').addEventListener('click',()=>{if(step===0){view('intro');scrollFocus($('start'));}else{step--;render();}});
  function showResult(){
    result=C.analyse(state);if(!result)return;const r=result;
    view('result');$('copy-status').textContent='';
    $('result-body').innerHTML='<p class="eyebrow">YOUR NEXT STEP</p><p class="result-task">For: '+esc(r.task)+'</p><h1 id="result-title" tabindex="-1">'+esc(r.focus.title)+'</h1><p class="result-lede">'+esc(r.focus.summary)+'</p><section class="next-step" aria-label="A practical next step"><h2>ONE THING TO DO</h2><p>'+esc(r.focus.action)+'</p><div class="ask"><span>ASK AT WORK</span><blockquote>“'+esc(r.focus.question)+'”</blockquote></div></section><h2 class="evidence-title">What your answers tell us</h2><div class="evidence"><article><h3>AI and this task</h3><p>'+esc(r.ai)+'</p></article><article><h3>Where people matter</h3><ul>'+r.people.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>'+r.humanNotes.map(x=>'<p>'+esc(x)+'</p>').join('')+'<p>These requirements don’t tell us how many people will be employed.</p></article><article><h3>At your workplace</h3><p>'+esc(r.workplace)+'</p></article></div>'+(r.gaps.length?'<section class="gaps"><h3>Still unknown</h3><ul>'+r.gaps.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></section>':'');
    scrollFocus($('result-title'));
  }
  $('edit').addEventListener('click',()=>{step=0;render();});
  function reset(){state=C.empty();result=null;step=0;$('summary-text').value='';$('copy-status').textContent='';$('result-body').innerHTML='';$('question-body').innerHTML='';view('intro');scrollFocus($('start'));}
  $('clear').addEventListener('click',()=>{$('clear-prompt').hidden=false;$('confirm-clear').focus();});
  $('confirm-clear').addEventListener('click',reset);
  $('cancel-clear').addEventListener('click',()=>{$('clear-prompt').hidden=true;$('clear').focus();});
  $('another').addEventListener('click',()=>{state=C.empty();result=null;step=0;$('summary-text').value='';$('result-body').innerHTML='';render();});
  $('copy').addEventListener('click',async()=>{
    if(!result)return;
    try{if(!navigator.clipboard?.writeText)throw Error('Unavailable');await navigator.clipboard.writeText(C.summary(result));$('copy-status').textContent='Summary copied.';}
    catch{$('summary-text').value=C.summary(result);$('copy-fallback').hidden=false;$('summary-text').focus();$('summary-text').select();$('copy-status').textContent='Automatic copying isn’t available. Select and copy the summary below.';}
  });
  $('save').addEventListener('click',()=>{if(!result)return;const url=URL.createObjectURL(new Blob([C.summary(result)],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='canary-career-check.txt';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);$('copy-status').textContent='Summary prepared for download.';});
})();
