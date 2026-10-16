// @ts-nocheck
/* ESOF 323 Robotics tarayıcı simülasyonları (Dr. Murat Arslan). Kaynak: ders sitesinin kendi kodu, React'e bağlanmak için
   yalnız şu değişiklikler yapıldı: renkler kapsayıcı öğedeki CSS değişkenlerinden okunur, tüm arayüz/çizim metinleri tx()
   ile çevrilir (TR sözlüğü sims-tr.ts), mountSim() durdurma fonksiyonu döndürür. Simülasyon mantığına dokunulmadı. */
import { translate } from './sims-tr'

let LANG = 'en'
const tx = (s) => (LANG === 'tr' && typeof s === 'string' ? translate(s) : s)


/* ---------- helpers ---------- */
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const f1=v=>(+v).toFixed(1), f2=v=>(+v).toFixed(2);
const wrapA=a=>Math.atan2(Math.sin(a),Math.cos(a));
const randn=()=>{let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);};
function el(tag,attrs={},...kids){const e=document.createElement(tag);for(const k in attrs){if(k==='class')e.className=attrs[k];else if(k==='html')e.innerHTML=attrs[k];else e.setAttribute(k,attrs[k]);}for(const c of kids){if(c==null)continue;e.append(c.nodeType?c:document.createTextNode(c));}return e;}
let PAL=null,PAL_EL=null;
function pal(){if(!PAL){const cs=getComputedStyle(PAL_EL||document.documentElement);const g=n=>cs.getPropertyValue(n).trim();PAL={bg:g('--sim-bg'),grid:g('--sim-grid'),ink:g('--ink'),mute:g('--mute'),a:g('--sim-a'),gold:g('--gold'),red:g('--red'),green:g('--green'),sky:g('--sky'),track:g('--sim-track'),line:g('--line')};}return PAL;}
const FONT='Poppins, system-ui, sans-serif';
function makeCanvas(host,W=640,H=400){const cv=el('canvas',{class:'sim-canvas'});const dpr=Math.min(2,window.devicePixelRatio||1);cv.width=W*dpr;cv.height=H*dpr;cv.style.aspectRatio=W+' / '+H;const ctx=cv.getContext('2d');ctx.scale(dpr,dpr);host.append(cv);const pos=e=>{const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height};};return{cv,ctx,W,H,pos};}
function loop(fn){let alive=true,last=performance.now(),id;const f=t=>{if(!alive)return;const dt=Math.min(0.05,Math.max(0,(t-last)/1000));last=t;fn(dt);id=requestAnimationFrame(f);};id=requestAnimationFrame(f);return()=>{alive=false;cancelAnimationFrame(id);};}
function controls(host){const c=el('div',{class:'ctrl'});host.append(c);return c;}
function slider(p,label0,min,max,step,val,fmt=v=>v){const out=el('output',{},fmt(val));const inp=el('input',{type:'range',min,max,step,value:val,'aria-label':tx(label0)});const o={v:+val};o.set=v=>{inp.value=v;o.v=+inp.value;out.textContent=fmt(o.v);};inp.addEventListener('input',()=>{o.v=+inp.value;out.textContent=fmt(o.v);});p.append(el('label',{class:'sl'},el('span',{class:'sl-h'},el('span',{},tx(label0)),out),inp));return o;}
function select(p,label,opts,val){const s=el('select');opts.forEach(([v,t])=>s.append(el('option',{value:v},tx(t))));s.value=val;const o={v:val};o.set=v=>{s.value=v;o.v=v;};s.addEventListener('change',()=>{o.v=s.value;});p.append(el('label',{class:'sl'},el('span',{class:'sl-h'},tx(label)),s));return o;}
function check(p,label,val){const i=el('input',{type:'checkbox'});i.checked=val;const o={v:val};i.addEventListener('change',()=>{o.v=i.checked;});p.append(el('label',{class:'ck'},i,tx(label)));return o;}
function button(p,label,fn,cls=''){const b=el('button',{class:'sbtn '+cls,type:'button'},tx(label));b.addEventListener('click',fn);p.append(b);return b;}
function readout(p){const r=el('div',{class:'readout','aria-live':'off'});p.append(r);return{set textContent(v){r.textContent=tx(v);},get textContent(){return r.textContent;},append(...k){r.append(...k);}};}
function bgGrid(ctx,W,H,s,p){ctx.fillStyle=p.bg;ctx.fillRect(0,0,W,H);ctx.strokeStyle=p.grid;ctx.lineWidth=1;ctx.beginPath();for(let x=s;x<W;x+=s){ctx.moveTo(x+.5,0);ctx.lineTo(x+.5,H);}for(let y=s;y<H;y+=s){ctx.moveTo(0,y+.5);ctx.lineTo(W,y+.5);}ctx.stroke();}
function txt(ctx,s,x,y,col,size=12,align='left',weight=400){ctx.fillStyle=col;ctx.font=`${weight} ${size}px ${FONT}`;ctx.textAlign=align;ctx.textBaseline='alphabetic';ctx.fillText(tx(s),x,y);}
function rr(ctx,x,y,w,h,r){ctx.beginPath();if(ctx.roundRect)ctx.roundRect(x,y,w,h,r);else ctx.rect(x,y,w,h);}
function legend(ctx,items,x,y,p){ctx.font=`12px ${FONT}`;let cx=x;items.forEach(([t0,c])=>{const t=tx(t0);ctx.fillStyle=c;ctx.fillRect(cx,y-5,14,3);ctx.fillStyle=p.ink;ctx.textAlign='left';ctx.fillText(t,cx+18,y);cx+=ctx.measureText(t).width+32;});}
function drawBot(ctx,x,y,th,p,col,ghost){ctx.save();ctx.translate(x,y);ctx.rotate(th);if(ghost){ctx.setLineDash([4,3]);ctx.strokeStyle=col;ctx.lineWidth=1.5;rr(ctx,-15,-12,28,24,5);ctx.stroke();ctx.setLineDash([]);}else{ctx.fillStyle=col;rr(ctx,-15,-12,28,24,5);ctx.fill();ctx.fillStyle=p.ink;ctx.fillRect(-9,-16,13,4);ctx.fillRect(-9,12,13,4);ctx.fillStyle=p.gold;ctx.beginPath();ctx.moveTo(13,0);ctx.lineTo(5,-5);ctx.lineTo(5,5);ctx.fill();}ctx.restore();}
function segDist(px,py,ax,ay,bx,by){const dx=bx-ax,dy=by-ay;const t=clamp(((px-ax)*dx+(py-ay)*dy)/(dx*dx+dy*dy),0,1);return Math.hypot(ax+t*dx-px,ay+t*dy-py);}

/* ---------- simulations ---------- */
const SIMS={};

