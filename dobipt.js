let counter=1,smples=document.getElementById("samples")
function createNewSample(whereToPaste=smples){
    let template=`<div class="dcol-12 dbg-light-green sampleRow dborder dborder-2 dborder-blue-blue" style="margin-bottom: 1px;" data-id="${counter}">
<span style="margin-right: 1rem;">Входы(через запяте):
    <input class="dcol-5 inp" rows="1">
</span>
<span>|Выход:<input class="dcol-2 out" rows="1"></span>
<button class="dbtn" style="text-decoration: none;" data-id="${counter}" onclick="deleteSample(this)">X</button>
</div>`
                counter++
            if(whereToPaste.insertAdjacentHTML){
    whereToPaste.insertAdjacentHTML('beforeend',template)
            }else{
                let div=document.createElement("div")
                div.innerHTML=template
                whereToPaste.appendChild(div.firstChild)
            }
}
function getSamples(){
return smples.getElementsByClassName("sampleRow")
}
function parseElementsToArr(){
    let elements=getSamples(),result=[]
for(let d=0;d<elements.length;d++){
     let thisThing={inp:[],res:0}
    let inputs=elements[d].getElementsByClassName("inp")[0]?.value.split(",").map(Number)
    let out=Number(elements[d].getElementsByClassName("out")[0]?.value)
 //     if (!inpValue || !outValue) continue;
  //  if(inputs.some(NaN)||isNaN(outValue)){
   //    continue;
  //  }
    thisThing.inp=inputs
    thisThing.res=out
    result[result.length]=thisThing
}
return result
}
function deleteSample(btn){
let element=smples.querySelector(`[data-id='${btn.dataset.id}']`)
element.remove()
return 0
}
function uint8ToStr(arr){
let str=""
    for(let d=0;d<arr.length;d++){
    str+=String.fromCharCode(arr[d]&255)
    }
    return str
}
function downloadString(string, mime, name,charset="charset=utf-8",base64=false) {
    const a = document.createElement("a");
    a.href = "data:" + (mime || "text/plain")+";"+charset+";" +(base64?"base64":"")+ "," + encodeURIComponent(string);
    a.setAttribute("download", name || "");
    a.click();
    return a.href;
}
function downloadBytes(arr,name){
    return downloadString(btoa(uint8ToStr(arr)),"application/octet-stream",name,'charset=iso-8859-1',true)
}
/*    <div id="settings">
    Здесь конфигурация. Обучать кого?<select id="model">
            <option value="neu">Сам нейрон</option>
              <option value="neu2">Цепочку: 1 нейрон - черновик создает, другой подправляет</option>
            </select><br>
             <input type="checkbox" name="" id="randSearch">Включить случайный поиск?<br>
            Диапозон случайного поиска?(сначала минимум,потом максимум, через запяте)<input id="diaposon" type="text" value="-1,1"><br>
            Сколько шагов сделать в случайном поиске?<input id="randSearchSteps" type="text" value="500_000"><br>
            Какую ошибку желаете?<input id="error" type="text" value="0.0001"><br>
            Какие начальные веса(через запяте,будут проигнорированы если случайный поиск есть)? <input type="text" name="" value="1,1,1" id="startWeights"><br>
            Сколько шагов основной части? <input type="text" name="" value="500_000" id="mainSteps"><br>
            <input type="checkbox" name="" id="logsEnable">Включить ли логи?<br>
             <input type="checkbox" name="" id="deterministicThings">Включить ли умножения весов на коэффиценты и сдвиг на малые дельты?(иногда помагает,но замедляет)<br>
            </div> */
