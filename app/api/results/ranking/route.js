import { supabase } from "@/lib/supabase";

export async function POST(req) {
  try {
    const { mode, fullname, turma } = await req.json();

    let query = supabase.from("results").select("*");

    if (mode === "turma") {
      query = query.eq("turma", turma);
    } else if (mode === "pessoal") {
      query = query.eq("fullname", fullname);
    }

    query = query.order("wpm", { ascending: false }).limit(50);

    const { data, error } = await query;
    if (error) throw error;

    return new Response(JSON.stringify({ success: true, data }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: String(err) }), { status: 500 });
  }
}
