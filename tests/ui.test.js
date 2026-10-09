const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {parseHTML}=require(process.env.CANARY_TEST_DOM||'linkedom');
function app(clipboard){
 const {window,document}=parseHTML(fs.readFileSync(path.join(__dirname,'../career/index.html'),'utf8'));
 window.matchMedia=()=>({matches:true});
 window.HTMLElement.prototype.focus=function(){};
 window.HTMLElement.prototype.scrollIntoView=function(){};
 window.HTMLTextAreaElement.prototype.select=function(){};
 const created=[],downloads=[];
 const testURL={createObjectURL:b=>{created.push(b);return 'blob:test';},revokeObjectURL:()=>{}};
 window.HTMLElement.prototype.click=function(){if(this.tagName==='A')downloads.push(this.download);this.dispatchEvent(new window.Event('click',{bubbles:true}));};
 const ctx=vm.createContext({window,document,globalThis:window,navigator:clipboard?{clipboard}:{},URL:testURL,Blob,setTimeout});
 for(const f of ['model.js','app.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../career',f),'utf8'),ctx,{filename:f});
 const $=id=>document.getElementById(id);
 const click=id=>$(id).click();
 const choose=(name,value)=>{const el=document.querySelector('input[name="'+name+'"][value="'+value+'"]');assert.ok(el);el.checked=true;el.dispatchEvent(new window.Event('change',{bubbles:true}));};
 const submit=()=>$('form').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));
 const task=value=>{$('task').value=value;$('task').dispatchEvent(new window.Event('input',{bubbles:true}));};
 return {window,document,$,click,choose,submit,task,created,downloads};
}
function finish(a,staff='steady',reason=''){
 a.click('start');a.task('Preparing reports');a.choose('use','part');a.submit();a.choose('needs','review');a.submit();a.choose('staff',staff);if(reason)a.choose('reason',reason);a.submit();
}
test('each step validates, keeps answers on back, and produces a useful result',()=>{
 const a=app();a.click('start');a.submit();assert.equal(a.$('errors').hidden,false);assert.match(a.$('errors').textContent,/Name a recurring task/);
 a.task('Preparing reports');a.choose('use','part');a.submit();assert.match(a.$('question-body').textContent,/What still needs a person/);
 a.choose('needs','review');a.click('back');assert.equal(a.$('task').value,'Preparing reports');assert.equal(a.document.querySelector('input[value="part"]').hasAttribute('checked'),true);
 a.submit();a.submit();a.choose('staff','reduced');a.submit();assert.equal(a.$('errors').hidden,false);
 a.choose('reason','other');a.submit();assert.equal(a.$('result').hidden,false);assert.match(a.$('result-body').textContent,/Prepare for the staffing change/);assert.match(a.$('result-body').textContent,/does not attribute this change to AI/);
});
test('none and unknown options clear other checkbox selections',()=>{
 const a=app();a.click('start');a.task('Equipment repairs');a.choose('use','none');a.submit();a.choose('needs','physical');a.choose('needs','unknown');
 assert.equal(a.document.querySelector('input[value="physical"]').checked,false);a.choose('needs','review');assert.equal(a.document.querySelector('input[value="unknown"]').checked,false);
});
test('changing staffing removes the prior conditional reason',()=>{
 const a=app();a.click('start');a.task('Preparing reports');a.choose('use','unknown');a.submit();a.choose('needs','unknown');a.submit();a.choose('staff','reduced');a.choose('reason','ai');a.choose('staff','steady');assert.equal(a.$('reason-block').hidden,true);a.submit();assert.doesNotMatch(a.$('result-body').textContent,/AI or automation was the stated reason/);
 a.click('edit');a.submit();a.submit();a.choose('staff','reduced');assert.equal(a.document.querySelector('input[name="reason"]:checked'),null);a.submit();assert.equal(a.$('errors').hidden,false);
});
test('user text is escaped in the task input and result, and new checks clear it',()=>{
 const a=app();a.click('start');a.task('<img src=x onerror=alert(1)>');a.choose('use','none');a.submit();assert.equal(a.$('question-body').querySelector('img'),null);a.choose('needs','none');a.submit();a.choose('staff','steady');a.submit();assert.equal(a.$('result-body').querySelector('img'),null);assert.match(a.$('result-body').textContent,/<img src=x/);a.click('another');assert.equal(a.$('task').value,'');assert.equal(a.$('result-body').innerHTML,'');
});
test('copy success, fallback and text download contain the actual result',async()=>{
 let copied='';const a=app({writeText:async t=>copied=t});finish(a);a.click('copy');await new Promise(r=>setImmediate(r));assert.match(copied,/Preparing reports/);assert.equal(a.$('copy-status').textContent,'Summary copied.');a.click('save');assert.equal(a.created.length,1);assert.match(await a.created[0].text(),/ASK AT WORK/);assert.equal(a.downloads[0],'canary-career-check.txt');
 const b=app();finish(b);b.click('copy');await new Promise(r=>setImmediate(r));assert.equal(b.$('copy-fallback').hidden,false);assert.match(b.$('summary-text').value,/Preparing reports/);
});
test('clear confirmation can be cancelled and reset removes all entered details',()=>{
 const a=app();a.click('start');a.task('Private task');a.click('clear');assert.equal(a.$('clear-prompt').hidden,false);a.click('cancel-clear');assert.equal(a.$('task').value,'Private task');a.click('clear');a.click('confirm-clear');assert.equal(a.$('intro').hidden,false);a.click('start');assert.equal(a.$('task').value,'');
});
test('reload starts fresh, without reading or writing browser storage',()=>{
 const a=app();finish(a);const b=app();assert.equal(b.$('intro').hidden,false);b.click('start');assert.equal(b.$('task').value,'');
 const code=fs.readFileSync(path.join(__dirname,'../career/app.js'),'utf8');assert.doesNotMatch(code,/localStorage|sessionStorage|fetch\(|XMLHttpRequest|sendBeacon/);
});
