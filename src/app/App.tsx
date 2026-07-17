import { useState, useEffect, useRef, useCallback, useId } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus, Pencil, X, Sun, Moon, TrendingDown, TrendingUp, Wallet,
  Eye, EyeOff, Search, Settings, RotateCcw, Check,
  BarChart2, TrendingUp as LineIcon, PieChart,
} from "lucide-react";

/* ─── Types ─────────────────────────────────────────────────────────────────── */
type Cat = "food"|"transport"|"housing"|"health"|"entertainment"|"shopping"|"income";
type Tab = "overview"|"transactions"|"budget";
type ChartType = "bar"|"line"|"donut";
type DateRange = "7d"|"month"|"all";

interface Expense { id:number; description:string; amount:number; category:Cat; date:string; type:"expense"|"income" }
interface DayBar  { date:string; label:string; expenses:number; income:number }

interface CColors {
  income?:string; expenses?:string;
  food?:string; transport?:string; housing?:string;
  health?:string; entertainment?:string; shopping?:string;
}

/* ─── Constants ─────────────────────────────────────────────────────────────── */
const CATS = [
  { key:"food" as Cat,          label:"Food & Dining",  lc:"#dc2626", dc:"#ff4d4d" },
  { key:"transport" as Cat,     label:"Transport",       lc:"#d97706", dc:"#ffaa33" },
  { key:"housing" as Cat,       label:"Housing",         lc:"#2563eb", dc:"#5b9aff" },
  { key:"health" as Cat,        label:"Health",          lc:"#059669", dc:"#00e090" },
  { key:"entertainment" as Cat, label:"Entertainment",   lc:"#7c3aed", dc:"#bb66ff" },
  { key:"shopping" as Cat,      label:"Shopping",        lc:"#c2410c", dc:"#ff7755" },
  { key:"income" as Cat,        label:"Income",          lc:"#16a34a", dc:"#00ff88" },
] as const;

const TODAY = "2026-07-10";
const LAST7 = Array.from({length:7},(_,i)=>{
  const d=new Date(TODAY); d.setDate(d.getDate()-6+i);
  return {date:d.toISOString().split("T")[0], label:d.toLocaleDateString("en-US",{weekday:"short"}).slice(0,3)};
});

const SEED: Expense[] = [
  {id:1,  description:"Whole Foods grocery run",  amount:87.42,  category:"food",          date:"2026-07-10",type:"expense"},
  {id:2,  description:"Metro monthly pass",        amount:132.00, category:"transport",     date:"2026-07-09",type:"expense"},
  {id:3,  description:"Rent — July",               amount:1450.0, category:"housing",       date:"2026-07-04",type:"expense"},
  {id:4,  description:"Salary — July 1st",         amount:4800.0, category:"income",        date:"2026-07-04",type:"income" },
  {id:5,  description:"Netflix + Spotify",         amount:28.98,  category:"entertainment", date:"2026-07-09",type:"expense"},
  {id:6,  description:"Doctor copay",              amount:40.00,  category:"health",        date:"2026-07-05",type:"expense"},
  {id:7,  description:"Lunch — Tartine",           amount:22.50,  category:"food",          date:"2026-07-08",type:"expense"},
  {id:8,  description:"ASOS order",                amount:76.00,  category:"shopping",      date:"2026-07-07",type:"expense"},
  {id:9,  description:"Freelance invoice #14",     amount:950.00, category:"income",        date:"2026-07-06",type:"income" },
  {id:10, description:"Uber — airport",            amount:44.20,  category:"transport",     date:"2026-07-04",type:"expense"},
  {id:11, description:"Trader Joe's",              amount:63.18,  category:"food",          date:"2026-07-06",type:"expense"},
  {id:12, description:"Cinema tickets",            amount:31.50,  category:"entertainment", date:"2026-07-09",type:"expense"},
];

/* ─── Color system ──────────────────────────────────────────────────────────── */
const THEME_PRESETS: Record<string, CColors> = {
  neon:   {income:"#00ff88",expenses:"#ff3d3d",food:"#ff4d4d",transport:"#ffaa33",housing:"#5b9aff",health:"#00e090",entertainment:"#bb66ff",shopping:"#ff7755"},
  pastel: {income:"#86efac",expenses:"#fca5a5",food:"#fca5a5",transport:"#fcd34d",housing:"#93c5fd",health:"#6ee7b7",entertainment:"#d8b4fe",shopping:"#fdba74"},
  mono:   {income:"#a1a1aa",expenses:"#52525b",food:"#71717a",transport:"#52525b",housing:"#3f3f46",health:"#a1a1aa",entertainment:"#71717a",shopping:"#52525b"},
};

const COLOR_SWATCHES = ["#ff4d4d","#ff8800","#ffd700","#00ff88","#00aaff","#aa44ff","#ff44aa","#888888","#ffffff","#22c55e"];

const getExpCol = (c:CColors,dark:boolean) => c.expenses ?? (dark?"#ff3d3d":"#dc2626");
const getIncCol = (c:CColors,dark:boolean) => c.income   ?? (dark?"#00ff88":"#16a34a");
const getCatCol = (key:string,c:CColors,dark:boolean): string => {
  const v = c[key as keyof CColors];
  if (v) return v;
  const cat = CATS.find(x=>x.key===key);
  return cat ? (dark ? cat.dc : cat.lc) : "#888888";
};

/* ─── Theme ─────────────────────────────────────────────────────────────────── */
interface Theme {
  bg:string; surface:string; card:string; border:string; fg:string; muted:string;
  shadow:string; shadowHov:string; ind:string; track:string; inp:string; inpBorder:string;
  spot:string; modalBg:string; rowHov:string; skel:string; exp:string; inc:string;
  fBg:string; fBdr:string; grad:string; drawerBg:string;
}
const TH: Record<"light"|"dark", Theme> = {
  light: {
    bg:"#f8f8f8", surface:"#ffffff",
    card:"rgba(255,255,255,0.88)", border:"rgba(0,0,0,0.07)",
    fg:"#0a0a0a", muted:"#71717a",
    shadow:"0 1px 2px rgba(0,0,0,0.05),0 4px 16px rgba(0,0,0,0.06),0 16px 40px rgba(0,0,0,0.04)",
    shadowHov:"0 2px 6px rgba(0,0,0,0.07),0 10px 30px rgba(0,0,0,0.1),0 28px 56px rgba(0,0,0,0.06)",
    ind:"#0a0a0a", track:"#ebebeb",
    inp:"#f2f2f2", inpBorder:"rgba(0,0,0,0.12)",
    spot:"rgba(255,255,255,0.65)", modalBg:"rgba(255,255,255,0.96)",
    rowHov:"rgba(0,0,0,0.025)", skel:"rgba(0,0,0,0.07)",
    exp:"#dc2626", inc:"#16a34a",
    fBg:"rgba(22,163,74,0.04)", fBdr:"rgba(22,163,74,0.14)",
    grad:"linear-gradient(135deg,rgba(255,255,255,0) 0%,rgba(255,255,255,0.6) 50%,rgba(255,255,255,0) 100%)",
    drawerBg:"rgba(250,250,250,0.97)",
  },
  dark: {
    bg:"#080808", surface:"#0e0e0e",
    card:"rgba(255,255,255,0.028)", border:"rgba(255,255,255,0.07)",
    fg:"#f0f0f0", muted:"#52525b",
    shadow:"0 1px 2px rgba(0,0,0,0.4),0 4px 20px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.04)",
    shadowHov:"0 2px 8px rgba(0,0,0,0.5),0 14px 40px rgba(0,0,0,0.65),0 0 0 1px rgba(255,255,255,0.08)",
    ind:"#00ff88", track:"rgba(255,255,255,0.06)",
    inp:"rgba(255,255,255,0.04)", inpBorder:"rgba(255,255,255,0.09)",
    spot:"rgba(255,255,255,0.045)", modalBg:"rgba(10,10,10,0.97)",
    rowHov:"rgba(255,255,255,0.028)", skel:"rgba(255,255,255,0.065)",
    exp:"#ff3d3d", inc:"#00ff88",
    fBg:"rgba(0,255,136,0.035)", fBdr:"rgba(0,255,136,0.12)",
    grad:"linear-gradient(135deg,rgba(255,255,255,0) 0%,rgba(255,255,255,0.06) 50%,rgba(255,255,255,0) 100%)",
    drawerBg:"rgba(10,10,10,0.97)",
  },
};

/* ─── Animation ─────────────────────────────────────────────────────────────── */
const EASE = [0.16,1,0.3,1] as [number,number,number,number];
const SP   = {type:"spring",stiffness:380,damping:36} as const;
const SPF  = {type:"spring",stiffness:520,damping:42} as const;
const SPS  = {type:"spring",stiffness:200,damping:28} as const;
const ITEM = {hidden:{opacity:0,y:18},show:{opacity:1,y:0,transition:SP}};
const CONT = {hidden:{},show:{transition:{staggerChildren:0.065,delayChildren:0.08}}};

/* ─── Date range helpers ────────────────────────────────────────────────────── */
function getRangeBars(range: DateRange, expenses: Expense[]): DayBar[] {
  if (range === "7d") {
    return LAST7.map(({date,label})=>({
      date, label,
      expenses: expenses.filter(e=>e.date===date&&e.type==="expense").reduce((s,e)=>s+e.amount,0),
      income:   expenses.filter(e=>e.date===date&&e.type==="income").reduce((s,e)=>s+e.amount,0),
    }));
  }
  if (range === "month") {
    // Last 4 weeks as weekly groups
    return Array.from({length:4},(_,wi)=>{
      const weekDates = Array.from({length:7},(_,di)=>{
        const d=new Date(TODAY); d.setDate(d.getDate()-(3-wi)*7-(6-di)); return d.toISOString().split("T")[0];
      });
      return {
        date: weekDates[0],
        label: `W${wi+1}`,
        expenses: expenses.filter(e=>weekDates.includes(e.date)&&e.type==="expense").reduce((s,e)=>s+e.amount,0),
        income:   expenses.filter(e=>weekDates.includes(e.date)&&e.type==="income").reduce((s,e)=>s+e.amount,0),
      };
    });
  }
  // all — deduplicated date rows
  const dates=[...new Set(expenses.map(e=>e.date))].sort();
  return dates.slice(-12).map(date=>({
    date,
    label: new Date(date).toLocaleDateString("en-US",{month:"numeric",day:"numeric"}),
    expenses: expenses.filter(e=>e.date===date&&e.type==="expense").reduce((s,e)=>s+e.amount,0),
    income:   expenses.filter(e=>e.date===date&&e.type==="income").reduce((s,e)=>s+e.amount,0),
  }));
}

function getDateFilter(range: DateRange): string[] | null {
  if (range === "7d")    return LAST7.map(d=>d.date);
  if (range === "month") {
    // 28 days = the same 4 weekly buckets getRangeBars("month") charts, so
    // the "Monthly View" chart totals match the KPI / panel totals.
    const dates: string[] = [];
    for (let i=27;i>=0;i--) {
      const d=new Date(TODAY); d.setDate(d.getDate()-i); dates.push(d.toISOString().split("T")[0]);
    }
    return dates;
  }
  return null; // all — no filter
}

/* ─── Hooks ─────────────────────────────────────────────────────────────────── */
function usePRM() {
  const [v,set]=useState(false);
  useEffect(()=>{
    const mq=window.matchMedia("(prefers-reduced-motion:reduce)");
    set(mq.matches);
    const h=()=>set(mq.matches);
    mq.addEventListener("change",h);
    return ()=>mq.removeEventListener("change",h);
  },[]);
  return v;
}

function useCountUp(target:number,dur=900) {
  const [val,setVal]=useState(0);
  const from=useRef(0);
  const raf=useRef(0);
  useEffect(()=>{
    cancelAnimationFrame(raf.current);
    const start=from.current;
    let t0:number|null=null;
    const step=(ts:number)=>{
      if(!t0)t0=ts;
      const p=Math.min((ts-t0)/dur,1), e=1-Math.pow(1-p,3);
      setVal(start+(target-start)*e);
      if(p<1)raf.current=requestAnimationFrame(step);
      else{setVal(target);from.current=target;}
    };
    raf.current=requestAnimationFrame(step);
    return ()=>cancelAnimationFrame(raf.current);
  },[target,dur]);
  return val;
}

function useElWidth(ref: React.RefObject<HTMLElement|null>) {
  const [w,set]=useState(400);
  useEffect(()=>{
    if(!ref.current)return;
    const ro=new ResizeObserver(([e])=>set(e.contentRect.width));
    ro.observe(ref.current as HTMLElement);
    return ()=>ro.disconnect();
  },[]);
  return w;
}

const fmt=(n:number)=>Math.abs(n).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2});

