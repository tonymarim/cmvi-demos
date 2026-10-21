import {analyze,simulated} from './signal.mjs';
const demoStarted=performance.now(); let demoSeq=0;
import * as B from '@babylonjs/core';
import {setupQuest} from './quest.js';

import {regions,accelerationInG} from './measurement-points.js';
import {createPanelState,commandPanel} from './panel-state.js';

import {loadAssembly} from './assembly.js';

import {createLaboratory} from './laboratory.js';

import './style.css';

import './laboratory.css';

const $=id=>document.getElementById(id);

let current=null,reference=null,lastSeq=null,stale=true;

const engine=new B.Engine($('scene'),true,{preserveDrawingBuffer:true});

const scene=new B.Scene(engine);scene.clearColor=new B.Color4(.045,.09,.13,1);

const camera=new B.ArcRotateCamera('camera',-Math.PI/2.7,1.16,5.4,new B.Vector3(0,1,0),scene);camera.attachControl($('scene'),true);camera.lowerRadiusLimit=2;camera.upperRadiusLimit=9;camera.wheelPrecision=45;

camera.minZ=.02;
new B.HemisphericLight('light',new B.Vector3(.3,1,-.2),scene).intensity=1.3;

const {floor}=createLaboratory(scene);

let assembly=null;

const control=createPanelState();

let requestController=null, requestEpoch=0;

let selectedPoint=null;
const industrial={1:{vertical:[.06,.29],horizontal:[.06,.43]},2:{vertical:[.05,.25],horizontal:[.05,.53]},3:{vertical:[.06,.15],horizontal:[.05,.25]},4:{vertical:[.07,.22],horizontal:[.13,.13]}};
function measurementContext(){return [selectedPoint,$('measurement-direction').value,$('measurement-axis').value].join(':');}
function updateMeasurement(){
 const region=regions.find(r=>r.id===selectedPoint),direction=$('measurement-direction').value,axis=$('measurement-axis').value;
 $('measurement-location').textContent=region?`Sensor informado em P${region.id} — ${region.name} · ${direction}`:'Posição do sensor ainda não informada.';
 $('axis-reading').textContent=!region||axis===''?'Selecione ponto e eixo para ler a aceleração.':stale?'Sem leitura atual do eixo selecionado':`MPU eixo ${['X','Y','Z'][axis]}: ${current.rmsAxes[axis].toFixed(4)} m/s² RMS = ${accelerationInG(current.rmsAxes[axis]).toFixed(5)} g RMS (não gE)`;
 const pair=industrial[selectedPoint]?.[direction];
 $('point-reference').textContent=pair?`Vibro Inspector: alinhado ${pair[0].toFixed(2)} gE; desalinhado ${pair[1].toFixed(2)} gE; razão ${(pair[1]/pair[0]).toFixed(2)}×. Razão observada apenas no instrumento industrial.`:'';
}
function changeMeasurement(){selectedPoint=Number($('measurement-point').value)||null;assembly?.selectPoint(selectedPoint);reference=null;updateComparison();updateMeasurement();paintPanel();}
for(const id of ['measurement-point','measurement-direction','measurement-axis']) $(id).onchange=changeMeasurement;
function operate(command){
 if(command.startsWith('point:')){$('measurement-point').value=command.split(':')[1];changeMeasurement();return;}


  commandPanel(control,command);

  requestEpoch++;

  requestController?.abort();

  lastSeq=null;

  const message=control.emergency?'EMERGÊNCIA TRAVADA — clique novamente para destravar':control.running?'Ligado — aguardando dados':'Parado — clique no botão azul para iniciar';

  $('panel-state').textContent=message;

  $('start').disabled=control.emergency||control.running||!assembly;

  $('stop').disabled=control.emergency||!control.running;

  $('emergency').textContent=control.emergency?'Destravar emergência':'Emergência';

  $('emergency').setAttribute('aria-pressed',String(control.emergency));

  $('door').disabled=control.emergency||!assembly;

  $('door').textContent=control.doorOpen?'Fechar tampa':'Abrir tampa';

  $('led').classList.toggle('on',control.running);

  if(!control.running){unavailable(message);$('live').textContent=control.emergency?'EMERGÊNCIA':'PARADO';$('age').textContent='Recepção local pausada';$('quality').textContent='Sem atualização local dos dados';}

  assembly?.update(0,control,false);

}

