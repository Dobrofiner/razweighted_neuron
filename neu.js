let xor = (x, y) => 1 - (1 - y + x*x*y) * (1 - x + x*y*y)
let xorand = (x,y,z) => xor(x*y, z)
let activation=k=>{
let d=((k*k)/(k+1)+3*k)
return (d/(d+1))
}
/*
xorand=(x,y,z)=>{
let a=x*y
return 1 - (1 - y + a*a*y) * (1 - a + a*y*y)
}

*/
function compromise(x,y){
return ((Math.max(x,y))-Math.abs(x*x-y*y))%1
}
function findClastersWithExpected(data,threshold=0.3,expectedValuesAround){
let clustersFound=[],toIgnore=[]
    for(let d=0;d<data.length;d++){
        if(toIgnore[d]==true){
        continue
        }
        let val=data[d],build=[]
        console.log(val)
        for(let e=0;e<data.length;e++){
        if(toIgnore[e]!=true){
            if(Math.abs(1-(data[e]+0.0000001)/(val+0.0000001))<=threshold){
            build[build.length]=[data[e],e]
            toIgnore[e]=true
         //  console.log(build,data[e],val,Math.abs(1-data[e]/val)<=0.3)
            }
            }
        }
        clustersFound[clustersFound.length]=build
    }
    let bindenedClusters={}
  //  console.log(clustersFound[0])
    for(let d=0;d<clustersFound.length;d++){
        let middleAriph=0
        for(let e=0;e<clustersFound[d].length;e++){
        middleAriph+=clustersFound[d][e][0]
        }
        let total=middleAriph/clustersFound[d].length
   //     console.log(total)
        for(let e=0;e<expectedValuesAround.length;e++){
            
            if(Math.abs(1-(total+0.0000001)/(expectedValuesAround[e]+0.0000001))<=threshold){
                bindenedClusters[expectedValuesAround[e]]=clustersFound[d]
            //  console.log("yeee")
                break;
            }
            if(expectedValuesAround[e]==0&&total-expectedValuesAround[e]<threshold){
               bindenedClusters[expectedValuesAround[e]]=clustersFound[d]
            //  console.log("yeee")
                break;
            }
        }
    }
    return bindenedClusters
}
let rdg=state=>((state+0xD0B)*0xD0BD^(0xAEDEAABD-1))>>>0
let rdg128 = (state) => ((
    (state + 0xD0BDn) * 
    0xdd0ed0bddd1d0bd5n ^ 
    (0xAEDEAABDAEDEAABDAEDEAABDAEDEAABDn - 1n)
) & 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFn);
function neu(inp,rw){
let total=inp[0]/rw[0]
    for(let d=1;d<inp.length;d++){
    total-=inp[d]/rw[d]
    }
    return activation(xorand(total,rw[0],rw[1]))
}
function floyd32(rdg,maxSteps=2**33,seed){
let steps=1
    let states=new Uint32Array([seed,seed])
    let start=performance.now()
    states[0]=rdg(states[0])
    states[1]=rdg(rdg(states[1]))
    while(states[0]!=states[1]&&steps<maxSteps){
        states[0]=rdg(states[0])
    states[1]=rdg(rdg(states[1]))
        steps++
    }
    let end=performance.now()
    return {period:steps,time:end-start,calledRdg:steps*3}
}
let norm=x=>((x*x)/(0.1+x*x))
function neuXorand(inp,rw){
let total=inp[0]/rw[0]
    for(let d=1;d<inp.length;d++){
    total-=inp[d]/rw[d]
    }
    return activation(xorand(total,rw[rw.length-2],rw[rw.length-1]))
}
function neu2(inp,rw){
let firstNeu=neu(inp,rw)
    return neu([firstNeu,1],[rw[rw.length-2],rw[rw.length-1]])
}
function netAnyInputs2outs(inp,weights){
    let first=neu2(inp,weights.slice(0,inp.length+2))
    let sec=neu2(inp,weights.slice(inp.length+2))
    return [first,sec]
}
function reward(answers,expected){
    let total=0
    for(let d=0;d<answers.length;d++){
            total+=((answers[d]+0.01/expected[d]+0.01))/expected[d]
    console.log(total)
    }
    return total/(calcError(answers,expected)+1)
}
function tuporadient(f,x,y=0.1,eps=1e-6,mode=0){
if(!mode||mode=="down"){
return (f((x-y)-eps)+eps)/(f(x+eps)+eps)
}else if(mode||mode=="up"){
   return f(x+eps)/(f((x-y)-eps)+eps) 
}
}
function tuporadient2(f, x, y=0.1, eps=1e-6) {
        return f(x+eps) - (f((x-y)-eps) + eps)
}
function tuporadientAutoY(f, x,yMul=1.1 ,eps=1e-6,aggresive=false,mode="fixed") {
    let y=x*(Math.min(0.2,yMul))
    if(mode=="adaptive"){
        y=Math.min(1,10**(Math.floor(Math.log10(Math.abs(x+1e-16))))) *yMul
    if(aggresive){
        y=Math.min(1,10**(Math.ceil(Math.log10(Math.abs(x+1e-16))))) *yMul
    }
    }
    return f(x+eps) - (f((x-y)-eps))
}
function tuporadientAY(f, x,yMul=1.1 ,eps=1e-6) {
    let y=x*(Math.min(0.2,yMul))
//return (f(x+eps)-f(x-eps))/(2*eps)
 return f(x+eps) - (f((x-y)-eps))
}
function errorOfWeight(samples,expected,weights,i,neuF,newVal,errF,state,answers,batchSizes=10){
    let orig=weights[i]
    weights[i]=newVal
let id=0//rdg(state.state)%samples.length
    let c=[];
    let length=Math.min((id+batchSizes),samples.length)
    for(let d=id;d<samples.length;d++){
        c[d]=neuF(samples[d].inp,weights)
    }//   console.log(answers,expected)
    let err=errF(c,expected)
    weights[i]=orig
 //   state.state=rdg(state.state)
   // console.log(c,state)
    return err
}
/**
 let samplesd=createSamplesBINRT2Neu5()
let res=await learnByTuporadient(samplesd,new Array(62).fill(1),50_000,100,fastNeu2neus,multiError,1e-6,10,100,1000)
console.log(res)
console.log(res.bestAnswers.map((x)=>[Math.round(x[0]/0.25)*0.25,Math.round(x[1]/0.25)*0.25]))
 */
