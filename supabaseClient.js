import { createClient } from "@supabase/supabase-js";

// Use the .supabase.co API endpoint, not the supabase.com dashboard URL
const supabaseUrl = "https://xvdttwzlyttgvmckeogp.supabase.co";
const supabaseKey = "sb_publishable_PASo00q4DJpN-Fg1HCZ1tQ_tKRkm4cH"; // Keep your full publishable key here

export const supabase = createClient(supabaseUrl, supabaseKey);