for(const name of ['start','stop','emergency','door']) $(name).onclick=()=>operate(name);

$('points-view').onclick=()=>{camera.setTarget(new B.Vector3(0,1.12,0));camera.alpha=Math.PI/2.2;camera.beta=1.12;camera.radius=1.55;};
$('panel-view').onclick=()=>{camera.setTarget(assembly?.panelTarget()??new B.Vector3(0,1,0));camera.alpha=-Math.PI/2;camera.beta=Math.PI/2.15;camera.radius=.8;};



const assemblyReady = loadAssembly(scene,operate).then(model=>{

  assembly=model;
  assembly.selectPoint(selectedPoint);

  camera.setTarget(new B.Vector3(0,model.size.y*.55,0));

  camera.radius=Math.max(2.4,model.size.length()*1.8);

  camera.lowerRadiusLimit=.7;

  $('model-status').textContent='CONJUNTO REAL / INVENTOR';

  operate('start');

}).catch(error=>{

  console.error('Falha ao carregar montagem:',error);

  $('model-status').textContent='Falha ao carregar montagem — recarregue a página';

});

// Painel como textura no mundo: permanece visível durante a sessão imersiva.

const panel=B.MeshBuilder.CreatePlane('telemetria imersiva',{width:2.6,height:1.25},scene);panel.position.set(0,2.3,2.4);

const texture=new B.DynamicTexture('painel',{width:1040,height:500},scene,false);

const pm=new B.StandardMaterial('painel',scene);pm.diffuseTexture=texture;pm.emissiveColor=B.Color3.White();pm.disableLighting=true;pm.backFaceCulling=false;panel.material=pm;

function paintPanel(){const c=texture.getContext();c.fillStyle='#10212e';c.fillRect(0,0,1040,500);c.fillStyle='#71e6c3';c.font='bold 34px sans-serif';c.fillText(selectedPoint?'MOTOR / SENSOR EM P'+selectedPoint+' · '+$('measurement-direction').value.toUpperCase():'MOTOR / INFORME A REGIÃO DO SENSOR',40,65);c.fillStyle='#ffffff';c.font='bold 30px sans-serif';c.fillText(!control.running?(control.emergency?'EMERGÊNCIA TRAVADA':'PARADO — botão azul para ligar'):stale?'SEM SINAL — leitura indisponível':current.source,40,120);c.font='bold 66px sans-serif';c.fillText(stale?'—':current.rms.toFixed(3)+' m/s² RMS',40,205);c.font='26px sans-serif';c.fillText(stale?'Verifique sensor e rede':`Pico ${current.peak.toFixed(2)} m/s² | Dominante ${current.dominantHz?.toFixed(1)??'—'} Hz`,40,255);c.fillText($('change').textContent,40,305);c.fillStyle='#9fb6c8';c.font='22px sans-serif';c.fillText('Vibração e rotação ilustrativas • comandos somente virtuais',40,470);

  if(!stale){c.strokeStyle='#71e6c3';c.lineWidth=3;c.beginPath();const scale=Math.max(.1,...current.ac.map(v=>Math.abs(v[0])));current.ac.forEach((v,i)=>{const x=40+i/127*960,y=385-v[0]/scale*48;i?c.lineTo(x,y):c.moveTo(x,y);});c.stroke();}texture.update();}

engine.runRenderLoop(()=>{const t=performance.now()/1000;const a=!stale&&current?Math.min(.055,current.rms*.017):0;if(assembly){assembly.update(Math.min(engine.getDeltaTime()/1000,.05),control,!stale);if(!control.emergency){assembly.placement.position.y=assembly.rest.y+Math.sin(t*2*Math.PI*8)*a;assembly.placement.position.z=assembly.rest.z+Math.cos(t*2*Math.PI*8)*a*.5;}}scene.render();});

window.addEventListener('resize',()=>engine.resize());

setupQuest({scene,floor,button:$('xr'),note:$('xr-note'),ready:assemblyReady,isReady:()=>!!assembly});

