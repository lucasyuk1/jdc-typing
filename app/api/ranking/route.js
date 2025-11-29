
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from('results')
    .select('*, users(username, turma)')
    .order('wpm', { ascending:false })
    .limit(100);
  if (error) return new Response(JSON.stringify([]), { status:200 });
  const rows = data.map(r => ({
    id: r.id,
    user_id: r.user_id,
    username: r.users?.username,
    turma: r.users?.turma,
    wpm: r.wpm,
    created_at: r.created_at
  }));
  return new Response(JSON.stringify(rows), { status:200 });
}
