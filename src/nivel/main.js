import * as B from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
const ids=["fonte","estadoEstacao","valvula","nivelTexto","raw","nivel","conectar","demo","log"],ui=Object.fromEntries(ids.map(id=>[id,document.getElementById(id)]));
const engine=new B.Engine(document.getElementById("renderCanvas"),true);let porta,reader,tarefa,demoTimer,abrindo=false;
function mat(s,n,c,a=1,emissiva=false){const m=new B.StandardMaterial(n,s);m.diffuseColor=B.Color3.FromHexString(c);m.alpha=a;if(emissiva)m.emissiveColor=B.Color3.FromHexString(c);return m}
function caixa(s,n,tam,pos,material){const m=B.MeshBuilder.CreateBox(n,{width:tam[0],height:tam[1],depth:tam[2]},s);m.position.set(...pos);m.material=material;return m}
function cena(){
const s=new B.Scene(engine);s.clearColor=B.Color4.FromHexString("#b9d3ddff");s.fogMode=B.Scene.FOGMODE_LINEAR;s.fogColor=B.Color3.FromHexString("#c7d6dc");s.fogStart=22;s.fogEnd=38;
const cam=new B.ArcRotateCamera("cam",-Math.PI/2,1.34,15,new B.Vector3(1,3.15,0),s);cam.lowerRadiusLimit=8;cam.upperRadiusLimit=21;cam.lowerBetaLimit=.85;cam.upperBetaLimit=1.48;cam.attachControl(engine.getRenderingCanvas(),true);
new B.HemisphericLight("ambiente",new B.Vector3(0,1,0),s).intensity=1.08;
const luzFria=mat(s,"luzFria","#eaffff",1,true),aco=mat(s,"aco","#465057"),acoEscuro=mat(s,"acoEscuro","#202629"),parede=mat(s,"parede","#a9acad"),junta=mat(s,"junta","#5d6265"),amarelo=mat(s,"seguranca","#f4cf16"),preto=mat(s,"preto","#111416"),vermelho=mat(s,"vermelhoIndustrial","#c92231"),azul=mat(s,"azulIndustrial","#174b83");
const piso=B.MeshBuilder.CreateGround("piso",{width:24,height:18},s);piso.material=mat(s,"pisoIndustrial","#777b7c");
// Piso modular e paredes técnicas, inspirados em um laboratório industrial fechado.
for(let x=-11;x<=11;x+=2)caixa(s,"juntaPiso",[.025,.018,18],[x,.015,0],junta);
for(let z=-8;z<=8;z+=2)caixa(s,"juntaPiso",[24,.018,.025],[0,.016,z],junta);
caixa(s,"paredeFundo",[24,6.8,.3],[0,3.4,8.25],parede);caixa(s,"paredeDireita",[.3,6.8,18],[11.85,3.4,0],parede);caixa(s,"paredeEsquerda",[.3,6.8,18],[-11.85,3.4,0],parede);
for(let x=-10.5;x<12;x+=2.1)caixa(s,"juntaVertical",[.035,6.8,.035],[x,3.4,8.05],junta);
for(let y=.9;y<6.8;y+=1.55)caixa(s,"juntaHorizontal",[24,.035,.035],[0,y,8.04],junta);
for(let z=-8;z<9;z+=2.1)caixa(s,"juntaLateral",[.035,6.8,.035],[11.66,3.4,z],junta);
caixa(s,"rodapeFundo",[24,.65,.36],[0,.32,8.02],preto);caixa(s,"rodapeDireito",[.36,.65,18],[11.64,.32,0],preto);
// Faixa superior envidraçada, típica de galpões-escola e laboratórios abertos.
const vidro=mat(s,"vidroClarabóia","#9ed9ef",.42,true);
for(let x=-10.5;x<=10.5;x+=3){caixa(s,"janelaAlta",[2.65,1.35,.12],[x,7.55,8.03],vidro);caixa(s,"montanteJanela",[.12,1.55,.2],[x+1.42,7.55,8],acoEscuro)}
for(const x of [-8,-2,4,10]){caixa(s,"colunaConcreto",[.72,9,.72],[x,4.5,6.9],mat(s,"concreto","#8c8d88"));caixa(s,"capitel",[1.15,.55,1.15],[x,8.15,6.9],mat(s,"concreto2","#777974"))}
// Teto em painéis rebaixados com vigas e luminárias embutidas.
caixa(s,"forro",[24,.18,18],[0,8.75,0],acoEscuro);
for(let x=-11;x<=11;x+=2){caixa(s,"perfilTeto",[.10,.22,18],[x,8.58,0],aco)}
for(let z=-8;z<=8;z+=2){caixa(s,"perfilTeto",[24,.22,.10],[0,8.57,z],aco)}
for(const x of [-8,-4,0,4,8])for(const z of [-5,-1,3,7])caixa(s,"luminaria",[1.45,.10,1.1],[x,8.43,z],luzFria);
for(const [x,z] of [[-5,-2],[-5,5],[5,-2],[5,5]]){const l=new B.PointLight("luzTeto",new B.Vector3(x,8,z),s);l.diffuse=B.Color3.FromHexString("#e8ffff");l.intensity=.28;l.range=9}
// Venezianas metálicas nas paredes.
function veneziana(nome,x,y,z,rot=false){const fundo=caixa(s,nome,[rot ? .18 : 3.1,2.15,rot ? 3.1 : .18],[x,y,z],acoEscuro);for(let i=-.8;i<=.8;i+=.2){const lam=caixa(s,"lamela",[rot ? .22 : 2.75,.09,rot ? 2.75 : .22],[x,y+i,z],aco);if(rot)lam.rotation.y=Math.PI/2}return fundo}
veneziana("ventFundo1",-6.8,4.4,7.82);veneziana("ventFundo2",5.9,4.4,7.82);veneziana("ventDireita",11.55,4.5,2.8,true);
// Infraestrutura aparente: eletrocalha, tubulação e quadro de comando.
caixa(s,"eletrocalha",[14,.32,.55],[-1,7.35,7.45],acoEscuro);for(let x=-7.5;x<6;x+=1.2)caixa(s,"travessaCalha",[.08,.38,.62],[x,7.35,7.45],aco);
const tuboAr=B.MeshBuilder.CreateCylinder("tuboAr",{diameter:.18,height:18,tessellation:20},s);tuboAr.rotation.z=Math.PI/2;tuboAr.position.set(1.8,6.75,7.72);tuboAr.material=azul;
caixa(s,"quadroEletrico",[2.1,3.1,.55],[8.8,3.1,7.55],mat(s,"quadro","#c2bba0"));caixa(s,"portaQuadro",[1.82,2.78,.05],[8.8,3.1,7.24],mat(s,"portaQuadroMat","#a79f83"));
caixa(s,"visorQuadro",[.38,.55,.09],[9.42,2.55,7.16],acoEscuro);caixa(s,"sinaleiro",[.18,.18,.10],[8.25,3.9,7.14],mat(s,"verdeSinal","#35e283",1,true));
// Guarda-corpo lateral para reforçar a escala e a linguagem de segurança industrial.
for(const z of [-7,-4,-1,2])caixa(s,"posteGrade",[.14,2,.14],[-8.8,1,z],amarelo);
for(const y of [1.05,1.95])caixa(s,"corrimao",[.14,.14,9],[-8.8,y,-2.5],amarelo);
for(const z of [-3.45,3.45])caixa(s,"linhaSeguranca",[9,.025,.11],[1,.025,z],amarelo);
for(const x of [-3.5,5.5])caixa(s,"linhaSeguranca",[.11,.025,7],[x,.025,0],amarelo);
const bancada=B.MeshBuilder.CreateBox("bancada",{width:7,height:.28,depth:4},s);bancada.position.y=.85;bancada.material=mat(s,"metal","#707b82");
for(const x of [-3,3])for(const z of [-1.55,1.55]){const p=B.MeshBuilder.CreateBox("pe",{width:.25,height:1.7,depth:.25},s);p.position.set(x,0,z);p.material=mat(s,"peMat","#343f45")}
const tanque=B.MeshBuilder.CreateCylinder("tanque",{diameter:3,height:3.8,tessellation:64},s);tanque.position.set(1.3,2.85,0);tanque.material=mat(s,"acrilico","#9fdcf0",.22);
const agua=B.MeshBuilder.CreateCylinder("agua",{diameter:2.82,height:.05,tessellation:64},s);agua.position.set(1.3,.98,0);agua.material=mat(s,"aguaMat","#168bd1",.82);
const painel=B.MeshBuilder.CreateBox("painel",{width:2.3,height:2.1,depth:.25},s);painel.position.set(-2.1,2,0);painel.material=mat(s,"painelMat","#e6e9eb");
const volante=B.MeshBuilder.CreateTorus("volante",{diameter:1.15,thickness:.16,tessellation:48},s);volante.position.set(-2.1,2.1,-.25);volante.rotation.x=Math.PI/2;volante.material=mat(s,"vermelho","#e52435");
const haste=B.MeshBuilder.CreateBox("haste",{width:.12,height:1,depth:.12},s);haste.position.set(-2.1,2.1,-.34);haste.material=mat(s,"hasteMat","#f6f6f6");
const placa=B.MeshBuilder.CreatePlane("placa",{width:2.5,height:.5},s);placa.position.set(-2.1,3.25,-.15);placa.rotation.y=Math.PI;placa.material=mat(s,"placaMat","#e52435");
const provisorios=[bancada,tanque,agua,painel,volante,haste,placa,...s.meshes.filter(mesh=>mesh.name==="pe")];s.materials.forEach(material=>material.maxSimultaneousLights=4);
return{s,provisorios,atualizar3D(p){agua.scaling.y=Math.max(.02,p*75);agua.position.y=.98+p*1.85;const a=p*Math.PI*1.6;volante.rotation.z=a;haste.rotation.y=a}}}
const m=cena();let ultimoPercentual=0,ultimoRaw=0,estacaoLigada=false;
async function carregarEstacaoInventor(){try{
const resultado=await B.SceneLoader.ImportMeshAsync("",import.meta.env.BASE_URL+"models/","ESTACAO_NIVEL.glb",m.s),grupo=new B.TransformNode("ESTACAO_INVENTOR",m.s),importados=[...resultado.transformNodes,...resultado.meshes];
resultado.meshes.forEach(mesh=>{if(mesh.material)mesh.material.maxSimultaneousLights=4});
importados.filter(n=>!n.parent&&n!==grupo).forEach(n=>n.parent=grupo);m.s.render();
let min=new B.Vector3(Infinity,Infinity,Infinity),max=new B.Vector3(-Infinity,-Infinity,-Infinity);
resultado.meshes.filter(mesh=>mesh.getTotalVertices()>0).forEach(mesh=>{mesh.computeWorldMatrix(true);const b=mesh.getBoundingInfo().boundingBox;min=B.Vector3.Minimize(min,b.minimumWorld);max=B.Vector3.Maximize(max,b.maximumWorld)});
const tamanho=max.subtract(min),escala=6.6/Math.max(tamanho.x,tamanho.y,tamanho.z),centro=min.add(max).scale(.5),angulo=-Math.PI/2,centroGirado=B.Vector3.TransformCoordinates(centro.scale(escala),B.Matrix.RotationY(angulo));grupo.scaling.setAll(escala);grupo.rotation.y=angulo;grupo.position.set(1-centroGirado.x,-min.y*escala,-centroGirado.z);
const procurar=nome=>importados.find(n=>n.name.toUpperCase().startsWith(nome)),liquido=procurar("LIQUIDO"),volante=procurar("VOLANTE"),botaoLiga=procurar("BOTAO1"),botaoDesliga=procurar("BOTAO2"),led=procurar("LEDVM");
if(!liquido||!volante||!botaoLiga||!botaoDesliga)throw new Error("Componentes LIQUIDO, VOLANTE, BOTAO1 ou BOTAO2 não encontrados.");
const partesLiquido=liquido.getChildMeshes?.()??[],escalaLiquido=liquido.scaling.clone(),posLiquido=liquido.position.clone(),rotacaoVolante=volante.rotationQuaternion?.clone()??B.Quaternion.FromEulerVector(volante.rotation);
const materialLiquido=new B.PBRMaterial("LIQUIDO_AZUL",m.s);materialLiquido.albedoColor=B.Color3.FromHexString("#008fd0");materialLiquido.emissiveColor=B.Color3.FromHexString("#005f96");materialLiquido.alpha=.82;materialLiquido.metallic=0;materialLiquido.roughness=.22;materialLiquido.maxSimultaneousLights=4;materialLiquido.transparencyMode=B.PBRMaterial.PBRMATERIAL_ALPHABLEND;partesLiquido.forEach(mesh=>mesh.material=materialLiquido);
m.provisorios.forEach(mesh=>mesh.dispose());m.atualizar3D=p=>{liquido.scaling.y=Math.max(.02,escalaLiquido.y*p);liquido.position.y=posLiquido.y;volante.rotationQuaternion=rotacaoVolante.multiply(B.Quaternion.RotationAxis(B.Axis.X,p*Math.PI*1.6))};
const materialLed=new B.StandardMaterial("LED_ESTACAO",m.s);materialLed.diffuseColor=B.Color3.FromHexString("#4b1116");materialLed.emissiveColor=B.Color3.FromHexString("#230306");led?.getChildMeshes().forEach(mesh=>mesh.material=materialLed);
function pressionar(botao){const escalaOriginal=botao.scaling.clone();botao.scaling=escalaOriginal.scale(.82);setTimeout(()=>botao.scaling.copyFrom(escalaOriginal),140)}
function ligar(){definirEstacao(true);pressionar(botaoLiga);materialLed.diffuseColor=B.Color3.FromHexString("#ff2638");materialLed.emissiveColor=B.Color3.FromHexString("#ff1028");msg("Estação ligada. O potenciômetro controla o nível.","#58dfa2")}
function desligar(){definirEstacao(false);pressionar(botaoDesliga);materialLed.diffuseColor=B.Color3.FromHexString("#4b1116");materialLed.emissiveColor=B.Color3.FromHexString("#230306");msg("Estação desligada. Clique no botão verde para habilitar.","#ffcc63")}
function tornarClicavel(no,acao){no.getChildMeshes().forEach(mesh=>{mesh.isPickable=true;mesh.actionManager=new B.ActionManager(m.s);mesh.actionManager.registerAction(new B.ExecuteCodeAction(B.ActionManager.OnPickTrigger,acao));mesh.actionManager.registerAction(new B.ExecuteCodeAction(B.ActionManager.OnPointerOverTrigger,()=>engine.getRenderingCanvas().style.cursor="pointer"));mesh.actionManager.registerAction(new B.ExecuteCodeAction(B.ActionManager.OnPointerOutTrigger,()=>engine.getRenderingCanvas().style.cursor="default"))})}
tornarClicavel(botaoLiga,ligar);tornarClicavel(botaoDesliga,desligar);m.ligar=ligar;m.desligar=desligar;m.atualizar3D(0);if(porta?.readable||demoTimer)ligar();
}catch(erro){msg(`Modelo Inventor não carregado: ${erro.message}. Usando modelo provisório.`,"#ffcc63")}}
function msg(t,c=""){ui.log.textContent=t;ui.log.style.color=c||"#a9bfcb"}function aplicarComando(){const p=estacaoLigada?ultimoPercentual:0,pct=p*100;ui.valvula.textContent=`${pct.toFixed(1).replace(".",",")} %`;ui.nivelTexto.textContent=`${pct.toFixed(1).replace(".",",")} %`;ui.nivel.style.width=`${pct}%`;m.atualizar3D(p)}function definirEstacao(on){estacaoLigada=on;ui.estadoEstacao.textContent=on?"LIGADA":"DESLIGADA";ui.estadoEstacao.style.color=on?"#58dfa2":"#ff7b75";aplicarComando()}function mostrar(raw){ultimoRaw=Math.max(0,Math.min(1023,Math.round(raw)));ultimoPercentual=ultimoRaw/1023;ui.raw.textContent=`${ultimoRaw} / 1023`;aplicarComando()}
function processar(l){if(l==="PRONTO"){definirEstacao(true);msg("Arduino pronto. Movimente o potenciômetro.","#58dfa2")}if(l.startsWith("POT:")){const n=Number(l.slice(4));if(Number.isInteger(n))mostrar(n)}}
async function ler(){let b="",d=new TextDecoder();try{reader=porta.readable.getReader();while(true){const{x:value,done}=await reader.read().then(r=>({x:r.value,done:r.done}));if(done)break;b+=d.decode(value,{stream:true});const ls=b.split(/\r?\n/);b=ls.pop()??"";ls.map(x=>x.trim()).filter(Boolean).forEach(processar)}}finally{reader?.releaseLock();reader=null}}
function estado(on){ui.conectar.textContent=on?"DESCONECTAR":"CONECTAR ARDUINO";ui.fonte.textContent=on?"ARDUINO USB":"DESCONECTADA";ui.fonte.style.color=on?"#58dfa2":"#ffcc63"}
async function fechar(){try{if(reader)await reader.cancel();if(tarefa)await tarefa;if(porta?.readable)await porta.close()}catch{}porta=null;tarefa=null;estado(false);if(m.desligar)m.desligar();else definirEstacao(false)}
async function conectar(){if(!navigator.serial){msg("Use Chrome ou Edge.","#ff7b75");return}if(porta?.readable){await fechar();return}if(abrindo)return;abrindo=true;ui.conectar.disabled=true;clearInterval(demoTimer);try{porta=await navigator.serial.requestPort();if(!porta.readable)await porta.open({baudRate:9600});estado(true);definirEstacao(true);tarefa=ler();try{m.ligar?.()}catch{}msg("Recebendo dados POT:valor.","#58dfa2")}catch(e){porta=null;estado(false);definirEstacao(false);msg(String(e.message).includes("already open")?"Porta ocupada em outra aba ou processo.":`Falha: ${e.message}`,"#ff7b75")}finally{abrindo=false;ui.conectar.disabled=false}}
async function demo(){if(porta?.readable)await fechar();clearInterval(demoTimer);let v=0,d=1;ui.fonte.textContent="SIMULAÇÃO";ui.fonte.style.color="#ffcc63";definirEstacao(true);try{m.ligar?.()}catch{}demoTimer=setInterval(()=>{v+=d*7;if(v>=1023||v<=0)d*=-1;mostrar(v)},35)}
ui.conectar.onclick=conectar;ui.demo.onclick=demo;mostrar(0);estado(false);carregarEstacaoInventor();engine.runRenderLoop(()=>m.s.render());addEventListener("resize",()=>engine.resize());

ui.conectar.hidden=true;demo();
