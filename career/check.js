/* Transparent task groups, not numerical probabilities or occupational scores. */
(function (root) {
  'use strict';
  const tasks = {
    admin: ['Data entry, scheduling, or admin processing', 'digital', 'AI may help extract information, draft routine responses, or process documents. Check exceptions, accuracy, and permissions.'],
    writing: ['Writing, editing, or content production', 'digital', 'Drafting and rewriting may change. Facts, originality, editorial decisions, and approval still need attention.'],
    analysis: ['Routine analysis, research, or reporting', 'digital', 'Summaries and routine reports may change. Check source quality, calculations, and conclusions.'],
    communication: ['Customer communication or sales outreach', 'digital', 'Routine messages may change. Difficult cases, relationships, and commitments need closer attention.'],
    design: ['Design or creative production', 'digital', 'Generating drafts and variations may change. Direction, rights, client needs, and final approval matter.'],
    software: ['Software development or engineering', 'digital', 'Code drafting may change. Requirements, integration, security, and testing remain part of the work.'],
    teaching: ['Teaching, training, or advising people', 'people', 'AI may assist with materials or explanations. Understanding a person’s needs and checking their progress are different parts of the job.'],
    management: ['Managing people or projects', 'people', 'Plans and status reports may change. Resolving conflicts, making commitments, and coordinating people involve more than producing a document.'],
    decisions: ['Negotiation or high-stakes decisions', 'people', 'AI may assist with preparation. Trust, authority to decide, and responsibility for consequences matter.'],
    vehicles: ['Operating vehicles or machinery', 'physical', 'Generative AI alone cannot perform the physical task. Dedicated automation and equipment can still change the work.'],
    hands: ['Physical, hands-on skilled work', 'physical', 'The work requires physical action. Generative AI may assist with instructions or paperwork; machinery and robotics are separate considerations.'],
    care: ['Treating or caring for people in person', 'physical', 'Physical care and personal interaction differ from documentation. AI may affect supporting tasks, staffing, or how care is organized.']
  };
  const choices = {
    q2:['senior','peers','final','unknown'], q3:['daily','pilot','talk','none','unknown'],
    q4:['low','real','severe','unknown'], q5:['own','other','none','unknown'],
    q6:['hands','mixed','remote','unknown'], q7:['own','shared','other','unknown'],
    q8:['mostly','mixed','procedure','unknown'], q9:['growing','flat','attrition','aiCuts','otherCuts','unknown']
  };
  function assess(a) {
    if (!Array.isArray(a.q1) || a.q1.length<1 || a.q1.length>3 || new Set(a.q1).size!==a.q1.length || a.q1.some(k=>!tasks[k])) throw new Error('Choose one to three distinct tasks.');
    Object.keys(choices).forEach(q=>{if (!choices[q].includes(a[q])) throw new Error('Missing or invalid answer: '+q);});
    const selected=a.q1.map(k=>({key:k,label:tasks[k][0],group:tasks[k][1],detail:tasks[k][2]}));
    const digital=selected.filter(t=>t.group==='digital');
    const holds=[];
    if(a.q5==='own') holds.push('You report that you hold a legally required license or sign-off. That may preserve a need for your approval, while still allowing tasks or staffing to change.');
    if(a.q5==='other') holds.push('You report that someone above you provides required sign-off. That requirement concerns their role and does not necessarily preserve yours.');
    if(a.q6==='hands') holds.push('You report that the work needs a person physically present most days. Generative AI alone cannot perform that physical work; other forms of automation may still affect it.');
    if(a.q6==='mixed') holds.push('Some of your work requires physical presence. Separate those tasks from the work that can be done remotely.');
    if(a.q7==='own') holds.push('You report personal accountability for outcomes. Consider which decisions require your authority and which could be reassigned.');
    if(a.q7==='shared') holds.push('Your team shares accountability. Identify the decisions that need human review and who is responsible for them.');
    if(a.q8==='mostly') holds.push('Much of your work involves judgment with incomplete information. Document examples where context or checking changed the outcome. This does not make the work immune to AI.');
    if(a.q8==='mixed') holds.push('Your work mixes judgment and procedure. These parts may change differently.');
    const unknown=Object.keys(choices).filter(q=>a[q]==='unknown');
    const review={senior:'Someone senior reviews your work. That is a review step, not proof that your own tasks can be automated.',peers:'Peers review your work. Shared review may matter even when tools help produce the first draft.',final:'You provide final review. The check treats that as responsibility, rather than reducing your task exposure.',unknown:'You are unsure who checks the work. Clarifying the approval process would make this assessment more useful.'}[a.q2];
    const cost={low:'You describe errors as quick to fix. A small task may be suitable for a careful trial using an employer-approved tool.',real:'You describe errors as costly in time, money, or reputation. Any trial needs a clear way to check the output.',severe:'You describe potentially serious consequences. Required review and professional standards matter; error costs do not establish job security.',unknown:'You are unsure about error costs. Find out how mistakes are caught and what happens when they are missed.'}[a.q4];
    const deployment={daily:'You report AI tools in daily use at your employer. That establishes use, not whether jobs have been displaced.',pilot:'You report a pilot or limited rollout. Whether it expands, and what it changes, remain open questions.',talk:'You report discussion but no real use yet. There is no observed rollout in your answers.',none:'You report no AI use on the radar at your employer. That is your local observation; it does not establish what the rest of your field is doing.',unknown:'You are unsure whether AI is in use at your employer. Treat adoption as unknown.'}[a.q3];
    const staffing={growing:'You report growing staffing. That is a local demand signal, not a guarantee about future hiring.',flat:'You report steady staffing. This alone does not tell us whether AI is changing the work.',attrition:'You report that people leave and are not replaced. That is worth investigating, but budgets, demand, and other changes can also cause it.',aiCuts:'You report job cuts with AI or automation cited by your employer. That is a reason to prepare, although the employer’s explanation does not establish how much AI caused the cuts.',otherCuts:'You report job cuts for other or unclear reasons. Prepare for the staffing change without assuming AI caused it.',unknown:'You are unsure about staffing changes. The check leaves this unknown.'}[a.q9];
    const next=[];
    if(a.q9==='aiCuts'||a.q9==='otherCuts') next.push('Update your résumé and gather examples of your work that you are permitted to keep. Find out which roles and tasks are changing; Cher Ami has job-loss and benefits resources if needed.');
    if(digital.length) next.push('Choose one task you selected: '+digital[0].label.toLowerCase()+'. Compare an approved AI tool’s output with your normal work: time saved, errors, and time spent checking. Use permitted material and follow your employer’s rules.');
    else next.push('List the paperwork or planning around your main tasks. Ask which parts are changing, even if the hands-on or personal work stays with people.');
    if(a.q5==='own') next.push('Check exactly what your license requires a person to do. Distinguish required approval from the preparation that could change.');
    else if(a.q7==='own'||a.q8==='mostly') next.push('Write down one recent decision where your judgment or accountability changed the outcome. Use it to explain your contribution in a conversation about new tools.');
    else next.push('Ask your manager which tasks they expect tools to change, who will check the results, and what skills the team will still need.');
    if(a.q9==='attrition') next.push('Ask why roles are not being backfilled and where their work is going. Avoid assuming that every missing replacement is caused by AI.');
    // Read the answers together. Rules express priorities, not job-loss probabilities.
    const humanRole = a.q5==='own' || a.q6==='hands' ||
      (a.q8==='mostly' && (a.q7==='own' || a.q2==='final'));
    const adoption = a.q3==='daily' || a.q3==='pilot';
    let assessment;
    const humanReason = a.q6==='hands'
      ? 'The physical part of your work limits what a generative AI tool can take over on its own. Look separately at paperwork and planning.'
      : a.q5==='own'
      ? 'Required sign-off gives you a role beyond producing the first draft. It does not guarantee that the same staffing level will be needed.'
      : 'Judgment combined with final review or personal accountability gives you a contribution beyond producing output. Make that contribution visible.';
    if(a.q9==='aiCuts' || a.q9==='otherCuts') {
      assessment={kind:'cuts', title:'Make a backup plan now',
        summary:'Staff cuts are the clearest warning in these answers. Whatever AI can do with your tasks, your immediate priority is understanding whether your role is affected and preparing options.',
        reasons:[a.q9==='aiCuts'?'Your employer has linked cuts to AI or automation. That makes this an immediate workplace issue, even though the explanation is not independent proof of the cause.':'Cuts for other or unclear reasons still matter to your job. An AI exposure estimate would not resolve that immediate uncertainty.',
          humanRole?humanReason:'The check does not identify a strong requirement for you personally to do the work. Find out which responsibilities your employer intends to retain.'],
        action:'This week, ask which roles are affected and what work will remain. Update your résumé with recent accomplishments and identify two realistic roles you could pursue.'};
    } else if(a.q9==='attrition') {
      assessment={kind:'attrition',title:'Find out where the missing jobs went',
        summary:'Unfilled vacancies deserve attention before drawing conclusions about AI. The key question is whether the work disappeared, moved to tools, or was passed to fewer people.',
        reasons:[adoption&&digital.length?'AI use and digital tasks make automation one plausible explanation to investigate. Budgets and changes in demand remain possible explanations too.':'Staffing is thinning without an established explanation. Your task mix alone cannot tell us why.',
          humanRole?humanReason:'If more work is being absorbed by fewer colleagues, the practical issue may already be workload and staffing expectations.'],
        action:'Ask what happened to the responsibilities of the last person who left. That answer will tell you more than a general prediction about your occupation.'};
    } else if(unknown.length>=4) {
      assessment={kind:'uncertain',title:'Find out what your employer is changing',
        summary:'There are too many unknowns to make a useful judgment about pressure on your role. You can still identify tasks AI may affect, but the missing workplace information would change the conclusion.',
        reasons:['The check needs context about adoption, staffing, and the parts of the job that require a person. Unknown answers should not quietly count as reassuring answers.',
          digital.length?'Your digital tasks are a sensible place to start the conversation about tools and changing expectations.':'Start with changes to planning, documentation, and staffing around your main work.'],
        action:'Ask your manager: “Which parts of our work do you expect AI to change over the next six months, and what does that mean for this role?”'};
    } else if(digital.length && adoption && !humanRole) {
      assessment={kind:'routine-pressure',title:'Prepare for pressure on routine work',
        summary:'The combination of digital tasks, AI adoption, and few clear requirements for your personal involvement deserves attention. A reasonable concern is that less staff time may be needed for some output, or that expectations may rise.',
        reasons:['Tools are already being used or tested around work that includes digital output. That makes changes to everyday tasks worth checking now.',
          a.q4==='severe'?'Serious error consequences create a need for checking, but your answers do not establish that you personally own that checking role.':'Your answers show limited physical requirements or personal sign-off. Producing the same output faster may not be enough to distinguish your contribution.'],
        action:'Choose one recurring task and ask how its time, quality requirements, and ownership are changing. Identify a useful responsibility beyond producing the first draft: resolving exceptions, checking quality, or working with the people who use it.'};
    } else if(digital.length && humanRole) {
      assessment={kind:'reshape',title:'Prepare for the job to change',
        summary:'Some of your output may become easier to produce, while other parts still call for your involvement. Focus on how the balance of your job changes and whether your employer still values the responsibilities you own.',
        reasons:[humanReason,adoption?'AI adoption makes this a current workflow question. Look for changes to workload, review time, and who makes decisions.':a.q3==='unknown'?'AI use is unknown. Establish whether tools are already changing your workflow before assuming you have time to prepare.':'You have not reported active adoption. Discuss how tools should fit the work before a rollout.'],
        action:'Take one recurring task and separate preparation from the decision, approval, or physical work that follows. Discuss which part you should spend more time on as tools improve.'};
    } else if(digital.length) {
      assessment={kind:'lead-time',title:'Use this time to prepare',
        summary:'Your work includes tasks AI may assist with, but these answers do not establish an active rollout or staffing reduction. Use the opportunity to understand the tools and how your role could change.',
        reasons:['Potential task exposure is present without a reported immediate staffing warning.',
          a.q3==='unknown'?'Adoption is unknown, so first establish whether tools are already in use.':'A lack of current adoption is not a lasting barrier. The useful question is what your employer would do with time saved.'],
        action:a.q4==='severe'?'Ask how an approved tool could be evaluated on sample material, who would validate its output, and which professional standards apply.':'Try one employer-approved tool on permitted sample work. Compare total time including corrections, then discuss what the result means for your responsibilities.'};
    } else if(selected.some(t=>t.group==='physical') && a.q6==='hands') {
      assessment={kind:'physical',title:'Watch the work around your main job',
        summary:'The physical part of your role appears less directly affected by generative AI. The earlier changes to investigate are likely to be in scheduling, documentation, planning, or how the work is assigned.',
        reasons:[humanReason,'This check covers generative AI. Dedicated machinery, robotics, and staffing decisions can affect physical jobs in different ways.'],
        action:'Look at one administrative task surrounding your work. Ask whether new tools will reduce that burden or simply increase the amount of work expected from each person.'};
    } else {
      assessment={kind:'people',title:'Focus on the decisions and relationships',
        summary:'Your selected work centers on people, decisions, or physical tasks rather than routine digital production. Look closely at the preparation AI might handle and the situations where a person must understand context or act.',
        reasons:['The task choices point toward supporting work changing before the whole role could be assessed.',
          humanRole?humanReason:'The answers do not establish which responsibilities specifically require you. Clarifying that is more useful than assuming people-facing work is protected.'],
        action:'Write down a recent situation where understanding a person, handling an exception, or taking responsibility changed the outcome. Use that example to discuss where your role adds value as tools change.'};
    }
    return {
      assessment,
      title:assessment.title,
      intro:assessment.summary,
      exposure:digital.length?'You selected work involving digital output that generative AI may assist with. The effect depends on the specific task, required quality, and time spent checking. Each selected task is described below.':'Your selected tasks center on people, decisions, or physical work. Supporting digital tasks may still change. The check cannot conclude that your role is safe.',
      selected, holds,
      holdNote:(holds.length?'These are reasons human involvement may matter, not guarantees that the same number of people will be employed.':'Your answers do not identify a clear requirement for your personal sign-off, physical presence, accountability, or substantial judgment. That does not establish that your job can be automated.')+(unknown.length?' You chose “Not sure” for '+unknown.length+' question'+(unknown.length===1?'':'s')+'; those conditions remain unknown.':''),
      review,cost,observed:deployment+' '+staffing,next
    };
  }
  const api={assess,tasks,choices};
  if(typeof module!=='undefined' && module.exports) module.exports=api;
  else root.CanaryCheck=api;
})(typeof globalThis!=='undefined'?globalThis:this);
