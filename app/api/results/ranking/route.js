import { supabase } from "@/lib/supabase";

export async function POST(req) {
  try {
    const { mode, usuario_id, turma } = await req.json();

    // SELECT seguro com alias para FK
    let query = supabase
      .from("results")
      .select(
        `id, usuario_id, wpm, accuracy, created_at,
         users:usuario_id (username, fullname, turma)`
      )
      .order("created_at", { ascending: false })
      .limit(5000);

    const { data, error } = await query;
    if (error) throw error;

    // Map seguro
    let rows = data.map((r) => ({
      id: r.id,
      usuario_id: r.usuario_id,
      fullname: r.users?.fullname || r.users?.username || "Sem nome",
      username: r.users?.username || "user",
      turma: r.users?.turma || "",
      wpm: Number(r.wpm) || 0,
      accuracy: Number(r.accuracy) || 0,
      created_at: r.created_at,
    }));

    // -----------------------------------------------------
    // MODO PESSOAL
    // -----------------------------------------------------
    if (mode === "pessoal" && usuario_id) {
      let pessoal = rows
        .filter((r) => String(r.usuario_id) === String(usuario_id))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      return new Response(
        JSON.stringify({ success: true, data: pessoal }),
        { status: 200 }
      );
    }

    // -----------------------------------------------------
    // Função de agrupamento reutilizada
    // -----------------------------------------------------
    function agrupar(lista) {
      const grouped = lista.reduce((acc, r) => {
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

      return Object.values(grouped).map((u) => ({
        usuario_id: u.usuario_id,
        fullname: u.fullname,
        turma: u.turma,
        wpm: Math.round(u.totalWPM / u.count),
        accuracy: Math.round(u.totalAcc / u.count),
        created_at: u.created_at,
      }));
    }

    // -----------------------------------------------------
    // MODO TURMA
    // -----------------------------------------------------
    if (mode === "turma" && turma) {
      const filtrado = rows.filter((r) => r.turma === turma);
      const agrupado = agrupar(filtrado).sort((a, b) => b.wpm - a.wpm);

      return new Response(
        JSON.stringify({ success: true, data: agrupado }),
        { status: 200 }
      );
    }

    // -----------------------------------------------------
    // MODO GERAL
    // -----------------------------------------------------
    const geral = agrupar(rows).sort((a, b) => b.wpm - a.wpm);

    return new Response(
      JSON.stringify({ success: true, data: geral }),
      { status: 200 }
    );

  } catch (err) {
    console.error("Erro no ranking:", err);
    return new Response(
      JSON.stringify({ success: false, data: [] }),
      { status: 500 }
    );
  }
}
