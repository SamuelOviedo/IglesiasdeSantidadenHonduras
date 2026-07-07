import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Faltan las variables de entorno de Supabase. Verifica tu archivo .env",
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);

export const getZonas = async () => {
  const { data, error } = await supabase
    .from("zonas")
    .select("*")
    .order("nombre");
  if (error) throw error;
  return data;
};

export const getIglesias = async (zonaId) => {
  const { data, error } = await supabase
    .from("iglesias")
    .select("*")
    .eq("zona_id", zonaId)
    .order("nombre");
  if (error) throw error;
  return data;
};

export const createIglesia = async (data) => {
  const { data: result, error } = await supabase
    .from("iglesias")
    .insert([data])
    .select()
    .single();
  if (error) throw error;
  return result;
};

export const updateIglesia = async (id, data) => {
  const { error } = await supabase.from("iglesias").update(data).eq("id", id);
  if (error) throw error;
};

export const deleteIglesia = async (id) => {
  const { error } = await supabase.from("iglesias").delete().eq("id", id);
  if (error) throw error;
};