SIMS.line={title:'Line follower',weeks:[1,5],
desc:'A two-wheeled robot with reflectance sensors. Compare a bang-bang controller using two sensors with a PD controller using a five-sensor array.',
mount(stage,side,cfg={}){
  const {ctx,W,H}=makeCanvas(stage);
  const pts=[];for(let i=0;i<360;i++){const t=i/360*Math.PI*2;pts.push({x:W/2+235*Math.cos(t)+30*Math.cos(3*t),y:H/2+130*Math.sin(t)+35*Math.sin(2*t)});}
  const dTrack=(x,y)=>{let m=1e9;for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];const d=segDist(x,y,a.x,a.y,b.x,b.y);if(d<m)m=d;}return m;};
  const c=side?controls(side):null;
  const mode=c?select(c,'Controller',[['bang','Bang-bang, 2 sensors'],['pid','PD, 5 sensors']],cfg.mode||'bang'):{v:'pid'};
  const spd=c?slider(c,'Base speed (px/s)',40,260,5,120):{v:150};
  const kp=c?slider(c,'Kp (PD only)',0,150,1,45):{v:45};
  const kd=c?slider(c,'Kd (PD only)',0,3,0.05,0.4,f2):{v:0.4};
  let R,S=[];
  const reset=()=>{const a=pts[0],b=pts[1];R={x:a.x,y:a.y,th:Math.atan2(b.y-a.y,b.x-a.x),le:0,d:0,turn:0,e:0,vL:0,vR:0,trail:[]};};
  reset();
  if(c)button(c,'Reset robot',reset,'ghost');
  const ro=c?readout(c):null;
  const L=28,o5=[2,1,0,-1,-2],o2=[1,-1];
  const sense=(offs,gap)=>{const fx=Math.cos(R.th),fy=Math.sin(R.th),lx=Math.sin(R.th),ly=-Math.cos(R.th);return offs.map(o=>{const x=R.x+fx*20+lx*o*gap,y=R.y+fy*20+ly*o*gap;return{x,y,on:dTrack(x,y)<8};});};
  function step(dt){
    const v=spd.v;let turn;
    if(mode.v==='bang'){S=sense(o2,6);const[l,r]=S;if(l.on&&r.on)turn=0;else if(l.on)turn=v*0.7;else if(r.on)turn=-v*0.7;else turn=R.turn;R.turn=turn;R.e=l.on&&!r.on?1:(r.on&&!l.on?-1:0);}
    else{S=sense(o5,8);let n=0,s=0;S.forEach((q,i)=>{if(q.on){n++;s+=o5[i];}});const e=n?s/n:(R.le>0?2.5:-2.5);R.d=0.7*R.d+0.3*(e-R.le)/dt;R.le=e;R.e=e;turn=clamp(kp.v*e+kd.v*R.d,-1.5*v,1.5*v);}
    R.vR=v+turn;R.vL=v-turn;R.th-=(R.vR-R.vL)/L*dt;const vv=(R.vR+R.vL)/2;R.x+=Math.cos(R.th)*vv*dt;R.y+=Math.sin(R.th)*vv*dt;
    if(R.x<-40||R.x>W+40||R.y<-40||R.y>H+40)reset();
  }
  function draw(){
    const p=pal();ctx.fillStyle=p.bg;ctx.fillRect(0,0,W,H);
    ctx.strokeStyle=p.track;ctx.lineWidth=16;ctx.lineJoin='round';ctx.beginPath();pts.forEach((q,i)=>i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y));ctx.closePath();ctx.stroke();
    ctx.strokeStyle=p.gold;ctx.lineWidth=2;ctx.beginPath();R.trail.forEach((q,i)=>i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y));ctx.stroke();
    drawBot(ctx,R.x,R.y,R.th,p,p.a);
    S.forEach(q=>{ctx.fillStyle=q.on?p.red:p.mute;ctx.beginPath();ctx.arc(q.x,q.y,3.2,0,7);ctx.fill();});
  }
  return loop(dt=>{for(let i=0;i<4;i++)step(dt/4);R.trail.push({x:R.x,y:R.y});if(R.trail.length>500)R.trail.shift();draw();
    if(ro)ro.textContent=`Error e: ${R.e.toFixed(2)}\nLeft wheel: ${R.vL.toFixed(0)} px/s\nRight wheel: ${R.vR.toFixed(0)} px/s`;});
}};

SIMS.filter={title:'Sensor noise and filtering',weeks:[3],
desc:'A noisy distance sensor sampled at 30 Hz. Compare a moving average, an exponential moving average and a 1D Kalman filter against the true distance.',
mount(stage,side){
  const {ctx,W,H}=makeCanvas(stage,640,360);const c=controls(side);
  const sg=slider(c,'Sensor noise σ (cm)',0,40,1,14);
  const N=slider(c,'Moving average window N',1,40,1,10);
  const al=slider(c,'EMA α',0.01,1,0.01,0.15,f2);
  const Q=slider(c,'Kalman Q, process noise',0.01,5,0.01,0.3,f2);
  const Rm=slider(c,'Kalman R, measurement noise',1,1000,1,200);
  const sMA=check(c,'Moving average',true),sE=check(c,'EMA',true),sK=check(c,'Kalman',true);
  const ro=readout(c);
  const buf=[],win=[];let t=0,acc=0,ema=null,kx=150,kP=100;
  const truth=t=>150+60*Math.sin(0.5*t)+(Math.floor(t/7)%2?40:-40);
  function sample(){const tr=truth(t);const z=tr+sg.v*randn();win.push(z);while(win.length>N.v)win.shift();const ma=win.reduce((a,b)=>a+b,0)/win.length;ema=ema===null?z:al.v*z+(1-al.v)*ema;kP+=Q.v;const K=kP/(kP+Rm.v);kx+=K*(z-kx);kP*=(1-K);buf.push({tr,z,ma,ema,k:kx});if(buf.length>320)buf.shift();}
  const Y=v=>H-24-(v/300)*(H-60);
  function draw(){
    const p=pal();bgGrid(ctx,W,H,40,p);
    const X=i=>W-(buf.length-1-i)*2;
    ctx.fillStyle=p.mute;buf.forEach((s,i)=>ctx.fillRect(X(i)-1,Y(s.z)-1,2.2,2.2));
    const line=(k,col,w,dash)=>{ctx.strokeStyle=col;ctx.lineWidth=w;ctx.setLineDash(dash||[]);ctx.beginPath();buf.forEach((s,i)=>i?ctx.lineTo(X(i),Y(s[k])):ctx.moveTo(X(i),Y(s[k])));ctx.stroke();ctx.setLineDash([]);};
    line('tr',p.ink,1.5,[5,4]);if(sMA.v)line('ma',p.sky,2);if(sE.v)line('ema',p.gold,2.2);if(sK.v)line('k',p.red,2);
    ctx.fillStyle=p.bg;ctx.fillRect(0,0,W,28);
    legend(ctx,[['True distance',p.ink],['Moving average',p.sky],['EMA',p.gold],['Kalman',p.red]],12,18,p);
    txt(ctx,'300 cm',W-8,Y(300)+14,p.mute,11,'right');txt(ctx,'0 cm',W-8,Y(0)-4,p.mute,11,'right');
  }
  return loop(dt=>{acc+=dt;while(acc>=1/30){acc-=1/30;t+=1/30;sample();}draw();
    if(buf.length>10){const rm=k=>Math.sqrt(buf.reduce((a,s)=>a+(s[k]-s.tr)**2,0)/buf.length).toFixed(1);ro.textContent=`Error vs true value (RMSE, cm)\nRaw sensor: ${rm('z')}\nMoving average: ${rm('ma')}\nEMA: ${rm('ema')}\nKalman: ${rm('k')}`;}});
}};