function createAdaptedFunc(func,isIndexInArray){
    if(isIndexInArray){
        return (weights,index)=>{
            return func(weights[index[0]])
        }
    }else{
        return (weights,index)=>{
            return func(weights[index])
        }
    }
}
let newFastUnAct=x=>(x*2)/(x*x+1)
//let createAdaptedFunc=(func,iAsArr)=>{if(iAsArr){return(w,i)=>func(w[i[0]])}else{return(w,i)=>func(w[i])}}
function learnByTuporadient(samples,weights,steps,lr=0.05,neuFunc=dNeu,errFunc=calcError,eps=0.0001,seed=1,maxMutationsEps=100,maxRw=5,epsTup=1e-15,batchSize){
    let copy=new Float64Array(weights.length),invMax=1/maxRw+1e-15,state={state:seed+1}
    copy.set(weights),origW=new Float64Array(copy)
 //   console.log()
    let bestWeights=new Float64Array(weights.length),bestAnswers=[]
    let expected=[],bestErr=1
    for(let d=0;d<samples.length;d++){
        expected[d]=samples[d].res
    }
      let answers=[]
        for(let d=0;d<samples.length;d++){
            answers[d]=neuFunc(samples[d].inp,copy)
        }
        console.log(answers)
    let d=0
    let fails=0,rnd=createRdg32BWithSeed(seed)
    let start=performance.now()
    for(d=0;d<steps;d++){
        origW.set(copy)
        for(let e=0;e<copy.length;e++){
            let orig=copy[e]
            let tup=tuporadientAY((x)=>errorOfWeight(samples,expected,origW,e,neuFunc,x,errFunc,state,answers,batchSize),copy[e],0.1,epsTup)
   //     console.log(tup)
            copy[e]-=(tup*orig)*lr
          //  while(copy[e]>maxRw||copy[e]<-maxRw){
             //   copy[e]*=invMax
            //}
            if(copy[e]>maxRw||copy[e]<-maxRw){
    copy[e]%=maxRw
            }
        }
        answers=[]
        for(let d=0;d<samples.length;d++){
            answers[d]=neuFunc(samples[d].inp,copy)
        }
        let err=errFunc(answers,expected)
    //   console.log(err,copy)
        if(err<bestErr){
            if((1-(err/bestErr)*100)<=1){
                fails++
            }else{
                fails=0
            }
      //    if(d>100){
    //      console.log("улучшение ошибки! итерация ",d,"ошибка:",bestErr,"->",err,"(",(1-(err/bestErr))*100,")")
  //       }
            bestWeights.set(copy)
            bestErr=err
            bestAnswers=[...answers]
         // lr-=0.1
        }else{
            fails++
           
          // lr+=0.2
        }//
        if(fails>=maxMutationsEps){
           for(let e=0;e<copy.length;e++){
             copy[e]+=(rnd.getFloat()*2-1)
            }
        }
        if(bestErr<=eps){
            break;
        }
   //     if(d%100==0){
   //   console.log("итерация",d,"ошибка:",bestErr)
   //     }
    }
    let end=performance.now()
    return {bestErr,bestAnswers,bestWeights,copy,time:end-start,lr,iters:d}
}
//let samplesd=createSamplesBINRT(true,5,0)
//await learnByTuporadient(samplesd,new Array(31).fill(1),1_000_000,100,fastNeu,calcError,1e-6,1000,100,100
async function learnByDubits(samples,weights,steps=100,neuFunc=dNeu,errFunc=calcError,seed=1,mutations=true,thresholdMutations=10,eps=0.0001){
    let copy=new Float32Array(weights),fails=0,dubits=new Array(weights.length),bestWeights=new Float32Array(weights),bestErr=100,bestAnswers=[]
    let rng=new dubit(0.5,1,seed+weights.length,2)
    for(let d=0;d<dubits.length;d++){
        dubits[d]=new dubit(0.5,1,seed+d,2)
    }
    let expected=[]
    for(let d=0;d<samples.length;d++){
        expected[d]=samples[d].res
    }
   //let fails=0
   let start=performance.now(),d
    for(d=0;d<steps;d++){
        copy.set(bestWeights)
    
        for(let e = 0;e<dubits.length;e++){
         ///   let sign=(-1)**dubits[e].measure()
            let thing=dubits[e].measure()
            if(thing){
                copy[e]*=dubits[e].measure()?1.2:0.8
            }else{
                copy[e]+=dubits[e].measure()?0.2:-0.1
            }
            if(mutations){
    if(fails>=thresholdMutations){
            fails=0
                  for(let e = 0;e<dubits.length;e++){
                    dubits[e].not()
                  }
         for(let e = 0;e<dubits.length;e++){
        rng.measure()
           copy[e]+=rng.a*2-1
        }
            }
        } 
                  let answers=[]
        for(let e=0;e<samples.length;e++){
            answers[e]=neuFunc(samples[e].inp,copy)
        }
        let error=errFunc(answers,expected)
        if(error<bestErr){
            bestAnswers=[...answers]
            bestWeights.set(copy)
            console.log("improved!",d,bestErr,"->",error,100-(error/bestErr)*100,"%")

            bestErr=error
            for(let e = 0;e<dubits.length;e++){
               dubits[e].noiseRate*=0.95
            }
           // break;
        }else{
            for(let e = 0;e<dubits.length;e++){
               dubits[e].noiseRate=(dubits[e].noiseRate*1.2)%1
            }
            fails++
          //  console.log("failed")
        }
    }
        if(bestErr<eps){
            console.log("достигнута ошибка ",bestErr,"за ",d,"итераций!")
            break;
        }
       //  for(let e = 0;e<dubits.length;e++){
         //   dubits[e].measure()
           //    copy[e]+=dubits[e].a*2-1
            //}
    }
    let end=performance.now()
    return {err:bestErr,answers:bestAnswers,weights:bestWeights,dubits,time:end-start,iters:d}
}

