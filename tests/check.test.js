const test=require('node:test');
const assert=require('node:assert/strict');
const C=require('../career/model.js');
const base=(changes={})=>({task:'Preparing the weekly report',use:'part',needs:['review'],staff:'steady',reason:'',...changes});
test('cuts outrank both AI use and human requirements, including a required license',()=>{
 for(const [use] of C.USE)for(const reason of ['ai','mixed','other','unknown']){
  const r=C.analyse(base({use,needs:['physical','approval'],staff:'reduced',reason}));
  assert.equal(r.focus.kind,'cuts');assert.match(r.focus.summary,/whether or not AI/);
  assert.doesNotMatch(r.focus.title,/safe|secure|protected/i);
 }
});
test('staffing explanations stay distinct from independently proven causes',()=>{
 assert.match(C.analyse(base({staff:'reduced',reason:'ai'})).workplace,/not independent proof/);
 assert.match(C.analyse(base({staff:'reduced',reason:'other'})).workplace,/does not attribute/);
 assert.ok(C.analyse(base({staff:'unfilled',reason:'unknown'})).gaps.includes('Why staffing is changing.'));
});
test('a mixed staffing pattern and unfilled vacancies outrank generic tool advice',()=>{
 assert.equal(C.analyse(base({staff:'unfilled',reason:'unknown'})).focus.kind,'unfilled');
 assert.equal(C.analyse(base({staff:'mixed',reason:'ai'})).focus.kind,'mixed');
});
test('unknown AI use or staffing prompts information gathering; unknown human needs remain visible',()=>{
 assert.equal(C.analyse(base({use:'unknown'})).focus.kind,'unknown');
 assert.equal(C.analyse(base({staff:'unknown'})).focus.kind,'unknown');
 const r=C.analyse(base({needs:['unknown']}));assert.equal(r.focus.kind,'use');assert.ok(r.gaps.length);
 assert.match(C.analyse(base({use:'unknown'})).ai,/does not count that as reassurance/);
});
test('observed regular use, trials and no observed use get different questions',()=>{
 assert.equal(C.analyse(base()).focus.kind,'use');
 assert.equal(C.analyse(base({use:'trial'})).focus.kind,'trial');
 assert.equal(C.analyse(base({use:'none'})).focus.kind,'none');
 assert.match(C.analyse(base({use:'none'})).focus.summary,/doesn’t tell you what is planned/);
});
test('none and unknown cannot be combined with concrete human requirements',()=>{
 assert.deepEqual(C.toggle(['physical'],'unknown'),['unknown']);
 assert.deepEqual(C.toggle(['none'],'review'),['review']);
 assert.deepEqual(C.toggle(['physical','review'],'review'),['physical']);
 assert.equal(C.analyse(base({needs:['unknown','physical']})),null);
 assert.equal(C.analyse(base({needs:['none','review']})),null);
});
test('incomplete and invalid values cannot produce a summary',()=>{
 for(const bad of [{task:''},{use:'bad'},{needs:[]},{needs:['review','review']},{staff:'bad'},{staff:'reduced',reason:''}])assert.equal(C.analyse(base(bad)),null);
 assert.equal(C.analyse(C.empty()),null);
});
test('all valid combinations yield a traceable action and reflect unknown answers',()=>{
 const sets=[];for(let mask=1;mask<32;mask++)sets.push(['physical','people','judgment','approval','review'].filter((_,i)=>mask&(1<<i)));sets.push(['none'],['unknown']);
 let count=0;
 for(const [use]of C.USE)for(const needs of sets)for(const [staff]of C.STAFF)for(const reason of C.needsReason(staff)?C.REASONS.map(x=>x[0]):['']){
  const r=C.analyse(base({use,needs,staff,reason}));assert.ok(r&&r.focus.action&&r.focus.question&&r.workplace);assert.equal(r.task,'Preparing the weekly report');
  if(use==='unknown')assert.ok(r.gaps.some(x=>/AI/.test(x)));
  if(staff==='unknown')assert.ok(r.gaps.some(x=>/staffing/.test(x)));
  assert.match(C.summary(r),/YOUR ANSWERS/);count++;
 }
 assert.equal(count,2475);
});