SIMS.pwm={title:'PWM and motor speed',weeks:[4],
desc:'PWM switches a 12 V supply fully on and off. The motor and the LED respond to the average voltage, so the duty cycle sets speed and brightness. Time is slowed down here; Arduino PWM runs at about 490 Hz.',
mount(stage,side){
  const {ctx,W,H}=makeCanvas(stage,640,360);const c=controls(side);
  const du=slider(c,'Duty cycle (%)',0,100,1,40);const per=slider(c,'Periods shown',2,10,1,4);
  const ro=readout(c);let rpm=0,ang=0,ph=0;
  return loop(dt=>{
    const p=pal();const D=du.v/100;rpm+=(D*3000-rpm)*Math.min(1,dt*1.8);ang+=rpm/60*2*Math.PI*dt*0.06;ph=(ph+dt*0.25)%1;
    bgGrid(ctx,W,H,40,p);
    const x0=60,x1=610,hi=48,lo=160,pw=(x1-x0)/per.v;
    txt(ctx,'12 V',x0-10,hi+4,p.mute,12,'right');txt(ctx,'0 V',x0-10,lo+4,p.mute,12,'right');
    ctx.strokeStyle=p.sky;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(x0,lo);
    for(let k=0;k<per.v;k++){const a=x0+k*pw,b=a+pw*D;ctx.lineTo(a,lo);if(D>0){ctx.lineTo(a,hi);ctx.lineTo(b,hi);ctx.lineTo(b,lo);}ctx.lineTo(a+pw,lo);}ctx.stroke();
    const ya=lo-(lo-hi)*D;ctx.strokeStyle=p.gold;ctx.setLineDash([6,4]);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x0,ya);ctx.lineTo(x1,ya);ctx.stroke();ctx.setLineDash([]);
    txt(ctx,`Average ${(12*D).toFixed(1)} V`,x1,ya-6,p.gold,12,'right',600);
    const cx=x0+ph*(x1-x0);ctx.strokeStyle=p.mute;ctx.setLineDash([2,3]);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(cx,hi-12);ctx.lineTo(cx,lo+8);ctx.stroke();ctx.setLineDash([]);
    ctx.save();ctx.translate(190,270);ctx.strokeStyle=p.ink;ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,58,0,7);ctx.stroke();ctx.rotate(ang);ctx.strokeStyle=p.a;for(let i=0;i<4;i++){ctx.rotate(Math.PI/2);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(52,0);ctx.stroke();}ctx.fillStyle=p.gold;ctx.beginPath();ctx.arc(0,0,7,0,7);ctx.fill();ctx.restore();
    txt(ctx,`${rpm.toFixed(0)} rpm`,265,262,p.ink,20,'left',700);txt(ctx,'DC motor',265,282,p.mute,12);
    ctx.save();ctx.globalAlpha=0.08+0.92*D;ctx.fillStyle=p.gold;ctx.beginPath();ctx.arc(500,262,28,0,7);ctx.fill();ctx.restore();
    ctx.strokeStyle=p.ink;ctx.lineWidth=2;ctx.beginPath();ctx.arc(500,262,28,0,7);ctx.stroke();txt(ctx,'LED',500,312,p.mute,12,'center');
    ro.textContent=`analogWrite value: ${Math.round(D*255)}\nAverage voltage: ${(12*D).toFixed(2)} V\nMotor speed: ${rpm.toFixed(0)} rpm\nSteady state: ${(D*3000).toFixed(0)} rpm`;
  });
}};

SIMS.pid={title:'PID step response',weeks:[5],
desc:'A cart on a rail with friction. The setpoint toggles between 0 and 1 every 5 seconds. Start with P only, add D to damp the overshoot, then add a disturbance and use I to remove the steady-state error.',
mount(stage,side){
  const {ctx,W,H}=makeCanvas(stage,640,400);const c=controls(side);
  const kp=slider(c,'Kp',0,60,0.5,10,f1),ki=slider(c,'Ki',0,20,0.1,0,f1),kd=slider(c,'Kd',0,15,0.1,3,f1),ds=slider(c,'Disturbance force',-8,8,0.5,0,f1);
  const aw=check(c,'Anti-windup',true);
  let S;const reset=()=>{S={x:0,v:0,I:0,t:0,u:0,sp:1,psp:1,peak:0,buf:[]};};reset();
  button(c,'Restart',reset,'ghost');const ro=readout(c);const UM=20;
  function step(dt){const sp=Math.floor(S.t/5)%2===0?1:0;if(sp!==S.psp){S.psp=sp;S.peak=S.x;}const e=sp-S.x;const Ip=S.I+e*dt;const u=kp.v*e+ki.v*Ip-kd.v*S.v;const us=clamp(u,-UM,UM);if(!aw.v||u===us)S.I=Ip;S.u=us;S.sp=sp;const a=us+ds.v-0.5*S.v;S.v+=a*dt;S.x+=S.v*dt;S.t+=dt;S.peak=sp?Math.max(S.peak,S.x):Math.min(S.peak,S.x);}
  const top=96,Y=v=>H-22-(v+0.5)/2*(H-top-34);
  return loop(dt=>{
    for(let i=0;i<4;i++)step(dt/4);S.buf.push({t:S.t,sp:S.sp,x:S.x,u:S.u});while(S.buf.length&&S.buf[0].t<S.t-8)S.buf.shift();
    const p=pal();bgGrid(ctx,W,H,40,p);
    ctx.fillStyle=p.bg;ctx.fillRect(0,0,W,top-10);
    const rx=v=>120+v*400;ctx.strokeStyle=p.mute;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(60,66);ctx.lineTo(580,66);ctx.stroke();
    txt(ctx,'0',rx(0),84,p.mute,11,'center');txt(ctx,'1',rx(1),84,p.mute,11,'center');
    ctx.fillStyle=p.red;ctx.beginPath();ctx.moveTo(rx(S.sp),26);ctx.lineTo(rx(S.sp)-7,14);ctx.lineTo(rx(S.sp)+7,14);ctx.fill();
    ctx.fillStyle=p.a;rr(ctx,rx(S.x)-22,40,44,22,4);ctx.fill();
    const uw=S.u/UM*60;ctx.fillStyle=p.gold;ctx.fillRect(rx(S.x),49,uw,4);
    const X=t=>W*(1-(S.t-t)/8);
    [0,1].forEach(v=>{ctx.strokeStyle=p.line;ctx.beginPath();ctx.moveTo(0,Y(v));ctx.lineTo(W,Y(v));ctx.stroke();});
    const plot=(k,col,w,sc=1,dash)=>{ctx.strokeStyle=col;ctx.lineWidth=w;ctx.setLineDash(dash||[]);ctx.beginPath();S.buf.forEach((s,i)=>{const yy=Y(s[k]*sc);i?ctx.lineTo(X(s.t),yy):ctx.moveTo(X(s.t),yy);});ctx.stroke();ctx.setLineDash([]);};
    plot('u',p.gold,1.5,1/UM*0.5,[3,3]);plot('sp',p.red,2,1,[6,4]);plot('x',p.a,2.5);
    legend(ctx,[['Setpoint',p.red],['Position x',p.a],['Control u (scaled)',p.gold]],12,top+6,p);
    const os=S.sp?(S.peak-1):(-S.peak);
    ro.textContent=`Setpoint: ${S.sp}\nPosition: ${S.x.toFixed(3)}\nError: ${(S.sp-S.x).toFixed(3)}\nControl u: ${S.u.toFixed(2)}${Math.abs(S.u)>=UM-1e-9?' (saturated)':''}\nIntegral: ${S.I.toFixed(3)}\nOvershoot this step: ${Math.max(0,os*100).toFixed(1)} %`;
  });
}};

