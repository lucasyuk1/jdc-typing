"use client";

import { useEffect, useState } from "react";

export default function TelaoUltra(){

const [rows,setRows] = useState([]);
const [ultimos,setUltimos] = useState([]);
const [leader,setLeader] = useState(null);
const [hora,setHora] = useState("");
const [rankAnterior,setRankAnterior] = useState({});

/* =========================
FORMATAR NÚMEROS
========================= */

function formatWPM(v){
return Math.round(Number(v) || 0);
}

function formatACC(v){
return Math.round(Number(v) || 0);
}

/* =========================
CORTAR NOMES LONGOS
========================= */

function nomeCurto(nome){
if(!nome) return "";
return nome.length > 18 ? nome.slice(0,18) + "…" : nome;
}

/* =========================
PEGAR NOME CORRETO
========================= */

function displayName(r){
return r?.fullname || r?.username || "Aluno";
}

/* =========================
CARREGAR RESULTADOS
========================= */

async function load(){

try{

const res = await fetch("/api/results",{cache:"no-store"});
const json = await res.json();

const data = json.data || json;

if(!Array.isArray(data)) return;

/* =========================
FILTRAR ADMIN E PROF
========================= */

const filtrado = data.filter(r =>
r?.username !== "larbak" &&
r?.turma?.toLowerCase() !== "prof"
);

/* =========================
ULTIMOS RESULTADOS
========================= */

const recentes=[...filtrado]
.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));

setUltimos(recentes.slice(0,10));

/* =========================
REMOVER REPETIDOS
(MANTER MAIOR WPM)
========================= */

const melhores={};

filtrado.forEach(r=>{

const key=r.username;

if(!melhores[key] || Number(r.wpm) > Number(melhores[key].wpm)){
melhores[key]={...r};
}

});

const unicos=Object.values(melhores);

/* =========================
RANKING
========================= */

const ranking=[...unicos].sort((a,b)=>Number(b.wpm)-Number(a.wpm));

/* =========================
MAPA DE POSIÇÕES
========================= */

const novoRanking={};

ranking.forEach((r,i)=>{
novoRanking[r.username]=i+1;
});

/* =========================
DEFINIR LIDER
========================= */

setLeader(ranking[0] || null);

/* =========================
SALVAR
========================= */

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
RANKING COMPLETO
========================= */

const rankingCompleto=[...rows]
.sort((a,b)=>Number(b.wpm)-Number(a.wpm));

/* =========================
TOP 10
========================= */

const rankingDia=rankingCompleto.slice(0,10);

/* =========================
POSIÇÃO REAL
========================= */

function posicaoGeral(username){
return rankingCompleto.findIndex(r=>r.username===username)+1;
}

/* =========================
MOVIMENTO DE RANKING
========================= */

function movimentoRanking(username){

const atual = posicaoGeral(username);
const anterior = rankAnterior[username];

if(!anterior) return "novo";

if(atual < anterior) return "subiu";
if(atual > anterior) return "desceu";

return "igual";
}

/* =========================
INTERFACE
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

{/* COLUNA ESQUERDA */}

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

{/* COLUNA DIREITA */}

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
padding:30px;
font-family:Arial;
}

.header{
display:flex;
justify-content:space-between;
align-items:center;
margin-bottom:20px;
}

.header h1{
font-size:48px;
color:#38bdf8;
}

.relogio{
font-size:32px;
color:#fbbf24;
}

.grid{
display:grid;
grid-template-columns:1fr 1fr;
gap:30px;
}

.coluna{
display:flex;
flex-direction:column;
gap:20px;
}

/* LIDER */

.leader{
background:#111827;
padding:25px;
border-radius:12px;
text-align:center;
}

.leaderNome{
font-size:42px;
font-weight:bold;
color:#fbbf24;
}

.leaderStats{
font-size:28px;
color:#4ade80;
}

/* ULTIMOS */

.ultimos{
background:#111827;
padding:20px;
border-radius:12px;
}

.ultimo{
display:grid;
grid-template-columns:1fr 80px 80px 120px;
font-size:22px;
padding:8px 0;
border-bottom:1px solid #1f2937;
}

.rank{
font-weight:bold;
text-align:center;
}

.rank.subiu{
color:#22c55e;
}

.rank.desceu{
color:#ef4444;
}

.rank.novo{
color:#38bdf8;
}

/* RANKING */

.ranking{
background:#111827;
padding:20px;
border-radius:12px;
}

.linha{
display:grid;
grid-template-columns:80px 1fr 100px 100px;
align-items:center;
font-size:26px;
padding:10px 0;
border-bottom:1px solid #1f2937;
}

.pos{
font-size:32px;
}

.nome{
font-weight:bold;
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

`}</style>

</div>

)

}
