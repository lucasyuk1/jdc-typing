import { supabase } from "@/lib/supabase";

export async function POST(req) {
try {
const { mode, fullname, turma } = await req.json();

let query = supabase
  .from("results")
  .select("id, user_id, fullname, turma, wpm, accuracy, created_at");

if (mode === "turma") {
  query = query.eq("turma", turma);
} else if (mode === "pessoal") {
  query = query.eq("fullname", fullname);
}

// Ordena por WPM decrescente
query = query.order("wpm", { ascending: false }).limit(50);

const { data, error } = await query;
if (error) throw error;

// Para o modo geral, agrupamos por usuário e calculamos médias
if (mode === "geral") {
  const grouped = data.reduce((acc, r) => {
    if (!acc[r.user_id]) {
      acc[r.user_id] = {
        usuario_id: r.user_id,
        fullname: r.fullname,
        turma: r.turma,
        totalWPM: r.wpm,
        totalAcc: r.accuracy,
        count: 1,
        created_at: r.created_at,
      };
    } else {
      acc[r.user_id].totalWPM += r.wpm;
      acc[r.user_id].totalAcc += r.accuracy;
      acc[r.user_id].count += 1;
      if (new Date(r.created_at) > new Date(acc[r.user_id].created_at)) {
        acc[r.user_id].created_at = r.created_at;
      }
    }
    return acc;
  }, {});

  const finalData = Object.values(grouped).map(u => ({
    usuario_id: u.usuario_id,
    fullname: u.fullname,
    turma: u.turma,
    wpm: Math.round(u.totalWPM / u.count),
    accuracy: Math.round(u.totalAcc / u.count),
    created_at: u.created_at,
  }));

  return new Response(JSON.stringify({ success: true, data: finalData }), { status: 200 });
}

return new Response(JSON.stringify({ success: true, data }), { status: 200 });

} catch (err) {
console.error(err);
return new Response(JSON.stringify({ success: false, error: String(err) }), { status: 500 });
}
}