SIMS.diff={title:'Differential drive kinematics',weeks:[6],
desc:'Set the wheel speeds and watch the robot turn about its instantaneous centre of rotation (ICR). The dashed robot is the odometry estimate: it assumes perfect wheels, while the real wheels have a small radius error.',
mount(stage,side){
  const {ctx,W,H}=makeCanvas(stage);const c=controls(side);
  const vl=slider(c,'Left wheel vL (px/s)',-120,120,1,60),vr=slider(c,'Right wheel vR (px/s)',-120,120,1,90),Lb=slider(c,'Wheel base L (px)',20,80,1,40);
  const od=check(c,'Show odometry estimate',true);const nz=slider(c,'Wheel radius error (%)',0,10,0.5,3,f1);
  let R,O,bl,br,tr,otr;
  const reset=()=>{R={x:W/2,y:H/2+80,th:-Math.PI/2};O={...R};bl=1+nz.v/100*randn();br=1+nz.v/100*randn();tr=[];otr=[];};reset();
  button(c,'Reset',reset,'ghost');const ro=readout(c);
  const adv=(P,a,b,dt)=>{const v=(a+b)/2,w=(b-a)/Lb.v;P.th-=w*dt;P.x+=v*Math.cos(P.th)*dt;P.y+=v*Math.sin(P.th)*dt;};
  return loop(dt=>{
    adv(R,vl.v*bl,vr.v*br,dt);adv(O,vl.v,vr.v,dt);
    tr.push({x:R.x,y:R.y});otr.push({x:O.x,y:O.y});if(tr.length>1500){tr.shift();otr.shift();}
    if(R.x<-80||R.x>W+80||R.y<-80||R.y>H+80)reset();
    const p=pal();bgGrid(ctx,W,H,40,p);
    const path=(a,col,dash)=>{ctx.strokeStyle=col;ctx.lineWidth=2;ctx.setLineDash(dash||[]);ctx.beginPath();a.forEach((q,i)=>i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y));ctx.stroke();ctx.setLineDash([]);};
    path(tr,p.gold);if(od.v)path(otr,p.sky,[4,4]);
    const v=(vl.v+vr.v)/2,w=(vr.v-vl.v)/Lb.v;let Rtxt='∞ (straight line)';
    if(Math.abs(w)>0.005){const Rc=v/w;Rtxt=`${Rc.toFixed(0)} px`;const ix=R.x+Math.sin(R.th)*Rc,iy=R.y-Math.cos(R.th)*Rc;
      if(Math.abs(Rc)<2000){ctx.strokeStyle=p.mute;ctx.setLineDash([3,5]);ctx.lineWidth=1;ctx.beginPath();ctx.arc(ix,iy,Math.abs(Rc),0,7);ctx.stroke();ctx.beginPath();ctx.moveTo(ix,iy);ctx.lineTo(R.x,R.y);ctx.stroke();ctx.setLineDash([]);}
      ctx.fillStyle=p.red;ctx.beginPath();ctx.arc(ix,iy,4,0,7);ctx.fill();txt(ctx,'ICR',ix+7,iy-6,p.red,12,'left',600);}
    if(od.v)drawBot(ctx,O.x,O.y,O.th,p,p.sky,true);
    drawBot(ctx,R.x,R.y,R.th,p,p.a);
    ro.textContent=`Linear speed v: ${v.toFixed(1)} px/s\nAngular speed ω: ${w.toFixed(3)} rad/s\nTurn radius R = v/ω: ${Rtxt}`+(od.v?`\nOdometry error: ${Math.hypot(R.x-O.x,R.y-O.y).toFixed(1)} px`:'');
  });
}};

SIMS.arm={title:'Two-link arm kinematics',weeks:[7],
desc:'Drag on the canvas to move the target and solve inverse kinematics, or switch to forward kinematics and set the joint angles yourself. The shaded ring is the reachable workspace.',
mount(stage,side){
  const {cv,ctx,W,H,pos}=makeCanvas(stage);const c=controls(side);
  const md=select(c,'Mode',[['ik','Inverse kinematics: drag target'],['fk','Forward kinematics: sliders']],'ik');
  const elb=select(c,'IK solution',[['up','Elbow up'],['down','Elbow down']],'up');
  const a1=slider(c,'θ1 (deg)',-180,180,1,60),a2=slider(c,'θ2 (deg)',-180,180,1,-70);
  const ro=readout(c);
  const l1=150,l2=110,bx=W/2,by=H-50;let q1=1,q2=-1.2,T={x:130,y:170},drag=false,reach=true;
  const setT=e=>{const m=pos(e);T={x:m.x-bx,y:by-m.y};};
  cv.addEventListener('pointerdown',e=>{if(md.v!=='ik')return;drag=true;cv.setPointerCapture(e.pointerId);setT(e);});
  cv.addEventListener('pointermove',e=>{if(drag)setT(e);});
  cv.addEventListener('pointerup',()=>{drag=false;});
  return loop(dt=>{
    if(md.v==='ik'){const r=Math.hypot(T.x,T.y),rmin=Math.abs(l1-l2)+1,rmax=l1+l2-1;reach=r>=rmin&&r<=rmax;const rc=clamp(r,rmin,rmax),an=Math.atan2(T.y,T.x);const x=rc*Math.cos(an),y=rc*Math.sin(an);const D=clamp((x*x+y*y-l1*l1-l2*l2)/(2*l1*l2),-1,1);const t2=Math.acos(D)*(elb.v==='up'?-1:1);const t1=Math.atan2(y,x)-Math.atan2(l2*Math.sin(t2),l1+l2*Math.cos(t2));const k=Math.min(1,dt*10);q1=wrapA(q1+wrapA(t1-q1)*k);q2=wrapA(q2+wrapA(t2-q2)*k);a1.set(Math.round(q1*180/Math.PI));a2.set(Math.round(q2*180/Math.PI));}
    else{q1=a1.v*Math.PI/180;q2=a2.v*Math.PI/180;}
    const p=pal();bgGrid(ctx,W,H,40,p);
    ctx.save();ctx.globalAlpha=0.12;ctx.fillStyle=p.gold;ctx.beginPath();ctx.arc(bx,by,l1+l2,0,Math.PI*2);ctx.arc(bx,by,Math.abs(l1-l2),0,Math.PI*2,true);ctx.fill('evenodd');ctx.restore();
    ctx.strokeStyle=p.line;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,by);ctx.lineTo(W,by);ctx.moveTo(bx,0);ctx.lineTo(bx,H);ctx.stroke();
    const ex=l1*Math.cos(q1),ey=l1*Math.sin(q1),fx=ex+l2*Math.cos(q1+q2),fy=ey+l2*Math.sin(q1+q2);const S=(x,y)=>[bx+x,by-y];
    ctx.fillStyle=p.ink;ctx.fillRect(bx-26,by,52,16);
    ctx.lineCap='round';ctx.strokeStyle=p.a;ctx.lineWidth=16;ctx.beginPath();ctx.moveTo(...S(0,0));ctx.lineTo(...S(ex,ey));ctx.stroke();ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(...S(ex,ey));ctx.lineTo(...S(fx,fy));ctx.stroke();ctx.lineCap='butt';
    [[0,0,9],[ex,ey,8]].forEach(([x,y,r])=>{ctx.fillStyle=p.gold;ctx.beginPath();ctx.arc(...S(x,y),r,0,7);ctx.fill();});
    ctx.fillStyle=p.ink;ctx.beginPath();ctx.arc(...S(fx,fy),5,0,7);ctx.fill();
    if(md.v==='ik'){const[tx,ty]=S(T.x,T.y);ctx.strokeStyle=reach?p.green:p.red;ctx.lineWidth=2;ctx.beginPath();ctx.arc(tx,ty,10,0,7);ctx.moveTo(tx-16,ty);ctx.lineTo(tx+16,ty);ctx.moveTo(tx,ty-16);ctx.lineTo(tx,ty+16);ctx.stroke();}
    const sing=Math.abs(Math.sin(q2))<0.06;
    ro.textContent=`θ1: ${(q1*180/Math.PI).toFixed(1)}°\nθ2: ${(q2*180/Math.PI).toFixed(1)}°\nEnd effector: (${fx.toFixed(0)}, ${fy.toFixed(0)}) px`+(md.v==='ik'?`\nTarget: ${reach?'reachable':'out of reach'}`:'')+(sing?'\nNear a singularity (θ2 ≈ 0° or 180°)':'');
  });
}};

