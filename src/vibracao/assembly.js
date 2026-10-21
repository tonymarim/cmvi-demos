import {SceneLoader, TransformNode, Vector3, ActionManager, ExecuteCodeAction, Color3} from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import {createMeasurementPoints} from './measurement-points.js';

// O GLB já converte centímetros do Inventor para metros nos nós Solid1.
// Preservar a escala e as transformações relativas de todas as peças.
export async function loadAssembly(scene, onCommand=()=>{}) {
  const result = await SceneLoader.ImportMeshAsync('', import.meta.env.BASE_URL+'models/', 'montagem_motor.glb', scene);
  const placement = new TransformNode('posicionamento montagem Inventor', scene);
  for (const mesh of result.meshes) if (!mesh.parent) mesh.parent = placement;
  // Eixo longitudinal do conjunto ao longo de X, sem modificar o CAD.
  placement.rotation.y = -Math.PI / 2;
  placement.computeWorldMatrix(true);
  for (const mesh of result.meshes) mesh.computeWorldMatrix(true);
  const bounds = placement.getHierarchyBoundingVectors(true);
  const center = bounds.min.add(bounds.max).scale(.5);
  placement.position = new Vector3(-center.x, -bounds.min.y + .015, -center.z);
  const nodes=[...result.transformNodes,...result.meshes];
  const part=name=>{
    const node=nodes.find(n=>n.name===name+':1');
    if(!node) throw new Error('Peça ausente: '+name);
    return node;
  };
  const rotor=part('ROTOR'), cadRoot=rotor.parent;
  const measurementPoints=createMeasurementPoints(scene,cadRoot,id=>onCommand('point:'+id));
  // Todos os eixos são coaxiais no sistema da montagem (Z do Inventor).
  const shaft=new TransformNode('transmissão solidária',scene);
  shaft.parent=cadRoot;
  shaft.position.set(rotor.position.x,rotor.position.y,0);
  for(const name of ['ROTOR','ACOPLAMENTO','ACOPLAMENTO_BOMBA','EIXO_BOMBA','ROTOR_BOMBA','AMORTECEDOR','DEFLETOR']) part(name).setParent(shaft);
  const lid=part('TAMPA_PAINEL');
  // Dobradiça vertical na borda oposta ao fecho ABRE_PAINEL.
  const hinge=new TransformNode('dobradiça painel',scene);
  hinge.parent=cadRoot;
  hinge.position.set(lid.position.x,lid.position.y,lid.position.z-.125);
  for(const name of ['TAMPA_PAINEL','LEDAZ','LEDBR','BOTAOAM','EMERGENCIA','CHAVE_SECCION','ABRE_PAINEL']) part(name).setParent(hinge);
  function clickable(name,command) {
    for(const mesh of part(name).getChildMeshes()) {
      mesh.isPickable=true;
      mesh.actionManager=new ActionManager(scene);
      mesh.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger,()=>onCommand(command)));
      mesh.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPointerOverTrigger,()=>{scene.getEngine().getRenderingCanvas().style.cursor='pointer';}));
      mesh.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPointerOutTrigger,()=>{scene.getEngine().getRenderingCanvas().style.cursor='default';}));
    }
  }
  clickable('LEDAZ','start');clickable('BOTAOAM','stop');clickable('EMERGENCIA','emergency');
  clickable('TAMPA_PAINEL','door');clickable('ABRE_PAINEL','door');
  const lamps=part('LEDBR').getChildMeshes().filter(m=>m.material).map(mesh=>{
    mesh.material=mesh.material.clone('LED branco exclusivo '+mesh.uniqueId);
    return mesh.material;
  });
  const mushroom=part('EMERGENCIA'), mushroomRest=mushroom.position.clone();
  let doorAngle=0;
  function update(dt,state,hasSignal) {
    measurementPoints.update();
    for(const material of lamps) material.emissiveColor=state.running?new Color3(1,1,.9):Color3.Black();
    mushroom.position.x=mushroomRest.x-(state.emergency?.008:0);
    if(state.emergency) return;
    const target=state.doorOpen?Math.PI*.62:0;
    doorAngle+=(target-doorAngle)*Math.min(1,dt*7);
    hinge.rotation.y=doorAngle;
    if(state.running&&hasSignal) shaft.rotation.z=(shaft.rotation.z+dt*2*Math.PI*.75)%(2*Math.PI);
  }
  return {placement, size: bounds.max.subtract(bounds.min), rest: placement.position.clone(),update,
    panelTarget:()=>lid.getAbsolutePosition().clone(),selectPoint:measurementPoints.select};
}
