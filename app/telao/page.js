"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";

export default function Telao() {

const [ranking, setRanking] = useState([]);
const [ultimos, setUltimos] = useState([]);
const [lider, setLider] = useState(null);
const [alerta, setAlerta] = useState(null);

const top3Anterior = useRef([]);

function formatarHora(dataISO) {

if (!dataISO) return "";

const data = new Date(dataISO);

return data.toLocaleTimeString("pt-BR", {
hour: "2-digit",
minute: "2-digit"
});

}

function barraPrecisao(acc){

let cor = "#22c55e";

if(acc < 95) cor = "#facc15";
if(acc < 90) cor = "#ef4444";

return {width:`${acc}%`,background:cor}

}

async function carregarDados(){

const { data } = await supabase
.from("results")
.select("*")
.order("created_at",{ascending:false});

if(!data) return;

const filtrado = data.filter(r =>
r.username !== "larbak" &&
r.turma &&
!r.turma.toLowerCase().includes("prof")
);

const mapa = {};

filtrado.forEach(r=>{

const atual = mapa[r.username];

if(!atual){
mapa[r.username] = r;
return;
}

if(
r.wpm > atual.wpm ||
(r.wpm === atual.wpm && r.accuracy > atual.accuracy)
){
mapa[r.username] = r;
}

});

const rankingCompleto = Object.values(mapa)
.sort((a,b)=>{
if(b.wpm !== a.wpm) return b.wpm - a.wpm;
return b.accuracy - a.accuracy;
});

const top = rankingCompleto.slice(0,10);

const ultimosComPosicao = filtrado
.slice(0,8)
.map(r=>{

const pos = rankingCompleto.findIndex(
p=>p.username === r.username
);

return{
...r,
posicao: pos >= 0 ? pos + 1 : "-",
hora: formatarHora(r.created_at)
}

});

const top3Atual = top.slice(0,3).map(r=>r.username);

const novoTop3 = top3Atual.find(
u=>!top3Anterior.current.includes(u)
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
},3000);

return ()=>clearInterval(interval);

},[]);

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
transition:all .5s;
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

.barra-bg{
width:120px;
height:10px;
background:#334155;
border-radius:10px;
overflow:hidden;
}

.barra{
height:100%;
}

.hora{
font-size:14px;
opacity:.6;
margin-left:10px;
}

`}</style>

{alerta && (

<div className="alerta">

<h1>🔥 NOVO TOP 3</h1>

<h2>{alerta.nome}</h2>

<p>{alerta.pos}º lugar • {alerta.turma}</p>

</div>

)}

<div className="grid">

{/* ESQUERDA */}

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
🏆 Líder do Ranking
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

<div style={{
marginTop:"10px",
display:"flex",
justifyContent:"center"
}}>
<div className="barra-bg">
<div className="barra" style={barraPrecisao(lider.accuracy)}></div>
</div>
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

<span className="hora">{r.hora}</span>

</div>

<div style={{
display:"flex",
alignItems:"center",
gap:"12px"
}}>

<span>
{r.wpm} WPM
</span>

<span>
🎯 {r.accuracy}%
</span>

<div className="barra-bg">
<div className="barra" style={barraPrecisao(r.accuracy)}></div>
</div>

</div>

</div>

))}

</div>

{/* DIREITA */}

<div>

<h2 style={{fontSize:"42px",marginBottom:"20px"}}>
🏆 Top 10
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
justifyContent:"space-between",
alignItems:"center"
}}>

<div style={{
display:"flex",
alignItems:"center",
gap:"12px"
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

<div style={{
display:"flex",
alignItems:"center",
gap:"14px"
}}>

<span>
{r.wpm} WPM
</span>

<span>
🎯 {r.accuracy}%
</span>

<div className="barra-bg">
<div className="barra" style={barraPrecisao(r.accuracy)}></div>
</div>

</div>

</div>

</div>

))}

</div>

</div>

</div>

);

}
