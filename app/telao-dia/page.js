"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";

export default function TelaoDia(){

const [ranking,setRanking] = useState([]);
const [ultimos,setUltimos] = useState([]);
const [lider,setLider] = useState(null);
const [alerta,setAlerta] = useState(null);
const [testesHoje,setTestesHoje] = useState(0);
const [dataSelecionada,setDataSelecionada] = useState(
new Date().toISOString().slice(0,10)
);

const top3Anterior = useRef([]);

function formatarDataHora(dataISO){

if(!dataISO) return "";

const dia = dataISO.slice(8,10);
const mes = dataISO.slice(5,7);
const hora = dataISO.slice(11,16);

return `${mes}/${dia} ${hora}`;

}

async function carregarDados(){

const inicio = `${dataSelecionada}T00:00:00`;
const fim = `${dataSelecionada}T23:59:59`;

/* RESULTADOS DO DIA */

const { data: dataDia } = await supabase
.from("results")
.select("*")
.gte("created_at",inicio)
.lte("created_at",fim)
.order("created_at",{ascending:false});

/* RESULTADOS GERAIS */

const { data: dataGeral } = await supabase
.from("results")
.select("*");

if(!dataDia || !dataGeral) return;

/* FILTRO */

const filtro = r =>
r.username !== "larbak" &&
r.turma &&
!r.turma.toLowerCase().includes("prof");

const hoje = dataDia.filter(filtro);
const geral = dataGeral.filter(filtro);

setTestesHoje(hoje.length);

/* RANKING GERAL */

const mapaGeral = {};

geral.forEach(r=>{

const atual = mapaGeral[r.username];

if(!atual){
mapaGeral[r.username] = r;
return;
}

if(
r.wpm > atual.wpm ||
(r.wpm === atual.wpm && r.accuracy > atual.accuracy)
){
mapaGeral[r.username] = r;
}

});

const rankingGeral = Object.values(mapaGeral)
.sort((a,b)=>{
if(b.wpm !== a.wpm) return b.wpm - a.wpm;
return b.accuracy - a.accuracy;
});

/* RANKING DO DIA */

const mapaDia = {};

hoje.forEach(r=>{

const atual = mapaDia[r.username];

if(!atual){
mapaDia[r.username] = r;
return;
}

if(
r.wpm > atual.wpm ||
(r.wpm === atual.wpm && r.accuracy > atual.accuracy)
){
mapaDia[r.username] = r;
}

});

const rankingDia = Object.values(mapaDia)
.sort((a,b)=>{
if(b.wpm !== a.wpm) return b.wpm - a.wpm;
return b.accuracy - a.accuracy;
});

const top = rankingDia.slice(0,10);

/* ÚLTIMOS RESULTADOS */

const ultimosComPosicao = hoje
.slice(0,8)
.map(r=>{

const pos = rankingGeral.findIndex(
p=>p.username === r.username
);

return{
...r,
posicao: pos >=0 ? pos+1 : "-",
hora: formatarDataHora(r.created_at)
}

});

/* ALERTA TOP 3 */

const top3Atual = top.slice(0,3).map(r=>r.username);

const novoTop3 = top3Atual.find(
u => !top3Anterior.current.includes(u)
);

if(novoTop3){

const aluno = top.find(r=>r.username===novoTop3);

setAlerta({
nome: aluno.fullname || aluno.username,
turma: aluno.turma,
pos: top3Atual.indexOf(novoTop3)+1
});

setTimeout(()=>setAlerta(null),5000);

}

top3Anterior.current = top3Atual;

setRanking(top);
setUltimos(ultimosComPosicao);
setLider(top[0]);

}

useEffect(()=>{

carregarDados();

const interval = setInterval(()=>{
carregarDados();
},5000);

return ()=>clearInterval(interval);

},[dataSelecionada]);

function medalha(i){
if(i===0) return "🥇";
if(i===1) return "🥈";
if(i===2) return "🥉";
return `${i+1}º`;
}

return(

<div style={{
background:"#0f172a",
color:"white",
minHeight:"100vh",
width:"100vw",
padding:"40px",
boxSizing:"border-box",
fontFamily:"Inter,system-ui,sans-serif"
}}>

<style>{`

.grid{
display:grid;
grid-template-columns:1fr 1.5fr;
gap:40px;
}

.rank{
transition:all .4s;
}

.rank:hover{
transform:scale(1.02);
}

.top3{
box-shadow:0 0 20px gold;
}

.alerta{
position:fixed;
top:0;
left:0;
width:100%;
height:100%;
background:rgba(0,0,0,0.9);
display:flex;
flex-direction:column;
align-items:center;
justify-content:center;
z-index:999;
}

.alerta h1{
font-size:80px;
color:gold;
}

.alerta h2{
font-size:70px;
font-weight:800;
}

.alerta p{
font-size:40px;
}

.hora{
font-size:16px;
opacity:.6;
margin-left:10px;
}

.stats{
font-size:24px;
opacity:.8;
margin-bottom:20px;
}

.titulo{
font-size:46px;
font-weight:800;
margin-bottom:10px;
}

.filtro{
margin-bottom:20px;
font-size:20px;
}

`}</style>

{alerta && (

<div className="alerta">

<h1>🔥 NOVO TOP 3 DO DIA</h1>

<h2>{alerta.nome}</h2>

<p>{alerta.pos}º lugar • {alerta.turma}</p>

</div>

)}

<div className="titulo">
📅 Ranking de Digitação — Dia
</div>

<div className="filtro">

Selecionar dia:{" "}

<input
type="date"
placeholder="MM/DD/YYYY"
value={dataSelecionada}
onChange={(e)=>setDataSelecionada(e.target.value)}
style={{
fontSize:"18px",
padding:"6px"
}}
/>

</div>

<div className="stats">
⚡ {testesHoje} testes neste dia
</div>

<div className="grid">

<div>

{lider && (

<div style={{
background:"#1e293b",
padding:"30px",
borderRadius:"16px",
marginBottom:"30px",
border:"3px solid gold",
textAlign:"center"
}}>

<div style={{fontSize:"28px",opacity:.8}}>
🏆 Líder do Dia
</div>

<div style={{
fontSize:"60px",
fontWeight:"800"
}}>
{lider.fullname || lider.username}
</div>

<div style={{
fontSize:"36px",
color:"#22c55e"
}}>
{lider.wpm} WPM • 🎯 {lider.accuracy}%
</div>

</div>

)}

<h2 style={{fontSize:"36px",marginBottom:"15px"}}>
⏱ Últimos Resultados
</h2>

{ultimos.map((r,i)=>(

<div key={i} style={{
display:"flex",
justifyContent:"space-between",
padding:"14px",
background:"#1e293b",
borderRadius:"10px",
marginBottom:"10px",
fontSize:"22px"
}}>

<div>

<b>#{r.posicao}</b>{" "}
{r.fullname || r.username}

<span className="hora">
{r.hora}
</span>

</div>

<div>
{r.wpm} WPM • 🎯 {r.accuracy}%
</div>

</div>

))}

</div>

<div>

<h2 style={{fontSize:"42px",marginBottom:"20px"}}>
🏆 Top 10 do Dia
</h2>

{ranking.map((r,i)=>(

<div
key={r.username}
className={`rank ${i<3 ? "top3":""}`}
style={{
padding:"18px",
marginBottom:"12px",
borderRadius:"14px",
fontSize:"26px",
background:
i===0 ? "#78350f":
i===1 ? "#334155":
i===2 ? "#92400e":
"#1e293b"
}}
>

<div style={{
display:"flex",
justifyContent:"space-between"
}}>

<div style={{
display:"flex",
gap:"12px",
alignItems:"center"
}}>

<span style={{fontSize:"30px"}}>
{medalha(i)}
</span>

<span style={{fontWeight:"700"}}>
{r.fullname || r.username}
</span>

<span style={{opacity:.7}}>
({r.turma})
</span>

</div>

<div>
{r.wpm} WPM • 🎯 {r.accuracy}%
</div>

</div>

</div>

))}

</div>

</div>

</div>

);

}
