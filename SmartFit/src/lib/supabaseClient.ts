import { createClient } from "@supabase/supabase-js";

//supabase url and api key as const
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

//create the supabase client 
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export default supabase;