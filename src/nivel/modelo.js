import * as B from "@babylonjs/core";
import "@babylonjs/loaders/glTF";

const canvas=document.getElementById("canvas");
const engine=new B.Engine(canvas,true,{preserveDrawingBuffer:true,stencil:true});
const scene=new B.Scene(engine);
scene.clearColor=B.Color4.FromHexString("#b7c8d0ff");

const camera=new B.ArcRotateCamera("camera",-1.1,1.12,11,new B.Vector3(0,2.6,0),scene);
camera.attachControl(canvas,true);camera.lowerRadiusLimit=4;camera.upperRadiusLimit=18;
new B.HemisphericLight("ambiente",new B.Vector3(0,1,0),scene).intensity=1.0;
const direcional=new B.DirectionalLight("direcional",new B.Vector3(-.5,-1,.4),scene);direcional.position.set(6,10,-6);direcional.intensity=.65;
const piso=B.MeshBuilder.CreateGround("piso",{width:18,height:14},scene);
const pisoMat=new B.StandardMaterial("pisoMat",scene);pisoMat.diffuseColor=B.Color3.FromHexString("#7e8588");piso.material=pisoMat;

const el=id=>document.getElementById(id);
const status=el("status");
let liquido,volante,liquidoEscalaInicial,liquidoPosicaoInicial,volanteRotacaoInicial;

function procurar(nome){return [...scene.transformNodes,...scene.meshes].find(n=>n.name.toUpperCase().startsWith(nome))}
function classificar(id,encontrado){const e=el(id);e.textContent=encontrado?"ENCONTRADO":"NÃO ENCONTRADO";e.className=encontrado?"ok":"erro"}

try{
  const resultado=await B.SceneLoader.ImportMeshAsync("","/models/","ESTACAO_NIVEL.glb",scene);
  const grupo=new B.TransformNode("MODELO_INVENTOR",scene);
  const importados=[...resultado.transformNodes,...resultado.meshes];
  importados.filter(n=>!n.parent&&n!==grupo&&n!==piso).forEach(n=>n.parent=grupo);
  scene.render();
  let min=new B.Vector3(Number.POSITIVE_INFINITY,Number.POSITIVE_INFINITY,Number.POSITIVE_INFINITY);
  let max=new B.Vector3(Number.NEGATIVE_INFINITY,Number.NEGATIVE_INFINITY,Number.NEGATIVE_INFINITY);
  resultado.meshes.filter(m=>m.getTotalVertices()>0).forEach(m=>{m.computeWorldMatrix(true);const b=m.getBoundingInfo().boundingBox;min=B.Vector3.Minimize(min,b.minimumWorld);max=B.Vector3.Maximize(max,b.maximumWorld)});
  const tamanho=max.subtract(min),escala=6/Math.max(tamanho.x,tamanho.y,tamanho.z),centro=min.add(max).scale(.5);
  grupo.scaling.setAll(escala);grupo.position.set(-centro.x*escala,-min.y*escala,-centro.z*escala);
  liquido=procurar("LIQUIDO");volante=procurar("VOLANTE");
  classificar("liquidoStatus",liquido);classificar("volanteStatus",volante);
  el("arquivo").textContent=`${(1234028/1048576).toFixed(2).replace(".",",")} MB`;
  if(liquido){
    liquidoEscalaInicial=liquido.scaling.clone();liquidoPosicaoInicial=liquido.position.clone();
    const partes=liquido.getChildMeshes?.()??[];
    const materialLiquido=new B.PBRMaterial("LIQUIDO_AZUL_TESTE",scene);materialLiquido.albedoColor=B.Color3.FromHexString("#008fd0");materialLiquido.emissiveColor=B.Color3.FromHexString("#005f96");materialLiquido.alpha=.82;materialLiquido.metallic=0;materialLiquido.roughness=.22;materialLiquido.transparencyMode=B.PBRMaterial.PBRMATERIAL_ALPHABLEND;
    partes.forEach(m=>m.material=materialLiquido);
  }
  if(volante)volanteRotacaoInicial=volante.rotation.clone();
  status.textContent=`Modelo carregado: ${resultado.meshes.length} malhas e ${scene.materials.length} materiais.`;status.className="status ok";
}catch(erro){status.textContent=`Falha ao carregar: ${erro.message}`;status.className="status erro"}

el("nivel").addEventListener("input",e=>{const p=Number(e.target.value)/100;el("nivelValor").textContent=`${Math.round(p*100)}%`;if(!liquido)return;liquido.scaling.y=Math.max(.02,liquidoEscalaInicial.y*p);liquido.position.y=liquidoPosicaoInicial.y});
el("giro").addEventListener("input",e=>{const graus=Number(e.target.value);el("giroValor").textContent=`${graus}°`;if(!volante)return;volante.rotation.z=volanteRotacaoInicial.z+B.Tools.ToRadians(graus)});

engine.runRenderLoop(()=>scene.render());addEventListener("resize",()=>engine.resize());
