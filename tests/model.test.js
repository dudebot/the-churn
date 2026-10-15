import assert from 'node:assert/strict';
import {simulate,compromise,population,components,distance} from '../model.js';
const [a,b]=compromise([0,.3,.9,1,.2],[1,.7,.1,0,.8]);
assert.deepEqual(a,[.2,.38,.74,.8,.32000000000000006]);
for(let k=0;k<5;k++)assert.ok(Math.abs(a[k]+b[k]-[1,1,1,1,1][k])<1e-12,'Pairwise compromise must preserve pair mean');
assert.equal(distance([0,0],[1,1],[0,1]),1);
const baseline=simulate({seed:42,churn:75}),repeat=simulate({seed:42,churn:75});assert.deepEqual(baseline,repeat,'Matched-seed deterministic reproduction');
for(const context of ['all','material','values'])for(const churn of [0,75,100]){
  const s=simulate({seed:13,churn,context}),ids=s.groups.flat();assert.equal(ids.length,s.n);assert.equal(new Set(ids).size,s.n);
  const edgeKeys=new Set();for(const [i,j]of s.edges){assert.ok(i<j&&i>=0&&j<s.n);edgeKeys.add(`${i},${j}`);assert.equal(s.agents[i].group,s.agents[j].group);}
  assert.equal(edgeKeys.size,s.edges.length);assert.equal(s.agents.reduce((z,a)=>z+a.degree,0),2*s.edges.length);
  for(const agent of s.agents)for(const x of agent.opinion)assert.ok(Number.isFinite(x)&&x>=0&&x<=1);
  assert.ok(Math.abs(s.metrics.typical*s.metrics.effective-s.n)<1e-9);
  for(let k=0;k<5;k++){const initial=s.agents.reduce((z,a)=>z+a.initial[k],0),final=s.agents.reduce((z,a)=>z+a.opinion[k],0);assert.ok(Math.abs(initial-final)<1e-9,'Population mean conservation');}
}
const zero=simulate({seed:7,epsilon:0,solidarity:0});assert.equal(zero.events.accepted,0);assert.ok(zero.agents.every(a=>a.initial.every((v,k)=>v===a.opinion[k])));
const frozen=simulate({seed:7,rewire:0,solidarity:0});const init=population(7);assert.equal(frozen.metrics.edges,init.network.reduce((n,s)=>n+s.size,0)/2);
assert.deepEqual(frozen.groups,components(init.network).groups);
const material=simulate({seed:42,churn:75,context:'material'});assert.deepEqual(baseline.agents.map(a=>a.position),material.agents.map(a=>a.position),'Reference layout stays fixed across contexts');assert.notDeepEqual(baseline.metrics,material.metrics);
const buffered=simulate({seed:42,churn:100,solidarity:100});assert.notDeepEqual(buffered.metrics,simulate({seed:42,churn:100,solidarity:0}).metrics,'Countermechanism must affect dynamics');
const basis=baseline.projection.basis;assert.ok(Math.abs(basis[0].reduce((z,v,k)=>z+v*basis[1][k],0))<1e-10);assert.ok(baseline.projection.explained>0&&baseline.projection.explained<=1);
console.log('Passed: compromise, conservation, deterministic reproduction, graph invariants, bounds, zero confidence, no rewiring, context, solidarity, fixed layout, PCA.');
