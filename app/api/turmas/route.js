import { supabase } from "@/lib/supabase";

export async function GET() {
try {
const { data, error } = await supabase
.from("turma")
.select("*");

if (error) {
  return new Response(
    JSON.stringify({ success: false, error: error.message }),
    { status: 400 }
  );
}

// Ordena turmas pelo número inicial (6A, 6B, 7A, ...)
const sorted = data.sort((a, b) => {
  const regex = /^(\d+)/;
  const numA = parseInt(a.nome.match(regex)?.[1] || "0");
  const numB = parseInt(b.nome.match(regex)?.[1] || "0");
  if (numA !== numB) return numA - numB;
  return a.nome.localeCompare(b.nome);
});

return new Response(JSON.stringify({ success: true, turmas: sorted }), {
  status: 200,
});

} catch (err) {
return new Response(JSON.stringify({ success: false, error: err.message }), {
status: 500,
});
}
}
