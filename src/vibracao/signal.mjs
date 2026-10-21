export function validate(p) {
  for(const key of ['dropped','overflow'])if(p?.[key]!==undefined&&(!Number.isSafeInteger(p[key])||p[key]<0))throw new Error('Contador inválido');
  if (!p || p.device !== 'motor-01' || !Number.isSafeInteger(p.seq) || p.seq < 0 ||
      !Number.isFinite(p.fs) || p.fs !== 200 || !Array.isArray(p.samples) || p.samples.length !== 128 ||
      !p.samples.every(s => Array.isArray(s) && s.length === 3 && s.every(v => Number.isFinite(v) && Math.abs(v) <= 4.01)))
    throw new Error('Esperado motor-01, seq inteiro, fs=200 e 128 amostras XYZ em g, faixa ±4 g.');
}
export function analyze(p) {
  validate(p);
  const n=p.samples.length;
  const means=[0,1,2].map(a=>p.samples.reduce((s,v)=>s+v[a],0)/n);
  const ac=p.samples.map(s=>s.map((v,a)=>(v-means[a])*9.80665));
  const rmsAxes=[0,1,2].map(a=>Math.sqrt(ac.reduce((s,v)=>s+v[a]**2,0)/n));
  const rms=Math.hypot(...rmsAxes);
  const peak=Math.max(...ac.map(s=>Math.hypot(...s)));
  const axis=rmsAxes.indexOf(Math.max(...rmsAxes));
  const weights=ac.map((_,i)=>0.5*(1-Math.cos(2*Math.PI*i/(n-1))));
  const sumW=weights.reduce((a,b)=>a+b,0);
  const spectrum=[];
  for(let k=1;k<=n/2;k++) {
    let re=0,im=0;
    for(let i=0;i<n;i++) {const v=ac[i][axis]*weights[i], angle=2*Math.PI*k*i/n;re+=v*Math.cos(angle);im-=v*Math.sin(angle);}
    spectrum.push({hz:k*p.fs/n, amplitude:Math.hypot(re,im)*(k===n/2?1:2)/sumW});
  }
  const dominant=spectrum.reduce((a,b)=>a.amplitude>b.amplitude?a:b);
  return {device:p.device,seq:p.seq,fs:p.fs,rms,rmsAxes,peak,crest:rms?peak/rms:0,
    dominantHz:rms>0.01?dominant.hz:null,axis:['X','Y','Z'][axis],spectrum,ac,
    clipped:p.samples.some(s=>s.some(v=>Math.abs(v)>=3.95)),dropped:p.dropped??0,overflow:p.overflow??0};
}
export function simulated(seq, elapsed) {
  const phase=elapsed%36;
  const amplitude=phase<12?0.025:phase<24?0.22:0.22-(phase-24)/12*0.195;
  return {device:'motor-01',seq,fs:200,samples:Array.from({length:128},(_,i)=>{
    const t=(seq*128+i)/200, v=Math.sin(2*Math.PI*25*t);
    return [amplitude*v,amplitude*0.45*Math.cos(2*Math.PI*25*t),1+amplitude*0.12*v];
  })};
}
