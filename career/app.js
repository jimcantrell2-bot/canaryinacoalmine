(function(){
  'use strict';
  const C=window.CanaryAssessment,$=id=>document.getElementById(id);
  let state=C.empty(),result=null;
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const optionList=(items,selected)=>'<option value="">Choose an answer</option>'+items.map(([v,l])=>'<option value="'+v+'"'+(selected===v?' selected':'')+'>'+esc(l)+'</option>').join('');
  function choices(items,name,multi=false){return '<div class="single-options">'+items.map(([v,l])=>'<label class="choice"><input type="'+(multi?'checkbox':'radio')+'" name="'+name+'" value="'+v+'"><span>'+esc(l)+'</span></label>').join('')+'</div>';}
  function focusAt(el){el.focus({preventScroll:true});el.scrollIntoView({block:'start',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}
  function invalidate(){result=null;$('result').hidden=true;$('result-content').innerHTML='';$('copy-status').textContent='';$('copy-fallback').hidden=true;$('summary-text').value='';$('form-errors').hidden=true;updateProgress();}
  function distribute(){const n=state.tasks.length;if(n)state.tasks.forEach((t,i)=>t.share=Math.floor(100/n)+(i<100%n?1:0));}
  function renderTaskDetails(){
    $('allocation').hidden=!state.tasks.length;
    $('shares').innerHTML=state.tasks.map(t=>'<div class="share-row"><label for="share-'+t.id+'">'+esc(C.TASKS[t.id].label)+'</label><div class="share-entry"><input id="share-'+t.id+'" type="number" min="1" max="100" step="1" inputmode="numeric" value="'+t.share+'" data-share="'+t.id+'" aria-describedby="allocation-help"><span aria-hidden="true">%</span></div></div>').join('');
    for(const [container,key,list] of [['routine-rows','routine',C.ROUTINE],['evidence-rows','evidence',C.EVIDENCE]])$(container).innerHTML=state.tasks.length?state.tasks.map(t=>'<div class="task-row"><label for="'+key+'-'+t.id+'">'+esc(C.TASKS[t.id].label)+'</label><select id="'+key+'-'+t.id+'" data-task="'+t.id+'" data-field="'+key+'">'+optionList(list,t[key])+'</select></div>').join(''):'<p class="placeholder-note">Choose your main tasks in question 1 first.</p>';
    updateTotal();
  }
  function updateTotal(){const total=state.tasks.reduce((n,t)=>n+(Number.isFinite(t.share)?t.share:0),0);$('total').textContent='Total: '+total+'%'+(total===100?'':' — adjust to 100%');$('total').classList.toggle('invalid',total!==100);}
  function updateProgress(){const missing=new Set(C.validate(state).map(e=>e.question));$('completion').textContent=(9-missing.size)+' of 9 questions complete';}
  $('tasks').innerHTML=Object.entries(C.TASKS).map(([id,t])=>'<label class="choice"><input type="checkbox" name="task" value="'+id+'"><span>'+esc(t.label)+'</span></label>').join('');
  for(const key of ['adoption','needs','ownership','errors','plans','staffing','reason'])$(key+'-options').innerHTML=choices(C.CHOICES[key],key,key==='needs');
  renderTaskDetails();$('form').hidden=false;updateProgress();
  $('form').addEventListener('change',e=>{
    const el=e.target,name=el.name;
    if(name==='task'){
      if(el.checked&&state.tasks.length===3){el.checked=false;$('task-status').textContent='Choose up to three. Uncheck one before adding another.';return;}
      if(el.checked)state.tasks.push({id:el.value,share:0,routine:'',evidence:''});else state.tasks=state.tasks.filter(t=>t.id!==el.value);
      distribute();renderTaskDetails();$('task-status').textContent='Time shares have been split evenly. Adjust them below to match your week.';
    }else if(el.dataset.task){const task=state.tasks.find(t=>t.id===el.dataset.task);if(task)task[el.dataset.field]=el.value;}
    else if(name==='needs'){state.needs=C.toggleNeeds(state.needs,el.value);document.querySelectorAll('input[name="needs"]').forEach(input=>input.checked=state.needs.includes(input.value));}
    else if(Object.hasOwn(C.CHOICES,name)){state[name]=el.value;if(name==='staffing'){state.reason='';document.querySelectorAll('input[name="reason"]').forEach(input=>input.checked=false);$('reason-block').hidden=!C.needsReason(el.value);}}
    invalidate();
  });
  $('form').addEventListener('input',e=>{const id=e.target.dataset.share;if(id){state.tasks.find(t=>t.id===id).share=e.target.value===''?NaN:Number(e.target.value);updateTotal();invalidate();}});
  $('equal-shares').addEventListener('click',()=>{distribute();state.tasks.forEach(t=>$('share-'+t.id).value=t.share);updateTotal();invalidate();});
  $('form').addEventListener('submit',e=>{
    e.preventDefault();const errors=C.validate(state);
    if(errors.length){$('error-list').innerHTML=errors.map(error=>'<li><a href="#q'+error.question+'">'+esc(error.text)+'</a></li>').join('');$('form-errors').hidden=false;focusAt($('form-errors'));return;}
    result=C.assess(state);renderResult();focusAt($('result-title'));
  });
  function renderResult(){const r=result;
    $('form-errors').hidden=true;$('result').hidden=false;
    $('result-content').innerHTML='<div class="result-label">Will AI take my job?</div><h2 id="result-title" class="result-title" tabindex="-1">'+esc(r.verdict.title)+'</h2><p class="answer">'+esc(r.verdict.answer)+'</p><p class="result-limit">This is a reasoned assessment of the work you described. It cannot predict a particular employer’s decision or give a probability of job loss.</p>'+(r.warnings.length?'<section class="workplace-note warning"><h3>Check these details</h3>'+r.warnings.map(t=>'<p>'+esc(t)+'</p>').join('')+'</section>':'')+'<div class="assessment-axes"><section class="assessment-axis"><h3>Exposure</h3><p>'+esc(r.exposure)+'</p></section><section class="assessment-axis"><h3>Holding</h3><p>'+(state.needs.some(x=>['physical','relationship','judgment'].includes(x))?'Essential human work identified':state.needs.includes('approval')&&state.ownership==='own'?'Your approval is required':state.needs.includes('unknown')?'Human requirements unclear':'Review or approval needs closer examination')+'</p></section></div><section class="result-section"><h3>Why this is your result</h3><ul>'+r.reasons.map(reason=>'<li><strong>'+esc(reason.title)+':</strong> '+esc(reason.text)+'</li>').join('')+'</ul></section><section class="result-section"><h3>Your tasks, separately</h3><p>The percentages describe the time you allocated. They are not risk scores.</p><div class="task-breakdown">'+r.tasks.map(t=>'<article class="task-read"><div class="time">'+t.share+'% of your week</div><h4>'+esc(t.label)+'</h4><p class="task-band">'+esc(t.bandLabel)+'</p><p>'+esc(t.basis)+'</p><p><strong>What AI may do:</strong> '+esc(t.can)+'</p><p><strong>What still needs checking:</strong> '+esc(t.limit)+'</p><p><strong>Your tool experience:</strong> '+esc(C.label(C.EVIDENCE,t.evidence))+'.</p></article>').join('')+'</div></section><section class="result-section"><h3>What holds the human role</h3><ul>'+r.holds.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul><p style="margin-top:12px">'+esc(r.quality)+'</p></section><section class="workplace-note '+r.workplace.kind+'"><h3>'+esc(r.workplace.title)+'</h3><p>'+esc(r.workplace.text)+'</p></section><section class="next-action"><h3>'+esc(r.action.title)+'</h3><p>'+esc(r.action.text)+'</p><blockquote><strong>Ask:</strong> “'+esc(r.action.question)+'”</blockquote></section>'+(r.gaps.length?'<details class="result-section"><summary>What is still unknown</summary><ul>'+r.gaps.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul></details>':'')+'<section class="result-section"><h3>What would change this assessment</h3><p>'+esc(r.sensitivity)+'</p></section>';
  }
  $('edit').addEventListener('click',()=>focusAt($('q1')));
  $('reset').addEventListener('click',()=>{state=C.empty();$('form').reset();$('reason-block').hidden=true;$('task-status').textContent='';renderTaskDetails();invalidate();focusAt($('q1'));});
  $('copy').addEventListener('click',async()=>{if(!result)return;try{if(!navigator.clipboard?.writeText)throw Error('unavailable');await navigator.clipboard.writeText(C.summary(result));$('copy-status').textContent='Summary copied.';}catch{$('summary-text').value=C.summary(result);$('copy-fallback').hidden=false;$('summary-text').focus();$('summary-text').select();$('copy-status').textContent='Select and copy the summary below.';}});
  $('save').addEventListener('click',()=>{if(!result)return;const url=URL.createObjectURL(new Blob([C.summary(result)],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='canary-job-assessment.txt';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);$('copy-status').textContent='Summary prepared for download.';});
})();
