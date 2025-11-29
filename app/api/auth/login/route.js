
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { username, password } = await req.json();
    // try by username or email
    let q = supabase.from('users').select('*').or(`username.eq.${username},email.eq.${username}`).limit(1).maybeSingle();
    const { data, error } = await q;
    if (error) return new Response(JSON.stringify({ success:false, error: error.message }), { status:400 });
    const user = data;
    if (!user) return new Response(JSON.stringify({ success:false, error: 'Usuário não encontrado' }), { status:404 });
    const ok = bcrypt.compareSync(password, user.password_hash);
    if (!ok) return new Response(JSON.stringify({ success:false, error:'Senha incorreta' }), { status:401 });
    // remove sensitive fields
    delete user.password_hash;
    return new Response(JSON.stringify({ success:true, user }), { status:200 });
  } catch (err) {
    return new Response(JSON.stringify({ success:false, error: String(err) }), { status:500 });
  }
}
