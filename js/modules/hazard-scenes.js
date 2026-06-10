// js/modules/hazard-scenes.js — Canvas driving scene renderer
const HazardScenes = (() => {
  let ctx, CW, CH;

  function init(canvas, w, h) {
    ctx = canvas.getContext('2d');
    CW = w; CH = h;
  }

  // ---- Perspective projection ----
  const HY = () => CH * 0.46;
  function rp(rx, ry) {
    const spread = 0.42 + ry * 0.58;
    return { x: CW*0.5 + rx*CW*0.5*spread, y: HY() + ry*(CH-HY()), s: 0.18 + ry*0.82 };
  }

  // ---- Primitives ----
  function skyGrad(top, bot) {
    const g = ctx.createLinearGradient(0,0,0,HY());
    g.addColorStop(0,top); g.addColorStop(1,bot);
    ctx.fillStyle = g; ctx.fillRect(0,0,CW,HY());
  }
  function grass(col) { ctx.fillStyle=col||'#4a7a3a'; ctx.fillRect(0,HY(),CW,CH-HY()); }
  function roadTrap(w, col) {
    ctx.fillStyle=col||'#3d3d3d';
    ctx.beginPath();
    ctx.moveTo(CW*(0.5-w*0.5),HY()); ctx.lineTo(CW*(0.5+w*0.5),HY());
    ctx.lineTo(CW*(0.5+w*0.5+0.25),CH); ctx.lineTo(CW*(0.5-w*0.5-0.25),CH);
    ctx.closePath(); ctx.fill();
  }
  function edgeLine(rx) {
    const p0=rp(rx,0), p1=rp(rx,1);
    ctx.strokeStyle='rgba(255,255,255,0.8)'; ctx.lineWidth=2; ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(p0.x,p0.y); ctx.lineTo(p1.x,p1.y); ctx.stroke();
  }
  function dashLine(t, rx, speed, col) {
    ctx.strokeStyle=col||'#f0e040'; ctx.lineWidth=2;
    for (let i=0; i<18; i++) {
      const r0=((i/18+t*speed)%1), r1=((i/18+t*speed+0.028)%1);
      if (r0>r1) continue;
      const p0=rp(rx,r0), p1=rp(rx,r1);
      ctx.beginPath(); ctx.moveTo(p0.x,p0.y); ctx.lineTo(p1.x,p1.y); ctx.stroke();
    }
  }
  function clouds(t) {
    ctx.fillStyle='rgba(255,255,255,0.82)';
    [[0.14,0.08,0.16,0.3],[0.54,0.05,0.19,0.2],[0.82,0.1,0.13,0.25]].forEach(([cx,cy,cw,sp])=>{
      const x=((cx+t*sp*0.04)%1.1-0.05)*CW, y=cy*CH;
      ctx.beginPath(); ctx.ellipse(x,y,cw*CW*0.5,CH*0.03,0,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(x-cw*CW*0.14,y+CH*0.01,cw*CW*0.27,CH*0.02,0,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(x+cw*CW*0.16,y+CH*0.011,cw*CW*0.24,CH*0.018,0,0,Math.PI*2); ctx.fill();
    });
  }
  function buildings() {
    const hy=HY(), cols=['#7a6a5a','#6a7a8a','#8a7a6a','#5a6a78','#7a8a7a'];
    for (let s=0;s<2;s++) for (let i=0;i<5;i++) {
      const bx=s===0?(i*CW*0.07):(CW*0.6+i*CW*0.08);
      const bh=35+(i*41)%55, bw=24+(i*11)%18;
      ctx.fillStyle=cols[(i+s*2)%5]; ctx.fillRect(bx,hy-bh,bw,bh+4);
      ctx.fillStyle='rgba(255,240,160,0.55)';
      for(let r=0;r<3;r++) for(let c=0;c<2;c++) ctx.fillRect(bx+3+c*10,hy-bh+7+r*13,6,7);
    }
  }
  function trees(t, positions) {
    (positions||[[0.04],[0.09],[0.86],[0.92]]).forEach(([rx],i)=>{
      const x=rx*CW+Math.sin(t*1.5+i)*2, hy=HY();
      ctx.fillStyle='#1a4a0a'; ctx.beginPath(); ctx.arc(x,hy-22,16,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#2a6a1a'; ctx.beginPath(); ctx.arc(x-5,hy-18,10,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#7a5010'; ctx.fillRect(x-3,hy-8,6,20);
    });
  }
  function hedges() {
    const hy=HY();
    ctx.fillStyle='#2a5a10'; ctx.fillRect(0,hy,CW*0.28,CH-hy); ctx.fillRect(CW*0.72,hy,CW*0.28,CH-hy);
    ctx.fillStyle='#1a4a08'; ctx.fillRect(0,hy,CW*0.28,10); ctx.fillRect(CW*0.72,hy,CW*0.28,10);
  }
  function shade(hex, a) {
    let r=parseInt(hex.slice(1,3),16)+a, g=parseInt(hex.slice(3,5),16)+a, b=parseInt(hex.slice(5,7),16)+a;
    return `rgb(${Math.min(255,Math.max(0,r))},${Math.min(255,Math.max(0,g))},${Math.min(255,Math.max(0,b))})`;
  }

  // ---- Vehicles ----
  function car(rx, ry, col, wm, hm) {
    const p=rp(rx,ry), w=CW*0.09*(wm||1)*p.s, h=CH*0.14*(hm||1)*p.s;
    ctx.fillStyle='rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.ellipse(p.x,p.y+h*0.07,w*0.48,h*0.09,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=col; ctx.beginPath(); ctx.roundRect(p.x-w/2,p.y-h,w,h,[3*p.s,3*p.s,2*p.s,2*p.s]); ctx.fill();
    ctx.fillStyle=shade(col,-25); ctx.beginPath(); ctx.roundRect(p.x-w*0.33,p.y-h*0.97,w*0.66,h*0.44,2*p.s); ctx.fill();
    ctx.fillStyle='rgba(160,210,235,0.75)'; ctx.beginPath(); ctx.roundRect(p.x-w*0.28,p.y-h*0.9,w*0.56,h*0.34,p.s); ctx.fill();
    ctx.fillStyle='#111';
    [[-0.4,-0.12],[0.4,-0.12],[-0.4,-0.72],[0.4,-0.72]].forEach(([ox,oy])=>{
      ctx.beginPath(); ctx.ellipse(p.x+ox*w,p.y+oy*h,w*0.11,h*0.09,0,0,Math.PI*2); ctx.fill();
    });
    ctx.fillStyle='#fff';
    [[-0.32],[0.32]].forEach(([ox])=>{ ctx.beginPath(); ctx.arc(p.x+ox*w,p.y-h*0.06,w*0.07,0,Math.PI*2); ctx.fill(); });
    return p;
  }
  function lorry(rx, ry, col) {
    const p=rp(rx,ry), w=CW*0.13*p.s, h=CH*0.22*p.s;
    ctx.fillStyle=col||'#c0392b'; ctx.beginPath(); ctx.roundRect(p.x-w/2,p.y-h,w,h,2); ctx.fill();
    ctx.fillStyle=shade(col||'#c0392b',15); ctx.fillRect(p.x-w*0.47,p.y-h*0.32,w*0.94,h*0.3);
    ctx.fillStyle='rgba(160,210,235,0.6)'; ctx.fillRect(p.x-w*0.28,p.y-h*0.88,w*0.56,h*0.18);
  }
  function cyclist(rx, ry) {
    const p=rp(rx,ry), sz=CW*0.022*p.s;
    ctx.strokeStyle='#555'; ctx.lineWidth=1.5*p.s;
    ctx.beginPath(); ctx.arc(p.x-sz*0.7,p.y,sz*0.55,0,Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.arc(p.x+sz*0.7,p.y,sz*0.55,0,Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(p.x-sz*0.7,p.y); ctx.lineTo(p.x,p.y-sz*0.6); ctx.lineTo(p.x+sz*0.7,p.y); ctx.stroke();
    ctx.fillStyle='#e67e22'; ctx.beginPath(); ctx.arc(p.x,p.y-sz*1.2,sz*0.4,0,Math.PI*2); ctx.fill();
  }
  function pedestrian(x, y, col, sc) {
    const s=sc||1; ctx.fillStyle=col||'#e74c3c';
    ctx.beginPath(); ctx.arc(x,y-24*s,7*s,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle=col||'#e74c3c'; ctx.lineWidth=3*s;
    ctx.beginPath();
    ctx.moveTo(x,y-17*s); ctx.lineTo(x,y+2*s);
    ctx.moveTo(x,y+2*s); ctx.lineTo(x-9*s,y+20*s); ctx.moveTo(x,y+2*s); ctx.lineTo(x+9*s,y+20*s);
    ctx.moveTo(x,y-10*s); ctx.lineTo(x-11*s,y-2*s); ctx.moveTo(x,y-10*s); ctx.lineTo(x+11*s,y-2*s);
    ctx.stroke();
  }

  // ---- Scenes ----
  function drawUrban(t, clip) {
    skyGrad('#6a9ab8','#c0d8e8'); clouds(t); buildings();
    roadTrap(0.46); edgeLine(-0.46); edgeLine(0.46);
    dashLine(t,0,0.55,'#f0f0f0');
    ctx.fillStyle='#aaa'; ctx.fillRect(0,HY(),CW*0.14,CH-HY()); ctx.fillRect(CW*0.86,HY(),CW*0.14,CH-HY());
    car(-1.25,0.28,'#1a5276',1,0.9); car(-1.35,0.52,'#6c3483',1,0.9); car(-1.3,0.76,'#117a65',1,0.9);
    car(1.25,0.32,'#922b21',1,0.9); car(1.32,0.62,'#7d6608',1,0.9);
    car(0.0,Math.max(0.08,0.7-t*0.55),'#2980b9');
    // Hazards
    if (clip.hazard==='ped_stepout' && t>=clip.hazardStart-0.1) {
      const ph=Math.max(0,(t-(clip.hazardStart-0.08))/0.22);
      const ry=0.82-ph*0.05, p=rp(-1.22,ry);
      pedestrian(p.x+ph*CW*0.12, p.y, '#e74c3c', 0.85+ry*0.2);
    }
    if (clip.hazard==='cyclist_swerve') {
      const sw=t>=clip.hazardStart?Math.min(1,(t-clip.hazardStart)/0.15):0;
      cyclist(0.55-sw*0.65,0.55+sw*0.08);
    }
    if (clip.hazard==='child_run' && t>=clip.hazardStart-0.06) {
      const ph=Math.max(0,(t-(clip.hazardStart-0.04))/0.2);
      const p=rp(1.18,0.78); pedestrian(p.x-ph*CW*0.2,p.y,'#e67e22',0.72);
    }
    if (clip.hazard==='bus_pullout') {
      lorry(0.8,Math.max(0.15,0.85-t*0.55),'#f39c12');
      if (t>=clip.hazardStart) {
        const ph=Math.min(1,(t-clip.hazardStart)/0.18), p=rp(0.75,0.72);
        pedestrian(p.x+ph*CW*0.05,p.y,'#c0392b',0.9);
      }
    }
    if (clip.hazard==='car_reverse') {
      const rv=t>=clip.hazardStart?Math.min(1,(t-clip.hazardStart)/0.2):0;
      car(1.1,0.38+rv*0.28,'#8e44ad',1,0.9);
    }
  }

  function drawRural(t, clip) {
    skyGrad('#7ab0cc','#cce0ee'); clouds(t); grass('#4a7a2a'); trees(t);
    roadTrap(0.3); edgeLine(-0.3); edgeLine(0.3); dashLine(t,0,0.55,'#f0e040');
    car(0.0,Math.max(0.08,0.6-t*0.45),'#3498db');
    if (clip.hazard==='car_junction') {
      ctx.fillStyle='#3d3d3d';
      const jy=HY()+0.5*(CH-HY());
      ctx.beginPath(); ctx.moveTo(CW*0.72,jy); ctx.lineTo(CW,jy); ctx.lineTo(CW,jy+CH*0.12); ctx.lineTo(CW*0.72,jy+CH*0.12); ctx.fill();
      if (t>=clip.hazardStart) { const ph=Math.min(1,(t-clip.hazardStart)/0.22); car(0.95-ph*0.6,0.52,'#e74c3c'); }
    }
    if (clip.hazard==='tractor') {
      const ry=Math.max(0.1,0.72-t*0.18), p=rp(0.1,ry), w=CW*0.1*p.s, h=CH*0.18*p.s;
      ctx.fillStyle='#27ae60'; ctx.beginPath(); ctx.roundRect(p.x-w/2,p.y-h,w,h,3); ctx.fill();
      ctx.fillStyle='#d4ac0d';
      ctx.beginPath(); ctx.arc(p.x-w*0.35,p.y,w*0.3,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(p.x+w*0.3,p.y,w*0.2,0,Math.PI*2); ctx.fill();
    }
  }

  function drawDual(t, clip) {
    skyGrad('#8ab5cc','#c8dde8'); clouds(t); grass();
    ctx.fillStyle='#3d3d3d';
    ctx.beginPath(); ctx.moveTo(CW*0.08,HY()); ctx.lineTo(CW*0.92,HY()); ctx.lineTo(CW,CH); ctx.lineTo(0,CH); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#4a7a2a';
    ctx.beginPath(); ctx.moveTo(CW*0.47,HY()); ctx.lineTo(CW*0.53,HY()); ctx.lineTo(CW*0.555,CH); ctx.lineTo(CW*0.445,CH); ctx.closePath(); ctx.fill();
    dashLine(t,-0.5,0.55,'#f0f0f0'); dashLine(t,0.5,0.55,'#f0f0f0');
    car(-0.5,Math.max(0.08,0.62-t*0.48),'#16a085'); car(-0.9,0.72,'#1a5276');
    if (clip.hazard==='car_merge') {
      const ph=t>=clip.hazardStart?Math.min(1,(t-clip.hazardStart)/0.22):0;
      car(0.85-ph*0.72,0.62,'#e74c3c');
    }
    if (clip.hazard==='brake_queue') {
      const br=t>=clip.hazardStart?Math.min(1,(t-clip.hazardStart)/0.15):0;
      car(-0.15,0.18+br*0.04,'#c0392b'); car(-0.55,0.3+br*0.03,'#e67e22');
      if (br>0.2) {
        const p1=rp(-0.15,0.18);
        ctx.fillStyle=`rgba(255,40,0,${br*0.85})`;
        ctx.beginPath(); ctx.arc(p1.x-10*p1.s,p1.y-3*p1.s,5*p1.s,0,Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(p1.x+10*p1.s,p1.y-3*p1.s,5*p1.s,0,Math.PI*2); ctx.fill();
      }
    }
  }

  function drawMotorway(t, clip) {
    skyGrad('#88aacc','#bbd5e8'); clouds(t); grass('#3d6a2a');
    ctx.fillStyle='#444';
    ctx.beginPath(); ctx.moveTo(CW*0.04,HY()); ctx.lineTo(CW*0.96,HY()); ctx.lineTo(CW,CH); ctx.lineTo(0,CH); ctx.closePath(); ctx.fill();
    dashLine(t,-0.65,0.55,'#f0f0f0'); dashLine(t,0,0.55,'#f0f0f0'); dashLine(t,0.65,0.55,'#f0f0f0');
    edgeLine(-0.96); edgeLine(0.96);
    const gy=HY()+18;
    ctx.strokeStyle='#888'; ctx.lineWidth=5; ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(CW*0.1,gy); ctx.lineTo(CW*0.9,gy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(CW*0.2,HY()); ctx.lineTo(CW*0.2,gy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(CW*0.8,HY()); ctx.lineTo(CW*0.8,gy); ctx.stroke();
    ctx.fillStyle='#ff8c00'; ctx.fillRect(CW*0.44,gy-12,26,20);
    ctx.fillStyle='#fff'; ctx.font=`bold ${Math.round(CW*0.016)}px Arial`; ctx.textAlign='center';
    ctx.fillText('70',CW*0.453,gy+3);
    car(-0.65,0.55,'#16a085'); car(-0.22,Math.max(0.08,0.65-t*0.48),'#2980b9');
    if (clip.hazard==='lorry_lane') {
      const ph=t>=clip.hazardStart?Math.min(1,(t-clip.hazardStart)/0.24):0;
      lorry(0.6-ph*0.75,0.68,'#c0392b');
    }
  }

  function drawCountry(t, clip) {
    skyGrad('#7ab0cc','#cce0ee'); clouds(t); grass('#3a6020'); hedges(); trees(t,[[0.01],[0.06],[0.93],[0.98]]);
    roadTrap(0.25); edgeLine(-0.25); edgeLine(0.25); dashLine(t,0,0.5,'#f0e040');
    car(0.0,Math.max(0.08,0.55-t*0.42),'#3498db');
    if (clip.hazard==='oncoming') {
      const ph=t>=clip.hazardStart?Math.min(1,(t-clip.hazardStart)/0.2):0;
      car(-0.04-ph*0.18,0.28-ph*0.12,'#e74c3c');
      if (ph>0.1) {
        const p=rp(-0.04-ph*0.18,0.28-ph*0.12);
        ctx.fillStyle=`rgba(255,255,180,${ph*0.35})`; ctx.beginPath(); ctx.arc(p.x,p.y-8*p.s,28*p.s,0,Math.PI*2); ctx.fill();
      }
    }
  }

  function drawRoundabout(t, clip) {
    skyGrad('#8ab5c8','#c8dce8'); clouds(t); grass();
    roadTrap(0.36); dashLine(t,0,0.5,'#f0f0f0');
    const rcx=CW*0.5, rcy=HY()+0.07*(CH-HY()), rcr=CW*0.14;
    ctx.strokeStyle='#3d3d3d'; ctx.lineWidth=CW*0.055; ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(rcx,rcy,rcr,0,Math.PI*2); ctx.stroke();
    ctx.fillStyle='#4a7a2a'; ctx.beginPath(); ctx.arc(rcx,rcy,rcr*0.55,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='#fff'; ctx.lineWidth=3; ctx.setLineDash([8,6]);
    for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(CW*0.36+i*CW*0.07,CH-25);ctx.lineTo(CW*0.36+i*CW*0.07+4,CH-5);ctx.stroke();}
    ctx.setLineDash([]);
    car(0.0,Math.max(0.35,0.85-t*0.45),'#2980b9');
    if (clip.hazard==='fast_car') {
      const ph=t>=clip.hazardStart?Math.min(1,(t-clip.hazardStart)/0.2):0;
      const ang=-0.6+ph*0.7, cr=rcr*0.88;
      const cx=rcx+Math.cos(ang)*cr, cy=rcy+Math.sin(ang)*cr*0.5;
      ctx.fillStyle='#e74c3c'; ctx.beginPath(); ctx.arc(cx,cy,9+ph*4,0,Math.PI*2); ctx.fill();
    }
  }

  function drawRoadworks(t, clip) {
    skyGrad('#8ab5cc','#c8dde8'); clouds(t); grass();
    roadTrap(0.42); dashLine(t,-0.15,0.55,'#f0f0f0');
    [[0.22,0.32],[0.18,0.45],[0.14,0.58],[0.10,0.70],[0.06,0.82]].forEach(([rx,ry])=>{
      const p=rp(rx,ry), cw=8*p.s, ch=16*p.s;
      ctx.fillStyle='#e67e22'; ctx.beginPath(); ctx.moveTo(p.x,p.y-ch); ctx.lineTo(p.x-cw,p.y); ctx.lineTo(p.x+cw,p.y); ctx.closePath(); ctx.fill();
      ctx.strokeStyle='#fff'; ctx.lineWidth=1.5*p.s;
      ctx.beginPath(); ctx.moveTo(p.x-cw*0.7,p.y-ch*0.4); ctx.lineTo(p.x+cw*0.7,p.y-ch*0.4); ctx.stroke();
    });
    ctx.fillStyle='#ff6600'; ctx.fillRect(CW*0.56,HY()+12,55,36);
    ctx.fillStyle='#fff'; ctx.font=`${Math.round(CW*0.013)}px Arial`; ctx.textAlign='center';
    ctx.fillText('ROAD',CW*0.588,HY()+26); ctx.fillText('NARROWS',CW*0.588,HY()+38);
    car(0.65,0.65,'#3498db');
    if (clip.hazard==='narrow') {
      const ph=t>=clip.hazardStart?Math.min(1,(t-clip.hazardStart)/0.2):0;
      car(0.5-ph*0.45,0.5+ph*0.1,'#e74c3c');
    }
  }

  function drawNight(t, clip) {
    skyGrad('#040810','#0c1825'); grass('#111'); roadTrap(0.44,'#222');
    ctx.fillStyle='rgba(255,255,200,0.12)';
    ctx.beginPath(); ctx.moveTo(CW*0.42,CH); ctx.lineTo(CW*0.24,HY()); ctx.lineTo(CW*0.76,HY()); ctx.lineTo(CW*0.58,CH); ctx.closePath(); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.7)';
    [[0.1,0.04],[0.28,0.07],[0.5,0.02],[0.68,0.06],[0.88,0.03]].forEach(([rx,ry])=>ctx.fillRect(rx*CW,ry*CH,2,2));
    [[0.12,0.35],[0.88,0.42]].forEach(([rx,ry])=>{
      const p=rp(rx>0.5?1.4:-1.4,ry);
      ctx.fillStyle='rgba(255,200,80,0.2)'; ctx.beginPath(); ctx.arc(p.x,p.y-15,22,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#f5c518'; ctx.beginPath(); ctx.arc(p.x,p.y-15,4,0,Math.PI*2); ctx.fill();
    });
    dashLine(t,0,0.55,'rgba(220,200,50,0.45)');
    if (clip.hazard==='ped_dark' && t>=clip.hazardStart-0.05) {
      const ph=Math.max(0,(t-(clip.hazardStart-0.03))/0.22);
      const p=rp(-0.2+ph*0.3,0.76);
      pedestrian(p.x,p.y,`rgba(35,35,35,${0.3+ph*0.6})`,0.9+ph*0.1);
    }
  }

  function draw(clip, t) {
    if (!ctx) return;
    ctx.clearRect(0,0,CW,CH);
    switch(clip.scene) {
      case 'urban':      drawUrban(t,clip); break;
      case 'rural':      drawRural(t,clip); break;
      case 'dual':       drawDual(t,clip); break;
      case 'motorway':   drawMotorway(t,clip); break;
      case 'country':    drawCountry(t,clip); break;
      case 'roundabout': drawRoundabout(t,clip); break;
      case 'roadworks':  drawRoadworks(t,clip); break;
      case 'night':      drawNight(t,clip); break;
      default:           drawUrban(t,clip);
    }
  }

  return { init, draw };
})();
