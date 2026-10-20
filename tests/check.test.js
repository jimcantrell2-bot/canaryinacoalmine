const test=require('node:test');
const assert=require('node:assert/strict');
const C=require('../career/assessment.js');
const task=(id,share=100,routine='repeat',evidence='untested')=>({id,share,routine,evidence});
const base=(changes={})=>({tasks:[task('admin')],adoption:'none',needs:['none'],ownership:'other',errors:'low',plans:'unknown',staffing:'steady',reason:'',...changes});
const read=changes=>C.assess(base(changes));
test('work mix changes the whole-role answer; a small paperwork task does not dominate physical work',()=>{
 const a=read({tasks:[task('hands',80),task('admin',20)],needs:['physical']});
 const b=read({tasks:[task('hands',20),task('admin',80)],needs:['physical']});
 assert.equal(a.verdict.kind,'physical');assert.equal(b.verdict.kind,'high-with-human-work');assert.equal(a.physicalShare,80);assert.equal(b.physicalShare,20);
});
test('a successful real trial, assisted work, failed trial, and untested routine work remain distinct',()=>{
 assert.equal(read({tasks:[task('analysis',100,'varied','most')]}).verdict.kind,'high');
 assert.equal(read({tasks:[task('analysis',100,'repeat','help')]}).verdict.kind,'digital-assistance');
 assert.equal(read({tasks:[task('analysis',100,'repeat','failed')]}).verdict.kind,'not-ready');
 assert.equal(read().verdict.kind,'high');assert.equal(read().demonstrated,0);
 assert.match(read().verdict.answer,/performance still needs checking/);
});
test('a personally held approval changes the explanation but cannot erase task exposure',()=>{
 const own=read({needs:['approval'],ownership:'own'}),other=read({needs:['approval'],ownership:'other'});
 assert.equal(own.exposure,'Higher');assert.equal(own.verdict.kind,'high-with-approval');assert.equal(other.verdict.kind,'high');
 assert.match(other.holds.join(' '),/not yours alone/);assert.match(own.verdict.answer,/does not protect/);
});
test('cuts are visible without replacing the task assessment or inventing an AI cause',()=>{
 for(const reason of ['ai','mixed','other','unknown']){
  const r=read({tasks:[task('hands')],needs:['physical'],staffing:'cuts',reason});
  assert.equal(r.verdict.kind,'physical');assert.equal(r.workplace.kind,'warning');assert.match(r.action.title,/employment change/);
  if(reason==='other')assert.match(r.workplace.text,/must not be attributed to AI/);
 }
});
test('growth, steady staffing, adoption and reductions do not silently redefine task exposure',()=>{
 for(const staffing of ['growing','steady','unknown'])for(const adoption of C.CHOICES.adoption.map(x=>x[0])){
  const r=read({staffing,adoption});assert.equal(r.exposure,'Higher');assert.equal(r.verdict.kind,'high');
 }
 const r=read({plans:'reduce'});assert.equal(r.workplace.kind,'warning');assert.match(r.action.title,/employment change/);
});
test('unknown main work remains unknown; unknown employer details do not erase known task information',()=>{
 assert.equal(read({tasks:[task('other')]}).verdict.kind,'unclear');
 const r=read({tasks:[task('hands')],needs:['unknown'],ownership:'unknown',adoption:'unknown',errors:'unknown',plans:'unknown',staffing:'unknown'});
 assert.equal(r.verdict.kind,'physical');assert.ok(r.gaps.length>=5);assert.doesNotMatch(r.workplace.text,/staffing is steady/i);
});
test('people-facing work can also show observed automation; no occupation gets an automatic exemption',()=>{
 const usual=read({tasks:[task('teaching',100,'varied','help')],needs:['relationship']});
 const observed=read({tasks:[task('teaching',100,'repeat','most')],needs:['none']});
 assert.equal(usual.verdict.kind,'people');assert.equal(observed.verdict.kind,'high');assert.equal(observed.demonstrated,100);
});
test('physical-tool contradictions are explained, not silently converted to software automation',()=>{
 const r=read({tasks:[task('hands',100,'repeat','most')],needs:['none']});
 assert.equal(r.verdict.kind,'physical');assert.equal(r.shares.lower,100);assert.ok(r.warnings.length>=2);assert.match(r.warnings.join(' '),/machinery or a robot/);
});
test('invalid, duplicate, missing or unbalanced inputs cannot produce a result',()=>{
 for(const tasks of [[],[task('fake')],[task('__proto__')],[null],[task('admin',50)],[task('admin',50),task('admin',50)],[task('admin',101)],[task('admin',1.5)]]){
  const r=read({tasks});assert.ok(r.errors.length);assert.equal(r.verdict,undefined);
 }
 assert.equal(new Set(C.validate(C.empty()).map(x=>x.question)).size,9);
 assert.ok(read({needs:['none','review']}).errors.length);
 assert.ok(read({staffing:'cuts',reason:''}).errors.length);
 assert.ok(read({plans:'invented'}).errors.length);
});
test('every offered task/routine/performance combination returns a complete, finite assessment',()=>{
 for(const id of Object.keys(C.TASKS))for(const [routine] of C.ROUTINE)for(const [evidence] of C.EVIDENCE){
  const r=read({tasks:[task(id,100,routine,evidence)]});assert.equal(r.errors.length,0);assert.ok(r.verdict.answer);assert.ok(r.action.text);assert.equal(Object.values(r.shares).reduce((n,x)=>n+x,0),100);assert.doesNotMatch(C.summary(r),/undefined|NaN/);
 }
});
test('the text summary contains task shares, actual reasoning, warning, and next step',()=>{
 const r=read({tasks:[task('software',70,'varied','help'),task('management',30,'varied','untested')],needs:['judgment'],staffing:'vacancies',reason:'unknown'});
 const s=C.summary(r);for(const value of ['70% Software','30% Managing',r.verdict.title,r.action.text,r.workplace.text,'not the probability'])assert.ok(s.includes(value),value);
});
test('unknown or failed performance is not presented as observed completion',()=>{
 for(const evidence of ['unknown','untested','failed','help']){
  const r=read({tasks:[task('admin',100,'repeat',evidence)]});assert.equal(r.demonstrated,0);assert.doesNotMatch(r.verdict.title,/answers show a real route/);
 }
});
