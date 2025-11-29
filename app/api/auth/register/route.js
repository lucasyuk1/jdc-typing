import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { username,fullname, email, idade, turma, password } = await req.json();

    if (!username || !email || !password)
      return new Response(JSON.stringify({ success: false, error: "Campos obrigatórios faltando" }), { status: 400 });

    // Hash da senha
    const password_hash = bcrypt.hashSync(password, 10);

    // Insere no Supabase
    const { error } = await supabase
      .from("users")
      .insert({
        username,
        fullname,
        email,
        idade: Number(idade),
        turma,
        password_hash,
      });

    if (error)
      return new Response(JSON.stringify({ success: false, error: error.message }), { status: 400 });

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
  }
}
