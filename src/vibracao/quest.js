import * as B from '@babylonjs/core';

// Reuses the existing controls so desktop and immersive operation share the
// same emergency interlock, measurement context and reference handling.
export async function setupQuest({scene, floor, button, note, ready, isReady}) {
  if (!window.isSecureContext) {
    button.textContent = 'VR precisa de acesso seguro';
    note.textContent = 'Quest Pro: use http://localhost:8080 após encaminhar a porta por USB, ou HTTPS confiável pela rede.';
    return;
  }
  if (!navigator.xr) {
    button.textContent = 'Abra no navegador do Quest';
    note.textContent = 'Este navegador não oferece WebXR. O painel comum continua disponível.';
    return;
  }
  try {
    if (!await navigator.xr.isSessionSupported('immersive-vr')) {
      button.textContent = 'Abra no navegador do Quest';
      note.textContent = 'Não foi encontrado um dispositivo VR neste navegador.';
      return;
    }
    await ready;
    if (!isReady()) throw new Error('A montagem não carregou. Recarregue a página.');
    const xr = await scene.createDefaultXRExperienceAsync({
      floorMeshes: [floor], disableDefaultUI: true, disableHandTracking: true,
      // Laser pointers work offline; do not fetch controller models from a CDN.
      inputOptions: {doNotLoadControllerMeshes: true},
    });
    const root = new B.TransformNode('comandos Quest Pro', scene);
    root.position.set(-1.65, 0, -.65);
    root.setEnabled(false);
    const get = id => document.getElementById(id);
    const actions = [
      {id:'start',label:()=> 'RECEBER DADOS',color:'#245b9d'},
      {id:'stop',label:()=> 'PARAR RECEPÇÃO',color:'#806117'},
      {id:'emergency',label:()=>get('emergency').textContent.toUpperCase(),color:'#8b2535'},
      {id:'door',label:()=>get('door').textContent.toUpperCase()},
      {id:'baseline',label:()=> 'REGISTRAR REFERÊNCIA'},
      {id:'measurement-point',select:true,label:()=>`PONTO: ${get('measurement-point').value || 'INFORMAR'}`},
      {id:'measurement-direction',select:true,label:()=>get('measurement-direction').value.toUpperCase()},
      {id:'measurement-axis',select:true,label:()=>`EIXO: ${get('measurement-axis').value === '' ? 'INFORMAR' : ['X','Y','Z'][get('measurement-axis').value]}`},
      {id:'exit',label:()=> 'SAIR DE VR',run:()=>xr.baseExperience.exitXRAsync()},
    ];
    const refresh = [];
    actions.forEach((action, index) => {
      const mesh = B.MeshBuilder.CreatePlane(`VR ${action.id}`, {width:.72,height:.19}, scene);
      mesh.parent = root;
      mesh.position.set((index % 2) * .8, 1.8 - Math.floor(index / 2) * .25, 0);
      const texture = new B.DynamicTexture(`texto VR ${action.id}`, {width:768,height:192}, scene, false);
      const material = new B.StandardMaterial(`material VR ${action.id}`, scene);
      material.diffuseTexture = texture; material.emissiveColor = B.Color3.White();
      material.disableLighting = true; material.backFaceCulling = false; mesh.material = material;
      let previous = '';
      refresh.push(() => {
        const disabled = action.id === 'exit' ? false : get(action.id).disabled;
        const label = action.label(), key = `${label}:${disabled}`;
        if (key === previous) return;
        previous = key;
        const ctx = texture.getContext();
        ctx.fillStyle = disabled ? '#39414b' : action.color || '#194c50'; ctx.fillRect(0,0,768,192);
        ctx.fillStyle = disabled ? '#89939b' : '#ffffff'; ctx.font = 'bold 38px Arial';
        ctx.textAlign = 'center'; ctx.fillText(label,384,108); texture.update();
      });
      mesh.actionManager = new B.ActionManager(scene);
      mesh.actionManager.registerAction(new B.ExecuteCodeAction(B.ActionManager.OnPickTrigger, () => {
        if (action.run) { action.run().catch(error=>{note.textContent=error.message;}); return; }
        const element = get(action.id);
        if (element.disabled) return;
        if (action.select) {
          element.selectedIndex = (element.selectedIndex + 1) % element.options.length;
          element.dispatchEvent(new Event('change'));
        } else element.click();
      }));
    });
    scene.onBeforeRenderObservable.add(() => { if(root.isEnabled()) refresh.forEach(draw=>draw()); });
    xr.baseExperience.camera.minZ = .03;
    xr.baseExperience.camera.onXRCameraInitializedObservable.add(camera => {
      camera.position.x = 0; camera.position.z = -2.8;
      camera.setTarget(new B.Vector3(0,camera.position.y,0));
    });
    xr.baseExperience.onStateChangedObservable.add(state => {
      root.setEnabled(state === B.WebXRState.IN_XR);
      button.disabled = state !== B.WebXRState.NOT_IN_XR;
      if (state === B.WebXRState.NOT_IN_XR) engineResize();
    });
    const engineResize = () => scene.getEngine().resize();
    button.disabled = false; button.textContent = 'Entrar em realidade virtual';
    note.textContent = 'Quest Pro: aponte e use o gatilho nos comandos flutuantes à esquerda. Use o piso para teletransporte. Recepção e emergência são apenas locais; não comandam o motor físico.';
    button.onclick = async () => {
      button.disabled = true;
      try { await xr.baseExperience.enterXRAsync('immersive-vr','local-floor',xr.renderTarget); }
      catch(error) { button.disabled=false; note.textContent='Não foi possível iniciar VR: '+error.message; }
    };
  } catch(error) { button.disabled=true; button.textContent='VR não inicializada'; note.textContent='WebXR: '+error.message; }
}