async function learnByDubitsCheckEnd(samples,weights,steps=100,neuFunc=dNeu,errFunc=calcError,seed=1,mutations=true,thresholdMutations=10,eps=0.0001){
    let copy=new Float32Array(weights),fails=0,dubits=new Array(weights.length),bestWeights=new Float32Array(weights),bestErr=100,bestAnswers=[]
    let rng=new dubit(0.5,1,seed+weights.length,2)
    for(let d=0;d<dubits.length;d++){
        dubits[d]=new dubit(0.5,1,seed+d,2)
    }
    let expected=[]
    for(let d=0;d<samples.length;d++){
        expected[d]=samples[d].res
    }
   //let fails=0
   let start=performance.now(),d
    for(d=0;d<steps;d++){
        copy.set(bestWeights)
    
        for(let e = 0;e<dubits.length;e++){
         ///   let sign=(-1)**dubits[e].measure()
            let thing=dubits[e].measure()
            if(thing){
                copy[e]*=dubits[e].measure()?1.2:0.8
            }else{
                copy[e]+=dubits[e].measure()?0.2:-0.1
            }
    }
        if(mutations){
    if(fails>=thresholdMutations){
            fails=0
                  for(let e = 0;e<dubits.length;e++){
                    dubits[e].not()
                  }
         for(let e = 0;e<dubits.length;e++){
        rng.measure()
      
        copy[e]+=rng.a*2-1
           
        }
            }
        } 
                  let answers=[]
        for(let e=0;e<samples.length;e++){
            answers[e]=neuFunc(samples[e].inp,copy)
        }
        let error=errFunc(answers,expected)
        if(error<bestErr){
            bestAnswers=[...answers]
            bestWeights.set(copy)
            console.log("improved!",d,bestErr,"->",error,100-(error/bestErr)*100,"%")

            bestErr=error
            for(let e = 0;e<dubits.length;e++){
               dubits[e].noiseRate*=0.95
            }
           // break;
        }else{
            for(let e = 0;e<dubits.length;e++){
               dubits[e].noiseRate=(dubits[e].noiseRate*1.2)%1
            }
            fails++
          //  console.log("failed")
        }
        if(bestErr<eps){
            console.log("достигнута ошибка ",bestErr,"за ",d,"итераций!")
            break;
        }
       //  for(let e = 0;e<dubits.length;e++){
         //   dubits[e].measure()
           //    copy[e]+=dubits[e].a*2-1
            //}
    }
    let end=performance.now()
    return {err:bestErr,answers:bestAnswers,weights:bestWeights,dubits,time:end-start,iters:d}
}

