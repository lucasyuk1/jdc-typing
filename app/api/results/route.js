import { supabase } from "@/lib/supabase";

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      usuario_id,   // deve ser UUID
      username,
      turma,
      wpm,
      accuracy,
      tempo_segundos
    } = body;

    const { error } = await supabase
      .from("results")   // nome da tabela
      .insert({
        usuario_id,
        username,
        turma,
        wpm,
        accuracy,
        tempo_segundos,
        created_at: new Date().toISOString()
      });

    if (error)
      return new Response(JSON.stringify({ success: false, error: error.message }), { status: 400 });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: String(err) }), { status: 500 });
  }
}