SIMS.path={title:'Grid path planning',weeks:[9],
desc:'Draw walls, move the start and goal, then run a search. Compare how many cells each algorithm expands before it finds a path, and whether the path is the shortest.',
mount(stage,side){
  const {cv,ctx,W,H,pos}=makeCanvas(stage);const c=controls(side);
  const CS=20,CO=32,RO=20,N=CO*RO;
  const alg=select(c,'Algorithm',[['bfs','Breadth-first search'],['greedy','Greedy best-first'],['astar','A*']],'astar');
  const tool=select(c,'Click tool',[['wall','Draw walls'],['erase','Erase walls'],['start','Move start'],['goal','Move goal']],'wall');
  const sp=slider(c,'Animation speed',1,40,1,6);
  const walls=new Uint8Array(N);let s=3+10*CO,g=28+10*CO;
  let gen=null,closed,openM,path=null,exp=0;
  const clearSearch=()=>{gen=null;closed=new Uint8Array(N);openM=new Uint8Array(N);path=null;exp=0;};clearSearch();
  const h=i=>Math.abs(i%CO-g%CO)+Math.abs(((i/CO)|0)-((g/CO)|0));
  function* search(a){const gc=new Float64Array(N).fill(Infinity),came=new Int32Array(N).fill(-1);gc[s]=0;const open=[{i:s,f:0}];openM[s]=1;
    while(open.length){let bi=0;if(a!=='bfs')for(let k=1;k<open.length;k++)if(open[k].f<open[bi].f)bi=k;const cur=open.splice(bi,1)[0].i;if(closed[cur])continue;closed[cur]=1;openM[cur]=0;exp++;
      if(cur===g){const pp=[];for(let k=cur;k!==-1;k=came[k])pp.push(k);path=pp;return;}
      const cc=cur%CO,cr=(cur/CO)|0;
      for(const[dc,dr]of[[1,0],[-1,0],[0,1],[0,-1]]){const nc=cc+dc,nr=cr+dr;if(nc<0||nr<0||nc>=CO||nr>=RO)continue;const ni=nr*CO+nc;if(walls[ni]||closed[ni])continue;const ng=gc[cur]+1;if(ng<gc[ni]){gc[ni]=ng;came[ni]=cur;open.push({i:ni,f:a==='astar'?ng+h(ni):a==='greedy'?h(ni):ng});openM[ni]=1;}}
      yield;}
    path=[];}
  const row=el('div',{class:'row'});c.append(row);
  button(row,'Run search',()=>{clearSearch();gen=search(alg.v);});
  button(row,'Random walls',()=>{for(let i=0;i<N;i++)walls[i]=Math.random()<0.28?1:0;walls[s]=walls[g]=0;clearSearch();},'ghost');
  button(row,'Clear',()=>{walls.fill(0);clearSearch();},'ghost');
  const ro=readout(c);
  let painting=false;
  const apply=e=>{const m=pos(e);const cc=clamp(Math.floor(m.x/CS),0,CO-1),cr=clamp(Math.floor(m.y/CS),0,RO-1),i=cr*CO+cc;
    if(tool.v==='wall'){if(i!==s&&i!==g)walls[i]=1;}else if(tool.v==='erase')walls[i]=0;else if(tool.v==='start'){if(!walls[i]&&i!==g)s=i;}else if(i!==s&&!walls[i])g=i;clearSearch();};
  cv.addEventListener('pointerdown',e=>{painting=true;cv.setPointerCapture(e.pointerId);apply(e);});
  cv.addEventListener('pointermove',e=>{if(painting&&(tool.v==='wall'||tool.v==='erase'))apply(e);});
  cv.addEventListener('pointerup',()=>{painting=false;});
  return loop(()=>{
    if(gen){for(let k=0;k<sp.v;k++){if(gen.next().done){gen=null;break;}}}
    const p=pal();ctx.fillStyle=p.bg;ctx.fillRect(0,0,W,H);
    for(let i=0;i<N;i++){const x=(i%CO)*CS,y=((i/CO)|0)*CS;if(walls[i]){ctx.fillStyle=p.ink;ctx.fillRect(x,y,CS,CS);}else if(closed[i]){ctx.globalAlpha=0.28;ctx.fillStyle=p.sky;ctx.fillRect(x,y,CS,CS);ctx.globalAlpha=1;}else if(openM[i]){ctx.globalAlpha=0.5;ctx.fillStyle=p.gold;ctx.fillRect(x,y,CS,CS);ctx.globalAlpha=1;}}
    ctx.strokeStyle=p.grid;ctx.lineWidth=1;ctx.beginPath();for(let x=0;x<=W;x+=CS){ctx.moveTo(x+.5,0);ctx.lineTo(x+.5,H);}for(let y=0;y<=H;y+=CS){ctx.moveTo(0,y+.5);ctx.lineTo(W,y+.5);}ctx.stroke();
    const C=i=>[(i%CO)*CS+CS/2,((i/CO)|0)*CS+CS/2];
    if(path&&path.length){ctx.strokeStyle=p.red;ctx.lineWidth=4;ctx.lineJoin='round';ctx.beginPath();path.forEach((i,k)=>k?ctx.lineTo(...C(i)):ctx.moveTo(...C(i)));ctx.stroke();}
    ctx.fillStyle=p.green;ctx.beginPath();ctx.arc(...C(s),7,0,7);ctx.fill();
    const[gx,gy]=C(g);ctx.fillStyle=p.red;ctx.fillRect(gx-7,gy-7,14,14);
    ro.textContent=`Expanded cells: ${exp}\nPath length: ${path===null?(gen?'searching…':'run a search'):(path.length?(path.length-1)+' steps':'no path exists')}\nGreen circle: start\nRed square: goal`;
  });
}};