async function learnByDubitsCheckEndPrevMeasure(samples,weights,steps=100,neuFunc=dNeu,errFunc=calcError,seed=1,mutations=true,thresholdMutations=10,eps=0.0001){
    let copy=new Float64Array(weights),fails=0,dubits=new Array(weights.length),bestWeights=new Float64Array(weights),bestErr=100,bestAnswers=[]
    let rng=new dubit(0.5,1,seed+weights.length,2),prev=0
    for(let d=0;d<dubits.length;d++){
        dubits[d]=new dubit(0.5,1,seed+d,2)
    }
    let expected=[]
    for(let d=0;d<samples.length;d++){
        expected[d]=samples[d].res
    }
   //let fails=0
   let start=performance.now(),d
    for(d=0;d<steps;d++){
        copy.set(bestWeights)
    
        for(let e = 0;e<dubits.length;e++){
         ///   let sign=(-1)**dubits[e].measure()
            let thing=dubits[e].measure()
            if(thing){
                copy[e]*=prev?1.2:0.8
            }else{
                copy[e]+=prev?0.2:-0.1
            }
            prev=thing
    }
        if(mutations){
    if(fails>=thresholdMutations){
            fails=0
                  for(let e = 0;e<dubits.length;e++){
                    dubits[e].not()
                  }
         for(let e = 0;e<dubits.length;e++){
        rng.measure()
      
        copy[e]+=rng.a*2-1
           
        }
            }
        } 
                  let answers=[]
        for(let e=0;e<samples.length;e++){
            answers[e]=neuFunc(samples[e].inp,copy)
        }
        let error=errFunc(answers,expected)
        if(error<bestErr){
            bestAnswers=[...answers]
            bestWeights.set(copy)
            console.log("improved!",d,bestErr,"->",error,100-(error/bestErr)*100,"%")

            bestErr=error
            for(let e = 0;e<dubits.length;e++){
               dubits[e].noiseRate*=0.95
            }
           // break;
        }else{
            for(let e = 0;e<dubits.length;e++){
               dubits[e].noiseRate=(dubits[e].noiseRate*1.2)%1
            }
            fails++
          //  console.log("failed")
        }
        if(bestErr<eps){
            console.log("достигнута ошибка ",bestErr,"за ",d,"итераций!")
            break;
        }
       //  for(let e = 0;e<dubits.length;e++){
         //   dubits[e].measure()
           //    copy[e]+=dubits[e].a*2-1
            //}
    }
    let end=performance.now()
    return {err:bestErr,answers:bestAnswers,weights:bestWeights,dubits,time:end-start,iters:d}
}
function rte(answers,expected){//relative total error
    let answ=0
    let expect=0
    for(let d=0;d<answers.length;d++){
        let w=(d/(anwers.length-1))
        answ+=(answers[d]**2)
        expect+=(expected[d]**2)
    }
    return Math.abs((1-(answ/expect)))
}
function rteSquare(answers, expected) {
    let answ = 0, expect = 0
    for(let d = 0; d < answers.length; d++) {
        let w = d / (answers.length - 1)
        answ += (answers[d] - (expected[d] - answers[d])) ** 2 * w
        expect += (expected[d] ** 2) * w
    }
    return Math.abs(1 - (answ / expect)) ** 2
}
function rteNoWeight(answers, expected) {
    let answ = 0, expect = 0
    for(let d = 0; d < answers.length; d++) {
        //let w = d / (answers.length - 1)
        answ += (answers[d] - (expected[d] - answers[d])) ** 2
        expect += (expected[d] ** 2)
    }
    return Math.abs(1 - (answ / expect)) ** 2
}
function rteNoWeightBetter(answers, expected) {
    let answ = 0, expect = 0
    for(let d = 0; d < answers.length; d++) {
        //let w = d / (answers.length - 1)
        answ += (expected[d] - answers[d])**2
        expect += (expected[d] ** 2)
    }
    return (answ / expect)** 2
}
function fastWAct(k){
    let m=k*(3-k)
    let d=m*m
    return d/(d+1)
}
function fastNeu(inp,rw,offset=0,mul=1,stupid=false){
let total=inp[0]/rw[stupid?offset:0]
    for(let d=1;d<inp.length;d++){
    total-=inp[d]/rw[offset+d]
    }
    return fastWAct(total*mul)
}
function fastNeu2neus(inp,rw,mul=1){
let n=fastNeu(inp,rw,0,mul)
let n2=fastNeu(inp,rw,inp.length,mul)
    return [n,n2]
}
function twoLayerFastNeu(inp,rw,mul=1){
let n=fastNeu(inp,rw,0,mul)
let n2=fastNeu(inp,rw,inp.length,mul)
let end=fastNeu([n,n2,1],rw,inp.length*2,mul)    
return end
}
function createRdg32BWithSeed(seed){
    let obj={
        rdg:rdg,
        seed,state:seed,
        getFloat:function getFloat(){
        let res=this.rdg(this.state)
        this.state=res;
        return res/(2**32)
    },
    getInt:function getInt(){
        let res=rdg(this.state)
        this.state=res
        return res
    }
}
return obj
}
function calcError2(res,expected){
let total=0,exTotal=0
    for(let d=0;d<res.length;d++){
        total+=res[d]**2
        exTotal+=expected[d]**2
    }
    return total/exTotal-1
}
function calcError3(res,expected){
let total=0
    for(let d=0;d<res.length;d++){
    let err=Math.abs((expected[d]||0)-res[d])
        total+=(err+1)/res.length
    //    console.log(err,total)
    }
    
    return total-1
}
function calcError(res, expected) {
    let total = 0;
    for (let d = 0; d < res.length; d++) {
        let diff = res[d] - expected[d];
        total += diff * diff;
    }
    return total / res.length;
}
function calcErrorMda(res, expected,maxWeight,weights) {
    let total = 0;
    for (let d = 0; d < res.length; d++) {
        let diff = res[d] - expected[d];
        total += diff * diff;
    }
    for(let d=0;d<weights.length;d++){
        total+=(weights[d]/maxWeight)
    }
    return total / res.length;
}

function xorandNeu(inp,weights){
let result=xorand(weights[weights.length-1],inp[0]/weights[0],inp[1]/weights[1])
    for(let d=3;d<inp.length;d+=2){
    result=xorand(result,inp[d]/weights[d],inp[d+1]/weights[d+1]||0)
    }
    return result
}

