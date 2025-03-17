import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://dtshpkdkqarhngiukbyv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0c2hwa2RrcWFyaG5naXVrYnl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyMDY5NzAsImV4cCI6MjA1Nzc4Mjk3MH0.viHEWPvV1e0j26haRBg6rii0hpee9Y_sgVkzxjgReqo";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
