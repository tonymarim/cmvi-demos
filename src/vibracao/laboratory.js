import * as B from '@babylonjs/core';

// Cenário independente: não altera motor, base, sensor ou telemetria.
// Geometria e texturas locais para funcionar sem internet na bancada.
export function createLaboratory(scene) {
  const root = new B.TransformNode('ambiente_laboratorio', scene);
  const mat = (name, color) => {
    const m = new B.StandardMaterial('lab_' + name, scene);
    m.diffuseColor = B.Color3.FromHexString(color);
    m.specularColor = new B.Color3(.08, .08, .08);
    return m;
  };
  const white = mat('paredes', '#e3e9e8');
  const teal = mat('faixa', '#397780');
  const metal = mat('estrutura', '#485e68');
  const cabinet = mat('armarios', '#b4c4c8');
  const top = mat('tampo', '#243b44');
  const black = mat('borracha', '#1b2930');
  const yellow = mat('demarcacao', '#e3b83f');
  const glow = mat('luminarias', '#f5fffa');
  glow.emissiveColor = new B.Color3(.75, .85, .82);
  const glass = mat('janela', '#b5d6df');
  glass.emissiveColor = new B.Color3(.16, .22, .25);
  const box = (name, size, position, material) => {
    const mesh = B.MeshBuilder.CreateBox('lab_' + name, {width:size[0], height:size[1], depth:size[2]}, scene);
    mesh.position.set(...position);
    mesh.material = material;
    mesh.parent = root;
    return mesh;
  };
  const label = (name, width, height, position, lines, bg = '#f2f5f3', fg = '#26434b') => {
    const mesh = B.MeshBuilder.CreatePlane('lab_' + name, {width, height}, scene);
    mesh.position.set(...position);mesh.parent = root;
    const texture = new B.DynamicTexture('lab_texto_' + name, {width:1024,height:256}, scene, false);
    const c = texture.getContext();
    c.fillStyle = bg;c.fillRect(0,0,1024,256);
    c.fillStyle = fg;c.textAlign = 'center';c.textBaseline = 'middle';
    lines.forEach((line,i) => {
      c.font = `${i===0?'600':'400'} ${lines.length===1?64:i===0?48:30}px Segoe UI, sans-serif`;
      c.fillText(line,512,256*(i+.5)/lines.length,960);
    });
    texture.update();
    const m = mat(name + '_texto', '#ffffff');m.diffuseTexture = texture;
    m.emissiveColor = new B.Color3(.35,.35,.35);mesh.material = m;
    return mesh;
  };

  const floor = B.MeshBuilder.CreateGround('piso_laboratorio', {width:12,height:12}, scene);
  floor.parent = root;
  const floorMat = mat('piso_epoxi', '#ffffff');
  const tiles = new B.DynamicTexture('lab_piso_textura', {width:512,height:512}, scene, false);
  const tc = tiles.getContext();tc.fillStyle = '#91a5aa';tc.fillRect(0,0,512,512);
  tc.strokeStyle = '#83989e';tc.lineWidth = 3;tc.strokeRect(1,1,510,510);
  tiles.update();tiles.uScale = 12;tiles.vScale = 12;floorMat.diffuseTexture = tiles;floor.material = floorMat;

  // Paredes voltadas para dentro; o verso não oculta a sala ao orbitar a câmera.
  function wall(name, position, rotation) {
    const mesh = B.MeshBuilder.CreatePlane(name, {width:12,height:4.2}, scene);
    mesh.position.set(...position);mesh.rotation.y = rotation;mesh.material = white;mesh.parent = root;
  }
  wall('lab_parede_fundo',[0,2.1,6],0);
  wall('lab_parede_esquerda',[-6,2.1,0],-Math.PI/2);
  wall('lab_parede_direita',[6,2.1,0],Math.PI/2);
  wall('lab_parede_entrada',[0,2.1,-6],Math.PI);
  box('faixa_fundo',[12,.28,.03],[0,1.4,5.96],teal);
  box('faixa_esquerda',[.03,.28,12],[-5.96,1.4,0],teal);
  box('faixa_direita',[.03,.28,12],[5.96,1.4,0],teal);
  box('rodape_fundo',[12,.12,.04],[0,.06,5.95],metal);
  box('rodape_esquerda',[.04,.12,12],[-5.95,.06,0],metal);
  box('rodape_direita',[.04,.12,12],[5.95,.06,0],metal);
  label('nome_laboratorio',5.4,.62,[0,3.62,5.9],['LABORATÓRIO DE ENSAIOS','COMISSIONAMENTO VIRTUAL  /  VIBRAÇÃO DE MOTORES']);

  // Ilhas laterais de trabalho e instrumentos meramente cenográficos.
  function workbench(x,z) {
    box('bancada_auxiliar',[3,.09,.8],[x,.92,z],top);
    for(const dx of [-1.35,1.35])for(const dz of [-.3,.3])
      box('pe_bancada',[.055,.87,.055],[x+dx,.435,z+dz],metal);
    box('prateleira',[2.85,.05,.65],[x,.24,z],cabinet);
    box('gaveteiro',[.85,.59,.66],[x+.92,.59,z],cabinet);
    for(let i=0;i<3;i++){
      box('frente_gaveta',[.79,.16,.015],[x+.92,.41+i*.18,z-.34],white);
      box('puxador',[.26,.018,.04],[x+.92,.41+i*.18,z-.365],metal);
    }
  }
  workbench(-3.45,4.1);workbench(3.45,4.1);
  box('osciloscopio',[.82,.44,.34],[-3.8,1.18,4.05],white);
  const scope = label('osciloscopio_tela',.53,.31,[-3.92,1.18,3.871],[], '#112f36');
  const st = scope.material.diffuseTexture, sc = st.getContext();
  sc.strokeStyle = '#275057';sc.lineWidth = 2;
  for(let x=0;x<1024;x+=64){sc.beginPath();sc.moveTo(x,0);sc.lineTo(x,256);sc.stroke();}
  for(let y=0;y<256;y+=32){sc.beginPath();sc.moveTo(0,y);sc.lineTo(1024,y);sc.stroke();}
  sc.strokeStyle = '#72d9b9';sc.lineWidth = 5;sc.beginPath();
  for(let x=0;x<1024;x++){const y=128-65*Math.sin(x/40);x?sc.lineTo(x,y):sc.moveTo(x,y);}sc.stroke();st.update();
  for(let i=0;i<3;i++)box('botao_instrumento',[.04,.04,.02],[-3.51,1.06+i*.09,3.866],metal);
  label('instrumentos_cenograficos',1.3,.18,[-3.7,1.54,4.07],['INSTRUMENTOS ILUSTRATIVOS']);
  box('fonte_bancada',[.55,.34,.36],[-2.73,1.135,4.04],cabinet);
  label('fonte_desligada',.38,.12,[-2.73,1.2,3.85],['DESLIGADA'],'#142e35','#b3d9d4');
  box('monitor_moldura',[1.02,.65,.08],[3.3,1.55,4.17],black);
  label('monitor',.92,.55,[3.3,1.55,4.122],['ESTAÇÃO DE ANÁLISE','BANCADA 01'],'#15333d','#c8e9e4');
  box('monitor_coluna',[.06,.3,.06],[3.3,1.05,4.18],metal);
  box('monitor_pe',[.42,.04,.25],[3.3,.985,4.12],metal);
  box('teclado',[.65,.035,.22],[3.3,.984,3.87],black);
  box('maleta',[.65,.16,.45],[4.37,1.05,4.03],teal);

  // Armário de equipamentos, janela com esquadria e quadro de procedimentos.
  box('armario',[1.3,2.2,.58],[-5.12,1.1,1.4],cabinet);
  for(const x of [-5.445,-4.795]){
    box('porta_armario',[.62,2.04,.03],[x,1.12,1.09],white);
    box('puxador_armario',[.025,.22,.035],[x+.2,1.14,1.055],metal);
    for(let j=0;j<3;j++)box('veneziana',[.4,.017,.014],[x,.35+j*.05,1.066],metal);
  }
  label('armario_placa',1.1,.2,[-5.12,2.38,1.08],['EQUIPAMENTOS']);
  box('janela_moldura',[3.2,1.5,.08],[-3.65,2.5,5.88],metal);
  box('janela_vidro',[3.03,1.33,.02],[-3.65,2.5,5.826],glass);
  for(const x of [-4.16,-3.14])box('montante',[.035,1.33,.04],[x,2.5,5.8],white);
  box('travessa',[3.03,.035,.04],[-3.65,2.5,5.8],white);
  box('quadro_moldura',[2.6,1.1,.05],[3.8,2.55,5.9],metal);
  label('quadro_procedimento',2.48,.98,[3.8,2.55,5.87],['ENSAIOS DE VIBRAÇÃO','01  FIXAR SENSOR     02  MEDIR REFERÊNCIA','03  COMPARAR          04  REGISTRAR']);

  // Área de ensaio demarcada no piso, sem contato com a base existente.
  for(const z of [-1.55,1.75])box('limite_ensaio',[4,.009,.055],[0,.006,z],yellow);
  for(const x of [-2,2])box('limite_ensaio',[.055,.009,3.3],[x,.006,.1],yellow);
  const areaLabel = label('area_ensaio',2.2,.4,[0,.013,-2.0],['01  /  ÁREA DE ENSAIO'],'#476069','#f0c658');
  areaLabel.rotation.x = Math.PI/2;
  label('saida',.85,.27,[0,2.65,-5.95],['SAÍDA'],'#237355','#ffffff').rotation.y = Math.PI;
  for(const x of [-3,3])for(const z of [-2.8,2.8]){
    box('luminaria_corpo',[2.1,.06,.42],[x,3.9,z],metal);
    box('luminaria_difusor',[1.95,.02,.31],[x,3.856,z],glow);
    for(const dx of [-.8,.8])box('suspensao',[.012,.25,.012],[x+dx,4.055,z],metal);
  }
  const fill = new B.DirectionalLight('lab_luz_janela',new B.Vector3(.4,-1,.5),scene);
  fill.intensity = .35;
  // Objetos imóveis podem manter suas matrizes em cache.
  root.getChildMeshes().forEach(mesh => mesh.freezeWorldMatrix());
  return {root,floor};
}
