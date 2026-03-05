"use client";

import { useEffect, useState } from "react";

export default function TelaoPage() {

const [rows,setRows] = useState([]);
const [ultimo,setUltimo] = useState(null);
const [novoRecorde,setNovoRecorde] = useState(false);

async function load(){

try{

const res = await fetch("/api/results",{
cache:"no-store"
});

const json = await res.json();
const data = json.data || json;

if(!Array.isArray(data)) return;

const sorted = data
.filter(r=>r.username !== "larbak")
.sort((a,b)=> new Date(b.created_at) - new Date(a.created_at));

setRows(sorted);

if(sorted.length){

const atual = sorted[0];

const melhorAnterior = rows.length
? Math.max(...rows.map(r=>r.wpm))
: 0;

if(atual.wpm > melhorAnterior){
setNovoRecorde(true);
setTimeout(()=>setNovoRecorde(false),4000);
}

setUltimo(atual);

}

}catch(err){
console.error("Erro carregando resultados:",err);
}

}

useEffect(()=>{

load();

const interval = setInterval(load,3000);

return ()=> clearInterval(interval);

},[]);

const ranking = [...rows]
.sort((a,b)=> b.wpm - a.wpm)
.slice(0,10);

return(

<div className="telao">

<h1 className="titulo">
🏆 Ranking de Digitação da Turma
</h1>

{/* Último resultado */}

{ultimo && (

<div className={`ultimo ${novoRecorde ? "recorde":""}`}>

<h2>⚡ Último Resultado</h2>

<div className="ultimo-card">

<span className="aluno">
{ultimo.username}
</span>

<span className="wpm">
{ultimo.wpm} WPM
</span>

<span className="accuracy">
{ultimo.accuracy}% precisão
</span>

<span className="hora">
{new Date(ultimo.created_at).toLocaleTimeString("pt-BR")}
</span>

</div>

</div>

)}

{/* Ranking */}

<div className="ranking">

{ranking.map((r,i)=>{

let medalha = "";

if(i===0) medalha="🥇";
if(i===1) medalha="🥈";
if(i===2) medalha="🥉";

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
margin-bottom:50px;
color:#38bdf8;

}

/* Último resultado */

.ultimo{

text-align:center;
margin-bottom:60px;
transition:0.4s;

}

.recorde{

animation:recorde 1s infinite alternate;

}

@keyframes recorde{

from{transform:scale(1)}
to{transform:scale(1.05)}

}

.ultimo-card{

display:inline-flex;
gap:40px;
padding:25px 50px;
background:#111827;
border-radius:20px;
font-size:34px;
align-items:center;

}

.aluno{

color:#fbbf24;
font-weight:bold;
font-size:36px;

}

.wpm{

color:#34d399;
font-weight:bold;

}

.accuracy{

color:#60a5fa;

}

.hora{

color:#9ca3af;
font-size:22px;

}

/* Ranking */

.ranking{

display:flex;
flex-direction:column;
gap:16px;
max-width:1100px;
margin:auto;

}

.linha{

display:grid;
grid-template-columns:120px 1fr 220px 220px;
align-items:center;
padding:22px;
border-radius:12px;
font-size:34px;
background:#111827;
animation:fade 0.4s ease;

}

@keyframes fade{

from{
opacity:0;
transform:translateY(10px);
}

to{
opacity:1;
transform:translateY(0);
}

}

.pos{

font-size:46px;
text-align:center;

}

.nome{

font-weight:bold;

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
