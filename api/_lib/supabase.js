import { createClient } from '@supabase/supabase-js';

// Service role client — only used server-side, never exposed to browser
export const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
