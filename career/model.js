(function(root){
  'use strict';
  const USE=[['none','I haven’t seen AI used for this task'],['trial','It’s being tested, but isn’t in regular use'],['part','It regularly does part of the task'],['most','It regularly does most of the task'],['unknown','I don’t know']];
  const NEEDS=[['physical','Hands-on work or physical presence'],['people','A conversation, trust, care, or negotiation'],['judgment','Decisions when the situation isn’t straightforward'],['approval','A person’s approval is legally required'],['review','A person checks the result or handles exceptions'],['none','None of these'],['unknown','I’m not sure']];
  const STAFF=[['growing','Hiring more people for this work'],['steady','About the same; people who leave are replaced'],['unfilled','People leave and aren’t replaced'],['reduced','Jobs or paid hours have been cut'],['mixed','Hiring in some areas, reductions in others'],['unknown','I don’t know']];
  const REASONS=[['ai','AI or automation was the stated reason'],['mixed','AI or automation was one of several reasons'],['other','Another reason was given'],['unknown','No clear reason was given / I don’t know']];
  const label=(list,v)=>list.find(x=>x[0]===v)?.[1]||'';
  const valid=(list,v)=>list.some(x=>x[0]===v);
  const needsReason=v=>['unfilled','reduced','mixed'].includes(v);
  const empty=()=>({task:'',use:'',needs:[],staff:'',reason:''});
  const clean=v=>typeof v==='string'?v.replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,100):'';
  function toggle(values,v){if(!valid(NEEDS,v))return values;if(values.includes(v))return values.filter(x=>x!==v);return ['none','unknown'].includes(v)?[v]:[...values.filter(x=>!['none','unknown'].includes(x)),v];}
  function errors(s,step){
    if(step===0){const out=[];if(clean(s.task).length<3)out.push('Name a recurring task, or choose an example.');if(!valid(USE,s.use))out.push('Choose what you’ve seen AI do with this task.');return out;}
    if(step===1){const n=s.needs;return Array.isArray(n)&&n.length&&new Set(n).size===n.length&&n.every(x=>valid(NEEDS,x))&&(!n.some(x=>['none','unknown'].includes(x))||n.length===1)?[]:['Choose what the task needs, “None of these,” or “I’m not sure.”'];}
    if(step===2){if(!valid(STAFF,s.staff))return ['Choose the staffing pattern you’ve seen.'];if(needsReason(s.staff)&&!valid(REASONS,s.reason))return ['Choose the reason given, or “I don’t know.”'];return [];}
    return ['Unknown step.'];
  }
  function analyse(s){
    if([0,1,2].some(i=>errors(s,i).length))return null;
    const task=clean(s.task), gaps=[];
    if(s.use==='unknown')gaps.push('Whether AI is being used for this task.');
    if(s.needs.includes('unknown'))gaps.push('Which parts of this task need a person.');
    if(s.staff==='unknown')gaps.push('Whether staffing for this work is changing.');
    if(needsReason(s.staff)&&s.reason==='unknown')gaps.push('Why staffing is changing.');
    let focus;
    if(s.staff==='reduced')focus={kind:'cuts',title:'Prepare for the staffing change.',summary:'You’ve seen jobs or hours cut. That matters whether or not AI was the reason. Find out what the change means for your role and keep your options ready.',action:'This week, clarify which roles are affected. Update your résumé with recent accomplishments and identify one realistic alternative role.',question:'Which roles or hours are affected, and what work will the remaining team be expected to do?'};
    else if(s.staff==='unfilled')focus={kind:'unfilled',title:'Find out where the work is going.',summary:'People are leaving without being replaced. The useful question is what happened to their work—and whether expectations for your role have changed.',action:'Follow one recent vacancy: find out which tasks stopped, moved to tools, or were passed to the remaining team.',question:'What happened to the last person’s responsibilities, and is that how we expect this work to be staffed from now on?'};
    else if(s.staff==='mixed')focus={kind:'mixed',title:'Find out which roles are changing.',summary:'Hiring and reductions can happen at the same time. A company-wide picture may hide what is happening to work like yours.',action:'Ask which responsibilities are growing and which are shrinking. Compare those with the work you actually do.',question:'Where are we adding people and where are we reducing them, and which of those changes affect my responsibilities?'};
    else if(s.use==='unknown'||s.staff==='unknown')focus={kind:'unknown',title:'Start with the missing information.',summary:'A key part of the picture is still unclear. One direct question about AI use or staffing will tell you more than a general estimate about your occupation.',action:s.use==='unknown'?'Find out whether an approved AI tool is used for this task, by whom, and for which parts.':'Find out whether vacancies, paid hours, or staffing plans have changed for work like yours.',question:s.use==='unknown'?'Are we using or testing AI for this task? If so, what does it do and what does a person still do?':'Has staffing or the plan for this kind of work changed over the past year?'};
    else if(['part','most'].includes(s.use))focus={kind:'use',title:'Check what the time saved changes.',summary:'AI is already doing some of this task. Look at the work left for people and what your employer plans to do with the time saved.',action:'Trace one recent example from start to finish. Include preparation, checking, corrections, and follow-up when comparing time and quality.',question:'With AI doing this work, what should I spend more time on—and are workload or staffing expectations changing?'};
    else if(s.use==='trial')focus={kind:'trial',title:'Ask what the trial is showing.',summary:'A trial is an opportunity to understand the change before it becomes routine. The important result is whether the whole task improves, including the work people still do.',action:'Ask for a real example from the trial: what improved, what went wrong, and how much checking was needed.',question:'What has the trial shown about total time, quality, and the work people still need to do?'};
    else focus={kind:'none',title:'Ask what is planned for this task.',summary:'You haven’t seen AI used for this task, and you haven’t reported a staffing reduction. That describes today’s observations; it doesn’t tell you what is planned.',action:'Ask whether a change is being considered. If a trial is proposed, agree on how time, quality, and checking will be compared.',question:'Are we considering AI for this task, and what problem would we want it to solve?'};
    const ai={none:'You haven’t observed AI use for this task. That leaves its potential use open.',trial:'You’ve seen a trial, rather than regular use. Its results and any rollout plan still need checking.',part:'You report regular AI use for part of the task. That is a workflow change, not evidence by itself of job loss.',most:'You report regular AI use for most of the task. Checking, exceptions, and decisions may still take time; ask how the full workflow has changed.',unknown:'AI use is unknown. The check does not count that as reassurance.'}[s.use];
    const humanNotes=[];
    if(s.needs.includes('physical'))humanNotes.push('Generative AI software cannot do the physical part on its own. Tools or machinery may still change how the work is done.');
    if(s.needs.includes('people'))humanNotes.push('Look at the situations where a conversation or relationship changes the outcome.');
    if(s.needs.includes('judgment'))humanNotes.push('Use a recent difficult case to show what a person had to decide.');
    if(s.needs.includes('approval'))humanNotes.push('Clarify exactly which approval is required and who is authorized to give it.');
    if(s.needs.includes('review'))humanNotes.push('Checking and handling exceptions are work too. Ask who owns them and how much time they take.');
    if(s.needs.includes('none'))humanNotes.push('You haven’t identified a specific human requirement from this list. That does not establish that the whole task can be automated.');
    if(s.needs.includes('unknown'))humanNotes.push('The human requirements are unclear. Ask who reviews, decides, and takes responsibility when something goes wrong.');
    let workplace=label(STAFF,s.staff)+'.';
    if(needsReason(s.staff)){workplace+=' '+label(REASONS,s.reason)+'.';if(['ai','mixed'].includes(s.reason))workplace+=' That is the explanation you heard, not independent proof of the cause.';if(s.reason==='other')workplace+=' The check does not attribute this change to AI.';}
    return {task,focus,ai,people:s.needs.map(x=>label(NEEDS,x)),humanNotes,workplace,gaps,useLabel:label(USE,s.use)};
  }
  function summary(r){return ['CANARY — CAREER CHECK',r.task,'',r.focus.title,r.focus.summary,'','NEXT STEP',r.focus.action,'','ASK AT WORK',r.focus.question,'','YOUR ANSWERS','AI use: '+r.useLabel,'People: '+r.people.join('; '),'Workplace: '+r.workplace,...(r.gaps.length?['','STILL UNKNOWN',...r.gaps]:[]),'','This check uses your observations. It does not predict job loss or assess your whole job.'].join('\n');}
  const api={USE,NEEDS,STAFF,REASONS,label,needsReason,empty,clean,toggle,errors,analyse,summary};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Canary=api;
})(typeof globalThis!=='undefined'?globalThis:this);
