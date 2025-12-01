import { supabase } from "@/lib/supabase"; // mesma instância do supabase que você já usa

export async function GET() {
  try {
    const { data, error } = await supabase.from("turma").select("*");

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, turmas: data }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
  }
}
