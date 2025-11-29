
import { supabase } from "@/lib/supabase";

export async function POST(req) {
  try {
    const body = await req.json();
    const { user_id, wpm, accuracy, errors, wordsTyped, tempo } = body;
    const { error } = await supabase.from('results').insert({
      user_id, wpm, accuracy, erros: errors, palavras: wordsTyped, tempo_segundos: tempo
    });
    if (error) return new Response(JSON.stringify({ success:false, error: error.message }), { status:400 });
    return new Response(JSON.stringify({ success:true }), { status:200 });
  } catch (err) {
    return new Response(JSON.stringify({ success:false, error:String(err) }), { status:500 });
  }
}

export async function GET() {
  // list recent (for admin)
  const { data, error } = await supabase.from('results').select('*, users(username)').order('created_at', { ascending:false }).limit(200);
  if (error) return new Response(JSON.stringify([]), { status:200 });
  // map to include username
  const mapped = data.map(r => ({ ...r, username: r.users?.username }));
  return new Response(JSON.stringify(mapped), { status:200 });
}

export async function DELETE(req) {
  try {
    const body = await req.json();
    const { id } = body;
    const { error } = await supabase.from('results').delete().eq('id', id);
    if (error) return new Response(JSON.stringify({ success:false, error: error.message }), { status:400 });
    return new Response(JSON.stringify({ success:true }), { status:200 });
  } catch (err) {
    return new Response(JSON.stringify({ success:false, error: String(err) }), { status:500 });
  }
}