/* ─── Skeleton ──────────────────────────────────────────────────────────────── */
function Skel({w,h,T}:{w:number|string;h:number;T:Theme}) {
  return(
    <motion.div animate={{opacity:[0.45,0.85,0.45]}} transition={{repeat:Infinity,duration:1.8,ease:"easeInOut"}}
      style={{width:w,height:h,background:T.skel,borderRadius:3}}/>
  );
}

/* ─── Odometer ──────────────────────────────────────────────────────────────── */
function Digit({ch}:{ch:string}) {
  if(!/\d/.test(ch)) return <span>{ch}</span>;
  return(
    <span style={{display:"inline-block",overflow:"hidden",height:"1.2em",verticalAlign:"top",position:"relative",width:"0.62em"}}>
      <AnimatePresence mode="popLayout">
        <motion.span key={ch} style={{display:"block",lineHeight:"1.2"}}
          initial={{y:"90%",opacity:0}} animate={{y:"0%",opacity:1}} exit={{y:"-90%",opacity:0}}
          transition={SPF}>{ch}</motion.span>
      </AnimatePresence>
    </span>
  );
}

function Odometer({value,T,size=26}:{value:number;T:Theme;size?:number}) {
  const d=useCountUp(value);
  const s=d.toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2});
  return(
    <span style={{display:"inline-flex",alignItems:"baseline",fontSize:size,fontWeight:600,fontFamily:"Geist Mono,monospace",color:T.fg,lineHeight:1.2}}>
      <span style={{marginRight:1}}>₹</span>
      {s.split("").map((ch,i)=><Digit key={i} ch={ch}/>)}
    </span>
  );
}

/* ─── TiltCard ──────────────────────────────────────────────────────────────── */
function TiltCard({children,T,rm,style:sx,className}:{
  children:React.ReactNode;T:Theme;rm:boolean;style?:React.CSSProperties;className?:string;
}) {
  const ref=useRef<HTMLDivElement>(null);
  const [rot,setRot]=useState({rx:0,ry:0,sx:50,sy:50});
  const onMove=useCallback((e:React.MouseEvent)=>{
    if(rm||!ref.current)return;
    const r=ref.current.getBoundingClientRect();
    const cx=(e.clientX-r.left)/r.width, cy=(e.clientY-r.top)/r.height;
    setRot({rx:(cy-0.5)*-4,ry:(cx-0.5)*4,sx:cx*100,sy:cy*100});
  },[rm]);
  return(
    <motion.div ref={ref} onMouseMove={onMove} onMouseLeave={()=>setRot({rx:0,ry:0,sx:50,sy:50})}
      animate={{rotateX:rot.rx,rotateY:rot.ry}}
      whileHover={rm?undefined:{boxShadow:T.shadowHov} as never}
      transition={{type:"spring",stiffness:280,damping:28}}
      className={className}
      style={{transformStyle:"preserve-3d",background:T.card,border:`1px solid ${T.border}`,
        boxShadow:T.shadow,overflow:"hidden",position:"relative",backdropFilter:"blur(12px)",
        transition:"border-color 250ms,box-shadow 250ms,background 250ms",...sx}}>
      <div style={{position:"absolute",inset:0,pointerEvents:"none",zIndex:1,
        background:`radial-gradient(circle at ${rot.sx}% ${rot.sy}%, ${T.spot} 0%, transparent 58%)`,
        transition:"background 80ms linear"}}/>
      <div style={{position:"absolute",top:0,left:0,right:0,height:1,zIndex:2,background:T.grad,opacity:0.7}}/>
      <div style={{position:"relative",zIndex:2}}>{children}</div>
    </motion.div>
  );
}

