import { withAuth } from '../_lib/auth.js';
import { supabaseAdmin } from '../_lib/supabase.js';

async function getMyMembership(userId) {
  const { data } = await supabaseAdmin
    .from('team_members')
    .select('role, team_id, teams(id, name)')
    .eq('user_id', userId)
    .limit(1)
    .single();
  return data;
}

export default withAuth(async (req, res, user) => {
  // GET: generate invite token (admin only)
  if (req.method === 'GET') {
    const m = await getMyMembership(user.id);
    if (!m) throw { status: 404, message: 'Not in a team' };
    if (m.role !== 'admin') throw { status: 403, message: 'Admin required' };

    // Create invite token (valid 7 days)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabaseAdmin
      .from('team_invites')
      .insert({ team_id: m.team_id, created_by: user.id, expires_at: expiresAt })
      .select('id')
      .single();
    if (error) throw { status: 500, message: error.message };

    return res.json({ token: data.id });
  }

  // POST: accept invite (join team)
  if (req.method === 'POST') {
    const { token } = req.query;
    if (!token) throw { status: 400, message: 'token required' };

    const { data: invite } = await supabaseAdmin
      .from('team_invites')
      .select('team_id, expires_at, used_at')
      .eq('id', token)
      .single();

    if (!invite) throw { status: 404, message: '邀请链接无效' };
    if (invite.used_at) throw { status: 410, message: '邀请链接已被使用' };
    if (new Date(invite.expires_at) < new Date()) throw { status: 410, message: '邀请链接已过期' };

    // Check if already in a team
    const existing = await getMyMembership(user.id);
    if (existing) throw { status: 409, message: '您已在一个团队中，请先退出当前团队' };

    // Join team as editor
    await supabaseAdmin.from('team_members').insert({ team_id: invite.team_id, user_id: user.id, role: 'editor' });
    // Mark invite as used
    await supabaseAdmin.from('team_invites').update({ used_at: new Date().toISOString() }).eq('id', token);

    return res.json({ success: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
});
