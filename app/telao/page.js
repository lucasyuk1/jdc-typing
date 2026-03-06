"use client";

import { useEffect, useState } from "react";

export default function TelaoUltra(){

const [rows,setRows] = useState([]);
const [ultimos,setUltimos] = useState([]);
const [leader,setLeader] = useState(null);
const [hora,setHora] = useState("");

async function load(){

try{

const res = await fetch("/api/results",{cache:"no-store"});
const json = await res.json();
const data = json.data || json;

if(!Array.isArray(data)) return;

const hoje = new Date().toLocaleDateString("en-CA");

const filtrado = data.filter(r =>
r.username !== "larbak" &&
r.created_at?.slice(0,10) === hoje
);

const recentes=[...filtrado]
.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));

setRows(recentes);
setUltimos(recentes.slice(0,5));

const ranking=[...recentes].sort((a,b)=>b.wpm-a.wpm);

if(ranking.length){
setLeader(ranking[0]);
}

}catch(e){
console.error("Erro carregando telão:",e);
}

}

useEffect(()=>{

load();
const interval=setInterval(load,3000);
return()=>clearInterval(interval);

},[]);

useEffect(()=>{

const rel=setInterval(()=>{
setHora(new Date().toLocaleTimeString("pt-BR"));
},1000);

return()=>clearInterval(rel);

},[]);


/* ranking do dia */

const rankingDia=[...rows]
.sort((a,b)=>b.wpm-a.wpm)
.slice(0,10);


/* ranking geral por média */

function rankingGeral(){

const medias={};

rows.forEach(r=>{
if(!medias[r.username]) medias[r.username]=[];
medias[r.username].push(r.wpm);
});

const lista=Object.entries(medias).map(([nome,valores])=>{

const media=valores.reduce((a,b)=>a+b,0)/valores.length;

return{
nome,
media
};

});

return lista.sort((a,b)=>b.media-a.media);

}

const geral = rankingGeral();

function posicaoGeral(nome){

return geral.findIndex(p=>p.nome===nome)+1;

}


return(

<div className="telao">

<header className="header">

<h1>🏆 Ranking de Digitação</h1>

<div className="relogio">
{hora}
</div>

</header>


<div className="grid">

{/* ESQUERDA */}

<div className="coluna">

{leader &&(

<div className="leader">

🔥 LÍDER DO DIA

<div className="leaderNome">
{leader.username}
</div>

<div className="leaderStats">
{leader.wpm} WPM • {leader.accuracy}%
</div>

</div>

)}

<div className="ultimos">

<h2>⚡ Últimos Resultados</h2>

{ultimos.map((u,i)=>(

<div key={i} className="ultimo">

<span className="nome">{u.username}</span>

<span className="stats">
{u.wpm} WPM • {u.accuracy}%
</span>

<span className="hora">
{new Date(u.created_at).toLocaleTimeString("pt-BR")}
</span>

</div>

))}

</div>

</div>


{/* DIREITA */}

<div className="coluna">

<div className="ranking">

<h2>📊 Ranking do Dia</h2>

{rankingDia.map((r,i)=>{

const medalha =
i===0?"🥇":
i===1?"🥈":
i===2?"🥉":
`#${i+1}`;

const geralPos = posicaoGeral(r.username);

return(

<div key={r.id} className="linha">

<div className="pos">
{medalha}
</div>

<div className="nome">
{r.username}
</div>

<div className="stats">
{r.wpm} WPM • {r.accuracy}%
</div>

<div className="geral">
GR #{geralPos}
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
height:calc(100vh - 120px);
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

.ultimos h2{
margin-bottom:10px;
}

.ultimo{
display:grid;
grid-template-columns:1fr 200px 120px;
padding:10px 0;
font-size:22px;
border-bottom:1px solid #1f2937;
}

/* RANKING */

.ranking{
background:#111827;
padding:20px;
border-radius:12px;
flex:1;
}

.linha{
display:grid;
grid-template-columns:80px 1fr 220px 120px;
align-items:center;
font-size:26px;
padding:12px 0;
border-bottom:1px solid #1f2937;
}

.pos{
font-size:32px;
}

.nome{
font-weight:bold;
}

.stats{
color:#4ade80;
}

.geral{
color:#60a5fa;
font-weight:bold;
}

`}</style>

</div>

)

}
