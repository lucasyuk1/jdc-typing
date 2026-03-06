"use client";

import { useEffect, useState } from "react";

export default function TelaoUltra() {

const [rows,setRows] = useState([]);
const [ultimos,setUltimos] = useState([]);
const [leader,setLeader] = useState(null);
const [novoLeader,setNovoLeader] = useState(false);
const [hora,setHora] = useState("");

async function load(){

try{

const res = await fetch("/api/results",{cache:"no-store"});
const json = await res.json();
const data = json.data || json;

if(!Array.isArray(data)) return;

/* DATA DO DIA (Brasil) */

const hoje = new Date().toLocaleDateString("en-CA");

/* FILTRO */

const filtrado = data.filter(r =>
r.username !== "larbak" &&
r.created_at?.slice(0,10) === hoje
);

/* RESULTADOS MAIS RECENTES */

const recentes=[...filtrado]
.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));

setRows(recentes);
setUltimos(recentes.slice(0,3));

/* RANKING */

const ranking=[...recentes].sort((a,b)=>b.wpm-a.wpm);

if(ranking.length){

if(leader && ranking[0].username !== leader.username){
setNovoLeader(true);
setTimeout(()=>setNovoLeader(false),4000);
}

setLeader(ranking[0]);

}

}catch(e){
console.error("Erro carregando telão:",e);
}

}

/* ATUALIZAÇÃO AUTOMÁTICA */

useEffect(()=>{

load();
const interval=setInterval(load,3000);

return()=>clearInterval(interval);

},[]);

/* RELÓGIO */

useEffect(()=>{

const rel=setInterval(()=>{
setHora(new Date().toLocaleTimeString("pt-BR"));
},1000);

return()=>clearInterval(rel);

},[]);

/* RANKING FINAL */

const ranking=[...rows]
.sort((a,b)=>b.wpm-a.wpm)
.slice(0,10);

/* MAIOR WPM PARA BARRA */

const melhorWPM = ranking.length
? Math.max(...ranking.map(r=>r.wpm))
:100;

/* POSIÇÃO DO JOGADOR */

function posicao(nome){

const ordenado=[...rows].sort((a,b)=>b.wpm-a.wpm);

return ordenado.findIndex(r=>r.username===nome)+1;

}

return(

<div className="telao">

<header className="header">

<h1>🏆 Ranking de Digitação do Dia</h1>

<div className="relogio">
{hora}
</div>

</header>

{/* LÍDER */}

{leader &&(

<div className={`leader ${novoLeader?"novo":""}`}>

🔥 LÍDER DO DIA: <b>{leader.username}</b> — {leader.wpm} WPM

</div>

)}

{/* ÚLTIMOS RESULTADOS */}

<div className="ultimos">

<h2>⚡ Últimos Resultados</h2>

{ultimos.map((u,i)=>{

const pos=posicao(u.username);

return(

<div
key={i}
className={`ultimo ${pos<=3?"top3":""}`}
>

<span className="aluno">{u.username}</span>

<span className="wpm">{u.wpm} WPM</span>

<span className="acc">{u.accuracy}%</span>

<span className="rank">#{pos}</span>

<span className="hora">

{new Date(u.created_at).toLocaleTimeString("pt-BR")}

</span>

</div>

)

})}

</div>

{/* RANKING */}

<div className="ranking">

{ranking.map((r,i)=>{

const medalha =
i===0?"🥇":
i===1?"🥈":
i===2?"🥉":
`#${i+1}`;

const barra=(r.wpm/melhorWPM)*100;

return(

<div key={r.id} className={`linha pos${i+1}`}>

<div className="pos">{medalha}</div>

<div className="nome">{r.username}</div>

<div className="wpm">{r.wpm}</div>

<div className="barra">

<div
className="fill"
style={{width:`${barra}%`}}
/>

</div>

<div className="acc">{r.accuracy}%</div>

</div>

)

})}

</div>

<style jsx>{`

.telao{
background:#020617;
color:white;
min-height:100vh;
padding:40px;
font-family:Arial;
}

.header{
display:flex;
justify-content:space-between;
align-items:center;
margin-bottom:30px;
}

.header h1{
font-size:60px;
color:#38bdf8;
}

.relogio{
font-size:36px;
color:#fbbf24;
}

/* líder */

.leader{
text-align:center;
font-size:40px;
background:#111827;
padding:20px;
border-radius:12px;
margin-bottom:30px;
}

.novo{
animation:pulse 0.8s infinite alternate;
}

@keyframes pulse{
from{transform:scale(1)}
to{transform:scale(1.05)}
}

/* últimos */

.ultimos{
display:flex;
flex-direction:column;
gap:12px;
margin-bottom:40px;
}

.ultimo{
display:flex;
gap:25px;
background:#111827;
padding:14px 24px;
border-radius:12px;
font-size:26px;
align-items:center;
}

.top3{
border:2px solid gold;
}

.aluno{
font-weight:bold;
color:#fbbf24;
}

.wpm{
color:#34d399;
}

.acc{
color:#60a5fa;
}

.rank{
color:#f87171;
font-weight:bold;
}

/* ranking */

.ranking{
display:flex;
flex-direction:column;
gap:14px;
}

.linha{
display:grid;
grid-template-columns:100px 1fr 120px 350px 120px;
align-items:center;
font-size:30px;
padding:20px;
background:#111827;
border-radius:10px;
}

.pos{
font-size:40px;
text-align:center;
}

.nome{
font-weight:bold;
}

.barra{
background:#1f2937;
height:20px;
border-radius:10px;
overflow:hidden;
}

.fill{
background:linear-gradient(90deg,#22c55e,#4ade80);
height:100%;
transition:width .5s;
}

.pos1{
background:linear-gradient(90deg,#f59e0b,#fde047);
color:black;
}

.pos2{
background:linear-gradient(90deg,#9ca3af,#e5e7eb);
color:black;
}

.pos3{
background:linear-gradient(90deg,#b45309,#f59e0b);
color:black;
}

`}</style>

</div>

)

}
