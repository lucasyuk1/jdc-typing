"use client";

import { useEffect, useState } from "react";

export default function TelaoUltra(){

const [ranking,setRanking] = useState([]);
const [ultimos,setUltimos] = useState([]);
const [leader,setLeader] = useState(null);
const [hora,setHora] = useState("");

/* ======================
FORMATAR
====================== */

function wpm(v){
return Math.round(Number(v)||0);
}

function acc(v){
return Math.round(Number(v)||0);
}

/* ======================
NOME EXIBIDO
====================== */

function nome(r){

if(r?.fullname && r.fullname.trim()!==""){
return r.fullname.trim();
}

return r?.username || "Aluno";

}

/* ======================
NOME CURTO
====================== */

function nomeCurto(n){

if(!n) return "";

return n.length>26
? n.slice(0,26)+"…"
: n;

}

/* ======================
CARREGAR RESULTADOS
====================== */

async function load(){

try{

const res = await fetch("/api/results",{cache:"no-store"});
const json = await res.json();

const data = json.data || json;

if(!Array.isArray(data)) return;

/* ======================
FILTRAR
====================== */

const filtrado = data.filter(r=>
r.username!=="larbak" &&
String(r.turma).toLowerCase()!=="prof"
);

/* ======================
MAPA MELHOR RESULTADO
====================== */

const mapa={};

filtrado.forEach(r=>{

const u = r.username;

if(!mapa[u]){
mapa[u]=r;
return;
}

if(Number(r.wpm)>Number(mapa[u].wpm)){
mapa[u]=r;
}

});

/* ======================
RANKING
====================== */

const lista = Object.values(mapa);

lista.sort((a,b)=>Number(b.wpm)-Number(a.wpm));

setRanking(lista);
setLeader(lista[0]||null);

/* ======================
ULTIMOS RESULTADOS
====================== */

const recentes=[...filtrado]
.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at))
.slice(0,10);

setUltimos(recentes);

}catch(e){

console.error("Erro no telão:",e);

}

}

/* ======================
AUTO UPDATE
====================== */

useEffect(()=>{

load();

const t=setInterval(load,3000);

return()=>clearInterval(t);

},[]);

/* ======================
RELÓGIO
====================== */

useEffect(()=>{

const r=setInterval(()=>{

setHora(new Date().toLocaleTimeString("pt-BR"));

},1000);

return()=>clearInterval(r);

},[]);

/* ======================
POSIÇÃO
====================== */

function pos(username){

return ranking.findIndex(r=>r.username===username)+1;

}

/* ======================
UI
====================== */

return(

<div className="telao">

<header className="header">

<h1>🏆 Ranking de Digitação</h1>

<div className="relogio">{hora}</div>

</header>

<div className="grid">

{/* ESQUERDA */}

<div className="coluna">

{leader &&(

<div className="leader">

🔥 LÍDER

<div className="leaderNome">
{nomeCurto(nome(leader))}
</div>

<div className="leaderStats">
{wpm(leader.wpm)} WPM • {acc(leader.accuracy)}%
</div>

</div>

)}

<div className="ultimos">

<h2>⚡ Últimos Resultados</h2>

{ultimos.map((u,i)=>(

<div key={i} className="ultimo">

<span className="nome">
{nomeCurto(nome(u))}
</span>

<span className="wpm">
{wpm(u.wpm)}
</span>

<span className="acc">
{acc(u.accuracy)}%
</span>

<span className="rank">
#{pos(u.username)}
</span>

</div>

))}

</div>

</div>

{/* DIREITA */}

<div className="coluna">

<div className="ranking">

<h2>📊 Ranking</h2>

{ranking.slice(0,10).map((r,i)=>{

const medalha=
i===0?"🥇":
i===1?"🥈":
i===2?"🥉":
`#${i+1}`;

return(

<div key={r.username} className="linha">

<div className="pos">{medalha}</div>

<div className="nome">
{nomeCurto(nome(r))}
</div>

<div className="wpm">
{wpm(r.wpm)}
</div>

<div className="acc">
{acc(r.accuracy)}%
</div>

</div>

);

})}

</div>

</div>

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
font-size:54px;
color:#38bdf8;
}

.relogio{
font-size:36px;
color:#fbbf24;
}

.grid{
display:grid;
grid-template-columns:1fr 1fr;
gap:40px;
}

.coluna{
display:flex;
flex-direction:column;
gap:25px;
}

.leader{
background:#111827;
padding:30px;
border-radius:14px;
text-align:center;
}

.leaderNome{
font-size:48px;
font-weight:bold;
color:#fbbf24;
margin-top:8px;
}

.leaderStats{
font-size:30px;
color:#4ade80;
margin-top:5px;
}

.ultimos{
background:#111827;
padding:24px;
border-radius:14px;
}

.ultimos h2{
font-size:28px;
margin-bottom:10px;
}

.ultimo{
display:grid;
grid-template-columns:2fr 90px 90px 120px;
align-items:center;
font-size:24px;
padding:10px 0;
border-bottom:1px solid #1f2937;
}

.nome{
font-weight:bold;
overflow:hidden;
text-overflow:ellipsis;
white-space:nowrap;
}

.wpm{
color:#4ade80;
text-align:center;
font-weight:bold;
}

.acc{
color:#38bdf8;
text-align:center;
}

.rank{
text-align:center;
font-weight:bold;
}

.ranking{
background:#111827;
padding:24px;
border-radius:14px;
}

.ranking h2{
font-size:28px;
margin-bottom:10px;
}

.linha{
display:grid;
grid-template-columns:90px 2fr 120px 120px;
align-items:center;
font-size:30px;
padding:12px 0;
border-bottom:1px solid #1f2937;
}

.pos{
font-size:34px;
text-align:center;
}

`}</style>

</div>

);

}
