import { supabase } from "@/lib/supabase";

export async function POST(req) {
try {
const body = await req.json();
const mode = body.mode || "geral"; // pode ser 'geral', 'turma', 'pessoal'

const { data, error } = await supabase
  .from("results")
  .select("*, users(username, turma, fullname)")
  .order("created_at", { ascending: false })
  .limit(1000); // aumenta limite para pegar mais resultados

if (error) {
  console.error("Supabase error:", error);
  return new Response(JSON.stringify({ success: false, data: [] }), { status: 200 });
}

// Mapeia os dados para o formato esperado pelo frontend
const rows = data.map(r => ({
  id: r.id,
  usuario_id: r.user_id,
  username: r.users?.username || "",
  fullname: r.users?.fullname || r.users?.username || "",
  turma: r.users?.turma || "",
  wpm: r.wpm,
  accuracy: r.accuracy ?? 0,
  created_at: r.created_at
}));

return new Response(JSON.stringify({ success: true, data: rows }), { status: 200 });

} catch (err) {
console.error("Error:", err);
return new Response(JSON.stringify({ success: false, data: [] }), { status: 500 });
}
}
