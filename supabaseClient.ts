import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPA_BASE_TOKEN;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPA_BASE_CHAT_ID;

export const supabase = createClient(supabaseUrl as any, supabaseAnonKey as any);