async function studyNeu(samples,startWeights=[100,100,100],epsilon=0.05,steps=50000,seed=1,randSearch=true,randSearchSteps=1000,minRand=-10,maxRand=10,log=1,neuFunc=neu,enableDeterministicThings=false,logF=console.log,batchSize=250_000,errorFunc=calcError){
    let expected=[],bestErr=100,rand=createRdg32BWithSeed(seed),searchRand=createRdg32BWithSeed(seed+1),randWeights=[0,0,0]
let storyKpds=[],totalKpd=0
    let howManyTimesNotChange=0,weights=[...startWeights],bestAnswers=[],inputs=[]
    for(let d=0;d<samples.length;d++){
        expected[d]=samples[d].res
    }
    for(let d=0;d<samples.length;d++){
      inputs[d]=samples[d].inp//нам не нужно копирование внутренних значений 
    }
    let answers=[],bestRandWeights=[],start=performance.now()
       let max=-maxRand,min=-minRand
    if(randSearch){
        logF("Начинается случайный поиск...")
        for(let d=0;d<randSearchSteps;d++){
            if(d%batchSize==0){
           //     logF("Передых на ",d,"Ошибка:",bestErr)
                await new Promise(resolve=>setTimeout(resolve,10))
            }
            for(let e=0;e<startWeights.length;e++){
                randWeights[e]=searchRand.getFloat()*maxRand+(maxRand-minRand)//*(max-min)-max//
            }
            for(let s=0;s<expected.length;s++){
                answers[s]=neuFunc(samples[s].inp,randWeights)
            }
             error=errorFunc(answers,expected)
            if(error<bestErr&&error>0){
                      if(log){
            logF(`На шаге ${d} при случайном поиске обнуражено улучшение ошибки!улучшение:${error}->${bestErr}(${(1-error/bestErr)*100}%)`)
                      }
                bestErr=error
                weights=[...randWeights]
                bestRandWeights=[...randWeights]
                bestAnswers=[...answers]
            }
        }
    }
console.log(expected,bestRandWeights)
    let d=0,copy=[],failedMutations=0,multiplayer=1
   let  muls =[0.4,0.5,0.6,0.7,0.8,0.9,1.1,1.2,1.3,1.4,1.5,1.6,1.7,1.8,1.9]
let shifts= [-1,-0.1,-0.01,1,0.1,0.01]
logF("Начинается обучение! Веса: "+JSON.stringify(weights))
    for(d=0;d<steps;d++){
   //     console.log("cycle")
          if(d%batchSize==0){
          //      logF("Передых на ",d,"Ошибка:",bestErr)
                await new Promise(resolve=>setTimeout(resolve,10))
            }
       error=0
       let prevErr=bestErr
        for(let d=0;d<weights.length;d++){
            copy[d]=weights[d]
        }
 if(enableDeterministicThings){
        for(let f=0;f<muls.length;f++){
            let m=muls[f]
            for(let e=0;e<copy.length;e++){
                copy[e]*=m
            }
             for(let s=0;s<expected.length;s++){
                answers[s]=neuFunc(samples[s].inp,copy)
            }
             error=errorFunc(answers,expected)
            if(error<bestErr&&error>0){
                if(log){
logF(`На шаге ${d} фазе умножения весов на коэффициенты обнуражено улучшение ошибки!Коэффциент ${muls[f]},улучшение:${error}->${bestErr}(${(1-error/bestErr)*100}%)`)
                }
               bestErr=error
                weights=[...copy]
                bestAnswers=[...answers]
                  failedMutations=0

                            break;

            }
        }
        for(let f = 0;f<shifts.length;f++){
            let shift=shifts[f] 
            for(let e=0;e<copy.length;e++){
                copy[e]+=shift
            }
            for(let s=0;s<expected.length;s++){
                answers[s]=neuFunc(samples[s].inp,copy)
            }
            error=errorFunc(answers,expected)
            if(error<bestErr&&error>0){
               if(log){
                       logF(`На шаге ${d} фазе сдвига весов на малую дельту обнуражено улучшение ошибки!Коэффциент ${shifts[f]},улучшение:${error}->${bestErr}(${(1-error/bestErr)*100}%)`)
               }
               bestErr=error
                weights=copy
                  failedMutations=0

              break;

            }
        }
    }

        //if(rand.getFloat()>0.5||howManyTimesNotChange>=10){//чтоб не застрять
        if(failedMutations>1_000_000){
            adaptiveMutate=1
      //      logF("слишком много пправалнных мутаций.включен был режиим адаптивных мутаций",copy,multiplayer)
            failedMutations=0
   //        multiplayer+=10
        }
          //  let mutationStrength=Math.max((bestErr*1000),2)

//if(!adaptiveMutate){
    mutationStrength=2
//}ч
// код мутаций
let mutationStrengthD2=mutationStrength/2
           for(let d=0;d<copy.length;d++){
                copy[d]+=(rand.getFloat()*mutationStrength-mutationStrengthD2)*multiplayer
            }
            for(let s=0;s<expected.length;s++){
                answers[s]=neuFunc(samples[s].inp,copy)
            }
            error=errorFunc(answers,expected)
            if(error<bestErr&&error>0){
              if(log){
               logF(`На шаге ${d} при случайной мутации обнуражено улучшение ошибки!улучшение:${error}->${bestErr}(${(1-error/bestErr)*100}%)`)
              }
                bestErr=error
                weights=[...copy]
                bestAnswers=[...answers]
                  howManyTimesNotChange=0
                  failedMutations=0
            }else{
                failedMutations++;
            }
          
     //   }
//    let kpd=1-bestErr/prevErr
  //      if(bestErr!=prevErr){
    //        kpd=0
      //  }
        //totalKpd+=(kpd*100)
        ///storyKpds[storyKpds.length]=kpd*100 
      //  console.log(bestErr)
    //    if(error<bestErr){
  ////     weights=copy
 //  /
     //  console.log("Веса на шаге "+d+" :",weights)
   //     }else{
    //        howManyTimesNotChange++
    //    }
        if(bestErr<epsilon){
            logF(`Достигнута целевая ошибка за ${d+1} итераций! Итоговая ошибка:${bestErr}.\nОтветы:`+JSON.stringify(bestAnswers))
            break;
        }

    }
  //  console.log("КПД:",totalKpd/storyKpds.length)
    let end=performance.now()
    return {time:end-start,weights,err:bestErr,iters:d+1,bestAnswers,expected,kpd:totalKpd/storyKpds.length,storyKpds,modelName:neuFunc.name}
}

