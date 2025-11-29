import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    if (!username || !password)
      return new Response(JSON.stringify({ success: false, error: "Preencha todos os campos" }), { status: 400 });

    // Procura por username OU email
    const { data: users, error } = await supabase
      .from("users")
      .select("*")
      .or(`username.eq.${username},email.eq.${username}`)
      .single();

    if (error || !user)
      return new Response(JSON.stringify({ success: false, error: "Usuário não encontrado" }), { status: 404 });

    // Confere senha
    const isValid = bcrypt.compareSync(password, user.password_hash);
    if (!isValid)
      return new Response(JSON.stringify({ success: false, error: "Senha incorreta" }), { status: 401 });

    // Remove info sensível
    delete user.password_hash;

    return new Response(JSON.stringify({ success: true, user }), { status: 200 });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
  }
}
