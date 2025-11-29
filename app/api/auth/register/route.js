
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const body = await req.json();
    const { username, email, idade, turma, password } = body;
    const hash = bcrypt.hashSync(password, 10);
    const { error } = await supabase.from('users').insert({ username, email, idade: Number(idade), turma, password_hash: hash });
    if (error) return new Response(JSON.stringify({ success:false, error: error.message }), { status:400 });
    return new Response(JSON.stringify({ success:true }), { status:200 });
  } catch (err) {
    return new Response(JSON.stringify({ success:false, error: String(err) }), { status:500 });
  }
}
