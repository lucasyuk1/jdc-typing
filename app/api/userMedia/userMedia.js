// /pages/api/userMedia.js

import { supabase } from "@/lib/supabaseClient"; // ajuste caso use outro client

export default async function handler(req, res) {
  const { usuario_id } = req.query;

  if (!usuario_id) return res.status(400).json({ error: "usuario_id é obrigatório" });

  try {
    // Busca todos os resultados do usuário
    const { data, error } = await supabase
      .from("results")
      .select("wpm")
      .eq("usuario_id", usuario_id);

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.json({ media: null });
    }

    const media = data.reduce((acc, r) => acc + r.wpm, 0) / data.length;
    return res.json({ media });
  } catch (err) {
    console.error("Erro ao buscar média:", err);
    return res.status(500).json({ media: null, error: err.message });
  }
}
