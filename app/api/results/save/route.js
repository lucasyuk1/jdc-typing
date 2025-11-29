import { supabase } from "@/lib/supabase";

export async function POST(req) {
  try {
    const body = await req.json();
    const { wpm, username, turma } = body;

    const { error } = await supabase.from("results").insert({
      username,
      turma,
      wpm,
    });

    if (error) return new Response(JSON.stringify({ success: false, error: error.message }), { status: 400 });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: String(err) }), { status: 500 });
  }
}
