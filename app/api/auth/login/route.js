import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";

export async function POST(req) {
try {
let { username, password } = await req.json();

if (!username || !password) {
  return new Response(JSON.stringify({ success: false, error: "Preencha todos os campos" }), { status: 400 });
}

// Limpa espaços e padroniza para lowercase
username = username.trim().toLowerCase();

// Busca por username ou email ignorando maiúsculas/minúsculas
let { data: user, error } = await supabase
  .from("users")
  .select("*")
  .ilike("username", username)
  .single();

if (!user) {
  const resEmail = await supabase
    .from("users")
    .select("*")
    .ilike("email", username)
    .single();

  user = resEmail.data;
  error = resEmail.error;
}

if (error || !user) {
  return new Response(JSON.stringify({ success: false, error: "Usuário não encontrado" }), { status: 404 });
}

// Confere senha
const isValid = await bcrypt.compare(password, user.password_hash);
if (!isValid) {
  return new Response(JSON.stringify({ success: false, error: "Senha incorreta" }), { status: 401 });
}

// Checagem do ID antes de criar cookie
if (!user?.id) {
  return new Response(JSON.stringify({ success: false, error: "Usuário inválido" }), { status: 500 });
}

// Remove info sensível
delete user.password_hash;

// Cria cookie seguro
const cookie = `user_session=${user.id}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=3600`;

// Retorna resposta com cookie
return new Response(JSON.stringify({ success: true, user }), {
  status: 200,
  headers: {
    "Set-Cookie": cookie,
    "Content-Type": "application/json",
  },
});

} catch (err) {
return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
}
}
