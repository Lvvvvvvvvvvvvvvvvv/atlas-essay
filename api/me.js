import { withAuth } from './_lib/auth.js';
import { supabaseAdmin } from './_lib/supabase.js';

// GET /api/me — returns current user + team + role
export default withAuth(async (req, res, user) => {
  const { data: membership } = await supabaseAdmin
    .from('team_members')
    .select('role, teams(id, name)')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('display_name, avatar_url')
    .eq('id', user.id)
    .single();

  res.json({
    id:          user.id,
    email:       user.email,
    displayName: profile?.display_name || null,
    team:        membership?.teams     || null,
    role:        membership?.role      || null,
  });
});
