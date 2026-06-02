import { withAuth } from '../_lib/auth.js';
import { supabaseAdmin } from '../_lib/supabase.js';

async function getMyMembership(userId) {
  const { data } = await supabaseAdmin
    .from('team_members')
    .select('role, team_id')
    .eq('user_id', userId)
    .limit(1)
    .single();
  return data;
}

export default withAuth(async (req, res, user) => {
  const m = await getMyMembership(user.id);
  if (!m) throw { status: 404, message: 'Not in a team' };

  if (req.method === 'GET') {
    const { data } = await supabaseAdmin
      .from('team_members')
      .select('user_id, role, joined_at')
      .eq('team_id', m.team_id);

    const members = await Promise.all((data || []).map(async row => {
      const { data: { user: u } } = await supabaseAdmin.auth.admin.getUserById(row.user_id);
      return { userId: row.user_id, role: row.role, joinedAt: row.joined_at, email: u?.email || '', displayName: u?.user_metadata?.display_name || '' };
    }));
    return res.json(members);
  }

  // Admin-only below
  if (m.role !== 'admin') throw { status: 403, message: 'Admin required' };

  if (req.method === 'POST') {
    const { email, role = 'editor' } = req.body || {};
    if (!email?.trim()) throw { status: 400, message: 'email required' };
    if (!['admin','editor','viewer'].includes(role)) throw { status: 400, message: 'invalid role' };

    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    const invitee = users?.find(u => u.email?.toLowerCase() === email.toLowerCase());
    if (!invitee) throw { status: 404, message: '用户不存在，请确认对方已注册 Atlas 账号' };

    const { data: existing } = await supabaseAdmin
      .from('team_members').select('user_id').eq('team_id', m.team_id).eq('user_id', invitee.id).single();
    if (existing) throw { status: 409, message: '该用户已是团队成员' };

    await supabaseAdmin.from('team_members').insert({ team_id: m.team_id, user_id: invitee.id, role });
    return res.status(201).json({ success: true });
  }

  if (req.method === 'PATCH') {
    const { userId } = req.query;
    const { role } = req.body || {};
    if (!userId || !role) throw { status: 400, message: 'userId and role required' };
    if (userId === user.id) throw { status: 400, message: '不能修改自己的角色' };
    if (!['admin','editor','viewer'].includes(role)) throw { status: 400, message: 'invalid role' };

    await supabaseAdmin.from('team_members').update({ role }).eq('team_id', m.team_id).eq('user_id', userId);
    return res.json({ success: true });
  }

  if (req.method === 'DELETE') {
    const { userId } = req.query;
    if (!userId) throw { status: 400, message: 'userId required' };
    if (userId === user.id) throw { status: 400, message: '不能移除自己' };

    await supabaseAdmin.from('team_members').delete().eq('team_id', m.team_id).eq('user_id', userId);
    return res.json({ success: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
});
