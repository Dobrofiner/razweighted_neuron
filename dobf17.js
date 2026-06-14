function abs(x){
    return (x<0)*-x+(x>0)*x
}
function quantFixedPointForInt16(arr,base){
    let maxPreciseInBase=0
    let max=2**15
    while(max>0){
    max=Math.floor(max/base)
    maxPreciseInBase++
    }
let copy=new Float64Array(arr),best="u a stupid"
    for(let d=1;d<maxPreciseInBase;d++){
copy.set(arr)
        let nothingNotWorked=false,scale=base**d
        
        for(let e=0;e<copy.length;e++){
        copy[e]*=scale
            if(Math.abs(copy[e])>2**15){
            nothingNotWorked=true
                break;
            }

        }
        if(nothingNotWorked){
        break
        }else{
        best= {weights:new Int16Array(copy.map(x=>Math.round(x))),scale:base**d,d}
        }
}
    return best
}
function quantFixedPointForInt17(arr,base){
    let maxPreciseInBase=0
    let max=2**16,scale=1
    while(max>0){
    max=Math.floor(max/base)
    maxPreciseInBase++
    }
let copy=new Float64Array(arr)

    let signs=new Uint8Array(Math.ceil(arr.length/8))
    
    for(let d=0;d<copy.length;d++){
    let sign=copy[d]<0?1:0
    copy[d]=Math.abs(copy[d])
    signs[Math.floor(d/8)]|=(sign<<(7-(d&7)))    
    }
    let best={weights:new Uint16Array(copy.map(x=>Math.round(x))),scale,d:0,signMap:signs,code:"u a stupid"}
    for(let d=1;d<maxPreciseInBase;d++){
        let nothingNotWorked=false
        scale*=base
        
        for(let e=0;e<copy.length;e++){
        copy[e]*=base
            if(Math.abs(copy[e])>2**16){
            nothingNotWorked=true
                break;
            }

        }
        if(nothingNotWorked){
        break
        }else{
        best= {weights:new Uint16Array(copy.map(x=>Math.round(x))),scale,d,signMap:signs}
        }
}
    return best
}
function quantFixedPointForInt9(arr,base){
    let maxPreciseInBase=0
    let max=256,scale=1
    while(max>0){
    max=Math.floor(max/base)
    maxPreciseInBase++
    }
let copy=new Float64Array(arr)

    let signs=new Uint8Array(Math.ceil(arr.length/8))
    
    for(let d=0;d<copy.length;d++){
    let sign=copy[d]<0?1:0
    copy[d]=Math.abs(copy[d])
    signs[Math.floor(d/8)]|=(sign<<(7-(d&7)))    
    }
    let best={weights:new Uint8Array(copy.map(x=>Math.round(x))),scale,d:0,signMap:signs,code:"u a stupid"}
    for(let d=1;d<maxPreciseInBase;d++){
        let nothingNotWorked=false
        scale*=base
        
        for(let e=0;e<copy.length;e++){
        copy[e]*=base
            if(Math.abs(copy[e])>2**8){
            nothingNotWorked=true
                break;
            }

        }
        if(nothingNotWorked){
        break
        }else{
        best= {weights:new Uint8Array(copy.map(x=>Math.round(x/base))),scale,d,signMap:signs}
        }
}
    return best
}
function unpackIntNQuant(data=quantFixedPointForInt16(weights,2)){
    console.log(data.signMap)
    let signs=data.signMap
    let toUse=new Float32Array(data.weights)
    for(let d=0;d<toUse.length;d++){
        toUse[d]/=data.scale
        toUse[d]*=(-1)**getSign(signs,d)
    //    console.log(weights[d],toUse[d],getSign(signs,d))
    }
    return toUse
}
function getSign(map,id){
return (map[Math.floor(id/8)]>>((7-(id&7))))&1
}
class int17Array{
    constructor(size,scale=1,safe){
        this.data=new Uint16Array(size)
        this.signs=new Uint8Array(Math.ceil(size/8))
        this.scale=scale
        this.safe=safe
    }
    set(id,value){
        let scaled=Math.round(value*this.scale)
        if(this.safe){
            //проверки

            if(id<0||id>(this.data.length-1)){
                throw new Error("Out of array range:"+id+". Array length is "+this.data.length)
            }
            if(value>(2**16)||value<-(2**16)){
               throw new Error(value+"is out of range. max/min Value is +-"+(2**16)/this.scale+". This value will be converted to int17(maybe some information lose)")
               scaled%=2**16 
            }
        }
        let signId=id>>3
        this.signs[signId]=this.signs[signId]|((scaled<0?1:0)<<(7-(id&7)))
        this.data[id]=Math.abs(scaled)
    }
    get(id){
        if(this.safe){
              if(id<0||id>(this.data.length-1)){
                throw new Error("Out of array range:"+id+". Array length is "+this.data.length)
            }
        }
        return ((-1)**((this.signs[id >> 3] >> (7 - (id & 7))) & 1)*this.data[id])/this.scale
    }
}
function isNegativeZero(x){
return x==0&&1/x==-Infinity
}
function toFloat17(x,bin=false,debug){
//mantissa - 12,exp - 4,sign-1
    let sign=(x<0)||isNegativeZero(x)?1:0
    if(x==0){
        if(bin){
            return ((sign<<16)>>>0)&(2**17-1)
        }else{
            return x
        }
    }
    x=abs(x),xOrig=x
    let exp=0
    if(x<1){
    while(x<1){
        x*=2
        exp--
    }
    }else{
    while(x>=2){
        x/=2///2
        exp++
      // console.log(exp)
    }
    }
    
  //  console.log(exp,x)
    if(Math.abs(exp+7)>15){
        throw new Error("exp out pf range. max exp is -7...8")
    }

    let mantissa=0


    if(x<1){
     //   console.log(x)
mantissa=Math.round(x*2**12)
    }else{
        mantissa=Math.round((x-1)*2**12)
    }
    if (mantissa === 4096) {
    mantissa = 0
    exp++
}
    let value=0
    if(bin){
      //  console.log(sign<<17,(exp+7)<<12,sign<<17|(exp+7)<<12,mantissa)
      if(exp<-7){
        return (((sign<<16)|(0<<12)|(mantissa))>>>0)&(2**17-1)
      }
    return (((sign<<16)|((exp+7)<<12)|(mantissa))>>>0)&(2**17-1)
    }
    if(exp<-7){
   return ((-1)**sign) * (mantissa / 2**12) * 2**-7;
    }
        console.log(mantissa,exp)

    return ((-1)**sign)*2**exp*(mantissa/2**12+1)
}

