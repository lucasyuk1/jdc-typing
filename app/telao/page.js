"use client";

import { useEffect, useState } from "react";

export default function TelaoPage() {

const [rows,setRows] = useState([]);
const [ultimos,setUltimos] = useState([]);
const [novoTop3,setNovoTop3] = useState(false);

async function load(){

try{

const res = await fetch("/api/results",{ cache:"no-store" });
const json = await res.json();
const data = json.data || json;

if(!Array.isArray(data)) return;

const hoje = new Date().toISOString().slice(0,10);

const filtrado = data.filter(r =>
r.username !== "larbak" &&
r.created_at?.slice(0,10) === hoje
);

const recentes = [...filtrado]
.sort((a,b)=> new Date(b.created_at) - new Date(a.created_at));

setRows(recentes);

const ultimos3 = recentes.slice(0,3);
setUltimos(ultimos3);

/* verifica se entrou no top3 */

if(recentes.length){

const ranking = [...recentes].sort((a,b)=>b.wpm-a.wpm);
const ultimo = recentes[0];
const pos = ranking.findIndex(r=>r.username===ultimo.username)+1;

if(pos<=3){
setNovoTop3(true);
setTimeout(()=>setNovoTop3(false),4000);
}

}

}catch(err){
console.error("Erro carregando resultados:",err);
}

}

useEffect(()=>{

load();
const interval = setInterval(load,3000);
return ()=>clearInterval(interval);

},[]);

const ranking = [...rows]
.sort((a,b)=>b.wpm-a.wpm)
.slice(0,10);

function getPosicao(username){

const ordenado = [...rows].sort((a,b)=>b.wpm-a.wpm);
return ordenado.findIndex(r=>r.username===username)+1;

}

/* calcula barra WPM */

const melhorWPM = ranking.length
? Math.max(...ranking.map(r=>r.wpm))
: 100;

return(

<div className="telao">

<h1 className="titulo">
🏆 Ranking de Digitação do Dia
</h1>

{/* ÚLTIMOS RESULTADOS */}

<div className="ultimos">

<h2>⚡ Últimos Resultados</h2>

{ultimos.map((u,i)=>{

const pos = getPosicao(u.username);

return(

<div
key={i}
className={`ultimo-card ${pos<=3 && novoTop3 ? "top3":""}`}
>

<span className="aluno">
{u.username}
</span>

<span className="wpm">
{u.wpm} WPM
</span>

<span className="accuracy">
{u.accuracy}%
</span>

<span className="posicao">
#{pos} no ranking
</span>

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

let medalha="";

if(i===0) medalha="🥇";
if(i===1) medalha="🥈";
if(i===2) medalha="🥉";

const barra = (r.wpm/melhorWPM)*100;

return(

<div key={r.id} className={`linha pos${i+1}`}>

<div className="pos">
{medalha || `#${i+1}`}
</div>

<div className="nome">
{r.username}
</div>

<div className="wpm">
{r.wpm} WPM
</div>

<div className="barra">

<div
className="barra-preenchida"
style={{width:`${barra}%`}}
/>

</div>

<div className="accuracy">
{r.accuracy}%
</div>

</div>

)

})}

</div>

<style jsx>{`

.telao{
background:#020617;
min-height:100vh;
color:white;
padding:40px;
font-family:Arial, Helvetica, sans-serif;
}

.titulo{
font-size:64px;
text-align:center;
margin-bottom:40px;
color:#38bdf8;
}

/* ULTIMOS RESULTADOS */

.ultimos{
text-align:center;
margin-bottom:60px;
display:flex;
flex-direction:column;
gap:20px;
align-items:center;
}

.ultimo-card{
display:flex;
gap:30px;
padding:20px 40px;
background:#111827;
border-radius:16px;
font-size:28px;
align-items:center;
}

.top3{
animation:top3 0.7s infinite alternate;
}

@keyframes top3{
from{transform:scale(1)}
to{transform:scale(1.06)}
}

.aluno{
color:#fbbf24;
font-weight:bold;
}

.wpm{
color:#34d399;
font-weight:bold;
}

.accuracy{
color:#60a5fa;
}

.posicao{
color:#f87171;
font-weight:bold;
}

.hora{
color:#9ca3af;
font-size:20px;
}

/* RANKING */

.ranking{
display:flex;
flex-direction:column;
gap:16px;
max-width:1200px;
margin:auto;
}

.linha{
display:grid;
grid-template-columns:100px 1fr 150px 300px 150px;
align-items:center;
padding:22px;
border-radius:12px;
font-size:32px;
background:#111827;
}

.pos{
font-size:46px;
text-align:center;
}

.nome{
font-weight:bold;
}

/* BARRA DE VELOCIDADE */

.barra{
background:#1f2937;
height:18px;
border-radius:10px;
overflow:hidden;
}

.barra-preenchida{
background:linear-gradient(90deg,#22c55e,#4ade80);
height:100%;
transition:width 0.6s;
}

.pos1{
background:linear-gradient(90deg,#f59e0b,#fde047);
color:black;
font-weight:bold;
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
