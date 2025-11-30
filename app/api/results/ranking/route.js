import { supabase } from "@/lib/supabase";

export async function POST(req) {
try {
const { mode, usuario_id, fullname, turma } = await req.json();

// Consulta results junto com dados do usuário
let query = supabase
  .from("results")
  .select("id, user_id, wpm, accuracy, created_at, users(username, fullname, turma)")
  .order("created_at", { ascending: false })
  .limit(1000);

const { data, error } = await query;
if (error) throw error;

// Mapeia os dados para incluir fullname, username e turma
let rows = data.map(r => ({
  id: r.id,
  usuario_id: r.user_id,
  username: r.users?.username || "",
  fullname: r.users?.fullname || r.users?.username || "",
  turma: r.users?.turma || "",
  wpm: r.wpm,
  accuracy: r.accuracy ?? 0,
  created_at: r.created_at
}));

// Aplica filtros de acordo com o modo
if (mode === "pessoal" && usuario_id) {
  rows = rows.filter(r => String(r.usuario_id) === String(usuario_id));
} else if (mode === "turma" && turma) {
  rows = rows.filter(r => r.turma === turma);
} else if (mode === "geral") {
  // Agrupa por usuário e calcula média
  const grouped = rows.reduce((acc, r) => {
    if (!acc[r.usuario_id]) {
      acc[r.usuario_id] = {
        usuario_id: r.usuario_id,
        fullname: r.fullname,
        turma: r.turma,
        totalWPM: r.wpm,
        totalAcc: r.accuracy,
        count: 1,
        created_at: r.created_at,
      };
    } else {
      acc[r.usuario_id].totalWPM += r.wpm;
      acc[r.usuario_id].totalAcc += r.accuracy;
      acc[r.usuario_id].count += 1;
      if (new Date(r.created_at) > new Date(acc[r.usuario_id].created_at)) {
        acc[r.usuario_id].created_at = r.created_at;
      }
    }
    return acc;
  }, {});

  rows = Object.values(grouped).map(u => ({
    usuario_id: u.usuario_id,
    fullname: u.fullname,
    turma: u.turma,
    wpm: Math.round(u.totalWPM / u.count),
    accuracy: Math.round(u.totalAcc / u.count),
    created_at: u.created_at,
  }));

  // Ordena pelo WPM médio
  rows.sort((a, b) => b.wpm - a.wpm);
}

return new Response(JSON.stringify({ success: true, data: rows }), { status: 200 });

} catch (err) {
console.error("Erro no ranking:", err);
return new Response(JSON.stringify({ success: false, data: [] }), { status: 500 });
}
}