function collectSettings(){
    let settings=document.getElementById("settings")
    let samples= parseElementsToArr()
    let modelName=document.getElementById("model").value
    let model=neu
    if(modelName=="neu"){
        model=neu
    }else if(modelName=="neu2"){
        model=neu2
    }else if(modelName=="dNeu"){
        model=dNeu
    }
let startWeights=document.getElementById("startWeights").value.split(",").map(Number)
//let samplesMaxLength=obj.samples.reduce((val,x)=>Math.max(x.inp.length,x))
//if(startWeights.some(NaN)){

//}
let randDiaposon=document.getElementById("diaposon").value.split(",").map(Number)
let epsilon=parseFloat(document.getElementById("error").value)||0.001
let Iflog=document.getElementById("logsEnable").checked
let seed=parseFloat(document.getElementById("seed").value)
let enableDeterministicThings=document.getElementById("deterministicThings").checked
let steps=parseFloat(document.getElementById("mainSteps").value)||1_000_000
let randSteps=parseFloat(document.getElementById("randSearchSteps").value)||1_000_000
let randSearch=document.getElementById("randSearch").checked
return [{
    samples,
    startWeights,
    epsilon,
    steps,
    seed: seed || 1,
    randSearch,
    randSearchSteps: randSteps,
    minRand: randDiaposon[0] || -1,
    maxRand: randDiaposon[1] || 1,
    log: Iflog,
    model,
    enableDeterministicThings,
    modelName
},[
    samples,
    startWeights,
    epsilon,
    steps,
    seed || 1,
    randSearch,
    randSteps,
    randDiaposon[0] || -1,
    randDiaposon[1] || 1,
    Iflog,
    model,
    enableDeterministicThings
]]
}
  function downloadString(string,mime,name){
            const a = document.createElement("a");
            a.href = "data:" + (mime||"text/plain") + "," + encodeURIComponent(string);
            a.setAttribute("download",name||"");
            a.click();
            return a.href;
        }
function log(value,scroll=true){
let l =  document.getElementById("log")
let toTransfer=value
if(typeof value != "string"){
    toTransfer=JSON.stringify(value)
}
let date=Date().split(" ")[4]
l.insertAdjacentHTML("beforeend",`[${date}]>`+toTransfer+"<br>")
  scroll?l.scrollTop = l.scrollHeight:"";  
}
let lastRes=collectSettings()
async function startLearning(){
    let params=collectSettings()[1]
    log("Стартуем обучение!")

let result=await studyNeu(...params,log)
lastRes=JSON.stringify(result)
console.log(lastRes)
let text=`Время:${result.time/1000} сек <br>
Итоговая ошибка:${result.err}<br>
Развеса в результе:${result.weights.join(",")}<br>
Ответы:${result.bestAnswers.join(",")}<br>
Итераций (основных): ${result.iters}<br>
Скачать это как json:<button class="dbtn" onclick='downloadString(lastRes,"application/json","Результаты обучения Развещенного нейрона.json")'>Скачать</button>
`
document.getElementById("result").innerHTML=text;
return result
}
function loadSettings(){
    let reader=new FileReader()
    let fileLoader=document.createElement("input")
    fileLoader.type="file"
    fileLoader.accept = "application/json"; // например, только JSON
    fileLoader.onchange = (event) => {
        let file = fileLoader.files[0];
        if (!file) return;

        let reader = new FileReader();
        reader.onload = (e) => {
            try {
                let data = JSON.parse(e.target.result);
                let errs=checkErrorsInSettings(data)
                if(errs.isValid){
                setSettings(data);
                }else{
                alert("Тут есть ошибки:\n-"+errs.errors.join("\n-"))
                }
            } catch (err) {
                console.error("Ошибка парсинга JSON", err);
            }
        };
        reader.readAsText(file);
    };

    fileLoader.click();
}
function setSettings(data=collectSettings()[1]){
let settings=document.getElementById("settings")
let samples=data.samples;
smples.innerHTML=""
let fragment=new DocumentFragment()
counter=0
//console.log(samples,data)
for(let d=0;d<samples.length;d++){
    createNewSample(fragment)
    let sample=fragment.querySelector(`[data-id='${counter-1}']`)
 //   console.log(sample,counter-1,`[data-id='${counter-1}']`)
    sample.getElementsByClassName("inp")[0].value=samples[d].inp.reduce((prev,next)=>prev+","+next)
    sample.getElementsByClassName("out")[0].value=samples[d].res
}
smples.innerHTML=""
smples.appendChild(fragment)
document.getElementById("model").value=data.modelName
document.getElementById("startWeights").value=data.startWeights.reduce((prev,next)=>prev+","+next)
document.getElementById("diaposon").value=`${data.minRand},${data.maxRand}`
document.getElementById("error").value=data.epsilon
document.getElementById("logsEnable").checked=data.log
document.getElementById("seed").value=data.seed
document.getElementById("deterministicThings").checked=data.enableDeterministicThings
document.getElementById("mainSteps").value=data.steps
document.getElementById("randSearchSteps").value=data.randSearchSteps
document.getElementById("randSearch").checked=data.randSearch
}
function validateSettings(data=collectSettings()[0]){
if(typeof data!="object"){
    return false
}
if(typeof data.log != "boolean"&&typeof data.enableDeterministicThings!= "boolean"&&typeof data.randSearch!="boolean"){
    return false
}
if((typeof data.epsilon != "number"&&data.epsilon<0)&&(typeof data.maxRand != "number")
&&(typeof data.minRand != "number")&&(typeof data.steps!="number"&&data.steps<0)
&&(typeof data.randSearchSteps != "number" && data.randSearchSteps<0)&&
(typeof data.seed != "number" && data.seed<0)){
    return false
}
if((typeof data.modelName!="string"||!data.modelName)&&(typeof data.model!="function"||!data.model)){
    return false
}
if(!Array.isArray(data.samples)){
return false
}else{
    for(let d=0;d<data.samples.length;d++){
        if(!Array.isArray(data.samples[d].inp)){
            return false
        }else{
            for(let e=0;e<data.samples[d].inp.length;e++){
                if(typeof data.samples[d].inp[e]!="number"){
                    return false
                }
            }
        }
        if(typeof data.samples[d].res !="number"){
            return false
        }
    }
}
if(!Array.isArray(data.startWeights)){
return false
}else{
    for(let d=0;d<data.startWeights.length;d++){
        if(isNaN(data.startWeights[d])){
        return false
    }
}
}
return true;
}