function toFloat24(x,bin=false,debug){
//mantissa - 17,exp - 6,sign-1
//2**-31-2**32
    let sign=(x<0)||isNegativeZero(x)?1:0
    if(x==0){
        if(bin){
            return ((sign<<23)>>>0)&(2**24-1)
        }else{
            return x
        }
    }
    x=abs(x),xOrig=x
    let exp=0
    if(x<1){
    while(x<1){
        x*=2
        exp--
    }
    }else{
    while(x>=2){
        x/=2///2
        exp++
      // console.log(exp)
    }
    }
    
  //  console.log(exp,x)
    if(Math.abs(exp+31)>63){
        throw new Error("exp out pf range. max exp is -31...32")
    }

    let mantissa=0


    if(x<1){
     //   console.log(x)
mantissa=Math.round(x*2**17)
    }else{
        mantissa=Math.round((x-1)*2**17)
    }
    if (mantissa === 2**17) {
    mantissa = 0
    exp++
}
    let value=0
    if(bin){
      //  console.log(sign<<17,(exp+7)<<12,sign<<17|(exp+7)<<12,mantissa)
      if(exp<-31){
        return (((sign<<23)|(0<<17)|(mantissa))>>>0)&(2**24-1)
      }
    return (((sign<<23)|((exp+31)<<17)|(mantissa))>>>0)&(2**24-1)
    }
    if(exp<-31){
   return ((-1)**sign) * (mantissa / 2**17) * 2**-31;
    }
       // console.log(mantissa,exp)

    return ((-1)**sign)*2**exp*(mantissa/2**17+1)
}

function unpackFloat17(x){
    if(Number.isInteger(x)&&x>=0&&x<2**17){
        let sign=x>>16
        let exp=((x&(2**16-1))>>12)
        let mant=1+((x&(2**12-1))/2**12)
     //   console.log(mant,exp,exp-7)
        if(exp==0){
            console.log(exp)
            return ((-1)**sign) * (mant) * 2**-7;
        }
        exp-=7
        return ((-1)**sign)*2**exp*(mant)
    }
    return NaN
}
function toFloat17_11(x,bin=false,debug){
//mantissa - 11,exp - 5,sign-1
    let sign=(x<0)||isNegativeZero(x)?1:0
    if(x==0){
        if(bin){
            return ((sign<<16)>>>0)&(2**17-1)
        }else{
            return x
        }
    }
    x=abs(x)
    let exp=0
    if(x<1){
    while(x<1){
        x*=2
        exp--
    }
    }else{
    while(x>=2){
        x/=2
        exp++
      // console.log(exp)
    }
    }
  //  console.log(exp,x)
    if((exp+15)>32){
        throw new Error("exp out pf range")
    }
    let mantissa=Math.round((x-1)*2**11)
    let value=0
    if(bin){
    return (((sign<<17)|(exp<<11)|(mantissa))>>>0)&(2**17-1)
    }
    if((exp+15)==0){
   return ((-1)**sign) * (mantissa / 2**11) * 2**-14;
    }
    return ((-1)**sign)*2**exp*(mantissa/2**11+1)
}
function genVisualThing(count,perElement,formatAtPer=16){
let tot=""
    for(let d=0;d<=count;d++){
    tot+=d.toString(36).repeat(perElement)
    }
    let newTot=""
    for(let d=0;d<tot.length;d++){
    if(d%formatAtPer==0&&d!=0){
    newTot+=" "+tot[d]
    }else{
    newTot+=tot[d]
    }
    }
    return newTot
}