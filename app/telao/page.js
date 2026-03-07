"use client";

import { useEffect, useState } from "react";

export default function TelaoUltra(){

const [rows,setRows] = useState([]);
const [ultimos,setUltimos] = useState([]);
const [leader,setLeader] = useState(null);
const [hora,setHora] = useState("");
const [rankAnterior,setRankAnterior] = useState({});
const [userMap,setUserMap] = useState({});

/* =========================
FORMATAR
========================= */

function formatWPM(v){
return Math.round(Number(v) || 0);
}

function formatACC(v){
return Math.round(Number(v) || 0);
}

/* =========================
NOME CURTO
========================= */

function nomeCurto(nome){
if(!nome) return "";
return nome.length > 26 ? nome.slice(0,26)+"…" : nome;
}

/* =========================
PEGAR NOME
========================= */

function displayName(r){

if(!r) return "Aluno";

const fullname = userMap[r.username];

if(fullname && fullname.trim() !== ""){
return fullname.trim();
}

return r.username || "Aluno";

}

/* =========================
LOAD
========================= */

async function load(){

try{

/* RESULTADOS */

const res = await fetch("/api/results",{cache:"no-store"});
const json = await res.json();

const data = json.data || json;

if(!Array.isArray(data)) return;

/* FILTRAR */

const filtrado = data.filter(r =>
r?.username !== "larbak" &&
r?.turma?.toLowerCase() !== "prof"
);

/* =========================
BUSCAR USERS
========================= */

const usernames = [...new Set(filtrado.map(r=>r.username))];

const resUsers = await fetch("/api/users",{cache:"no-store"});
const usersJson = await resUsers.json();

const users = usersJson.data || usersJson;

const map = {};

users.forEach(u=>{
map[u.username] = u.fullname;
});

setUserMap(map);

/* =========================
MELHOR POR USER
========================= */

const mapa = {};

filtrado.forEach(r=>{

const key = r.username;

if(!mapa[key]){
mapa[key] = {...r};
return;
}

if(Number(r.wpm) > Number(mapa[key].wpm)){
mapa[key] = {...r};
}

});

const unicos = Object.values(mapa);

/* =========================
RANKING
========================= */

const ranking = [...unicos].sort(
(a,b)=>Number(b.wpm)-Number(a.wpm)
);

/* MAPA POSIÇÃO */

const novoRanking={};

ranking.forEach((r,i)=>{
novoRanking[r.username]=i+1;
});

/* =========================
ULTIMOS
========================= */

const recentes=[...filtrado]
.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at))
.slice(0,10);

setUltimos(recentes);
setLeader(ranking[0] || null);
setRows(unicos);
setRankAnterior(novoRanking);

}catch(e){
console.error("Erro carregando telão:",e);
}

}

/* =========================
AUTO UPDATE
========================= */

useEffect(()=>{

load();

const interval=setInterval(load,3000);

return()=>clearInterval(interval);

},[]);

/* =========================
RELÓGIO
========================= */

useEffect(()=>{

const rel=setInterval(()=>{
setHora(new Date().toLocaleTimeString("pt-BR"));
},1000);

return()=>clearInterval(rel);

},[]);

/* =========================
RANKING
========================= */

const rankingCompleto=[...rows].sort(
(a,b)=>Number(b.wpm)-Number(a.wpm)
);

const rankingDia=rankingCompleto.slice(0,10);

/* POSIÇÃO */

function posicaoGeral(username){
return rankingCompleto.findIndex(r=>r.username===username)+1;
}

/* MOVIMENTO */

function movimentoRanking(username){

const atual = posicaoGeral(username);
const anterior = rankAnterior[username];

if(!anterior) return "novo";
if(atual < anterior) return "subiu";
if(atual > anterior) return "desceu";

return "igual";

}

/* =========================
UI
========================= */

return(

<div className="telao">

<header className="header">

<h1>🏆 Ranking de Digitação</h1>

<div className="relogio">
{hora}
</div>

</header>

<div className="grid">

<div className="coluna">

{leader &&(

<div className="leader">

🔥 LÍDER

<div className="leaderNome">
{nomeCurto(displayName(leader))}
</div>

<div className="leaderStats">
{formatWPM(leader.wpm)} WPM • {formatACC(leader.accuracy)}%
</div>

</div>

)}

<div className="ultimos">

<h2>⚡ Últimos Resultados</h2>

{ultimos.map((u,i)=>{

const pos = posicaoGeral(u.username);
const mov = movimentoRanking(u.username);

return(

<div key={i} className="ultimo">

<span className="nome">
{nomeCurto(displayName(u))}
</span>

<span className="wpm">
{formatWPM(u.wpm)}
</span>

<span className="acc">
{formatACC(u.accuracy)}%
</span>

<span className={`rank ${mov}`}>

{pos ? `#${pos}` : "-"}

{mov==="subiu" && " 🔼"}
{mov==="desceu" && " 🔽"}
{mov==="novo" && " ✨"}

</span>

</div>

)

})}

</div>

</div>

<div className="coluna">

<div className="ranking">

<h2>📊 Ranking</h2>

{rankingDia.map((r,i)=>{

const medalha =
i===0?"🥇":
i===1?"🥈":
i===2?"🥉":
`#${i+1}`;

return(

<div key={r.username} className="linha">

<div className="pos">
{medalha}
</div>

<div className="nome">
{nomeCurto(displayName(r))}
</div>

<div className="wpm">
{formatWPM(r.wpm)}
</div>

<div className="acc">
{formatACC(r.accuracy)}%
</div>

</div>

)

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
grid-template-columns:2fr 90px 90px 140px;
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
font-weight:bold;
text-align:center;
}

.acc{
color:#38bdf8;
text-align:center;
}

.rank{
font-weight:bold;
text-align:center;
}

.rank.subiu{ color:#22c55e; }
.rank.desceu{ color:#ef4444; }
.rank.novo{ color:#38bdf8; }

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

)

}