function checkErrorsInSettings(data=collectSettings()[0]){
let errors=[]
if(typeof data!="object"){
    errors[errors.length]="not object";
    return errors
}
if(typeof data.log != "boolean"){//
    errors[errors.length]="log is not boolean"
}
if(typeof data.enableDeterministicThings!= "boolean"){
errors[errors.length]="enableDeterministicThings is not boolean"
}
if(typeof data.randSearch!="boolean"){
errors[errors.length]="randSearch is not boolean"
}
if(typeof data.epsilon != "number"){
    errors[errors.length]="epsilon is not number"
}else if(data.epsilon<0){
    errors[errors.length]="epsilon is less then 0"
}
if(typeof data.maxRand != "number"){
        errors[errors.length]="maxRand is not number"
}
if(typeof data.minRand != "number"){
        errors[errors.length]="minRand is not number"
}
if(typeof data.steps!="number"){
        errors[errors.length]="steps is not number"
}else if(data.steps<0){
        errors[errors.length]="steps is less then 0"
}
if(typeof data.randSearchSteps != "number"){
        errors[errors.length]="randSearchSteps is not number"
}else if(data.randSearchSteps<0){
        errors[errors.length]="randSearchSteps is less then 0"
}
if(typeof data.seed != "number"){
        errors[errors.length]="seed is not number"
}else if(data.seed<0){
        errors[errors.length]="seed is less then 0"
}
if(typeof data.modelName!="string"||!data.modelName){
    errors[errors.length]="modelName is not string or not exist"
}
if(typeof data.model!="function"||!data.model){
    errors[errors.length]="modelName is not function or not exist"
}

if(!Array.isArray(data.samples)){
errors[errors.length]="samples is not array"
}else{
    for(let d=0;d<data.samples.length;d++){
        if(!Array.isArray(data.samples[d].inp)){
           errors[errors.length]=`samples[${d}].inp is not array`
        }else{
            for(let e=0;e<data.samples[d].inp.length;e++){
                if(typeof data.samples[d].inp[e]!="number"){
                    errors[errors.length]=`samples[${d}].inp[${e}] is not number`
                }
            }
        }
        if(typeof data.samples[d].res !="number"){
            return errors[errors.length]=`samples[${d}].res is not number`
        }
    }
}
if(!Array.isArray(data.startWeights)){
errors[errors.length]="startsWeights is not array"
}else{
    for(let d=0;d<data.startWeights.length;d++){
        if(isNaN(data.startWeights[d])){
            errors[errors.length]=`startsWeights[${d}] is NaN`
    }
}
}
return {errors,isValid:errors.length==0};
}