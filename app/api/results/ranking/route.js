import { supabase } from "@/lib/supabase";

export async function POST(req) {
  try {
    const body = await req.json();
    const mode = body.mode || "geral"; // modos: pessoal, turma, geral

    // Busca todos os resultados junto com o usuário
    const { data, error } = await supabase
      .from("results")
      .select("*, users(username, turma, fullname)")
      .limit(1000);

    if (error) {
      console.error("Supabase error:", error);
      return new Response(JSON.stringify({ success: false, data: [] }), { status: 200 });
    }

    let rows = data.map(r => ({
      id: r.id,
      usuario_id: r.usuario_id ?? r.user_id,
      username: r.users?.username || "",
      fullname: r.users?.fullname || r.users?.username || "",
      turma: r.users?.turma || "",
      wpm: r.wpm ?? 0,
      accuracy: r.accuracy ?? 0,
      created_at: r.created_at
    }));

    // ----------- MODO PESSOAL -----------
    if (mode === "pessoal" && body.usuario_id) {
      rows = rows.filter(r => String(r.usuario_id) === String(body.usuario_id));

      // Ordenação com desempate
      rows.sort((a, b) => {
        if (b.wpm !== a.wpm) return b.wpm - a.wpm;
        return b.accuracy - a.accuracy; // desempate por precisão
      });

      console.log(`Ranking pessoal: ${rows.length} resultados encontrados`);
      return new Response(JSON.stringify({ success: true, data: rows }), { status: 200 });
    }

    // ----------- MODO TURMA -----------
    if (mode === "turma" && body.turma) {
      rows = rows.filter(r => r.turma === body.turma);
    }

    // ----------- MODO GERAL OU TURMA AGREGADA -----------
    const aggregated = aggregateByUser(rows);

    console.log(`${mode} ranking: ${aggregated.length} usuários agregados`);

    return new Response(JSON.stringify({ success: true, data: aggregated }), { status: 200 });

  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ success: false, data: [] }), { status: 500 });
  }
}

// Função para agregar resultados por usuário (média WPM e precisão)
function aggregateByUser(rows) {
  const grouped = rows.reduce((acc, r) => {
    if (!acc[r.usuario_id]) {
      acc[r.usuario_id] = {
        usuario_id: r.usuario_id,
        username: r.username,
        fullname: r.fullname,
        turma: r.turma,
        totalWPM: r.wpm,
        totalAcc: r.accuracy,
        count: 1,
        created_at: r.created_at
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

  let resultados = Object.values(grouped).map(u => ({
    usuario_id: u.usuario_id,
    username: u.username,
    fullname: u.fullname,
    turma: u.turma,
    wpm: Math.round(u.totalWPM / u.count),
    accuracy: Math.round(u.totalAcc / u.count),
    created_at: u.created_at
  }));

  // Ordenar por WPM e desempatar por precisão
  resultados.sort((a, b) => {
    if (b.wpm !== a.wpm) return b.wpm - a.wpm;
    return b.accuracy - a.accuracy;
  });

  // Atribui ranking final
  resultados = resultados.map((r, index) => ({ ...r, ranking: index + 1 }));

  return resultados;
}
