import { supabase } from "@/lib/supabase";

/* =========================
   BUSCAR RESULTADOS
========================= */

export async function GET() {

  const { data, error } = await supabase
    .from("results")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10000);

  if (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 }
    );
  }

  return new Response(
    JSON.stringify(data),
    { status: 200 }
  );
}


/* =========================
   INSERIR RESULTADO
========================= */

export async function POST(req) {
try {

const body = await req.json();

const {
  usuario_id,
  username,
  fullname,
  turma,
  wpm,
  accuracy,
  tempo_segundos
} = body;

/* horário Brasil */
const created_at = new Date().toLocaleString("pt-BR", {
  timeZone: "America/Sao_Paulo"
});

const { error } = await supabase
  .from("results")
  .insert({
    usuario_id,
    username,
    fullname,
    turma,
    wpm,
    accuracy,
    tempo_segundos,
    created_at
  });

if (error)
  return new Response(
    JSON.stringify({ success: false, error: error.message }),
    { status: 400 }
  );

return new Response(
  JSON.stringify({ success: true }),
  { status: 200 }
);

} catch (err) {

return new Response(
  JSON.stringify({ success: false, error: String(err) }),
  { status: 500 }
);

}
}


/* =========================
   DELETAR RESULTADO
========================= */

export async function DELETE(req) {
try {

const { id } = await req.json();

const { error } = await supabase
  .from("results")
  .delete()
  .eq("id", id);

if (error)
  return new Response(
    JSON.stringify({ success: false, error: error.message }),
    { status: 400 }
  );

return new Response(
  JSON.stringify({ success: true }),
  { status: 200 }
);

} catch (err) {

return new Response(
  JSON.stringify({ success: false, error: String(err) }),
  { status: 500 }
);

}
}