function getAnswers(rw,samples){
    let answers=[]
    let expected=[]
       for(let d=0;d<samples.length;d++){
        expected[d]=samples[d].res
    }
          for(let s=0;s<expected.length;s++){
                answers[s]=neu(samples[s].inp,rw)
            }
            return answers
}
function neuOffset(inp,rw,offset){
   // if(offset!=0)offset+=1
let total=inp[0]/rw[offset]
    for(let d=1;d<inp.length;d++){
    total-=inp[d]/rw[d+offset]
    }
    return activation(xorand(total,rw[offset],rw[offset+1]))
}
function fourOutsNet(inp,weights){
    let one=neuOffset(inp,weights,0)
    let sec=neuOffset(inp,weights,inp.length+1)
    let third=neuOffset(inp,weights,(inp.length+1)*2)
    let four=neuOffset(inp,weights,(inp.length+1)*3)
    return [one,sec,third,four]
}
function multiError(answers,expected){
    let error=0
    for(let d=0;d<answers.length;d++){
        error+=calcError(answers[d],expected[d])
    }
    return error/(answers[0].length*answers.length)
}
let numbers=[
    [
    0,1,1,1,0,
    1,0,0,0,1,
    1,0,0,0,1,
    1,0,0,0,1,
    1,0,0,0,1,
    0,1,1,1,0
    ],[
    0,0,1,0,0,
    0,1,1,0,0,
    1,0,1,0,0,
    0,0,1,0,0,
    0,0,1,0,0,
    0,0,1,0,0
    ],[
    0,1,1,1,0,
    1,0,0,1,0,
    0,0,1,0,0,
    0,1,0,0,0,
    1,1,1,1,1,
    0,0,0,0,0
    ],[
    1,1,1,1,1,
    0,0,0,0,1,
    1,1,1,1,1,
    0,0,0,0,1,
    0,0,0,0,1,
    1,1,1,1,1
    ],[
    0,0,0,1,0,
    0,0,1,1,0,
    0,1,0,1,0,
    1,1,1,1,1,
    0,0,0,1,0,
    0,0,0,1,0
    ],[
    1,1,1,1,1,
    1,0,0,0,0,
    1,1,1,1,0,
    0,0,0,0,1,
    0,0,0,0,1,
    1,1,1,1,0
    ],[
    1,1,1,1,1,
    1,0,0,0,0,
    1,1,1,1,0,
    1,0,0,0,1,
    1,0,0,0,1,
    0,1,1,1,0
    ],[
    1,1,1,1,1,
    0,0,0,0,1,
    0,0,0,1,0,
    0,0,1,0,0,
    0,1,0,0,0,
    1,0,0,0,0
    ],[
    0,1,1,1,0,
    1,0,0,0,1,
    1,0,0,0,1,
    0,1,1,1,0,
    1,0,0,0,1,
    0,1,1,1,0
    ],[
    0,1,1,1,0,
    1,0,0,0,1,
    1,0,0,0,1,
    0,1,1,1,1,
    0,0,0,0,1,
    1,1,1,1,0
    ]
]
function createSamplesBINRT(isOneNeu,count=10,offset=0){
    let samples=[]
    for(let d=offset;d<offset+count;d++){
         if(d==numbers.length){
            break;
         }
        let code=isOneNeu?(d-offset)/(count-1):[...d.toString(2).padStart(4,0)].map(Number)
        samples[samples.length]={
            inp:[...numbers[d],1],
            res:code
        }
     
    }
    return samples
}
function createSamplesBINRT2Neu(){
    let samples=[]
    for(let d=0;d<10;d++){
         if(d==numbers.length){
            break;
         }
        let code=[0,0]
            code[1]=Math.max(0,Math.min((d)/5,1))
            code[0]=Math.max(0,Math.min((d-4)/5,1))
        samples[samples.length]={
            inp:[...numbers[d],1],
            res:code
        }
    }
    return samples
}
function createSamplesBINRT2Neu5(){
    let samples=[]
    for(let d=0;d<10;d++){
         if(d==numbers.length){
            break;
         }
         let inF=d.toString(5)
        let code=[inF[1]/4,inF[0]/4]
if(isNaN(code[0])){
    code[0]=0
}else if(isNaN(code[1])){
    code[1]=0
}
if(d==5){
    code[0]=1
    code[1]=0
}
        samples[samples.length]={
            inp:[...numbers[d],1],
            res:code
        }
    }
    return samples
}
function digitTo2D(digit, total=10) {
    if(digit==0)return [0,0]
    let one=Math.abs(digit-Math.abs(digit-5))/5+1/(digit*2)+(0.01*1/digit)
    let sec=Math.abs(digit-5)/5+1/(digit*3)+1/digit
    return [one/(one+1)+digit*0.01,sec/(sec+1)+(digit*0.01)];
}
let dobAct = k => {
    let d = Math.abs(k - Math.abs(k-0.5) + k - 1/k);
    return d / (d + 1);
}
function dNeu(inp,rw){
let total=inp[0]/rw[0]
for(let d=1;d<inp.length;d++){
    total-=inp[d]/rw[d]
}
    return dobAct(total)
}
function dWeightedNeu(inp,rw){
let total=inp[0]*rw[0]
for(let d=1;d<inp.length;d++){
    total-=inp[d]*rw[d]
}
    return dobAct(total)
}
function dWeightedPlusNeu(inp,rw){
let total=inp[0]*rw[0]
for(let d=1;d<inp.length;d++){
    total+=inp[d]*rw[d]
}
    return dobAct(total)
}
function tuporadientDiff(f, x, y=0.1, eps=1e-6) {
        return f(x+eps) - (f((x-y)-eps) + eps)
}
class Matrix{
    constructor(width,height,copy,activationF){
    this.width=width
    this.height=height
 this.activation=activationF
        this.value=new Array(height)
        for(let d =0;d<this.height;d++){
            this.value[d]=new Array(this.width)
            for(let e =0;e<this.width;e++){
                this.value[d][e] = (copy && typeof copy[d][e] === 'number' && !isNaN(copy[d][e])) 
            ? copy[d][e]
            : 1
            }
        }
    }
    razweight(other){
   // let newMatrix=new  Matrix(this.width,this.height,this.value)
        for(let d=0;d<this.height;d++){
        for(let e=0;e<this.width;e++)
            this.value[d][e]=this.value[d][e]/other.value[d][e]
        }
        return this
    }
    weight(other){
  //  let newMatrix=new  Matrix(this.width,this.height,this.value)
        for(let d=0;d<this.height;d++){
        for(let e=0;e<this.width;e++)
            this.value[d][e]=this.value[d][e]*other.value[d][e]
        }
        return this
    }
    sub(other){
  //  let newMatrix=new  Matrix(this.width,this.height,this.value)
        for(let d=0;d<this.height;d++){
        for(let e=0;e<this.width;e++)
            this.value[d][e]=this.value[d][e]-other.value[d][e]
        }
        return this
    }
    add(other){
  //  let newMatrix=new  Matrix(this.width,this.height,this.value)
        for(let d=0;d<this.height;d++){
        for(let e=0;e<this.width;e++)
            this.value[d][e]=this.value[d][e]+other.value[d][e]
        }
        return this
    }
    copy(){
        return new Matrix(this.width, this.height, this.value,this.activation)
    }
    toVector(){
        let vector=new Vector(this.height,[],this.activation)
         for(let d=0;d<this.height;d++){
            let sum=0
            for(let e=0;e<this.width;e++){
                sum+=this.value[d][e]
            }
             vector.value[d]=sum
        }
        return vector
    }
    toRazWeightVector(){
         let vector=new Vector(this.height,[],this.activation)
         for(let d=0;d<this.height;d++){
            let diff=this.value[d][0]
            for(let e=1;e<this.width;e++){
                diff-=this.value[d][e]
            }
             vector.value[d]=diff
        }
        return vector 
    }
}
class Vector{
    constructor(size,copy,activationF){
        this.value=[]
        this.size=size
        for(let d=0;d<size;d++){
           this.value[d] = (copy && typeof copy[d] === 'number' && !isNaN(copy[d])) 
            ? copy[d] 
            : 1
        }
        this.activation=activationF
    }
    activate(){
        for(let d=0;d<this.size;d++){
            this.value[d]=this.activation(this.value[d])
        }
        return this
    }
}
class dubit{
constructor(alfa,phaseSign=1,seed,noise){
this.a=alfa
this.bSign=phaseSign
    this.gen=createRdg32BWithSeed(seed)
    this.noiseRate=noise
//    this.temperature=temp
}
    measure(log){
        let rand=this.gen.getFloat()
        let m=rand>this.a?0:1
        if(log){
        console.log(this.a,rand)
        }
       this.a=Math.abs(this.a+(this.gen.getFloat()-0.5)*this.noiseRate)%1
    // this.a/=this.a+1
    //this.b/=this.b+1
    return m
    }
get amplitudeA(){
    return this.a<0?-(Math.abs(this.a)**0.5):(this.a**0.5)
}
get amplitudeB(){
    return this.bSign*((1-this.a)**0.5)
}
not(){
this.a=1-this.a
return this
}
setNoiseRate(n){
this.noiseRate=Math.max(0,Math.min(1,n))
}
cnot(other){
if(other.a>0.5){
this.not()
}
    return this
}
hadamard(){
this.a=0.5
this.bSign = (this.bSign === -1 && this.a < 0.5) ? -1 : 1;
return this
}
}
class dubitArray{
    constructor(size,aFiller=x=>2**31,bSign=x=>1,noiseFiller=x=>2**31,seed=1){
        this.d = new Uint32Array(size*4)//на один дубит - 4 числа:0 - a,1-signB,2-state,3-noise
    for(let d=0;d<(this.d.length/4);d++){
        this.d[d*4]=aFiller(d)
        this.d[d*4+1]=bSign(d)
        this.d[d*4+2]=seed+d
        this.d[d*4+3]=noiseFiller(d)
    }
    }
    getStateOf(id,raw=false){
    let obj={a:(this.d[id*4]),
            bSign:(this.d[id*4+1]),
            state:(this.d[id*4+2]),
            noise:(this.d[id*4+3])
            }
        if(!raw){
            obj.bSign=(-1)**obj.bSign
            obj.noise/=2**32
            obj.a/=2**32
        }
        return obj
    }
    measureId(id){
        let nextState=rdg(this.d[id*4+2])
        let m=nextState>this.d[id*4]?0:1
        nextState=rdg(nextState)
        this.d[id*4]=this.d[id*4]+(rdg(nextState)-(2**31))*(this.d[id*4+3]/2**32)
        this.d[id*4+2]=rdg(nextState)
        return m
    }
    not(id){
        this.d[id*4]=2**32-this.d[id*4]
    }
}
function findValInF(f,val,steps,seed,eps,drobPrece=64,diaposon=1,log=1,failsBeforeNot=100,lr=10){
let dub=new dubitArray(2,(x)=>2**31,()=>1,()=>2**32-1,seed)
    let best=0,diapBits=Math.floor(Math.log2(diaposon)),bestErr=100
    let start=performance.now(),d=0
   let  fails=0
  //  console.log(dub)
    for(d=0;d<steps;d++){
        let canditate=0
        let sign=(-1)**dub.measureId(0)
        for(let e=0;e<diapBits;e++){
        canditate=canditate*2+dub.measureId(0)
        }
        let drobP=0
        for(let e=0;e<drobPrece;e++){
        drobP=drobP*2+dub.measureId(0) 
        }
        canditate=canditate+drobP/(2**drobPrece)
        let err=(val-f(canditate))**2
        if(err<=bestErr){
            if(log){
console.log("найден новый кондидант!",canditate,"ошибка:",err,d)
            }
        best=canditate
        bestErr=err
        dub.d[3]=dub.d[3]*0.95*lr
        fails=0
        }else{
        dub.d[3]=(dub.d[3]*1.2+1)*lr
        fails++
        }
        if(fails>failsBeforeNot){
            dub.measureId(1)
            dub.not(0)
            dub.d[0]+=((dub.d[4]*2)-2**32)*lr
        }
        if(bestErr<=eps){
        break;
        }
        
    }
    let end=performance.now()
    let time=end-start
    let speed=1000/(time/d)
    return {best,time,speed,iters:d,bestErr,answer:f(best),dub}
}
/*class dubitArrayFloat{
    constructor(size,aFiller=x=>2**31,bSign=x=>1,noiseFiller=x=>2**31,seed=1){
        this.d = new Float64Array(size*4)//на один дубит - 4 числа:0 - a,1-signB,2-state,3-noise
    for(let d=0;d<(this.d.length/4);d++){
        this.d[d*4]=aFiller(d)
        this.d[d*4+1]=bSign(d)
        this.d[d*4+2]=seed+d
        this.d[d*4+3]=noiseFiller(d)
    }
    }
    getStateOf(id,raw=false){
    let obj={a:(this.d[id*4]),
            bSign:(this.d[id*4+1]),
            state:(this.d[id*4+2]),
            noise:(this.d[id*4+3])
            }
        if(!raw){
            obj.bSign=(-1)**obj.bSign
            obj.noise/=2**32
            obj.a/=2**32
        }
        return obj
    }
    measureId(id){
        let nextState=rdg(this.d[id*4+2])
        let m=nextState>this.d[id*4]?0:1
        nextState=rdg(nextState)
        this.d[id*4]=this.d[id*4]+(rdg(nextState)/2**32-(0.5))*(this.d[id*4+3]/2**32)
        this.d[id*4+2]=rdg(nextState)
        return m
    }
    not(id){
        this.d[id*4]=2**32-this.d[id*4]
    }
}*/
function getStartsWeightsDubit(samples,startWeights=[1,1,1],iters=100){
let weights=[...startWeights],copy=[...startWeights],expected=[]
let bestErr=100,bestAnswers=[],answers=[]

}
class qdit{
constructor(states,seed,noise){
this.states=states.slice(0,5)
let sum=0
for(let d=0;d<this.states.length;d++){
    sum+=this.states[d]
}
for(let d=0;d<this.states.length;d++){
    this.states[d]/=sum;
}
    this.gen=createRdg32BWithSeed(seed)
    this.noiseRate=noise
//    this.temperature=temp
}
normalize(){
    let sum=0
    for(let d=0;d<this.states.length;d++){
    sum+=this.states[d]
}
for(let d=0;d<this.states.length;d++){
    this.states[d]=this.states[d]/sum;
}
//console.log(this.states)
}
    measure(log){
        let rand=this.gen.getFloat()
        let m=0,sum=0
        for(let d=0;d<this.states.length;d++){
            sum+=this.states[d]
            if(sum>rand)m=d;
        }
        if(log){
            console.log(this.states,rand)
        }
        for(let d=0;d<this.states.length;d++){
            this.states[d]=Math.abs(this.states[d]+(this.gen.getFloat()-0.5)*this.noiseRate)%1
        }
        this.normalize()
        return m
    }
}
/*

function hybridSearch(costFunction, domainSize, iterations) {
    let best = Infinity
    let q = new dubit(0.5, 42, 0.1)
    
    for (let i = 0; i < iterations; i++) {
        // 1. Генерируем magnitude (0..domainSize)
        let magnitude = 0
        let bits = Math.ceil(Math.log2(domainSize + 1))
        for (let bit = 0; bit < bits; bit++) {
            magnitude = (magnitude << 1) | q.measure()
        }
        magnitude = magnitude % (domainSize + 1)  // обрезаем до диапазона
        
        // 2. Генерируем знак (0 = плюс, 1 = минус)
        let sign = q.measure() === 0 ? 1 : -1
        
        // 3. Кандидат
        let candidate = sign * magnitude
        
        let cost = costFunction(candidate)
        
        if (cost < best) {
            best = cost
            q.noiseRate *= 0.99
        } else {
            q.noiseRate = Math.min(0.5, q.noiseRate * 1.01)
        }
    }
    return best
}

// Пример: ищем минимум квадратичной функции на [0, 100]
let min = hybridSearch((x)=>((x+1)*(x+1))-1, 30, 10_000)
console.log(min)  // должно быть близко к 0
*/

