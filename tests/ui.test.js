const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require(process.env.CANARY_TEST_DOM||'jsdom');
function app(clipboard){
 const dom=new JSDOM(fs.readFileSync(path.join(__dirname,'../career/index.html'),'utf8'),{url:'https://canary.example/career/',runScripts:'outside-only'});
 const w=dom.window,d=w.document,created=[],downloads=[];
 w.matchMedia=()=>({matches:true});w.HTMLElement.prototype.scrollIntoView=function(){};
 w.URL.createObjectURL=blob=>{created.push(blob);return 'blob:summary';};w.URL.revokeObjectURL=()=>{};
 w.HTMLAnchorElement.prototype.click=function(){downloads.push(this.download);};
 if(clipboard)Object.defineProperty(w.navigator,'clipboard',{value:clipboard});
 for(const f of ['assessment.js','app.js'])w.eval(fs.readFileSync(path.join(__dirname,'../career',f),'utf8'));
 const $=id=>d.getElementById(id);
 function choose(name,value,checked=true){const el=d.querySelector('input[name="'+name+'"][value="'+value+'"]');assert.ok(el,name+':'+value);el.checked=checked;el.dispatchEvent(new w.Event('change',{bubbles:true}));}
 function select(id,value){const el=$(id);el.value=value;el.dispatchEvent(new w.Event('change',{bubbles:true}));}
 const submit=()=>$('form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
 const share=(id,value)=>{const el=$('share-'+id);el.value=String(value);el.dispatchEvent(new w.Event('input',{bubbles:true}));};
 return {dom,w,d,$,choose,select,submit,share,created,downloads};
}
function finish(a,id='admin'){
 a.choose('task',id);a.select('routine-'+id,'repeat');a.select('evidence-'+id,'untested');a.choose('adoption','none');a.choose('needs',id==='hands'?'physical':'none');a.choose('ownership','other');a.choose('errors','low');a.choose('plans','unknown');a.choose('staffing','steady');a.submit();
}
test('page initializes, validates gaps, and produces a result from a complete form',()=>{
 const a=app();assert.equal(a.$('form').hidden,false);assert.match(a.$('completion').textContent,/0 of 9/);a.submit();assert.equal(a.$('form-errors').hidden,false);assert.equal(a.d.activeElement,a.$('form-errors'));
 finish(a);assert.equal(a.$('result').hidden,false);assert.match(a.$('result-content').textContent,/candidate for automation/);assert.equal(a.d.activeElement.id,'result-title');assert.match(a.$('completion').textContent,/9 of 9/);
});
test('task limit, explicit time allocation, and weighted results work through real form events',()=>{
 const a=app();a.choose('task','hands');a.choose('task','admin');a.choose('task','management');a.choose('task','writing');assert.equal(a.d.querySelector('input[name="task"][value="writing"]').checked,false);assert.match(a.$('task-status').textContent,/up to three/);
 a.choose('task','management',false);a.share('hands',80);a.share('admin',20);
 for(const id of ['hands','admin']){a.select('routine-'+id,'repeat');a.select('evidence-'+id,'untested');}
 for(const [name,value] of Object.entries({adoption:'daily',needs:'physical',ownership:'own',errors:'costly',plans:'volume',staffing:'steady'}))a.choose(name,value);
 a.submit();assert.match(a.$('result-title').textContent,/supporting work/);a.share('hands',20);a.share('admin',80);assert.equal(a.$('result').hidden,true);assert.equal(a.$('result-content').innerHTML,'');a.submit();assert.match(a.$('result-title').textContent,/Much of your work is exposed/);
});
test('missing or invalid time shares block results and allow correction',()=>{
 const a=app();finish(a);a.share('admin',75);a.submit();assert.equal(a.$('result').hidden,true);assert.match(a.$('error-list').textContent,/100%/);a.share('admin',100);a.submit();assert.equal(a.$('result').hidden,false);
});
test('needs are exclusive when none or unknown is selected',()=>{
 const a=app();a.choose('needs','physical');a.choose('needs','unknown');assert.equal(a.d.querySelector('input[name="needs"][value="physical"]').checked,false);a.choose('needs','review');assert.equal(a.d.querySelector('input[name="needs"][value="unknown"]').checked,false);
});
test('staffing reason clears on edits and cuts never masquerade as proof of AI causation',()=>{
 const a=app();finish(a,'hands');a.choose('staffing','cuts');assert.equal(a.$('reason-block').hidden,false);a.choose('reason','other');a.submit();assert.match(a.$('result-title').textContent,/supporting work/);assert.match(a.$('result-content').textContent,/must not be attributed to AI/);
 a.choose('staffing','steady');assert.equal(a.$('reason-block').hidden,true);a.choose('staffing','cuts');assert.equal(a.d.querySelector('input[name="reason"]:checked'),null);a.submit();assert.match(a.$('error-list').textContent,/reason given/);
});
test('edit keeps answers, changes invalidate output, and clear removes all answers',()=>{
 const a=app();finish(a);a.$('edit').click();assert.equal(a.d.activeElement.id,'q1');assert.equal(a.d.querySelector('input[name="task"][value="admin"]').checked,true);a.choose('plans','reduce');assert.equal(a.$('result').hidden,true);a.submit();assert.match(a.$('result-content').textContent,/employer intends to reduce labor/);a.$('reset').click();assert.equal(a.$('result').hidden,true);assert.equal(a.d.querySelector('input[name="task"]:checked'),null);assert.match(a.$('completion').textContent,/0 of 9/);
});
test('copy, fallback, and download include the actual computed assessment',async()=>{
 let copied='';const a=app({writeText:async text=>copied=text});finish(a);a.$('copy').click();await new Promise(r=>setImmediate(r));assert.ok(copied.includes(a.$('result-title').textContent));assert.match(copied,/100% Records/);assert.equal(a.$('copy-status').textContent,'Summary copied.');a.$('save').click();assert.equal(a.created.length,1);assert.equal(a.downloads[0],'canary-job-assessment.txt');
 const b=app();finish(b);b.$('copy').click();await new Promise(r=>setImmediate(r));assert.equal(b.$('copy-fallback').hidden,false);assert.ok(b.$('summary-text').value.includes(b.$('result-title').textContent));
});
test('valid result content is not stale after changing per-task tool performance',()=>{
 const a=app();finish(a);a.select('evidence-admin','failed');assert.equal(a.$('result').hidden,true);a.submit();assert.match(a.$('result-title').textContent,/not cleared the bar/);
});
test('no storage, analytics or answer transmission is introduced',()=>{
 const code=fs.readFileSync(path.join(__dirname,'../career/app.js'),'utf8');assert.doesNotMatch(code,/localStorage|sessionStorage|fetch\(|XMLHttpRequest|sendBeacon/);
 const a=app();finish(a);const b=app();assert.match(b.$('completion').textContent,/0 of 9/);
});
