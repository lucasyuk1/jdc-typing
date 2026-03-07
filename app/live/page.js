"use client";

import { useEffect, useState, useRef } from "react";
import Chart from "chart.js/auto";

export default function LivePage(){

const [rows,setRows] = useState([]);
const [turmaFiltro,setTurmaFiltro] = useState("TODAS");
const [stats,setStats] = useState({
mediaWPM:0,
melhorWPM:0,
mediaAccuracy:0,
total:0
});

const chartRef = useRef(null);
const chartInstance = useRef(null);


async function load(){

try{

const res = await fetch("/api/results",{
cache:"no-store"
});

const json = await res.json();
const data = json.data || json;

if(!Array.isArray(data)){
console.log("API retornou algo inválido:",json);
return;
}

setRows(data);

calcularStats(data);

}catch(err){
console.error("Erro carregando resultados:",err);
}

}


function calcularStats(data){

if(!data.length) return;

const somaWPM = data.reduce((a,b)=>a+b.wpm,0);
const somaAcc = data.reduce((a,b)=>a+b.accuracy,0);
const melhor = Math.max(...data.map(r=>r.wpm));

setStats({
mediaWPM:Math.round(somaWPM/data.length),
mediaAccuracy:Math.round(somaAcc/data.length),
melhorWPM:melhor,
total:data.length
});

}


useEffect(()=>{

load();

const interval = setInterval(load,3000);

return ()=>clearInterval(interval);

},[]);



/* ----------- GRÁFICO ----------- */

useEffect(()=>{

if(!rows.length) return;

const ultimos = [...rows]
.sort((a,b)=>new Date(a.created_at)-new Date(b.created_at))
.slice(-20);

const labels = ultimos.map(r=>r.username);
const dados = ultimos.map(r=>r.wpm);

if(chartInstance.current){
chartInstance.current.destroy();
}

chartInstance.current = new Chart(chartRef.current,{
type:"bar",
data:{
labels,
datasets:[
{
label:"WPM",
data:dados
}
]
},
options:{
plugins:{
legend:{display:false}
},
scales:{
y:{beginAtZero:true}
}
}
});

},[rows]);



async function del(id){

if(!confirm("Apagar resultado?")) return;

await fetch("/api/results",{
method:"DELETE",
headers:{'Content-Type':'application/json'},
body:JSON.stringify({id})
});

setRows(rows.filter(r=>r.id!==id));

}



/* ----------- FILTROS ----------- */

const turmas = [...new Set(rows.map(r=>r.turma))];

const filtrados = turmaFiltro==="TODAS"
? rows
: rows.filter(r=>r.turma===turmaFiltro);



/* ----------- RANKING ----------- */

const ranking = [...filtrados]
.sort((a,b)=>b.wpm-a.wpm)
.slice(0,10);



return(

<div style={{padding:30,fontFamily:"Arial"}}>

<h1>Painel AO VIVO — Monitoramento da Turma</h1>


{/* BOTÕES */}

<div style={{marginBottom:25,display:"flex",gap:10}}>

<button
onClick={()=>window.open("/telao","_blank")}
style={{
padding:"10px 20px",
fontSize:16,
background:"#111",
color:"#fff",
border:"none",
borderRadius:6,
cursor:"pointer"
}}
>
Abrir Telão
</button>

<button
onClick={()=>window.open("/telao-dia","_blank")}
style={{
padding:"10px 20px",
fontSize:16,
background:"#111",
color:"#fff",
border:"none",
borderRadius:6,
cursor:"pointer"
}}
>
Abrir Ranking Diário
</button>

<button
onClick={()=>load()}
style={{
padding:"10px 20px",
fontSize:16,
background:"#2563eb",
color:"#fff",
border:"none",
borderRadius:6,
cursor:"pointer"
}}
>
Atualizar
</button>

</div>



{/* ESTATÍSTICAS */}

<div style={{
display:"grid",
gridTemplateColumns:"repeat(4,1fr)",
gap:20,
marginBottom:30
}}>

<div style={{background:"#111",color:"#fff",padding:20}}>
<h3>Total de Testes</h3>
<h1>{stats.total}</h1>
</div>

<div style={{background:"#111",color:"#fff",padding:20}}>
<h3>Média WPM</h3>
<h1>{stats.mediaWPM}</h1>
</div>

<div style={{background:"#111",color:"#fff",padding:20}}>
<h3>Melhor WPM</h3>
<h1>{stats.melhorWPM}</h1>
</div>

<div style={{background:"#111",color:"#fff",padding:20}}>
<h3>Média Precisão</h3>
<h1>{stats.mediaAccuracy}%</h1>
</div>

</div>



{/* FILTRO */}

<div style={{marginBottom:20}}>

<select
value={turmaFiltro}
onChange={(e)=>setTurmaFiltro(e.target.value)}
>

<option value="TODAS">Todas as turmas</option>

{turmas.map(t=>(
<option key={t}>{t}</option>
))}

</select>

</div>



{/* GRÁFICO */}

<div style={{marginBottom:40}}>
<h2>Resultados Recentes</h2>
<canvas ref={chartRef}/>
</div>



{/* RANKING */}

<div style={{marginBottom:40}}>

<h2>Ranking ao Vivo</h2>

<table border="1" cellPadding="8" style={{width:"100%"}}>

<thead>
<tr>
<th>#</th>
<th>Aluno</th>
<th>Turma</th>
<th>WPM</th>
<th>Precisão</th>
</tr>
</thead>

<tbody>

{ranking.map((r,i)=>(
<tr key={r.id}>
<td>{i+1}</td>
<td>{r.username}</td>
<td>{r.turma}</td>
<td>{r.wpm}</td>
<td>{r.accuracy}%</td>
</tr>
))}

</tbody>

</table>

</div>



{/* FEED AO VIVO */}

<div>

<h2>Feed em Tempo Real</h2>

<table border="1" cellPadding="8" style={{width:"100%"}}>

<thead>
<tr>
<th>Usuário</th>
<th>Turma</th>
<th>WPM</th>
<th>Precisão</th>
<th>Data</th>
<th>Ações</th>
</tr>
</thead>

<tbody>

{filtrados
.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at))
.slice(0,30)
.map(r=>{

const diffMin=(Date.now()-new Date(r.created_at))/60000;
const travado=diffMin>5;

return(

<tr
key={r.id}
style={{background:travado?"#ffdddd":"transparent"}}
>

<td>{r.username}</td>
<td>{r.turma}</td>
<td>{r.wpm}</td>
<td>{r.accuracy}%</td>
<td>{new Date(r.created_at).toLocaleString("pt-BR")}</td>

<td>
<button onClick={()=>del(r.id)}>
Apagar
</button>
</td>

</tr>

);

})}

</tbody>

</table>

</div>

</div>

);

}
