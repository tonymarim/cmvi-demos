import {MeshBuilder, Mesh, Vector3, StandardMaterial, DynamicTexture, Color3, ActionManager, ExecuteCodeAction} from '@babylonjs/core';

export const regions=[
  {id:1,name:'Motor · extremidade oposta ao acoplamento',z:-.09},
  {id:2,name:'Motor · lado do acoplamento',z:.068},
  {id:3,name:'Bomba · suporte do eixo',z:.225},
  {id:4,name:'Bomba · região próxima à carcaça',z:.335}
];
export const G0=9.80665;
export const accelerationInG=ms2=>ms2/G0;

export function createMeasurementPoints(scene,root,onSelect){
  const markers=regions.map((region,i)=>{
    const x=-.01829,y=.16;
    const stem=MeshBuilder.CreateLines('guia região '+region.id,{points:[new Vector3(x,y,region.z),new Vector3(x,.30+(i%2)*.09,region.z)]},scene);
    stem.parent=root;stem.color=Color3.FromHexString('#ff9c45');stem.isPickable=false;
    const sphere=MeshBuilder.CreateSphere('região de coleta '+region.id,{diameter:.025,segments:12},scene);
    sphere.parent=root;sphere.position.set(x,y,region.z);
    const mat=new StandardMaterial('marcador '+region.id,scene);sphere.material=mat;mat.disableLighting=true;
    const label=MeshBuilder.CreatePlane('P'+region.id,{width:.11,height:.085,sideOrientation:Mesh.DOUBLESIDE},scene);
    const anchor=new Vector3(x,.33+(i%2)*.09,region.z);
    // Billboard no espaço mundial: evita herdar a reflexão do root glTF.
    label.billboardMode=Mesh.BILLBOARDMODE_ALL;
    const texture=new DynamicTexture('etiqueta P'+region.id,{width:256,height:192},scene,false);
    const lm=new StandardMaterial('etiqueta '+region.id,scene);lm.diffuseTexture=texture;lm.emissiveColor=Color3.White();lm.disableLighting=true;lm.backFaceCulling=false;label.material=lm;
    for(const mesh of [sphere,label]){
      mesh.actionManager=new ActionManager(scene);
      mesh.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger,()=>onSelect(region.id)));
    }
    return {region,mat,texture,label,anchor};
  });
  function select(id){
    for(const {region,mat,texture} of markers){
      const active=region.id===id;
      mat.emissiveColor=Color3.FromHexString(active?'#61ffbe':'#ff9c45');
      const c=texture.getContext();c.fillStyle=active?'#11543e':'#702d07';c.fillRect(0,0,256,192);
      c.strokeStyle=active?'#61ffbe':'#ff9c45';c.lineWidth=12;c.strokeRect(6,6,244,180);
      c.fillStyle='#ffffff';c.font='bold 90px sans-serif';c.textAlign='center';c.fillText('P'+region.id,128,120);texture.update();
    }
  }
  select(null);
  function update(){root.computeWorldMatrix(true);for(const m of markers)m.label.position.copyFrom(Vector3.TransformCoordinates(m.anchor,root.getWorldMatrix()));}
  update();
  return {select,update};
}
