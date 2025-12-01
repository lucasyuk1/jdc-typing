import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("turmas")      // tabela correta
      .select("id, turma_name") // selecionar apenas o que precisa
      .order("turma_name", { ascending: true }); // ordena tipo 6A, 6B, 7A...

    if (error) {
      return new Response(JSON.stringify({ success: false, error: error.message }), { status: 400 });
    }

    return new Response(JSON.stringify({ success: true, turmas: data }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
  }
}
