import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://hjsitolcntkqkqpsllti.supabase.co",
  "sb_publishable_9hL1DEWtx_O52G77yF9k3A_cyybWTji",
);

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