function plot(id,series,xMax,unipolar=false){const canvas=$(id),c=canvas.getContext('2d'),w=canvas.width,h=canvas.height,left=65,right=w-20,top=12,bottom=h-32;c.clearRect(0,0,w,h);const max=Math.max(.1,...series.flatMap(s=>s.map(Math.abs)))*1.1;c.font='17px Segoe UI';for(let i=0;i<5;i++){const y=top+(bottom-top)*i/4;const value=unipolar?max*(1-i/4):max*(1-i/2);c.strokeStyle='#263c4c';c.beginPath();c.moveTo(left,y);c.lineTo(right,y);c.stroke();c.fillStyle='#8fa8bb';c.fillText(value.toFixed(1),0,y+6);}for(let i=0;i<5;i++){c.fillStyle='#8fa8bb';c.fillText((xMax*i/4).toFixed(2),left+(right-left)*i/4-12,h-5);}series.forEach((s,a)=>{c.strokeStyle=['#73e6c5','#77adff','#efb55b'][a];c.lineWidth=2;c.beginPath();s.forEach((v,i)=>{const x=left+i/(s.length-1)*(right-left),y=unipolar?bottom-v/max*(bottom-top):(top+bottom)/2-v/max*(bottom-top)/2;i?c.lineTo(x,y):c.moveTo(x,y);});c.stroke();});}

function unavailable(message){stale=true;updateMeasurement();$('status').textContent=message;$('live').textContent='SEM SINAL';$('rms').textContent=$('peak').textContent=$('freq').textContent='—';$('baseline').disabled=true;for(const id of ['wave','spectrum'])$(id).getContext('2d').clearRect(0,0,$(id).width,$(id).height);$('change').textContent=reference?'Referência preservada; sem leitura atual':'Capture a condição inicial';paintPanel();}

$('baseline').onclick=()=>{if(!stale&&current){reference={value:current.rms,source:current.source,context:measurementContext()};updateComparison();paintPanel();}};

function updateComparison(){ $('change').textContent=!reference?'Capture a condição inicial':reference.value<.02?'Referência muito baixa para calcular %':`${((current.rms/reference.value-1)*100).toFixed(1)}% vs. referência (${reference.value.toFixed(3)} m/s²)`;}

async function poll(){const epoch=requestEpoch;try{if(!control.running)return;requestController=new AbortController();const data={...analyze(simulated(demoSeq++,(performance.now()-demoStarted)/1000)),source:'SIMULADO'}; const p={demo:true,ageMs:0,stale:false,data};if(epoch!==requestEpoch||!control.running)return;$('source').textContent=p.demo?'DEMONSTRAÇÃO · SIMULADO':'AQUISIÇÃO · SENSOR REAL';$('source').classList.toggle('warn',p.demo);$('age').textContent='Ciclo de 36 s: baixa → elevada → redução gradual';

  if(p.stale){unavailable('Sem sinal recente');return;}stale=false;current=p.data;updateMeasurement();$('panel-state').textContent='Ligado — recebendo dados';if(reference&&(reference.source!==current.source||reference.context!==measurementContext()))reference=null;$('baseline').disabled=false;$('status').textContent=p.demo?'Simulação em andamento':'Sensor conectado';$('live').textContent=p.demo?'SIMULAÇÃO':'AO VIVO';$('rms').textContent=current.rms.toFixed(3);$('peak').textContent=current.peak.toFixed(2);$('freq').textContent=current.dominantHz?.toFixed(1)??'—';$('axis').textContent=`Eixo ${current.axis} · Hz`;$('quality').textContent=`200 Hz · bloco ${current.seq} · perdas de envio: ${current.dropped} · FIFO: ${current.overflow}${current.clipped?' · ATENÇÃO: SENSOR SATURADO':''}${p.loggingError?' · FALHA NO CSV':''}`;updateComparison();if(lastSeq!==current.seq){plot('wave',[0,1,2].map(a=>current.ac.map(s=>s[a])),127/200);plot('spectrum',[[0,...current.spectrum.map(s=>s.amplitude)]],100,true);lastSeq=current.seq;}paintPanel();

}catch(e){if(epoch!==requestEpoch||!control.running)return;$('age').textContent='Verifique o servidor e a conexão Wi-Fi';unavailable('Servidor indisponível');}finally{setTimeout(poll,400);}}

operate('stop');poll();

document.getElementById('export-demo').onclick=()=>{
 if(!current)return;
 const csv='fonte;RMS_m_s2;pico_m_s2;frequencia_Hz\nSIMULADO;'+[current.rms,current.peak,current.dominantHz].join(';')+'\n';
 const url=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'}));
 const link=document.createElement('a');link.href=url;link.download='vibracao-simulada.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
};
