"use client";

import { useEffect, useState } from "react";

export default function TelaoPage() {

const [rows,setRows] = useState([]);
const [ultimo,setUltimo] = useState(null);

async function load(){

const res = await fetch("/api/results");
const data = await res.json();

if(!data) return;

const sorted = data.sort(
(a,b)=> new Date(b.created_at) - new Date(a.created_at)
);

setRows(sorted);

if(sorted.length){
setUltimo(sorted[0]);
}

}

useEffect(()=>{

load();

const interval = setInterval(load,5000);

return ()=> clearInterval(interval);

},[]);


const ranking = [...rows]
.filter(r=>r.username !== "larbak")
.sort((a,b)=> b.wpm - a.wpm)
.slice(0,10);


return(

<div className="telao">

<h1 className="titulo">
🏆 Ranking de Digitação da Turma
</h1>


{/* ÚLTIMO RESULTADO */}

{ultimo && (
<div className="ultimo">

<h2>⚡ Último resultado</h2>

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

</div>

</div>
)}


{/* RANKING */}

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

background:#0b0f19;
min-height:100vh;
color:white;
padding:40px;
font-family:Arial;

}

.titulo{

font-size:56px;
text-align:center;
margin-bottom:40px;
color:#7dd3fc;

}

.ultimo{

text-align:center;
margin-bottom:50px;

}

.ultimo-card{

display:inline-flex;
gap:30px;
padding:20px 40px;
background:#111827;
border-radius:15px;
font-size:28px;

}

.aluno{

color:#fbbf24;
font-weight:bold;

}

.wpm{

color:#34d399;

}

.accuracy{

color:#60a5fa;

}

.ranking{

display:flex;
flex-direction:column;
gap:15px;
max-width:900px;
margin:auto;

}

.linha{

display:grid;
grid-template-columns:120px 1fr 200px 200px;
align-items:center;
padding:20px;
border-radius:10px;
font-size:30px;
background:#111827;

}

.pos{

font-size:40px;
text-align:center;

}

.nome{

font-weight:bold;

}

.pos1{

background:linear-gradient(90deg,#f59e0b,#fbbf24);
color:black;

}

.pos2{

background:linear-gradient(90deg,#9ca3af,#d1d5db);
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