SIMS.pf={title:'Particle filter localization',weeks:[10],
desc:'The robot measures noisy distances to four landmarks. Each blue dot is one guess of where the robot is; the red ring is the filter\'s estimate. Kidnap the robot to see the filter lose it and recover.',
mount(stage,side){
  const {ctx,W,H}=makeCanvas(stage);const c=controls(side);
  const Nn=slider(c,'Particles',50,2000,50,500);const sz=slider(c,'Range noise σ (px)',2,40,1,10);
  const LM=[[70,60],[570,70],[560,340],[90,330]];
  let R={x:220,y:200,th:0},P=[],t=0,acc=0,est={x:0,y:0},z=null;
  const rnd=()=>({x:Math.random()*W,y:Math.random()*H,th:Math.random()*Math.PI*2});
  const init=()=>{P=[];for(let i=0;i<Nn.v;i++)P.push(rnd());};init();
  const row=el('div',{class:'row'});c.append(row);
  button(row,'Kidnap robot',()=>{R.x=80+Math.random()*(W-160);R.y=80+Math.random()*(H-160);R.th=Math.random()*6.28;});
  button(row,'Scatter particles',init,'ghost');const ro=readout(c);
  function update(){z=LM.map(l=>Math.hypot(l[0]-R.x,l[1]-R.y)+sz.v*randn());const s2=2*sz.v*sz.v;const lw=P.map(q=>{let a=0;LM.forEach((l,j)=>{const d=Math.hypot(l[0]-q.x,l[1]-q.y)-z[j];a-=d*d/s2;});return a;});const mx=Math.max(...lw);const w=lw.map(a=>Math.exp(a-mx));const sum=w.reduce((a,b)=>a+b,0);const n=P.length;
    const NP=[];let r=Math.random()/n,cw=w[0]/sum,i=0;for(let m=0;m<n;m++){const U=r+m/n;while(U>cw&&i<n-1){i++;cw+=w[i]/sum;}const q=P[i];NP.push({x:q.x+randn()*1.5,y:q.y+randn()*1.5,th:q.th+randn()*0.03});}
    const inj=Math.floor(n*0.03);for(let k=0;k<inj;k++)NP[Math.floor(Math.random()*n)]=rnd();P=NP;
    let sx=0,sy=0;P.forEach(q=>{sx+=q.x;sy+=q.y;});est={x:sx/n,y:sy/n};}
  return loop(dt=>{
    if(P.length!==Nn.v)init();
    t+=dt;const v=70;let w=0.35*Math.sin(t*0.5)+0.15;const m=75;
    if(R.x<m||R.x>W-m||R.y<m||R.y>H-m){const want=Math.atan2(H/2-R.y,W/2-R.x);w=clamp(wrapA(want-R.th)*2,-1.6,1.6);}
    R.th+=w*dt;R.x+=v*Math.cos(R.th)*dt;R.y+=v*Math.sin(R.th)*dt;
    P.forEach(q=>{q.th+=(w+randn()*0.15)*dt;const st=(v+randn()*v*0.1)*dt;q.x+=st*Math.cos(q.th);q.y+=st*Math.sin(q.th);});
    acc+=dt;if(acc>0.25){acc=0;update();}
    const p=pal();bgGrid(ctx,W,H,40,p);
    if(z){ctx.strokeStyle=p.line;ctx.lineWidth=1;LM.forEach((l,j)=>{ctx.beginPath();ctx.arc(l[0],l[1],z[j],0,7);ctx.stroke();});}
    ctx.fillStyle=p.sky;ctx.globalAlpha=0.55;P.forEach(q=>ctx.fillRect(q.x-1.2,q.y-1.2,2.4,2.4));ctx.globalAlpha=1;
    LM.forEach(l=>{ctx.fillStyle=p.gold;ctx.fillRect(l[0]-8,l[1]-8,16,16);ctx.strokeStyle=p.ink;ctx.lineWidth=1.5;ctx.strokeRect(l[0]-8,l[1]-8,16,16);});
    drawBot(ctx,R.x,R.y,R.th,p,p.a);
    ctx.strokeStyle=p.red;ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(est.x,est.y,13,0,7);ctx.stroke();
    ro.textContent=`Particles: ${P.length}\nEstimate error: ${Math.hypot(est.x-R.x,est.y-R.y).toFixed(1)} px\nGold squares: landmarks\nGrey circles: measured ranges`;
  });
}};

