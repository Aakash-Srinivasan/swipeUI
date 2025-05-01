import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPA_BASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPA_BASE_PUBLIC_ANNON_KEY;

export const supabase = createClient(supabaseUrl as any, supabaseAnonKey as any);
