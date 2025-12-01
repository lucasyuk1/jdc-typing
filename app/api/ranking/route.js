import { supabase } from "@/lib/supabase";

export async function POST(req) {
  try {
    const body = await req.json();
    const mode = body.mode || "geral"; // agora será usado

    const { data, error } = await supabase
      .from("results")
      .select("*, users(username, turma, fullname)")
      .order("wpm", { ascending: true })
      .limit(1000);

    if (error) {
      console.error("Supabase error:", error);
      return new Response(
        JSON.stringify({ success: false, data: [] }),
        { status: 200 }
      );
    }

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
    if (mode === "pessoal" && body.usuario_id) {
      rows = rows.filter(r =>
        String(r.usuario_id) === String(body.usuario_id)
      );
    } else if (mode === "turma" && body.turma) {
      rows = rows.filter(r => r.turma === body.turma);
    }

    return new Response(
      JSON.stringify({ success: true, data: rows }),
      { status: 200 }
    );

  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ success: false, data: [] }),
      { status: 500 }
    );
  }
}
