export function createPanelState() {
  return {running:false, emergency:false, doorOpen:false};
}
export function commandPanel(state, command) {
  if(command==='emergency') {
    state.emergency=!state.emergency;
    state.running=false;
  } else if(command==='stop') state.running=false;
  else if(command==='start'&&!state.emergency) state.running=true;
  else if(command==='door'&&!state.emergency) state.doorOpen=!state.doorOpen;
  return state;
}