SIMS.drone={title:'Quadrotor flight control (2D)',weeks:[11,12],
desc:'A planar quadrotor with a cascaded controller: a position PID outside and an attitude PD inside. Click the sky to set a target, or switch to mission mode, click to place waypoints and start the mission.',
mount(stage,side,cfg={}){
  const {cv,ctx,W,H,pos}=makeCanvas(stage);const c=controls(side);
  const md=select(c,'Mode',[['hold','Position hold: click sets target'],['mission','Mission: click adds waypoints']],cfg.mode||'hold');
  const kp=slider(c,'Position Kp',0,10,0.1,3,f1),ki=slider(c,'Position Ki',0,3,0.05,0,f2),kd=slider(c,'Position Kd',0,8,0.1,3,f1);
  const ka=slider(c,'Attitude Kp',0,15,0.1,4.5,f1),kad=slider(c,'Attitude Kd',0,1.5,0.01,0.4,f2);
  const wd=slider(c,'Wind force (N)',0,4,0.1,0,f1);
  const m=1,g=9.81,l=0.25,I=0.02,Tm=15,S=32,G=H-28,XW=W/S;
  let D,T1=0,T2=0,Ix=0,Iy=0,tgt,wps=[],wi=0,run=false,trail=[],t=0;
  const reset=()=>{D={x:3,y:0,vx:0,vy:0,ph:0,om:0};Ix=Iy=0;tgt={x:10,y:5};trail=[];run=false;wi=0;};reset();
  const row=el('div',{class:'row'});c.append(row);
  button(row,'Start mission',()=>{if(wps.length){md.set('mission');wi=0;run=true;}});
  button(row,'Clear waypoints',()=>{wps=[];run=false;},'ghost');
  button(row,'Reset',reset,'ghost');const ro=readout(c);
  cv.addEventListener('pointerdown',e=>{const q=pos(e);const w={x:clamp(q.x/S,0.5,XW-0.5),y:clamp((G-q.y)/S,0.3,(G-10)/S)};if(md.v==='hold'){tgt=w;run=false;}else wps.push(w);});
  function step(h){
    if(run&&wps[wi]){tgt=wps[wi];if(Math.hypot(tgt.x-D.x,tgt.y-D.y)<0.35&&Math.hypot(D.vx,D.vy)<0.8){wi++;if(wi>=wps.length){run=false;tgt=wps[wps.length-1];}}}
    const ex=tgt.x-D.x,ey=tgt.y-D.y;Ix=clamp(Ix+ex*h,-5,5);Iy=clamp(Iy+ey*h,-5,5);
    const ax=clamp(kp.v*ex+ki.v*Ix-kd.v*D.vx,-8,8),ay=clamp(kp.v*ey+ki.v*Iy-kd.v*D.vy,-6,8);
    const phd=clamp(Math.atan2(ax,g+ay),-0.6,0.6);const T=clamp(m*(g+ay)/Math.max(0.5,Math.cos(D.ph)),0,2*Tm);
    const tau=ka.v*(phd-D.ph)-kad.v*D.om;T1=clamp(T/2+tau/(2*l),0,Tm);T2=clamp(T/2-tau/(2*l),0,Tm);
    const wind=wd.v*(1+0.5*Math.sin(t*1.3)+0.3*Math.sin(t*3.7));const F=T1+T2;
    D.vx+=((F*Math.sin(D.ph)+wind)/m-0.1*D.vx)*h;D.vy+=(F*Math.cos(D.ph)/m-g-0.1*D.vy)*h;D.om+=((T1-T2)*l/I)*h;
    D.ph+=D.om*h;D.x+=D.vx*h;D.y+=D.vy*h;t+=h;
    if(D.y<=0){D.y=0;if(D.vy<0)D.vy=0;D.vx*=0.95;D.ph*=0.9;D.om*=0.5;}
    if(D.x<0.3){D.x=0.3;D.vx=Math.max(0,D.vx);}if(D.x>XW-0.3){D.x=XW-0.3;D.vx=Math.min(0,D.vx);}
  }
  return loop(dt=>{
    const n=Math.max(1,Math.ceil(dt/0.004));for(let i=0;i<n;i++)step(dt/n);
    trail.push([D.x,D.y]);if(trail.length>600)trail.shift();
    const p=pal();bgGrid(ctx,W,H,S,p);const P=(x,y)=>[x*S,G-y*S];
    ctx.fillStyle=p.grid;ctx.fillRect(0,G,W,H-G);ctx.strokeStyle=p.ink;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,G);ctx.lineTo(W,G);ctx.stroke();
    for(let x=0;x<=XW;x+=2)txt(ctx,x+' m',x*S+3,H-9,p.mute,10);
    for(let y=2;y<=10;y+=2)txt(ctx,y+' m',4,G-y*S-3,p.mute,10);
    if(wd.v>0){ctx.strokeStyle=p.mute;ctx.lineWidth=1.5;for(let k=0;k<4;k++){const yy=40+k*70,xx=((t*60*wd.v+k*170)%(W+80))-40;ctx.beginPath();ctx.moveTo(xx,yy);ctx.lineTo(xx+26,yy);ctx.lineTo(xx+20,yy-4);ctx.moveTo(xx+26,yy);ctx.lineTo(xx+20,yy+4);ctx.stroke();}}
    if(wps.length){ctx.strokeStyle=p.mute;ctx.setLineDash([5,5]);ctx.lineWidth=1.5;ctx.beginPath();wps.forEach((w,i)=>i?ctx.lineTo(...P(w.x,w.y)):ctx.moveTo(...P(w.x,w.y)));ctx.stroke();ctx.setLineDash([]);
      wps.forEach((w,i)=>{const[x,y]=P(w.x,w.y);ctx.fillStyle=i<wi&&(run||wi>=wps.length)?p.green:p.a;ctx.beginPath();ctx.arc(x,y,10,0,7);ctx.fill();txt(ctx,String(i+1),x,y+4,p.bg,11,'center',700);});}
    const[tx,ty]=P(tgt.x,tgt.y);ctx.strokeStyle=p.gold;ctx.lineWidth=2;ctx.beginPath();ctx.arc(tx,ty,13,0,7);ctx.moveTo(tx-20,ty);ctx.lineTo(tx+20,ty);ctx.moveTo(tx,ty-20);ctx.lineTo(tx,ty+20);ctx.stroke();
    ctx.strokeStyle=p.sky;ctx.lineWidth=1.5;ctx.beginPath();trail.forEach((q,i)=>i?ctx.lineTo(...P(q[0],q[1])):ctx.moveTo(...P(q[0],q[1])));ctx.stroke();
    const[dx,dy]=P(D.x,D.y);ctx.save();ctx.translate(dx,dy-8);ctx.rotate(D.ph);
    ctx.strokeStyle=p.a;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-30,0);ctx.lineTo(30,0);ctx.stroke();ctx.fillStyle=p.a;rr(ctx,-11,-7,22,13,3);ctx.fill();
    [[-30,T1],[30,T2]].forEach(([x,T])=>{ctx.strokeStyle=p.ink;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,-6);ctx.stroke();ctx.beginPath();ctx.ellipse(x,-7,13,2.5,0,0,7);ctx.stroke();ctx.strokeStyle=p.gold;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,-12);ctx.lineTo(x,-12-T*2.6);ctx.stroke();});
    ctx.restore();
    ro.textContent=`Altitude: ${D.y.toFixed(2)} m\nPosition x: ${D.x.toFixed(2)} m\nRoll angle: ${(D.ph*180/Math.PI).toFixed(1)}°\nThrust left / right: ${T1.toFixed(1)} / ${T2.toFixed(1)} N\nMission: ${run?`flying to waypoint ${wi+1} of ${wps.length}`:(wps.length?`${wps.length} waypoints ready`:'no waypoints')}`;
  });
}};

SIMS.swarm={title:'Swarm flocking (boids)',weeks:[12],
desc:'Each drone follows three local rules using only nearby neighbours: keep apart (separation), match heading (alignment) and stay with the group (cohesion). Click to move the swarm goal.',
mount(stage,side){
  const {cv,ctx,W,H,pos}=makeCanvas(stage);const c=controls(side);
  const Nn=slider(c,'Drones',5,150,1,60),sw=slider(c,'Separation',0,4,0.1,1.6,f1),aw=slider(c,'Alignment',0,4,0.1,1,f1),cw=slider(c,'Cohesion',0,4,0.1,1,f1);
  const gl=check(c,'Steer toward goal',true);const ro=readout(c);
  let B=[],G={x:W*0.7,y:H*0.5};
  cv.addEventListener('pointerdown',e=>{G=pos(e);});
  return loop(dt=>{
    while(B.length<Nn.v)B.push({x:Math.random()*W,y:Math.random()*H,vx:randn()*40,vy:randn()*40});if(B.length>Nn.v)B.length=Nn.v;
    let nnSum=0;
    const acc=B.map(b=>{let n=0,px=0,py=0,vx=0,vy=0,sx=0,sy=0,nn=1e9;
      for(const o of B){if(o===b)continue;const dx=b.x-o.x,dy=b.y-o.y,d=Math.hypot(dx,dy);if(d<nn)nn=d;if(d<60){n++;px+=o.x;py+=o.y;vx+=o.vx;vy+=o.vy;if(d<24&&d>0){sx+=dx/d*(24-d)*4;sy+=dy/d*(24-d)*4;}}}
      nnSum+=nn<1e9?nn:0;let ax=sw.v*sx,ay=sw.v*sy;
      if(n){ax+=cw.v*(px/n-b.x)*0.8+aw.v*(vx/n-b.vx)*1.0;ay+=cw.v*(py/n-b.y)*0.8+aw.v*(vy/n-b.vy)*1.0;}
      if(gl.v){const dx=G.x-b.x,dy=G.y-b.y,d=Math.hypot(dx,dy)||1;ax+=dx/d*40;ay+=dy/d*40;}
      const mg=30;if(b.x<mg)ax+=(mg-b.x)*6;if(b.x>W-mg)ax-=(b.x-W+mg)*6;if(b.y<mg)ay+=(mg-b.y)*6;if(b.y>H-mg)ay-=(b.y-H+mg)*6;
      return[ax,ay];});
    B.forEach((b,i)=>{b.vx+=acc[i][0]*dt;b.vy+=acc[i][1]*dt;const s=Math.hypot(b.vx,b.vy)||1;const ns=clamp(s,30,120);b.vx*=ns/s;b.vy*=ns/s;b.x=clamp(b.x+b.vx*dt,2,W-2);b.y=clamp(b.y+b.vy*dt,2,H-2);});
    const p=pal();bgGrid(ctx,W,H,40,p);
    if(gl.v){ctx.strokeStyle=p.gold;ctx.lineWidth=2;ctx.beginPath();ctx.arc(G.x,G.y,14,0,7);ctx.stroke();ctx.beginPath();ctx.arc(G.x,G.y,4,0,7);ctx.fillStyle=p.gold;ctx.fill();}
    ctx.fillStyle=p.a;B.forEach(b=>{const a=Math.atan2(b.vy,b.vx);ctx.save();ctx.translate(b.x,b.y);ctx.rotate(a);ctx.beginPath();ctx.moveTo(8,0);ctx.lineTo(-6,-5);ctx.lineTo(-3,0);ctx.lineTo(-6,5);ctx.closePath();ctx.fill();ctx.restore();});
    ro.textContent=`Drones: ${B.length}\nMean nearest-neighbour distance: ${(nnSum/Math.max(1,B.length)).toFixed(1)} px`;
  });
}};

