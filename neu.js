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