/* ─── KPI Card ──────────────────────────────────────────────────────────────── */
function KPICard({label,value,color,icon,T,rm,loaded}:{
  label:string;value:number;color:string;icon:React.ReactNode;T:Theme;rm:boolean;loaded:boolean;
}) {
  const prev=useRef(value);
  const [pulse,setPulse]=useState(false);
  useEffect(()=>{
    if(loaded&&prev.current!==value){setPulse(true);const id=setTimeout(()=>setPulse(false),700);prev.current=value;return()=>clearTimeout(id);}
  },[value,loaded]);
  return(
    <TiltCard T={T} rm={rm} style={{flex:1,padding:"20px 24px"}}>
      <motion.div animate={pulse?{scale:[1,1.04,1]}:{}} transition={{duration:0.5,ease:EASE}}>
        <div className="flex items-center gap-1.5 mb-2" style={{color}}>
          {icon}
          <span style={{fontSize:10,fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",fontFamily:"Geist Mono,monospace"}}>{label}</span>
        </div>
        {loaded?<Odometer value={value} T={T}/>:<Skel w={128} h={28} T={T}/>}
      </motion.div>
    </TiltCard>
  );
}

/* ─── Color Picker ──────────────────────────────────────────────────────────── */
function ColorPicker({value,onChange,T}:{value:string;onChange:(v:string)=>void;T:Theme}) {
  return(
    <div className="flex items-center gap-1 flex-wrap">
      {COLOR_SWATCHES.map(c=>(
        <motion.button key={c} whileTap={{scale:0.85}}
          onClick={()=>onChange(c)}
          style={{width:16,height:16,background:c,borderRadius:3,flexShrink:0,cursor:"pointer",
            border:`2px solid ${value.toLowerCase()===c.toLowerCase()?T.fg:"transparent"}`,
            transition:"border-color 150ms",outline:"none"}}
          aria-label={`Pick color ${c}`}/>
      ))}
      <input type="color" value={value} onChange={e=>onChange(e.target.value)}
        style={{width:22,height:22,padding:2,border:`1px solid ${T.inpBorder}`,
          borderRadius:3,cursor:"pointer",background:"transparent",flexShrink:0}}
        title="Custom color"/>
    </div>
  );
}

/* ─── SVG helpers ───────────────────────────────────────────────────────────── */
function smoothPath(pts:{x:number;y:number}[]) {
  if(pts.length<2)return"";
  let d=`M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for(let i=1;i<pts.length;i++){
    const p0=pts[i-1],p1=pts[i], cpx=((p0.x+p1.x)/2).toFixed(1);
    d+=` C ${cpx} ${p0.y.toFixed(1)} ${cpx} ${p1.y.toFixed(1)} ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
  }
  return d;
}

function polarToXY(cx:number,cy:number,r:number,angleDeg:number){
  const rad=(angleDeg-90)*(Math.PI/180);
  return{x:cx+r*Math.cos(rad),y:cy+r*Math.sin(rad)};
}

function donutArc(cx:number,cy:number,outerR:number,innerR:number,startDeg:number,endDeg:number){
  const o1=polarToXY(cx,cy,outerR,startDeg),o2=polarToXY(cx,cy,outerR,endDeg);
  const i1=polarToXY(cx,cy,innerR,endDeg),  i2=polarToXY(cx,cy,innerR,startDeg);
  const large=endDeg-startDeg>180?1:0;
  if(Math.abs(endDeg-startDeg)<0.01)return"";
  return[
    `M ${o1.x.toFixed(2)} ${o1.y.toFixed(2)}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${o2.x.toFixed(2)} ${o2.y.toFixed(2)}`,
    `L ${i1.x.toFixed(2)} ${i1.y.toFixed(2)}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${i2.x.toFixed(2)} ${i2.y.toFixed(2)}`,
    "Z",
  ].join(" ");
}

/* ─── Bar Chart ─────────────────────────────────────────────────────────────── */
interface ChartProps{
  data:DayBar[];showExp:boolean;showInc:boolean;
  selDates:string[];onSelect:(d:string[])=>void;
  T:Theme;dark:boolean;loaded:boolean;rm:boolean;
  expCol:string;incCol:string;mini?:boolean;uid?:string;
}

function BarChart({data,showExp,showInc,selDates,onSelect,T,dark,loaded,rm,expCol,incCol,mini,uid}:ChartProps) {
  const autoId=useId().replace(/:/g,"");
  const pfx=uid??autoId;
  const wRef=useRef<HTMLDivElement>(null);
  const svgRef=useRef<SVGSVGElement>(null);
  const W=useElWidth(wRef as React.RefObject<HTMLElement>);
  const PL=mini?20:44, PR=8, PB=mini?18:26, PT=8;
  const CW=Math.max(W-PL-PR,40);
  const CH=mini?70:148;
  const SVG_H=CH+PT+PB;
  const max=Math.max(...data.flatMap(d=>[showExp?d.expenses:0,showInc?d.income:0]),50);
  const [hov,setHov]=useState<number|null>(null);
  const [mx,setMx]=useState(0); const [my,setMy]=useState(0);
  const drag=useRef(false); const anch=useRef<number|null>(null);
  const [dragR,setDragR]=useState<[number,number]|null>(null);
  const grpW=CW/data.length;
  const bW=Math.min((grpW-6)/2,mini?8:20);
  const bH=(v:number)=>Math.max((v/max)*CH,v>0?3:0);
  const bY=(v:number)=>CH-bH(v)+PT;
  const idxAt=(sx:number)=>Math.max(0,Math.min(data.length-1,Math.floor((sx-PL)/grpW)));
  const onMove=(e:React.MouseEvent<SVGSVGElement>)=>{
    if(mini)return;
    const r=svgRef.current!.getBoundingClientRect();
    const sx=(e.clientX-r.left)*(W/r.width), sy=(e.clientY-r.top);
    setHov(idxAt(sx));setMx(e.clientX-r.left);setMy(sy);
    if(drag.current&&anch.current!==null) setDragR([Math.min(anch.current,idxAt(sx)),Math.max(anch.current,idxAt(sx))]);
  };
  const onDown=(e:React.MouseEvent<SVGSVGElement>)=>{
    if(mini)return;
    const r=svgRef.current!.getBoundingClientRect();
    const idx=idxAt((e.clientX-r.left)*(W/r.width));
    drag.current=true;anch.current=idx;setDragR([idx,idx]);
  };
  const onUp=()=>{
    if(!drag.current||!dragR)return;
    drag.current=false;
    const [s,ee]=dragR;
    const dates=data.slice(s,ee+1).map(d=>d.date);
    const same=dates.length===selDates.length&&dates.every((d,i)=>d===selDates[i]);
    onSelect(same?[]:dates);setDragR(null);anch.current=null;
  };
  const yTicks=mini?[0,0.5,1]:[0,0.25,0.5,0.75,1];
  return(
    <div ref={wRef} style={{width:"100%",userSelect:"none"}}>
      {loaded?(
        <svg ref={svgRef as React.RefObject<SVGSVGElement>} width="100%" height={SVG_H}
          onMouseMove={onMove} onMouseDown={onDown} onMouseUp={onUp}
          onMouseLeave={()=>{setHov(null);if(drag.current){drag.current=false;setDragR(null);}}}
          style={{cursor:mini?"default":"crosshair",display:"block",overflow:"visible"}}>
          <defs>
            <linearGradient id={`gE-${pfx}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={expCol} stopOpacity={1}/><stop offset="100%" stopColor={expCol} stopOpacity={0.5}/>
            </linearGradient>
            <linearGradient id={`gI-${pfx}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={incCol} stopOpacity={1}/><stop offset="100%" stopColor={incCol} stopOpacity={0.5}/>
            </linearGradient>
            {!mini&&<><filter id={`glE-${pfx}`}><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <filter id={`glI-${pfx}`}><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></>}
          </defs>
          {!mini&&yTicks.map(f=>{
            const y=CH-f*CH+PT, v=max*f;
            return(<g key={f}>
              <line x1={PL} y1={y} x2={PL+CW} y2={y} stroke={T.border} strokeWidth={0.6} strokeDasharray="3 5"/>
              <text x={PL-6} y={y+4} textAnchor="end" fontSize={9} fill={T.muted} fontFamily="Geist Mono,monospace">
                {v>=1000?`₹${(v/1000).toFixed(0)}k`:`₹${Math.round(v)}`}
              </text>
            </g>);
          })}
          {dragR&&<rect x={PL+dragR[0]*grpW} y={PT} width={(dragR[1]-dragR[0]+1)*grpW} height={CH}
            fill={dark?"rgba(0,255,136,0.07)":"rgba(22,163,74,0.07)"}
            stroke={dark?"rgba(0,255,136,0.22)":"rgba(22,163,74,0.22)"} strokeWidth={1} rx={2} style={{pointerEvents:"none"}}/>}
          {selDates.length>0&&!dragR&&data.map((d,i)=>selDates.includes(d.date)?(
            <rect key={d.date} x={PL+i*grpW} y={PT} width={grpW} height={CH}
              fill={dark?"rgba(0,255,136,0.05)":"rgba(22,163,74,0.05)"} style={{pointerEvents:"none"}}/>):null)}
          {data.map((d,i)=>{
            const gx=PL+i*grpW+grpW/2, isH=hov===i, isSel=selDates.includes(d.date);
            const eH=bH(d.expenses),iH=bH(d.income),eY=bY(d.expenses),iY=bY(d.income);
            return(<g key={d.date} role={mini?undefined:"img"} aria-label={mini?undefined:`${d.label}: ₹${fmt(d.expenses)} expenses, ₹${fmt(d.income)} income`}>
              {!mini&&isH&&showExp&&d.expenses>0&&<line x1={PL} y1={eY} x2={gx-bW-2} y2={eY} stroke={expCol} strokeWidth={0.7} strokeOpacity={0.4} strokeDasharray="3 4"/>}
              {!mini&&isH&&showInc&&d.income>0&&<line x1={PL} y1={iY} x2={gx+2} y2={iY} stroke={incCol} strokeWidth={0.7} strokeOpacity={0.4} strokeDasharray="3 4"/>}
              <motion.rect x={gx-bW-1} width={bW} rx={2} ry={2} fill={`url(#gE-${pfx})`}
                filter={!mini&&isH&&showExp?`url(#glE-${pfx})`:undefined}
                initial={{y:CH+PT,height:0,opacity:0}}
                animate={{y:showExp?eY:CH+PT,height:showExp?eH:0,opacity:showExp?1:0}}
                transition={rm?{duration:0}:{...SPS,delay:showExp?i*0.04:0}}/>
              <motion.rect x={gx+1} width={bW} rx={2} ry={2} fill={`url(#gI-${pfx})`}
                filter={!mini&&isH&&showInc?`url(#glI-${pfx})`:undefined}
                initial={{y:CH+PT,height:0,opacity:0}}
                animate={{y:showInc?iY:CH+PT,height:showInc?iH:0,opacity:showInc?1:0}}
                transition={rm?{duration:0}:{...SPS,delay:showInc?i*0.04+0.025:0}}/>
              <text x={gx} y={CH+PT+(mini?13:19)} textAnchor="middle" fontSize={mini?7:9} fontFamily="Geist Mono,monospace"
                fill={isSel?T.ind:isH?T.fg:T.muted} style={{transition:"fill 150ms"}}>{d.label}</text>
            </g>);
          })}
          {!mini&&hov!==null&&(()=>{
            const d=data[hov]; if(!d||(!d.expenses&&!d.income))return null;
            const rows=[showExp&&d.expenses>0,showInc&&d.income>0].filter(Boolean).length;
            const tw=110, th=18+rows*18+8, tx=Math.min(mx+14,W-tw-4), ty=Math.max(my-th/2,PT);
            return(<g style={{pointerEvents:"none"}}>
              <rect x={tx} y={ty} width={tw} height={th} rx={4}
                fill={dark?"rgba(14,14,14,0.97)":"rgba(255,255,255,0.97)"}
                stroke={T.border} strokeWidth={1} style={{filter:"drop-shadow(0 4px 14px rgba(0,0,0,0.18))"}}/>
              <text x={tx+9} y={ty+13} fontSize={9} fill={T.muted} fontFamily="Geist Mono,monospace">{d.date}</text>
              {showExp&&d.expenses>0&&<text x={tx+9} y={ty+29} fontSize={11} fill={expCol} fontFamily="Geist Mono,monospace" fontWeight={600}>exp ₹{fmt(d.expenses)}</text>}
              {showInc&&d.income>0&&<text x={tx+9} y={ty+29+(showExp&&d.expenses>0?17:0)} fontSize={11} fill={incCol} fontFamily="Geist Mono,monospace" fontWeight={600}>inc ₹{fmt(d.income)}</text>}
            </g>);
          })()}
        </svg>
      ):(
        <div className="flex items-end gap-1.5" style={{height:SVG_H,paddingLeft:PL,paddingBottom:PB,alignItems:"flex-end"}}>
          {[55,90,40,138,74,110,65].map((h,i)=><Skel key={i} w="100%" h={h} T={T}/>)}
        </div>
      )}
    </div>
  );
}

/* ─── Line Chart ────────────────────────────────────────────────────────────── */
function LineChart({data,showExp,showInc,T,dark,loaded,rm,expCol,incCol,mini,uid}:ChartProps) {
  const autoId=useId().replace(/:/g,"");
  const pfx=uid??autoId;
  const wRef=useRef<HTMLDivElement>(null);
  const W=useElWidth(wRef as React.RefObject<HTMLElement>);
  const PL=mini?20:44, PR=8, PB=mini?18:26, PT=8;
  const CW=Math.max(W-PL-PR,40);
  const CH=mini?70:148;
  const SVG_H=CH+PT+PB;
  const max=Math.max(...data.flatMap(d=>[showExp?d.expenses:0,showInc?d.income:0]),50);
  const [hov,setHov]=useState<number|null>(null);
  const n=data.length;
  const px=(i:number)=>PL+i*(CW/(n-1||1));
  const py=(v:number)=>CH+PT-(v/max)*CH;
  const expPts=data.map((d,i)=>({x:px(i),y:py(d.expenses)}));
  const incPts=data.map((d,i)=>({x:px(i),y:py(d.income)}));
  const baseY=CH+PT;
  const eArea=smoothPath(expPts)+` L ${expPts[expPts.length-1]?.x??0} ${baseY} L ${expPts[0]?.x??0} ${baseY} Z`;
  const iArea=smoothPath(incPts)+` L ${incPts[incPts.length-1]?.x??0} ${baseY} L ${incPts[0]?.x??0} ${baseY} Z`;
  const yTicks=mini?[0,0.5,1]:[0,0.25,0.5,0.75,1];
  return(
    <div ref={wRef} style={{width:"100%",userSelect:"none"}}>
      {loaded?(
        <svg width="100%" height={SVG_H} style={{display:"block",overflow:"visible"}}
          onMouseLeave={()=>setHov(null)}>
          <defs>
            <linearGradient id={`eA-${pfx}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={expCol} stopOpacity={0.22}/><stop offset="100%" stopColor={expCol} stopOpacity={0.01}/>
            </linearGradient>
            <linearGradient id={`iA-${pfx}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={incCol} stopOpacity={0.22}/><stop offset="100%" stopColor={incCol} stopOpacity={0.01}/>
            </linearGradient>
          </defs>
          {!mini&&yTicks.map(f=>{
            const y=CH-f*CH+PT, v=max*f;
            return(<g key={f}>
              <line x1={PL} y1={y} x2={PL+CW} y2={y} stroke={T.border} strokeWidth={0.6} strokeDasharray="3 5"/>
              <text x={PL-6} y={y+4} textAnchor="end" fontSize={9} fill={T.muted} fontFamily="Geist Mono,monospace">
                {v>=1000?`₹${(v/1000).toFixed(0)}k`:`₹${Math.round(v)}`}
              </text>
            </g>);
          })}
          {showExp&&<motion.path d={eArea} fill={`url(#eA-${pfx})`} initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.5}}/>}
          {showInc&&<motion.path d={iArea} fill={`url(#iA-${pfx})`} initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.5,delay:0.1}}/>}
          {showExp&&<motion.path d={smoothPath(expPts)} fill="none" stroke={expCol} strokeWidth={mini?1.5:2.5} strokeLinecap="round" strokeLinejoin="round"
            initial={{pathLength:0}} animate={{pathLength:1}} transition={{duration:1.1,ease:EASE}}/>}
          {showInc&&<motion.path d={smoothPath(incPts)} fill="none" stroke={incCol} strokeWidth={mini?1.5:2.5} strokeLinecap="round" strokeLinejoin="round"
            initial={{pathLength:0}} animate={{pathLength:1}} transition={{duration:1.1,ease:EASE,delay:0.1}}/>}
          {!mini&&showExp&&expPts.map((pt,i)=>(
            <motion.circle key={`e${i}`} cx={pt.x} cy={pt.y} fill={expCol} stroke={T.bg} strokeWidth={2}
              initial={{r:0}} animate={{r:hov===i?6:4}} transition={{...SPF}}
              onMouseEnter={()=>setHov(i)} style={{cursor:"pointer"}}
              aria-label={`${data[i].label}: ₹${fmt(data[i].expenses)} expenses`}/>
          ))}
          {!mini&&showInc&&incPts.map((pt,i)=>(
            <motion.circle key={`i${i}`} cx={pt.x} cy={pt.y} fill={incCol} stroke={T.bg} strokeWidth={2}
              initial={{r:0}} animate={{r:hov===i?6:4}} transition={{...SPF,delay:0.6+i*0.05}}
              onMouseEnter={()=>setHov(i)} style={{cursor:"pointer"}}
              aria-label={`${data[i].label}: ₹${fmt(data[i].income)} income`}/>
          ))}
          {!mini&&hov!==null&&data[hov]&&(()=>{
            const d=data[hov], tx=Math.min(px(hov)+14,W-120), ty=PT;
            const rows=[showExp&&d.expenses>0,showInc&&d.income>0].filter(Boolean).length;
            const th=18+rows*18+8;
            return(<g style={{pointerEvents:"none"}}>
              <line x1={px(hov)} y1={PT} x2={px(hov)} y2={CH+PT} stroke={T.border} strokeWidth={1} strokeDasharray="3 4"/>
              <rect x={tx} y={ty} width={110} height={th} rx={4}
                fill={dark?"rgba(14,14,14,0.97)":"rgba(255,255,255,0.97)"}
                stroke={T.border} strokeWidth={1} style={{filter:"drop-shadow(0 4px 14px rgba(0,0,0,0.18))"}}/>
              <text x={tx+9} y={ty+13} fontSize={9} fill={T.muted} fontFamily="Geist Mono,monospace">{d.date}</text>
              {showExp&&d.expenses>0&&<text x={tx+9} y={ty+29} fontSize={11} fill={expCol} fontFamily="Geist Mono,monospace" fontWeight={600}>exp ₹{fmt(d.expenses)}</text>}
              {showInc&&d.income>0&&<text x={tx+9} y={ty+29+(showExp&&d.expenses>0?17:0)} fontSize={11} fill={incCol} fontFamily="Geist Mono,monospace" fontWeight={600}>inc ₹{fmt(d.income)}</text>}
            </g>);
          })()}
          {data.map((d,i)=>(
            <text key={d.date} x={px(i)} y={CH+PT+(mini?13:19)} textAnchor="middle" fontSize={mini?7:9} fontFamily="Geist Mono,monospace" fill={T.muted}>
              {d.label}
            </text>
          ))}
        </svg>
      ):(
        <div style={{height:SVG_H,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Skel w="100%" h={CH} T={T}/>
        </div>
      )}
    </div>
  );
}

/* ─── Donut Chart ───────────────────────────────────────────────────────────── */
interface DonutProps{
  expenses:Expense[];T:Theme;dark:boolean;loaded:boolean;rm:boolean;
  getCatColor:(key:string)=>string;mini?:boolean;
}

function DonutSlice({startDeg,endDeg,col,cx,cy,outerR,innerR,isHov,rm,delay}:{
  startDeg:number;endDeg:number;col:string;cx:number;cy:number;
  outerR:number;innerR:number;isHov:boolean;rm:boolean;delay:number;
}) {
  const [curEnd,setCurEnd]=useState(startDeg);
  useEffect(()=>{
    if(rm){setCurEnd(endDeg);return;}
    const dur=800, t0=Date.now(), delayMs=delay*1000;
    let raf:number;
    const step=()=>{
      const el=Date.now()-t0-delayMs;
      if(el<0){raf=requestAnimationFrame(step);return;}
      const p=Math.min(el/dur,1), e=1-Math.pow(1-p,3);
      setCurEnd(startDeg+(endDeg-startDeg)*e);
      if(p<1)raf=requestAnimationFrame(step);
    };
    raf=requestAnimationFrame(step);
    return()=>cancelAnimationFrame(raf);
  },[endDeg,startDeg,rm,delay]);
  const offset=isHov?8:0;
  const midDeg=(startDeg+endDeg)/2;
  const midRad=(midDeg-90)*(Math.PI/180);
  const oCx=cx+offset*Math.cos(midRad), oCy=cy+offset*Math.sin(midRad);
  const d=donutArc(oCx,oCy,outerR,innerR,startDeg,curEnd);
  if(!d)return null;
  return(
    <motion.path d={d} fill={col}
      animate={{filter:isHov?`drop-shadow(0 0 8px ${col}88)`:"none"}}
      transition={{duration:0.2}}
      style={{cursor:"pointer",transition:"filter 200ms"}}/>
  );
}

function DonutChart({expenses,T,dark,loaded,rm,getCatColor,mini}:DonutProps) {
  const size=mini?120:220;
  const cx=size/2,cy=size/2;
  const outerR=mini?46:88, innerR=mini?28:56;
  const cats=CATS.filter(c=>c.key!=="income").map(cat=>({
    ...cat, color:getCatColor(cat.key),
    value:expenses.filter(e=>e.category===cat.key&&e.type==="expense").reduce((s,e)=>s+e.amount,0),
  })).filter(c=>c.value>0);
  const total=cats.reduce((s,c)=>s+c.value,0);
  const [hov,setHov]=useState<string|null>(null);
  const [hovPos,setHovPos]=useState({x:0,y:0});
  let curDeg=0;
  const slices=cats.map(cat=>{
    const start=curDeg, angle=(cat.value/total)*360;
    curDeg+=angle;
    return{...cat,startDeg:start,endDeg:curDeg};
  });
  if(!loaded)return<div style={{width:size,height:size,display:"flex",alignItems:"center",justifyContent:"center"}}><Skel w={size*0.8} h={size*0.8} T={T}/></div>;
  if(!total)return<div style={{width:size,height:size,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontFamily:"Geist Mono,monospace",color:T.muted}}>no data</div>;
  return(
    <div style={{position:"relative",display:"inline-block"}}>
      <svg width={size} height={size}
        onMouseMove={e=>{const r=e.currentTarget.getBoundingClientRect();setHovPos({x:e.clientX-r.left,y:e.clientY-r.top});}}
        onMouseLeave={()=>setHov(null)}>
        {slices.map((s,i)=>(
          <g key={s.key} onMouseEnter={()=>setHov(s.key)} onMouseLeave={()=>setHov(null)}>
            <DonutSlice startDeg={s.startDeg} endDeg={s.endDeg} col={s.color}
              cx={cx} cy={cy} outerR={outerR} innerR={innerR}
              isHov={hov===s.key} rm={rm} delay={i*0.07}/>
          </g>
        ))}
        {!mini&&<>
          <text x={cx} y={cy-10} textAnchor="middle" fontSize={10} fill={T.muted} fontFamily="Geist Mono,monospace">Expenses</text>
          <text x={cx} y={cy+12} textAnchor="middle" fontSize={20} fontWeight={700} fill={T.fg} fontFamily="Geist Mono,monospace">₹{Math.round(total/1000*10)/10}k</text>
        </>}
      </svg>
      {!mini&&hov&&(()=>{
        const sl=slices.find(s=>s.key===hov);
        if(!sl)return null;
        const tx=hovPos.x>size/2?hovPos.x-130:hovPos.x+12, ty=Math.max(hovPos.y-20,4);
        return(
          <div style={{position:"absolute",top:ty,left:tx,background:dark?"rgba(14,14,14,0.97)":"rgba(255,255,255,0.97)",
            border:`1px solid ${T.border}`,borderRadius:4,padding:"6px 10px",
            boxShadow:"0 4px 16px rgba(0,0,0,0.2)",pointerEvents:"none",zIndex:10}}>
            <div style={{fontSize:9,fontFamily:"Geist Mono,monospace",color:T.muted,marginBottom:2}}>{sl.label}</div>
            <div style={{fontSize:13,fontWeight:700,fontFamily:"Geist Mono,monospace",color:sl.color}}>₹{fmt(sl.value)}</div>
            <div style={{fontSize:9,fontFamily:"Geist Mono,monospace",color:T.muted}}>{Math.round(sl.value/total*100)}%</div>
          </div>
        );
      })()}
    </div>
  );
}

/* ─── Chart Panel (switching wrapper) ─────────────────────────────────────── */
interface PanelChartProps extends ChartProps{
  chartType:ChartType;expenses:Expense[];getCatColor:(k:string)=>string;
}

function ChartPanel({chartType,...props}:PanelChartProps) {
  const panelId=useId().replace(/:/g,"");
  return(
    <AnimatePresence mode="wait">
      <motion.div key={chartType}
        initial={{opacity:0,filter:"blur(5px)"}} animate={{opacity:1,filter:"blur(0px)"}}
        exit={{opacity:0,filter:"blur(5px)"}} transition={{duration:0.28,ease:EASE}}>
        {chartType==="bar"&&<BarChart {...props} uid={`main-${panelId}`}/>}
        {chartType==="line"&&<LineChart {...props} uid={`main-${panelId}`}/>}
        {chartType==="donut"&&(
          <div style={{display:"flex",justifyContent:"center",alignItems:"center",paddingTop:8}}>
            <DonutChart expenses={props.expenses} T={props.T} dark={props.dark}
              loaded={props.loaded} rm={props.rm} getCatColor={props.getCatColor}/>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

/* ─── Category Panel ────────────────────────────────────────────────────────── */
function CatPanel({expenses,selCat,onSel,T,dark,loaded,rm,getCatColor}:{
  expenses:Expense[];selCat:Cat|null;onSel:(c:Cat|null)=>void;
  T:Theme;dark:boolean;loaded:boolean;rm:boolean;getCatColor:(k:string)=>string;
}) {
  const totalExp=expenses.filter(e=>e.type==="expense").reduce((s,e)=>s+e.amount,0);
  const rows=CATS.filter(c=>c.key!=="income").map(cat=>({
    ...cat, color:getCatColor(cat.key),
    spent:expenses.filter(e=>e.category===cat.key&&e.type==="expense").reduce((s,e)=>s+e.amount,0),
  })).filter(r=>r.spent>0);
  if(!loaded)return(
    <div className="space-y-4">
      {[1,2,3,4,5].map(i=>(<div key={i} className="flex items-center gap-3">
        <Skel w={6} h={6} T={T}/><Skel w={100} h={9} T={T}/><Skel w="100%" h={3} T={T}/><Skel w={60} h={9} T={T}/>
      </div>))}
    </div>
  );
  return(
    <div className="space-y-1.5">
      {rows.map((cat,i)=>{
        const pct=totalExp>0?(cat.spent/totalExp)*100:0;
        const isSel=selCat===cat.key, isDim=selCat!==null&&!isSel;
        return(
          // Entrance (rise+fade) and the dim-on-select opacity live in one animate
          // target so neither overrides the other — avoids leaving the row stuck
          // in its blurred/hidden entrance state.
          <motion.div key={cat.key}
            initial={rm?false:{opacity:0,y:14}}
            animate={{opacity:isDim?0.28:1,y:0}}
            transition={rm?{duration:0}:{y:{...SP,delay:i*0.05},opacity:{duration:0.24}}}
            className="flex items-center gap-3 px-2 py-1.5 -mx-2 cursor-pointer"
            onClick={()=>onSel(isSel?null:cat.key)}
            whileHover={{x:3,backgroundColor:T.rowHov} as never}
            style={{borderRadius:4}}
            role="button" aria-pressed={isSel} tabIndex={0}
            onKeyDown={e=>e.key==="Enter"&&onSel(isSel?null:cat.key)}>
            <motion.div style={{width:6,height:6,borderRadius:"50%",background:cat.color,flexShrink:0,transition:"background 400ms ease"}}
              whileHover={rm?undefined:{scale:1.8}}/>
            <span style={{fontSize:10,fontFamily:"Geist Mono,monospace",color:T.muted,width:108,flexShrink:0}}>{cat.label}</span>
            <div style={{flex:1,height:3,background:T.track,borderRadius:99,overflow:"hidden",position:"relative"}}>
              <motion.div initial={{width:0}}
                animate={{width:`${pct}%`,filter:isSel?`drop-shadow(0 0 4px ${cat.color}aa)`:"none"}}
                transition={rm?{duration:0}:{...SPS,delay:0.1}}
                style={{position:"absolute",top:0,left:0,height:"100%",background:cat.color,borderRadius:99,transition:"background 400ms ease"}}/>
              <div style={{position:"absolute",inset:0,overflow:"hidden",borderRadius:99,pointerEvents:"none"}}>
                <div className="cat-shimmer" style={{position:"absolute",top:0,bottom:0,width:"45%",
                  background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.28),transparent)",
                  animation:"shimmerSweep 1.8s ease 0.4s 1 forwards",transform:"translateX(-100%)"}}/>
              </div>
            </div>
            <span style={{fontSize:11,fontWeight:600,fontFamily:"Geist Mono,monospace",color:T.fg,width:68,textAlign:"right"}}>
              ₹{fmt(cat.spent)}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ─── Recent Panel ──────────────────────────────────────────────────────────── */
function RecentPanel({items,search,onSearch,T,onRemove,onEdit,loaded,rm,getCatColor,expCol,incCol}:{
  items:Expense[];search:string;onSearch:(s:string)=>void;
  T:Theme;onRemove:(id:number)=>void;onEdit:(e:Expense)=>void;loaded:boolean;rm:boolean;
  getCatColor:(k:string)=>string;expCol:string;incCol:string;
}) {
  return(
    <div style={{display:"flex",flexDirection:"column"}}>
      <div className="flex items-center gap-2 px-3 py-2 mb-3"
        style={{background:T.inp,border:`1px solid ${T.inpBorder}`,borderRadius:6}}>
        <Search size={12} style={{color:T.muted,flexShrink:0}}/>
        <input value={search} onChange={e=>onSearch(e.target.value)} placeholder="Search transactions…"
          className="flex-1 bg-transparent outline-none text-xs" style={{color:T.fg,fontFamily:"Inter,sans-serif"}}
          aria-label="Search transactions"/>
        {search&&<motion.button onClick={()=>onSearch("")} whileTap={{scale:0.85}} style={{color:T.muted,lineHeight:1}}><X size={11}/></motion.button>}
      </div>
      <div style={{overflowY:"auto",scrollbarWidth:"none"}}>
        {!loaded?(
          <div className="space-y-3">{[1,2,3,4,5].map(i=>(<div key={i} className="flex items-center gap-3">
            <Skel w={6} h={6} T={T}/><Skel w="55%" h={10} T={T}/><Skel w={72} h={10} T={T}/>
          </div>))}</div>
        ):items.length===0?(
          <div className="text-center py-10" style={{fontSize:10,fontFamily:"Geist Mono,monospace",letterSpacing:"0.15em",color:T.border}}>NO RESULTS</div>
        ):(
          <div style={{borderTop:`1px solid ${T.border}`}}>
            <AnimatePresence>
              {items.slice(0,12).map((e,i)=>{
                const col=getCatColor(e.category);
                return(
                  <motion.div key={e.id}
                    initial={rm?{}:{opacity:0,x:16,filter:"blur(3px)"}}
                    animate={{opacity:1,x:0,filter:"blur(0px)"}}
                    exit={{opacity:0,height:0,paddingTop:0,paddingBottom:0}}
                    transition={{delay:Math.min(i*0.028,0.25)}}
                    className="flex items-center gap-2.5 py-2.5 group"
                    style={{borderBottom:`1px solid ${T.border}`,cursor:"pointer"}}
                    onDoubleClick={()=>onEdit(e)}
                    whileHover={{paddingLeft:6,backgroundColor:T.rowHov} as never}>
                    <motion.div style={{width:6,height:6,borderRadius:"50%",background:col,flexShrink:0,transition:"background 400ms ease"}}
                      whileHover={rm?undefined:{scale:1.7}}/>
                    <span style={{fontSize:12,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:T.fg}}>{e.description}</span>
                    <span style={{fontSize:9,fontFamily:"Geist Mono,monospace",color:T.muted}} className="sm:block hidden">{e.date}</span>
                    <span style={{fontSize:12,fontWeight:600,fontFamily:"Geist Mono,monospace",flexShrink:0,color:e.type==="income"?incCol:expCol}}>
                      {e.type==="income"?"+":"−"}₹{fmt(e.amount)}
                    </span>
                    <motion.button onClick={()=>onEdit(e)}
                      className="opacity-0 group-hover:opacity-100 flex-shrink-0"
                      style={{color:T.muted}} whileHover={{color:T.fg} as never} whileTap={{scale:0.8}}
                      aria-label={`Edit ${e.description}`} title="Edit">
                      <Pencil size={11}/>
                    </motion.button>
                    <motion.button onClick={()=>onRemove(e.id)}
                      className="opacity-0 group-hover:opacity-100 flex-shrink-0"
                      style={{color:T.muted}} whileHover={{color:expCol} as never} whileTap={{scale:0.8}}
                      aria-label={`Remove ${e.description}`} title="Delete">
                      <X size={10}/>
                    </motion.button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Budget Card ───────────────────────────────────────────────────────────── */
function BudgetCard({cat,spent,budget,onSaveBudget,T,dark,rm,delay,getCatColor,expCol,incCol}:{
  cat:typeof CATS[number];spent:number;budget:number;onSaveBudget:(v:number)=>void;
  T:Theme;dark:boolean;rm:boolean;delay:number;
  getCatColor:(k:string)=>string;expCol:string;incCol:string;
}) {
  const pct=budget?Math.min(100,(spent/budget)*100):0;
  const over=budget?spent>budget:false;
  const col=getCatColor(cat.key);
  const [editing,setEditing]=useState(false);
  const [val,setVal]=useState(String(budget));
  useEffect(()=>{if(!editing)setVal(String(budget));},[budget,editing]);
  const commit=()=>{
    setEditing(false);
    const n=parseFloat(val);
    if(!isNaN(n)&&n>=0&&n!==budget)onSaveBudget(n);
    else setVal(String(budget));
  };
  return(
    <TiltCard T={T} rm={rm} style={{padding:20}}>
      <motion.div initial={rm?{}:{opacity:0,y:12,filter:"blur(4px)"}} animate={{opacity:1,y:0,filter:"blur(0px)"}} transition={{delay,...SP}}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div style={{width:6,height:6,borderRadius:"50%",background:col,transition:"background 400ms ease"}}/>
            <span style={{fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",fontFamily:"Geist Mono,monospace",color:T.muted}}>{cat.label}</span>
          </div>
          <span style={{fontSize:10,fontWeight:700,fontFamily:"Geist Mono,monospace",color:over?expCol:T.muted}}>{over?"OVER":`${Math.round(pct)}%`}</span>
        </div>
        <div style={{height:4,background:T.track,borderRadius:99,overflow:"hidden",position:"relative"}}>
          <motion.div initial={{width:0}} animate={{width:`${pct}%`}}
            transition={rm?{duration:0}:{delay:delay+0.1,...SPS}}
            style={{position:"absolute",top:0,left:0,height:"100%",background:over?expCol:col,borderRadius:99,transition:"background 400ms ease"}}/>
        </div>
        <div className="flex items-center justify-between mt-2" style={{fontSize:12,fontFamily:"Geist Mono,monospace"}}>
          <span style={{color:T.fg}}>₹{fmt(spent)}</span>
          {editing?(
            <span style={{display:"inline-flex",alignItems:"center",gap:2,color:T.muted}}>
              of ₹
              <input autoFocus type="number" min={0} value={val} onChange={e=>setVal(e.target.value)}
                onBlur={commit}
                onKeyDown={e=>{if(e.key==="Enter")commit();if(e.key==="Escape"){setVal(String(budget));setEditing(false);}}}
                style={{width:72,background:T.inp,border:`1px solid ${T.inpBorder}`,color:T.fg,
                  fontFamily:"Geist Mono,monospace",fontSize:12,padding:"1px 4px",outline:"none",colorScheme:dark?"dark":"light"}}/>
            </span>
          ):(
            <button onClick={()=>setEditing(true)} title="Edit budget — saved to Excel"
              style={{color:T.muted,background:"transparent",border:"none",cursor:"pointer",
                fontFamily:"Geist Mono,monospace",fontSize:12,borderBottom:`1px dotted ${T.muted}`,paddingBottom:1}}>
              of ₹{fmt(budget)}
            </button>
          )}
        </div>
        <div style={{marginTop:3,fontSize:10,fontFamily:"Geist Mono,monospace",color:over?expCol:incCol}}>
          {over?`₹${fmt(spent-budget)} over`:`₹${fmt(budget-spent)} remaining`}
        </div>
      </motion.div>
    </TiltCard>
  );
}

/* ─── Settings Drawer ───────────────────────────────────────────────────────── */
interface DrawerProps{
  open:boolean;onClose:()=>void;
  chartType:ChartType;onChartType:(t:ChartType)=>void;
  draft:CColors;onDraft:(c:CColors)=>void;
  hasUnsaved:boolean;onApply:()=>void;onCancel:()=>void;
  T:Theme;dark:boolean;rm:boolean;
  previewData:DayBar[];previewExpenses:Expense[];
}

function SettingsDrawer({open,onClose,chartType,onChartType,draft,onDraft,hasUnsaved,onApply,onCancel,T,dark,rm,previewData,previewExpenses}:DrawerProps) {
  const dExpCol=getExpCol(draft,dark), dIncCol=getIncCol(draft,dark);
  const dGetCat=(k:string)=>getCatCol(k,draft,dark);

  const CHART_TYPES:[ChartType,string,React.ReactNode][]=[
    ["bar","Bar",<BarChart2 size={14}/>],
    ["line","Line",<LineIcon size={14}/>],
    ["donut","Donut",<PieChart size={14}/>],
  ];

  return(
    <>
      <AnimatePresence>
        {open&&(
          <motion.div key="sd-bd" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            transition={{duration:0.25}} className="fixed inset-0 z-30"
            style={{background:"rgba(0,0,0,0.35)",backdropFilter:"blur(4px)"}}
            onClick={onClose}/>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {open&&(
          <motion.div key="sd"
            initial={{x:"100%",opacity:0}} animate={{x:0,opacity:1}} exit={{x:"100%",opacity:0}}
            transition={{...SPS}}
            className="fixed top-0 right-0 bottom-0 z-40 flex flex-col"
            style={{width:360,background:T.drawerBg,borderLeft:`1px solid ${T.border}`,
              backdropFilter:"blur(24px)",boxShadow:"-8px 0 40px rgba(0,0,0,0.3)",overflowY:"auto",scrollbarWidth:"none"}}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
              style={{borderBottom:`1px solid ${T.border}`,position:"sticky",top:0,background:T.drawerBg,zIndex:1,backdropFilter:"blur(24px)"}}>
              <div className="flex items-center gap-2">
                <Settings size={13} style={{color:T.muted}}/>
                <span style={{fontSize:11,fontWeight:700,letterSpacing:"0.18em",textTransform:"uppercase",fontFamily:"Geist Mono,monospace",color:T.fg}}>Settings</span>
              </div>
              <motion.button onClick={onClose} whileTap={{scale:0.82}} style={{color:T.muted,cursor:"pointer"}}
                aria-label="Close settings"><X size={15}/></motion.button>
            </div>

            <div className="flex-1 p-5 space-y-6" style={{overflowY:"auto",scrollbarWidth:"none"}}>
              {/* Chart type */}
              <section>
                <div style={{fontSize:9,fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",fontFamily:"Geist Mono,monospace",color:T.muted,marginBottom:10}}>Chart Type</div>
                <div className="flex gap-2 mb-4">
                  {CHART_TYPES.map(([ct,label,icon])=>(
                    <motion.button key={ct} onClick={()=>onChartType(ct)} whileTap={{scale:0.93}}
                      className="flex items-center gap-1.5 flex-1 justify-center py-2"
                      style={{fontSize:10,fontWeight:700,fontFamily:"Geist Mono,monospace",cursor:"pointer",
                        background:chartType===ct?T.ind+"18":T.inp,
                        border:`1px solid ${chartType===ct?T.ind:T.inpBorder}`,
                        color:chartType===ct?T.ind:T.muted,transition:"all 180ms ease"}}
                      aria-pressed={chartType===ct}>
                      {icon}{label}
                    </motion.button>
                  ))}
                </div>
                {/* Mini preview */}
                <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:4,padding:"12px 8px 8px",overflow:"hidden"}}>
                  <div style={{fontSize:8,fontFamily:"Geist Mono,monospace",color:T.muted,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:6,paddingLeft:4}}>Preview</div>
                  <AnimatePresence mode="wait">
                    <motion.div key={chartType} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.2}}>
                      {chartType==="bar"&&<BarChart data={previewData} showExp showInc selDates={[]} onSelect={()=>{}} T={T} dark={dark} loaded rm={rm} expCol={dExpCol} incCol={dIncCol} mini uid="prev"/>}
                      {chartType==="line"&&<LineChart data={previewData} showExp showInc selDates={[]} onSelect={()=>{}} T={T} dark={dark} loaded rm={rm} expCol={dExpCol} incCol={dIncCol} mini uid="prev"/>}
                      {chartType==="donut"&&(
                        <div style={{display:"flex",justifyContent:"center"}}>
                          <DonutChart expenses={previewExpenses} T={T} dark={dark} loaded rm={rm} getCatColor={dGetCat} mini/>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </section>

              {/* Preset themes */}
              <section>
                <div style={{fontSize:9,fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",fontFamily:"Geist Mono,monospace",color:T.muted,marginBottom:10}}>Preset Themes</div>
                <div className="flex gap-2 mb-2">
                  {(Object.keys(THEME_PRESETS) as string[]).map(name=>(
                    <motion.button key={name} whileTap={{scale:0.93}}
                      onClick={()=>onDraft({...draft,...THEME_PRESETS[name]})}
                      style={{flex:1,padding:"8px 0",fontSize:9,fontWeight:700,letterSpacing:"0.1em",textTransform:"capitalize",
                        fontFamily:"Geist Mono,monospace",background:T.inp,border:`1px solid ${T.inpBorder}`,
                        color:T.muted,cursor:"pointer",transition:"all 180ms ease"}}
                      whileHover={{color:T.fg,borderColor:T.fg} as never}>
                      {name}
                    </motion.button>
                  ))}
                </div>
                <motion.button onClick={()=>onDraft({})} whileTap={{scale:0.93}}
                  className="flex items-center gap-1.5 w-full justify-center py-2"
                  style={{fontSize:9,fontWeight:700,fontFamily:"Geist Mono,monospace",cursor:"pointer",
                    background:"transparent",border:`1px solid ${T.inpBorder}`,color:T.muted,transition:"all 180ms ease"}}
                  whileHover={{color:T.fg} as never}>
                  <RotateCcw size={10}/> Reset to defaults
                </motion.button>
              </section>

              {/* Income & Expenses colors */}
              <section>
                <div style={{fontSize:9,fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",fontFamily:"Geist Mono,monospace",color:T.muted,marginBottom:10}}>Income & Expenses</div>
                <div className="space-y-3">
                  {[{key:"income",label:"Income",col:dIncCol},{key:"expenses",label:"Expenses",col:dExpCol}].map(({key,label,col})=>(
                    <div key={key}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <div style={{width:8,height:8,borderRadius:"50%",background:col,flexShrink:0}}/>
                        <span style={{fontSize:10,fontFamily:"Geist Mono,monospace",color:T.fg}}>{label}</span>
                      </div>
                      <ColorPicker value={col} onChange={v=>onDraft({...draft,[key]:v})} T={T}/>
                    </div>
                  ))}
                </div>
              </section>

              {/* Category colors */}
              <section>
                <div style={{fontSize:9,fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",fontFamily:"Geist Mono,monospace",color:T.muted,marginBottom:10}}>Category Colors</div>
                <div className="space-y-3">
                  {CATS.filter(c=>c.key!=="income").map(cat=>{
                    const col=dGetCat(cat.key);
                    return(
                      <div key={cat.key}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <div style={{width:8,height:8,borderRadius:"50%",background:col,flexShrink:0}}/>
                          <span style={{fontSize:10,fontFamily:"Geist Mono,monospace",color:T.fg}}>{cat.label}</span>
                        </div>
                        <ColorPicker value={col} onChange={v=>onDraft({...draft,[cat.key]:v})} T={T}/>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* Apply / Cancel */}
            <AnimatePresence>
              {hasUnsaved&&(
                <motion.div initial={{y:60,opacity:0}} animate={{y:0,opacity:1}} exit={{y:60,opacity:0}}
                  transition={SP} className="flex-shrink-0 flex gap-2 p-4"
                  style={{borderTop:`1px solid ${T.border}`,background:T.drawerBg,backdropFilter:"blur(24px)"}}>
                  <div className="flex items-center gap-1.5 flex-1" style={{fontSize:9,fontFamily:"Geist Mono,monospace",color:T.muted}}>
                    <div style={{width:5,height:5,borderRadius:"50%",background:"#f59e0b",animation:"pulse 1.5s ease infinite"}}/>
                    Unsaved changes
                  </div>
                  <motion.button onClick={onCancel} whileTap={{scale:0.93}}
                    style={{padding:"8px 16px",fontSize:10,fontWeight:700,fontFamily:"Geist Mono,monospace",
                      background:T.inp,border:`1px solid ${T.inpBorder}`,color:T.muted,cursor:"pointer",transition:"all 180ms"}}>
                    Cancel
                  </motion.button>
                  <motion.button onClick={onApply} whileTap={{scale:0.93}}
                    className="flex items-center gap-1.5"
                    style={{padding:"8px 16px",fontSize:10,fontWeight:700,fontFamily:"Geist Mono,monospace",
                      background:dark?"#00ff88":"#0a0a0a",color:dark?"#080808":"#ffffff",cursor:"pointer",
                      boxShadow:dark?"0 3px 14px rgba(0,255,136,0.3)":"0 3px 10px rgba(0,0,0,0.2)"}}>
                    <Check size={11}/>Apply
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ─── Add Modal ─────────────────────────────────────────────────────────────── */
function Modal({T,dark,rm,onClose,onSubmit,initial}:{
  T:Theme;dark:boolean;rm:boolean;onClose:()=>void;
  onSubmit:(e:Omit<Expense,"id">)=>void;initial?:Expense|null;
}) {
  const [form,setForm]=useState({
    description:initial?.description??"",
    amount:initial?String(initial.amount):"",
    category:(initial?.category??"food") as Cat,
    type:(initial?.type??"expense") as "expense"|"income",
    date:initial?.date??TODAY,
  });
  const amt=parseFloat(form.amount);
  const valid=form.description.trim()!==""&&Number.isFinite(amt)&&amt>0&&!!form.date;
  return(
    <>
      <motion.div key="bd" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.25}}
        className="fixed inset-0 z-40" style={{background:"rgba(0,0,0,0.55)",backdropFilter:"blur(10px)"}} onClick={onClose}/>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{pointerEvents:"none"}}>
        <motion.div style={{pointerEvents:"auto",width:"100%",maxWidth:420}}
          initial={{opacity:0,scale:0.94,y:20}}
          animate={{opacity:1,scale:1,y:0}}
          exit={{opacity:0,scale:0.94,y:14}}
          transition={rm?{duration:0.15}:SP}>
          <div style={{background:T.modalBg,border:`1px solid ${T.border}`,overflow:"hidden",
            boxShadow:dark?"0 0 0 1px rgba(255,255,255,0.06),0 32px 80px rgba(0,0,0,0.85)":"0 8px 40px rgba(0,0,0,0.15)"}}>
            <div style={{height:1,background:T.grad}}/>
            <div className="flex items-center justify-between px-5 py-4" style={{borderBottom:`1px solid ${T.border}`}}>
              <span style={{fontSize:11,fontWeight:700,letterSpacing:"0.18em",textTransform:"uppercase",fontFamily:"Geist Mono,monospace",color:T.fg}}>{initial?"Edit Entry":"New Entry"}</span>
              <motion.button onClick={onClose} whileTap={{scale:0.82}} style={{color:T.muted,cursor:"pointer"}}><X size={15}/></motion.button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <div style={{fontSize:9,fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",fontFamily:"Geist Mono,monospace",color:T.muted,marginBottom:8}}>Type</div>
                <div className="grid grid-cols-2 gap-2">
                  {(["expense","income"] as const).map(t=>{
                    const col=t==="income"?T.inc:T.exp, sel=form.type===t;
                    return(
                      <motion.button key={t} whileTap={{scale:0.95}}
                        onClick={()=>setForm({...form,type:t,category:t==="income"?"income":"food"})}
                        style={{padding:"10px 0",fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",
                          fontFamily:"Geist Mono,monospace",background:sel?col+"18":T.inp,
                          border:`1px solid ${sel?col:T.inpBorder}`,color:sel?col:T.muted,
                          transition:"all 200ms ease",cursor:"pointer"}}>{t}</motion.button>
                    );
                  })}
                </div>
              </div>
              <div>
                <div style={{fontSize:9,fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",fontFamily:"Geist Mono,monospace",color:T.muted,marginBottom:8}}>Description</div>
                <input value={form.description} onChange={e=>setForm({...form,description:e.target.value})}
                  placeholder="What was this for?" className="w-full outline-none"
                  style={{padding:"10px 12px",fontSize:14,background:T.inp,border:`1px solid ${T.inpBorder}`,color:T.fg,fontFamily:"Inter,sans-serif",transition:"border-color 200ms"}}
                  onFocus={e=>e.target.style.borderColor=dark?"rgba(0,255,136,0.45)":"rgba(0,0,0,0.32)"}
                  onBlur={e=>e.target.style.borderColor=T.inpBorder}/>
              </div>
              <div>
                <div style={{fontSize:9,fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",fontFamily:"Geist Mono,monospace",color:T.muted,marginBottom:8}}>Amount</div>
                <input type="number" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}
                  placeholder="0.00" className="w-full outline-none"
                  style={{padding:"10px 12px",fontSize:14,background:T.inp,border:`1px solid ${T.inpBorder}`,color:T.fg,fontFamily:"Geist Mono,monospace",transition:"border-color 200ms"}}
                  onFocus={e=>e.target.style.borderColor=dark?"rgba(0,255,136,0.45)":"rgba(0,0,0,0.32)"}
                  onBlur={e=>e.target.style.borderColor=T.inpBorder}/>
              </div>
              <div>
                <div style={{fontSize:9,fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",fontFamily:"Geist Mono,monospace",color:T.muted,marginBottom:8}}>Date</div>
                <input type="date" value={form.date} max={TODAY} onChange={e=>setForm({...form,date:e.target.value})}
                  className="w-full outline-none"
                  style={{padding:"10px 12px",fontSize:14,background:T.inp,border:`1px solid ${T.inpBorder}`,color:T.fg,fontFamily:"Geist Mono,monospace",transition:"border-color 200ms",colorScheme:dark?"dark":"light"}}
                  onFocus={e=>e.target.style.borderColor=dark?"rgba(0,255,136,0.45)":"rgba(0,0,0,0.32)"}
                  onBlur={e=>e.target.style.borderColor=T.inpBorder}/>
              </div>
              {form.type==="expense"&&(
                <div>
                  <div style={{fontSize:9,fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",fontFamily:"Geist Mono,monospace",color:T.muted,marginBottom:8}}>Category</div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {CATS.filter(c=>c.key!=="income").map(cat=>{
                      const col=dark?cat.dc:cat.lc, sel=form.category===cat.key;
                      return(
                        <motion.button key={cat.key} whileTap={{scale:0.93}}
                          onClick={()=>setForm({...form,category:cat.key})}
                          style={{padding:"8px 4px",fontSize:9,fontWeight:700,fontFamily:"Geist Mono,monospace",
                            background:sel?col+"18":"transparent",border:`1px solid ${sel?col:T.inpBorder}`,
                            color:sel?col:T.muted,transition:"all 180ms ease",cursor:"pointer"}}>{cat.label.split(" ")[0]}</motion.button>
                      );
                    })}
                  </div>
                </div>
              )}
              <motion.button onClick={()=>{
                if(!valid)return;
                onSubmit({description:form.description.trim(),amount:amt,category:form.category,date:form.date,type:form.type});
                onClose();
              }} disabled={!valid}
                whileTap={{scale:0.97}} whileHover={valid?{scale:1.01} as never:undefined}
                style={{width:"100%",padding:"14px 0",fontSize:10,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",
                  fontFamily:"Geist Mono,monospace",cursor:valid?"pointer":"not-allowed",background:dark?"#00ff88":"#0a0a0a",
                  color:dark?"#080808":"#ffffff",boxShadow:dark?"0 4px 20px rgba(0,255,136,0.28)":"0 4px 12px rgba(0,0,0,0.18)",
                  transition:"box-shadow 200ms,opacity 200ms",opacity:valid?1:0.28}}>
                {initial?"Save Changes":"Add Entry"}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}

/* ─── App ───────────────────────────────────────────────────────────────────── */
export default function App() {
  const rm=usePRM();
  const [dark,setDark]=useState(true);
  const T=TH[dark?"dark":"light"];
  const [reveal,setReveal]=useState<{x:number;y:number;toDark:boolean}|null>(null);

  const [expenses,setExpenses]=useState<Expense[]>([]);
  const [budgets,setBudgets]=useState<Record<string,number>>({});
  const [loaded,setLoaded]=useState(false);
  const [modal,setModal]=useState(false);
  const [editTarget,setEditTarget]=useState<Expense|null>(null);
  const [tab,setTab]=useState<Tab>("overview");
  const [showExp,setShowExp]=useState(true);
  const [showInc,setShowInc]=useState(true);
  const [selDates,setSelDates]=useState<string[]>([]);
  const [selCat,setSelCat]=useState<Cat|null>(null);
  const [search,setSearch]=useState("");

  // Settings
  const [settingsOpen,setSettingsOpen]=useState(false);
  const [chartType,setChartType]=useState<ChartType>("bar");
  const [dateRange,setDateRange]=useState<DateRange>("7d");
  const [liveColors,setLiveColors]=useState<CColors>({});
  const [draftColors,setDraftColors]=useState<CColors>({});
  const [hasUnsaved,setHasUnsaved]=useState(false);

  // Derived colors
  const expCol=getExpCol(liveColors,dark), incCol=getIncCol(liveColors,dark);
  const getCatColor=useCallback((k:string)=>getCatCol(k,liveColors,dark),[liveColors,dark]);
  const overrideT={...T,exp:expCol,inc:incCol};

  // Sync draft to live whenever the drawer opens
  useEffect(()=>{
    if(settingsOpen){setDraftColors(liveColors);setHasUnsaved(false);}
  },[settingsOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDraft=(c:CColors)=>{setDraftColors(c);setHasUnsaved(true);};
  const handleApply=()=>{setLiveColors(draftColors);setHasUnsaved(false);};
  const handleCancel=()=>{setDraftColors(liveColors);setHasUnsaved(false);};

  // Tab underline
  const tabBarRef=useRef<HTMLDivElement>(null);
  const tabRefs=useRef<Record<string,HTMLButtonElement|null>>({});
  const [ind,setInd]=useState({left:0,width:72});
  useEffect(()=>{
    const el=tabRefs.current[tab],bar=tabBarRef.current;
    if(el&&bar){const br=bar.getBoundingClientRect(),er=el.getBoundingClientRect();setInd({left:er.left-br.left,width:er.width});}
  },[tab,loaded]);

  // Load transactions + budgets from the Excel-backed API (server/index.js → data/expenses.xlsx)
  const refetch=useCallback(()=>{
    return Promise.all([
      fetch("/api/expenses").then(r=>r.json()),
      fetch("/api/budgets").then(r=>r.json()),
    ])
      .then(([exp,bud]:[Expense[],Record<string,number>])=>{setExpenses(exp);setBudgets(bud);})
      .catch(err=>console.error("Failed to load data",err));
  },[]);
  useEffect(()=>{refetch().finally(()=>setLoaded(true));},[refetch]);

  // Update a category budget: optimistic, then persist to the Excel "Budgets" sheet.
  const updateBudget=useCallback(async(category:string,value:number)=>{
    setBudgets(p=>({...p,[category]:value}));
    try{
      const r=await fetch(`/api/budgets/${category}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({budget:value})});
      if(!r.ok)throw new Error(`PUT failed: ${r.status}`);
      const saved:Record<string,number>=await r.json();
      setBudgets(saved);
    }catch(err){
      console.error("Failed to save budget",err);
      refetch();
    }
  },[refetch]);

  // Newest first: by date desc, then id desc — matches the server's ordering so
  // a back-dated add or an edited date lands in the right spot without a refetch.
  const sortExp=(rows:Expense[])=>[...rows].sort((a,b)=>a.date<b.date?1:a.date>b.date?-1:b.id-a.id);

  // Add a transaction: optimistic UI, then persist to Excel and swap in the saved row.
  const addExpense=useCallback(async(entry:Omit<Expense,"id">)=>{
    const temp:Expense={id:Date.now(),...entry};
    setExpenses(p=>sortExp([temp,...p]));
    try{
      const r=await fetch("/api/expenses",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(entry)});
      if(!r.ok)throw new Error(`POST failed: ${r.status}`);
      const saved:Expense=await r.json();
      setExpenses(p=>sortExp(p.map(e=>e.id===temp.id?saved:e)));
    }catch(err){
      console.error("Failed to save expense",err);
      refetch(); // roll back to whatever the Excel file actually holds
    }
  },[refetch]);

  // Edit a transaction: optimistic UI, then persist the update to Excel.
  const editExpense=useCallback(async(id:number,entry:Omit<Expense,"id">)=>{
    setExpenses(p=>sortExp(p.map(e=>e.id===id?{...entry,id}:e)));
    try{
      const r=await fetch(`/api/expenses/${id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(entry)});
      if(!r.ok)throw new Error(`PUT failed: ${r.status}`);
      const saved:Expense=await r.json();
      setExpenses(p=>sortExp(p.map(e=>e.id===id?saved:e)));
    }catch(err){
      console.error("Failed to update expense",err);
      refetch(); // roll back to whatever the Excel file actually holds
    }
  },[refetch]);

  // Remove a transaction: optimistic UI, then delete from Excel.
  const removeExpense=useCallback(async(id:number)=>{
    setExpenses(p=>p.filter(e=>e.id!==id));
    try{
      const r=await fetch(`/api/expenses/${id}`,{method:"DELETE"});
      if(!r.ok)throw new Error(`DELETE failed: ${r.status}`);
    }catch(err){
      console.error("Failed to delete expense",err);
      refetch();
    }
  },[refetch]);

  // Keyboard shortcuts
  useEffect(()=>{
    const h=(e:KeyboardEvent)=>{
      if(e.key==="Escape"){
        if(settingsOpen)setSettingsOpen(false);
        if(modal)setModal(false);
        if(editTarget)setEditTarget(null);
      }
    };
    window.addEventListener("keydown",h);
    return()=>window.removeEventListener("keydown",h);
  },[settingsOpen,modal,editTarget]);

  // Theme toggle
  const toggleTheme=(e:React.MouseEvent<HTMLButtonElement>)=>{
    if(reveal)return;
    const r=e.currentTarget.getBoundingClientRect();
    setReveal({x:r.left+r.width/2,y:r.top+r.height/2,toDark:!dark});
    setTimeout(()=>setDark(v=>!v),290);
    setTimeout(()=>setReveal(null),600);
  };

  // Chart & filtered data
  const chartData=getRangeBars(dateRange,expenses);
  const rangeDateFilter=getDateFilter(dateRange);
  // Overview panels honor the 7d/Month/All range plus any explicit selections.
  const filtered=expenses.filter(e=>{
    if(rangeDateFilter&&!rangeDateFilter.includes(e.date))return false;
    if(selDates.length>0&&!selDates.includes(e.date))return false;
    if(selCat&&e.category!==selCat)return false;
    if(search&&!e.description.toLowerCase().includes(search.toLowerCase()))return false;
    return true;
  });
  // The Transactions tab lists everything — only the explicit filters (search,
  // category, and any date range picked on the chart) apply, never the rolling window.
  const txFiltered=expenses.filter(e=>{
    if(selDates.length>0&&!selDates.includes(e.date))return false;
    if(selCat&&e.category!==selCat)return false;
    if(search&&!e.description.toLowerCase().includes(search.toLowerCase()))return false;
    return true;
  });
  // KPI cards reflect true all-time totals, independent of the Overview range.
  const totInc=expenses.filter(e=>e.type==="income").reduce((s,e)=>s+e.amount,0);
  const totExp=expenses.filter(e=>e.type==="expense").reduce((s,e)=>s+e.amount,0);
  const bal=totInc-totExp;
  const hasFilter=selDates.length>0||selCat!==null||search;
  const maxR=Math.hypot(typeof window!=="undefined"?window.innerWidth:1440,typeof window!=="undefined"?window.innerHeight:900);

  const TABS:[Tab,string][]=[["overview","Overview"],["transactions","Transactions"],["budget","Budget"]];
  const DATE_RANGES:[DateRange,string][]=[["7d","7 Days"],["month","Month"],["all","All"]];

  // "?" tooltip state
  const [showTip,setShowTip]=useState(false);

  return(
    <>
      <style>{`
        @keyframes shimmerSweep{0%{transform:translateX(-100%)}60%,100%{transform:translateX(380%)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        body{margin:0}
        input::placeholder{color:${T.muted}}
        input[type=color]{-webkit-appearance:none;appearance:none}
        input[type=color]::-webkit-color-swatch-wrapper{padding:0}
        input[type=color]::-webkit-color-swatch{border:none;border-radius:2px}
        ::-webkit-scrollbar{display:none}
        *{box-sizing:border-box}
      `}</style>

      <div style={{minHeight:"100vh",background:T.bg,color:T.fg,fontFamily:"Inter,sans-serif",
        transition:"background-color 250ms ease,color 250ms ease",position:"relative"}}>

        {/* Ambient */}
        {dark&&!rm&&(
          <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
            <motion.div animate={{x:[0,50,0],y:[0,25,0]}} transition={{duration:20,repeat:Infinity,ease:"easeInOut"}}
              style={{position:"absolute",top:"-25%",left:"-15%",width:"65%",height:"65%",borderRadius:"50%",
                background:"radial-gradient(ellipse,rgba(0,255,136,0.022) 0%,transparent 70%)"}}/>
            <motion.div animate={{x:[0,-40,0],y:[0,35,0]}} transition={{duration:26,repeat:Infinity,ease:"easeInOut",delay:5}}
              style={{position:"absolute",bottom:"-25%",right:"-15%",width:"55%",height:"55%",borderRadius:"50%",
                background:"radial-gradient(ellipse,rgba(91,154,255,0.016) 0%,transparent 70%)"}}/>
          </div>
        )}

        {/* Theme reveal */}
        <AnimatePresence>
          {reveal&&(
            <motion.div
              initial={{clipPath:`circle(0px at ${reveal.x}px ${reveal.y}px)`}}
              animate={{clipPath:`circle(${maxR}px at ${reveal.x}px ${reveal.y}px)`}}
              exit={{opacity:0}} transition={{duration:0.55,ease:EASE}}
              style={{position:"fixed",inset:0,zIndex:9999,pointerEvents:"none",
                background:reveal.toDark?"#080808":"#f8f8f8"}}/>
          )}
        </AnimatePresence>

        <div style={{position:"relative",zIndex:1}}>
          {/* Header */}
          <motion.header
            initial={rm?{}:{opacity:0,y:-14,filter:"blur(4px)"}}
            animate={{opacity:1,y:0,filter:"blur(0px)"}}
            transition={{...SP,delay:0.04}}
            className="flex items-center justify-between px-5 py-3.5"
            style={{borderBottom:`1px solid ${T.border}`,background:T.bg,backdropFilter:"blur(20px)",
              transition:"background 250ms,border-color 250ms",position:"sticky",top:0,zIndex:20}}>
            <div className="flex items-center gap-3">
              <motion.div animate={dark&&!rm?{filter:["drop-shadow(0 0 3px #00ff8830)","drop-shadow(0 0 7px #00ff8855)","drop-shadow(0 0 3px #00ff8830)"]}:{}}
                transition={{duration:3,repeat:Infinity}}>
                <Wallet size={14} style={{color:overrideT.ind}}/>
              </motion.div>
              <span style={{fontSize:11,fontWeight:700,letterSpacing:"0.18em",textTransform:"uppercase",fontFamily:"Geist Mono,monospace",color:T.fg,transition:"color 250ms"}}>Daily Expenses</span>
              <span style={{fontSize:11,fontFamily:"Geist Mono,monospace",color:T.muted,transition:"color 250ms"}}>/Jul 2026</span>
            </div>
            <div className="flex items-center gap-2">
              {/* Settings */}
              <motion.button onClick={()=>setSettingsOpen(true)} whileHover={{scale:1.1}} whileTap={{scale:0.86}}
                className="flex items-center justify-center w-8 h-8"
                style={{border:`1px solid ${T.border}`,color:T.muted,background:T.card,borderRadius:6,
                  backdropFilter:"blur(8px)",transition:"border-color 250ms,background 250ms",cursor:"pointer"}}
                aria-label="Open settings">
                <Settings size={13}/>
              </motion.button>
              {/* Theme toggle */}
              <motion.button onClick={toggleTheme} whileHover={{scale:1.1}} whileTap={{scale:0.86}}
                className="flex items-center justify-center w-8 h-8"
                style={{border:`1px solid ${T.border}`,color:T.muted,background:T.card,borderRadius:6,
                  backdropFilter:"blur(8px)",transition:"border-color 250ms,background 250ms",cursor:"pointer"}}
                aria-label={dark?"Switch to light mode":"Switch to dark mode"}>
                <AnimatePresence mode="wait">
                  {dark
                    ?<motion.div key="sun" initial={{rotate:-50,opacity:0,scale:0.5}} animate={{rotate:0,opacity:1,scale:1}} exit={{rotate:50,opacity:0,scale:0.5}} transition={{duration:0.22}}><Sun size={13}/></motion.div>
                    :<motion.div key="moon" initial={{rotate:50,opacity:0,scale:0.5}} animate={{rotate:0,opacity:1,scale:1}} exit={{rotate:-50,opacity:0,scale:0.5}} transition={{duration:0.22}}><Moon size={13}/></motion.div>}
                </AnimatePresence>
              </motion.button>
              {/* Add */}
              <motion.button onClick={()=>setModal(true)}
                whileHover={{scale:1.03,boxShadow:dark?"0 6px 24px rgba(0,255,136,0.38)":"0 6px 20px rgba(0,0,0,0.2)"} as never}
                whileTap={{scale:0.92}}
                className="flex items-center gap-2 px-4 py-2"
                style={{fontSize:10,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",fontFamily:"Geist Mono,monospace",
                  background:dark?"#00ff88":"#0a0a0a",color:dark?"#080808":"#ffffff",cursor:"pointer",
                  boxShadow:dark?"0 3px 16px rgba(0,255,136,0.28)":"0 3px 12px rgba(0,0,0,0.16)",
                  transition:"box-shadow 200ms"}}>
                <Plus size={11}/>Add
              </motion.button>
            </div>
          </motion.header>

          {/* KPIs */}
          <motion.div className="flex" style={{borderBottom:`1px solid ${T.border}`,transition:"border-color 250ms"}}
            variants={rm?undefined:CONT} initial="hidden" animate={loaded?"show":"hidden"}>
            {[
              {label:"Balance",value:bal,     color:bal>=0?incCol:expCol,icon:bal>=0?<TrendingUp size={11}/>:<TrendingDown size={11}/>},
              {label:"Income", value:totInc,  color:incCol,icon:<TrendingUp size={11}/>},
              {label:"Expenses",value:totExp, color:expCol,icon:<TrendingDown size={11}/>},
            ].map(kpi=>(
              <motion.div key={kpi.label} style={{flex:1}} variants={rm?undefined:ITEM}>
                <KPICard {...kpi} T={T} rm={rm} loaded={loaded}/>
              </motion.div>
            ))}
          </motion.div>

          {/* Tabs */}
          <div ref={tabBarRef} className="flex relative"
            style={{borderBottom:`1px solid ${T.border}`,transition:"border-color 250ms"}}>
            {TABS.map(([id,label])=>(
              <button key={id} ref={el=>{tabRefs.current[id]=el;}}
                onClick={()=>setTab(id)}
                style={{padding:"12px 20px",fontSize:10,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",
                  fontFamily:"Geist Mono,monospace",color:tab===id?T.fg:T.muted,position:"relative",zIndex:1,
                  transition:"color 250ms",cursor:"pointer",background:"transparent",border:"none"}}
                aria-selected={tab===id} role="tab">
                {label}
              </button>
            ))}
            <motion.div className="absolute bottom-0" style={{height:2,background:overrideT.ind,transition:"background 250ms"}}
              animate={{left:ind.left,width:ind.width}} transition={SP}/>
          </div>

          {/* Filter pills */}
          <AnimatePresence>
            {hasFilter&&(
              <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}}
                transition={{duration:0.2}} style={{overflow:"hidden"}}>
                <div className="flex items-center gap-2 px-5 py-2 flex-wrap"
                  style={{background:T.fBg,borderBottom:`1px solid ${T.fBdr}`,transition:"background 250ms,border-color 250ms"}}>
                  {selDates.length>0&&(
                    <span className="flex items-center gap-1.5" style={{fontSize:9,fontFamily:"Geist Mono,monospace",
                      border:`1px solid ${T.border}`,background:T.card,color:overrideT.ind,padding:"2px 8px"}}>
                      {selDates.length===1?selDates[0]:`${selDates[0]} → ${selDates[selDates.length-1]}`}
                      <button onClick={()=>setSelDates([])} style={{lineHeight:1,cursor:"pointer",background:"transparent",border:"none",color:"inherit"}} aria-label="Clear date filter"><X size={9}/></button>
                    </span>
                  )}
                  {selCat&&(
                    <span className="flex items-center gap-1.5" style={{fontSize:9,fontFamily:"Geist Mono,monospace",
                      border:`1px solid ${T.border}`,background:T.card,color:getCatColor(selCat),padding:"2px 8px"}}>
                      {CATS.find(c=>c.key===selCat)?.label}
                      <button onClick={()=>setSelCat(null)} style={{lineHeight:1,cursor:"pointer",background:"transparent",border:"none",color:"inherit"}} aria-label="Clear category filter"><X size={9}/></button>
                    </span>
                  )}
                  {search&&(
                    <span className="flex items-center gap-1.5" style={{fontSize:9,fontFamily:"Geist Mono,monospace",
                      border:`1px solid ${T.border}`,background:T.card,color:T.muted,padding:"2px 8px"}}>
                      "{search}"
                      <button onClick={()=>setSearch("")} style={{lineHeight:1,cursor:"pointer",background:"transparent",border:"none",color:"inherit"}} aria-label="Clear search"><X size={9}/></button>
                    </span>
                  )}
                  <button onClick={()=>{setSelDates([]);setSelCat(null);setSearch("");}}
                    style={{marginLeft:"auto",fontSize:9,fontFamily:"Geist Mono,monospace",color:T.muted,cursor:"pointer",background:"transparent",border:"none"}}>
                    clear all ×
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Content */}
          <main style={{padding:20}}>
            <AnimatePresence mode="wait">

              {/* OVERVIEW */}
              {tab==="overview"&&(
                <motion.div key="ov"
                  initial={rm?{}:{opacity:0,y:12,filter:"blur(4px)"}}
                  animate={{opacity:1,y:0,filter:"blur(0px)"}}
                  exit={rm?{}:{opacity:0,y:-8,filter:"blur(3px)"}}
                  transition={{duration:0.24,ease:EASE}}>

                  {/* Date range + chart type strip */}
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <div className="flex gap-1">
                      {DATE_RANGES.map(([r,label])=>(
                        <motion.button key={r} onClick={()=>{setDateRange(r);setSelDates([]);}}
                          whileTap={{scale:0.93}}
                          style={{padding:"5px 12px",fontSize:9,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",
                            fontFamily:"Geist Mono,monospace",cursor:"pointer",
                            background:dateRange===r?overrideT.ind+"18":T.inp,
                            border:`1px solid ${dateRange===r?overrideT.ind:T.inpBorder}`,
                            color:dateRange===r?overrideT.ind:T.muted,transition:"all 180ms ease"}}>
                          {label}
                        </motion.button>
                      ))}
                    </div>
                    <div className="flex gap-1 ml-auto">
                      {([["bar",<BarChart2 size={11}/>],["line",<LineIcon size={11}/>],["donut",<PieChart size={11}/>]] as [ChartType,React.ReactNode][]).map(([ct,icon])=>(
                        <motion.button key={ct} onClick={()=>setChartType(ct)} whileTap={{scale:0.93}}
                          className="flex items-center justify-center w-7 h-7"
                          style={{border:`1px solid ${chartType===ct?overrideT.ind:T.inpBorder}`,
                            background:chartType===ct?overrideT.ind+"18":T.inp,
                            color:chartType===ct?overrideT.ind:T.muted,cursor:"pointer",transition:"all 180ms ease"}}
                          aria-label={`${ct} chart`} aria-pressed={chartType===ct}>
                          {icon}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(296px,1fr))",gap:16}}>
                    {/* Chart card */}
                    <TiltCard T={T} rm={rm} style={{padding:20,minWidth:0}}>
                      <div className="flex items-center justify-between mb-3">
                        <span style={{fontSize:10,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",fontFamily:"Geist Mono,monospace",color:T.muted}}>
                          {dateRange==="7d"?"Last 7 Days":dateRange==="month"?"Monthly View":"All Time"}
                        </span>
                        <div className="flex items-center gap-3">
                          {chartType!=="donut"&&[{key:"exp",show:showExp,set:setShowExp,col:expCol,label:"EXP"},{key:"inc",show:showInc,set:setShowInc,col:incCol,label:"INC"}].map(s=>(
                            <motion.button key={s.key} onClick={()=>s.set(v=>!v)} whileHover={{scale:1.1}} whileTap={{scale:0.9}}
                              className="flex items-center gap-1"
                              style={{fontSize:9,fontWeight:700,fontFamily:"Geist Mono,monospace",letterSpacing:"0.08em",
                                color:s.show?s.col:T.muted,transition:"color 200ms",cursor:"pointer",background:"transparent",border:"none"}}
                              aria-label={`Toggle ${s.label}`} aria-pressed={s.show}>
                              {s.show?<Eye size={10}/>:<EyeOff size={10}/>}{s.label}
                            </motion.button>
                          ))}
                          {/* "?" tooltip */}
                          <div style={{position:"relative"}}>
                            <motion.button
                              onMouseEnter={()=>setShowTip(true)} onMouseLeave={()=>setShowTip(false)}
                              onClick={()=>setShowTip(v=>!v)}
                              style={{width:16,height:16,borderRadius:"50%",border:`1px solid ${T.border}`,
                                background:"transparent",color:T.muted,fontSize:9,fontFamily:"Geist Mono,monospace",
                                cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}
                              aria-label="Chart interaction help">
                              ?
                            </motion.button>
                            <AnimatePresence>
                              {showTip&&(
                                <motion.div initial={{opacity:0,y:-4,scale:0.95}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:-4,scale:0.95}}
                                  transition={{...SPF}}
                                  style={{position:"absolute",bottom:"calc(100% + 8px)",right:0,width:220,
                                    background:dark?"rgba(14,14,14,0.97)":"rgba(255,255,255,0.97)",
                                    border:`1px solid ${T.border}`,borderRadius:6,padding:"10px 12px",
                                    boxShadow:"0 8px 24px rgba(0,0,0,0.2)",zIndex:100,pointerEvents:"none"}}>
                                  <div style={{fontSize:10,fontFamily:"Geist Mono,monospace",color:T.muted,lineHeight:1.6}}>
                                    <strong style={{color:T.fg,display:"block",marginBottom:4}}>Chart interaction</strong>
                                    Click a bar to filter by date. Drag across multiple bars to select a date range. Click again to clear.
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>
                      <ChartPanel chartType={chartType} data={chartData} showExp={showExp} showInc={showInc}
                        selDates={selDates} onSelect={setSelDates} T={T} dark={dark} loaded={loaded} rm={rm}
                        expCol={expCol} incCol={incCol} expenses={filtered} getCatColor={getCatColor}/>
                      {chartType!=="donut"&&(
                        <div className="flex gap-4 mt-1.5">
                          {[{c:expCol,l:"expenses"},{c:incCol,l:"income"}].map(x=>(
                            <span key={x.l} className="flex items-center gap-1.5" style={{fontSize:9,fontFamily:"Geist Mono,monospace",color:T.muted}}>
                              <span style={{display:"inline-block",width:6,height:6,borderRadius:"50%",background:x.c,transition:"background 400ms ease"}}/>{x.l}
                            </span>
                          ))}
                        </div>
                      )}
                    </TiltCard>

                    {/* Categories */}
                    <TiltCard T={T} rm={rm} style={{padding:20,minWidth:0}}>
                      <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",fontFamily:"Geist Mono,monospace",color:T.muted,marginBottom:16}}>
                        By Category
                      </div>
                      <CatPanel expenses={filtered} selCat={selCat} onSel={setSelCat} T={T} dark={dark} loaded={loaded} rm={rm} getCatColor={getCatColor}/>
                    </TiltCard>

                    {/* Recent */}
                    <TiltCard T={T} rm={rm} style={{padding:20,minWidth:0}}>
                      <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",fontFamily:"Geist Mono,monospace",color:T.muted,marginBottom:12}}>
                        Recent Transactions
                      </div>
                      <RecentPanel items={filtered} search={search} onSearch={setSearch}
                        T={T} onRemove={removeExpense} onEdit={setEditTarget}
                        loaded={loaded} rm={rm} getCatColor={getCatColor}
                        expCol={expCol} incCol={incCol}/>
                    </TiltCard>
                  </div>
                </motion.div>
              )}

              {/* TRANSACTIONS */}
              {tab==="transactions"&&(
                <motion.div key="tx"
                  initial={rm?{}:{opacity:0,y:12,filter:"blur(4px)"}}
                  animate={{opacity:1,y:0,filter:"blur(0px)"}}
                  exit={rm?{}:{opacity:0,y:-8,filter:"blur(3px)"}}
                  transition={{duration:0.24,ease:EASE}}>
                  <TiltCard T={T} rm={rm}>
                    <div className="flex items-center gap-2.5 px-4 py-3" style={{borderBottom:`1px solid ${T.border}`}}>
                      <Search size={12} style={{color:T.muted}}/>
                      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Filter transactions…"
                        className="flex-1 bg-transparent outline-none text-xs" style={{color:T.fg,fontFamily:"Inter,sans-serif"}}
                        aria-label="Filter transactions"/>
                      {search&&<motion.button onClick={()=>setSearch("")} whileTap={{scale:0.85}} style={{color:T.muted,lineHeight:1,cursor:"pointer"}}><X size={11}/></motion.button>}
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"8px 1fr auto auto auto",gap:"0 12px",
                      padding:"8px 16px",borderBottom:`1px solid ${T.border}`,
                      fontSize:9,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",fontFamily:"Geist Mono,monospace",color:T.muted}}>
                      <div/><div>Description</div>
                      <div className="hidden md:block">Category</div>
                      <div className="hidden sm:block">Date</div>
                      <div style={{textAlign:"right"}}>Amount</div>
                    </div>
                    <AnimatePresence>
                      {txFiltered.map((e,i)=>{
                        const col=getCatColor(e.category);
                        return(
                          <motion.div key={e.id}
                            initial={rm?{}:{opacity:0,x:-8}} animate={{opacity:1,x:0}} exit={{opacity:0,height:0}}
                            transition={{delay:Math.min(i*0.02,0.22)}}
                            className="group"
                            style={{display:"grid",gridTemplateColumns:"8px 1fr auto auto auto",gap:"0 12px",
                              alignItems:"center",padding:"12px 16px",borderBottom:`1px solid ${T.border}`,cursor:"pointer"}}
                            onDoubleClick={()=>setEditTarget(e)}
                            whileHover={{backgroundColor:T.rowHov} as never}>
                            <div style={{width:6,height:6,borderRadius:"50%",background:col,transition:"background 400ms ease"}}/>
                            <span style={{fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:T.fg}}>{e.description}</span>
                            <span style={{fontSize:10,fontFamily:"Geist Mono,monospace",color:T.muted}} className="hidden md:block">{CATS.find(c=>c.key===e.category)?.label}</span>
                            <span style={{fontSize:10,fontFamily:"Geist Mono,monospace",color:T.muted}} className="hidden sm:block">{e.date}</span>
                            <div className="flex items-center gap-2 justify-end">
                              <span style={{fontSize:12,fontWeight:600,fontFamily:"Geist Mono,monospace",minWidth:92,textAlign:"right",color:e.type==="income"?incCol:expCol}} >
                                {e.type==="income"?"+":"−"}₹{fmt(e.amount)}
                              </span>
                              <motion.button onClick={()=>setEditTarget(e)}
                                className="opacity-0 group-hover:opacity-100 flex-shrink-0"
                                style={{color:T.muted,cursor:"pointer"}}
                                whileHover={{color:overrideT.ind} as never} whileTap={{scale:0.8}}
                                aria-label={`Edit ${e.description}`} title="Edit">
                                <Pencil size={11}/>
                              </motion.button>
                              <motion.button onClick={()=>removeExpense(e.id)}
                                className="opacity-0 group-hover:opacity-100 flex-shrink-0"
                                style={{color:T.muted,cursor:"pointer"}}
                                whileHover={{color:expCol} as never} whileTap={{scale:0.8}}
                                aria-label={`Remove ${e.description}`} title="Delete">
                                <X size={10}/>
                              </motion.button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                    {txFiltered.length===0&&(
                      <div style={{textAlign:"center",padding:"60px 0",fontSize:10,fontFamily:"Geist Mono,monospace",letterSpacing:"0.15em",color:T.border}}>NO RESULTS</div>
                    )}
                  </TiltCard>
                </motion.div>
              )}

              {/* BUDGET */}
              {tab==="budget"&&(
                <motion.div key="bg"
                  initial={rm?{}:{opacity:0,y:12,filter:"blur(4px)"}}
                  animate={{opacity:1,y:0,filter:"blur(0px)"}}
                  exit={rm?{}:{opacity:0,y:-8,filter:"blur(3px)"}}
                  transition={{duration:0.24,ease:EASE}}
                  style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(256px,1fr))",gap:14}}>
                  {CATS.filter(c=>c.key!=="income").map((cat,i)=>(
                    <BudgetCard key={cat.key} cat={cat}
                      spent={expenses.filter(e=>e.category===cat.key&&e.type==="expense").reduce((s,e)=>s+e.amount,0)}
                      budget={budgets[cat.key]??0}
                      onSaveBudget={v=>updateBudget(cat.key,v)}
                      T={T} dark={dark} rm={rm} delay={i*0.055} getCatColor={getCatColor}
                      expCol={expCol} incCol={incCol}/>
                  ))}
                </motion.div>
              )}

            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Settings Drawer */}
      <SettingsDrawer
        open={settingsOpen} onClose={()=>setSettingsOpen(false)}
        chartType={chartType} onChartType={setChartType}
        draft={draftColors} onDraft={handleDraft}
        hasUnsaved={hasUnsaved} onApply={handleApply} onCancel={handleCancel}
        T={T} dark={dark} rm={rm}
        previewData={LAST7.map(({date,label})=>({
          date,label,
          expenses:SEED.filter(e=>e.date===date&&e.type==="expense").reduce((s,e)=>s+e.amount,0),
          income:SEED.filter(e=>e.date===date&&e.type==="income").reduce((s,e)=>s+e.amount,0),
        }))}
        previewExpenses={SEED}/>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {(modal||editTarget)&&(
          <Modal
            key={editTarget?`edit-${editTarget.id}`:"add"}
            T={T} dark={dark} rm={rm}
            initial={editTarget}
            onClose={()=>{setModal(false);setEditTarget(null);}}
            onSubmit={editTarget
              ?(entry)=>editExpense(editTarget.id,entry)
              :addExpense}/>
        )}
      </AnimatePresence>
    </>
  );
}
