import {simulate} from './model.js';
self.onmessage=({data})=>{try{self.postMessage({id:data.id,result:simulate(data.options)});}catch(e){self.postMessage({id:data.id,error:e.message});}};
