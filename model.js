// Research-informed synthesis. See MODEL.md for assumptions and source boundaries.
export const VERSION = '1.0.0';
export function random(seed) { let a=seed>>>0; return ()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;}; }
const normal = r => Math.sqrt(-2*Math.log(Math.max(1e-12,r())))*Math.cos(2*Math.PI*r());
const clamp=x=>Math.max(0,Math.min(1,x));
export function distance(a,b,dims=[0,1,2,3,4]) {return Math.sqrt(dims.reduce((s,k)=>s+(a[k]-b[k])**2,0)/dims.length);}
export function compromise(a,b,mu=.2,dims=[0,1,2,3,4]) {const aa=[...a],bb=[...b];for(const k of dims){aa[k]=a[k]+mu*(b[k]-a[k]);bb[k]=b[k]+mu*(a[k]-b[k]);}return [aa,bb];}
export function pca(vectors){
  const d=vectors[0].length,n=vectors.length,mean=Array(d).fill(0);for(const v of vectors)for(let k=0;k<d;k++)mean[k]+=v[k]/n;
  const cov=Array.from({length:d},()=>Array(d).fill(0));for(const v of vectors)for(let j=0;j<d;j++)for(let k=0;k<d;k++)cov[j][k]+=(v[j]-mean[j])*(v[k]-mean[k])/n;
  const basis=[],eigen=[];for(let p=0;p<2;p++){let v=Array.from({length:d},(_,k)=>Math.sin((k+1)*(p+1)+.7));for(let t=0;t<150;t++){let w=cov.map(row=>row.reduce((s,c,k)=>s+c*v[k],0));for(const prev of basis){const dot=w.reduce((s,c,k)=>s+c*prev[k],0);w=w.map((c,k)=>c-dot*prev[k]);}const length=Math.hypot(...w)||1;v=w.map(c=>c/length);}if(v.find(x=>Math.abs(x)>.01)<0)v=v.map(x=>-x);basis.push(v);eigen.push(v.reduce((s,c,j)=>s+c*cov[j].reduce((z,x,k)=>z+x*v[k],0),0));}
  const points=vectors.map(v=>basis.map(b=>b.reduce((s,x,k)=>s+x*(v[k]-mean[k]),0)));const max=Math.max(...points.flat().map(Math.abs),.01)*1.18;
  return {mean,basis,explained:eigen.reduce((a,b)=>a+b,0)/cov.reduce((s,r,k)=>s+r[k],0),points:points.map(([x,y])=>[.5+x/(2*max),.5+y/(2*max)])};
}
export function population(seed=42,n=360){
  const r=random(seed),centers=Array.from({length:24},()=>Array.from({length:5},()=>.09+.82*r()));
  const weights=centers.map(()=>.1+r()**2*4),total=weights.reduce((a,b)=>a+b,0);
  const agents=Array.from({length:n},(_,id)=>{let t=r()*total,g=0;while(t>weights[g]&&g<23)t-=weights[g++];const initial=centers[g].map(x=>clamp(x+.065*normal(r)));return{id,initial,opinion:[...initial]};});
  const projection=pca(agents.map(a=>a.initial));agents.forEach((a,i)=>a.position=projection.points[i]);
  const network=agents.map(()=>new Set());for(let i=0;i<n;i++)for(let k=0;k<5;k++){const j=Math.floor(r()*n);if(i!==j){network[i].add(j);network[j].add(i);}}
  return {agents,network,projection};
}
export function components(network){const labels=Array(network.length).fill(-1),groups=[];for(let i=0;i<network.length;i++){if(labels[i]>=0)continue;const g=groups.length,stack=[i],ids=[];labels[i]=g;while(stack.length){const k=stack.pop();ids.push(k);for(const j of network[k])if(labels[j]<0){labels[j]=g;stack.push(j);}}groups.push(ids);}return{labels,groups};}
export function simulate({seed=42,churn=35,solidarity=20,context='all',n=360,sweeps=90,epsilon:epsilonOverride,rewire:rewireOverride}={}){
  const c=clamp(churn/100),b=clamp(solidarity/100),epsilon=epsilonOverride??(.40-.345*c+.24*b),rewire=rewireOverride??((.025+.82*c)*(1-.85*b));
  const dims=context==='material'?[0,1]:context==='values'?[2,3,4]:[0,1,2,3,4];
  const {agents,network,projection}=population(seed,n),r=random(seed^0x5f3759df);let accepted=0,attempts=0,removed=0,replaced=0,bridges=0;
  const add=(i,j)=>{network[i].add(j);network[j].add(i);};const remove=(i,j)=>{network[i].delete(j);network[j].delete(i);};
  for(let t=0;t<sweeps*n;t++){
    const i=Math.floor(r()*n);let j;
    // Independent cross-population bridge opportunity; it can add a new tie.
    const bridge=r()<.07*b;
    if(bridge){j=Math.floor(r()*n);if(j===i)continue;}else{if(!network[i].size)continue;let pick=Math.floor(r()*network[i].size);for(const v of network[i])if(pick--===0){j=v;break;}}
    attempts++;const d=distance(agents[i].opinion,agents[j].opinion,dims),radius=bridge?Math.min(.8,epsilon+.25*b):epsilon;
    if(d<radius){const [a,bb]=compromise(agents[i].opinion,agents[j].opinion,.2,dims);agents[i].opinion=a;agents[j].opinion=bb;accepted++;if(bridge){add(i,j);bridges++;}}
    else if(!bridge&&r()<rewire){remove(i,j);removed++;const candidates=[];for(let k=0;k<n;k++)if(k!==i&&!network[i].has(k)&&distance(agents[i].opinion,agents[k].opinion,dims)<epsilon)candidates.push(k);if(candidates.length){add(i,candidates[Math.floor(r()*candidates.length)]);replaced++;}}
  }
  const {labels,groups}=components(network),sizes=groups.map(g=>g.length),edges=[];network.forEach((neighbors,i)=>{for(const j of neighbors)if(i<j)edges.push([i,j]);});
  const metrics={groups:groups.length,largest:Math.max(...sizes)/n,typical:sizes.reduce((s,k)=>s+k*k,0)/n,isolated:sizes.filter(k=>k===1).length,effective:n*n/sizes.reduce((s,k)=>s+k*k,0),edges:edges.length,acceptance:attempts?accepted/attempts:0};
  return{version:VERSION,seed,churn,solidarity,context,n,sweeps,parameters:{epsilon,rewire,mu:.2,dims,bridgeProbability:.07*b},metrics,events:{accepted,attempts,removed,replaced,bridges},agents:agents.map((a,i)=>({...a,group:labels[i],degree:network[i].size})),groups,edges,projection:{mean:projection.mean,basis:projection.basis,explained:projection.explained}};
}