SIMS.ros={title:'ROS 2 computation graph',weeks:[13],
desc:'Nodes publish messages on topics and other nodes subscribe to them. Click a node to stop or start it and see which parts of the system go quiet.',
mount(stage,side){
  const {cv,ctx,W,H,pos}=makeCanvas(stage,640,360);const c=controls(side);
  const rate=slider(c,'Playback speed',0.2,2,0.1,1,f1);
  const N={cam:{n:'/camera_driver',x:100,y:70,req:[]},lid:{n:'/lidar_driver',x:100,y:200,req:[]},det:{n:'/object_detector',x:320,y:70,req:['cam']},slam:{n:'/slam_toolbox',x:320,y:200,req:['lid']},plan:{n:'/planner',x:535,y:135,req:['slam']},mot:{n:'/motor_controller',x:535,y:305,req:['plan']}};
  Object.values(N).forEach(n=>{n.alive=true;n.prod=true;});
  let ox=0,oy=0;
  const E=[{a:'cam',b:'det',t:'/image_raw',hz:12,m:()=>'sensor_msgs/Image 640x480 rgb8'},
    {a:'lid',b:'slam',t:'/scan',hz:8,m:()=>`sensor_msgs/LaserScan ranges[360] min=${(0.3+Math.random()).toFixed(2)}`},
    {a:'det',b:'plan',t:'/detections',hz:4,m:()=>`vision_msgs/Detection2DArray person ${(0.7+Math.random()*0.29).toFixed(2)}`},
    {a:'slam',b:'plan',t:'/map',hz:1,m:()=>'nav_msgs/OccupancyGrid 384x384 res=0.05'},
    {a:'plan',b:'mot',t:'/cmd_vel',hz:8,m:()=>`geometry_msgs/Twist linear.x=${(0.2+Math.random()*0.1).toFixed(2)} angular.z=${(Math.random()*0.6-0.3).toFixed(2)}`},
    {a:'mot',b:'slam',t:'/odom',hz:10,m:()=>{ox+=0.01;oy+=0.004;return `nav_msgs/Odometry x=${ox.toFixed(2)} y=${oy.toFixed(2)}`;}}];
  E.forEach(e=>e.acc=Math.random());
  const msgs=[],log=[];
  const logEl=el('div',{class:'readout log'});const ro=readout(c);c.append(el('span',{class:'sl-h'},tx('Latest delivered messages')),logEl);
  const BW=75,BH=20;
  const edgePts=e=>{const A=N[e.a],B=N[e.b];const dx=B.x-A.x,dy=B.y-A.y;const tE=Math.min(BW/Math.abs(dx||1e-9),BH/Math.abs(dy||1e-9));return[A.x+dx*tE,A.y+dy*tE,B.x-dx*tE,B.y-dy*tE];};
  cv.addEventListener('pointerdown',e=>{const q=pos(e);for(const k in N){const n=N[k];if(Math.abs(q.x-n.x)<BW&&Math.abs(q.y-n.y)<BH)n.alive=!n.alive;}});
  return loop(dt=>{
    for(let it=0;it<3;it++)for(const k in N){const n=N[k];n.prod=n.alive&&n.req.every(r=>N[r].prod);}
    E.forEach(e=>{e.acc+=dt*rate.v*e.hz;while(e.acc>=1){e.acc-=1;if(N[e.a].prod)msgs.push({e,p:0,txt:e.m()});}});
    for(let i=msgs.length-1;i>=0;i--){const q=msgs[i];q.p+=dt*rate.v*1.3;if(q.p>=1){msgs.splice(i,1);if(N[q.e.b].alive){log.push(`${q.e.t}: ${q.txt}`);if(log.length>7)log.shift();}}}
    const p=pal();bgGrid(ctx,W,H,40,p);
    E.forEach(e=>{const[x1,y1,x2,y2]=edgePts(e);const live=N[e.a].prod;ctx.strokeStyle=live?p.mute:p.line;ctx.lineWidth=live?1.8:1.2;ctx.setLineDash(live?[]:[4,4]);ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.setLineDash([]);
      const a=Math.atan2(y2-y1,x2-x1);ctx.fillStyle=live?p.mute:p.line;ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-9*Math.cos(a-0.4),y2-9*Math.sin(a-0.4));ctx.lineTo(x2-9*Math.cos(a+0.4),y2-9*Math.sin(a+0.4));ctx.fill();
      const mx=(x1+x2)/2,my=(y1+y2)/2;ctx.font=`600 11.5px ${FONT}`;const tw=ctx.measureText(e.t).width;ctx.fillStyle=p.bg;ctx.fillRect(mx-tw/2-4,my-9,tw+8,16);txt(ctx,e.t,mx,my+3,live?p.ink:p.mute,11.5,'center',600);});
    msgs.forEach(q=>{const[x1,y1,x2,y2]=edgePts(q.e);ctx.fillStyle=p.gold;ctx.beginPath();ctx.arc(x1+(x2-x1)*q.p,y1+(y2-y1)*q.p,4.5,0,7);ctx.fill();});
    for(const k in N){const n=N[k];rr(ctx,n.x-BW,n.y-BH,BW*2,BH*2,6);if(n.alive&&n.prod){ctx.fillStyle=p.a;ctx.fill();txt(ctx,n.n,n.x,n.y+4,p.bg,13,'center',600);}else{ctx.fillStyle=p.bg;ctx.fill();ctx.strokeStyle=n.alive?p.gold:p.mute;ctx.lineWidth=2;ctx.setLineDash(n.alive?[]:[5,4]);ctx.stroke();ctx.setLineDash([]);txt(ctx,n.n,n.x,n.y+4,n.alive?p.ink:p.mute,13,'center',600);}}
    txt(ctx,'Filled: running. Gold outline: running but waiting for input. Dashed: stopped.',12,H-10,p.mute,11.5);
    logEl.textContent=log.join('\n');
    ro.textContent='$ ros2 node list\n'+Object.values(N).filter(n=>n.alive).map(n=>n.n).join('\n');
  });
}};


export const SIM_IDS = Object.keys(SIMS)

/** `stage`'e tuvali, `side`'a denetimleri kurar; dönen fonksiyon animasyonu durdurur. */
export function mountSim(id, stage, side, cfg = {}, lang = 'en') {
  const s = SIMS[id]
  if (!s) return () => {}
  LANG = lang
  PAL = null
  PAL_EL = stage
  return s.mount(stage, side, cfg)
}
