const test=require('node:test');
const assert=require('node:assert/strict');
const {assess,tasks,choices}=require('../career/check.js');
const base={q1:['writing'],q2:'peers',q3:'unknown',q4:'real',q5:'none',q6:'remote',q7:'other',q8:'procedure',q9:'unknown'};
test('a required license cannot produce a safety rating',()=>{
 const r=assess({...base,q5:'own'});
 assert.equal(r.assessment.kind,'reshape');
 assert.match(r.holds[0],/staffing to change/);
 assert.doesNotMatch(JSON.stringify(r),/Anchored|Augmented|strongest hold|chance of losing a job[^.]*\d/);
});
test('staffing attrition is not attributed to AI',()=>{
 const r=assess({...base,q9:'attrition'});
 assert.match(r.observed,/budgets, demand/);
 assert.match(r.next.join(' '),/Avoid assuming/);
});
test('daily AI use is not treated as measured displacement',()=>{
 const r=assess({...base,q3:'daily'});
 assert.match(r.observed,/not whether jobs have been displaced/);
});
test('unknowns remain unknown, not false negative evidence',()=>{
 const a={q1:['care']};Object.keys(choices).forEach(q=>a[q]='unknown');
 const r=assess(a);
 assert.match(r.holdNote,/8 questions/);
 assert.match(r.observed,/adoption as unknown/);
 assert.match(r.exposure,/cannot conclude.*safe/);
});
test('mixed task details stay visible without averaging',()=>{
 const r=assess({...base,q1:['writing','care','decisions']});
 assert.equal(r.selected.length,3);
 assert.deepEqual(r.selected.map(t=>t.group),['digital','physical','people']);
 assert.equal('score' in r,false);
});
test('cuts for other reasons get preparation without AI attribution',()=>{
 const r=assess({...base,q9:'otherCuts'});
 assert.match(r.observed,/without assuming AI caused it/);
 assert.match(r.next[0],/résumé/);
});
test('invalid, missing, duplicate and excessive selections are rejected',()=>{
 for(const q1 of [[],['nope'],['care','care'],Object.keys(tasks).slice(0,4)]) assert.throws(()=>assess({...base,q1}));
 assert.throws(()=>assess({...base,q9:null}));
});
test('every task and every offered context answer yields a useful result',()=>{
 for(const key of Object.keys(tasks)){
  const r=assess({...base,q1:[key]});assert.ok(r.next.length>=2);assert.ok(r.selected[0].detail);
 }
 for(const [q,options] of Object.entries(choices)) for(const value of options){
  const r=assess({...base,[q]:value});assert.ok(r.observed);assert.ok(r.holdNote);assert.doesNotMatch(JSON.stringify(r),/undefined|NaN/);
 }
});

test('the same digital task gets a different assessment as circumstances change',()=>{
 assert.equal(assess({...base,q3:'none',q9:'flat'}).assessment.kind,'lead-time');
 assert.equal(assess({...base,q3:'daily',q9:'flat'}).assessment.kind,'routine-pressure');
 assert.equal(assess({...base,q3:'daily',q9:'flat',q5:'own'}).assessment.kind,'reshape');
 assert.equal(assess({...base,q3:'daily',q9:'aiCuts',q5:'own'}).assessment.kind,'cuts');
});
test('observed cuts and attrition outrank protective factors and missing information',()=>{
 const a={q1:['care'],q2:'unknown',q3:'unknown',q4:'unknown',q5:'own',q6:'hands',q7:'unknown',q8:'unknown',q9:'otherCuts'};
 assert.equal(assess(a).assessment.kind,'cuts');
 assert.equal(assess({...a,q9:'attrition'}).assessment.kind,'attrition');
});
test('physical work with no staffing warning gets a distinct assessment',()=>{
 assert.equal(assess({...base,q1:['care'],q6:'hands',q9:'flat'}).assessment.kind,'physical');
});
test('severe consequences change the preparation action',()=>{
 const r=assess({...base,q3:'none',q9:'flat',q4:'severe'});
 assert.match(r.assessment.action,/professional standards/);
});
