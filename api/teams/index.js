import { withAuth } from '../_lib/auth.js';
import { supabaseAdmin } from '../_lib/supabase.js';

async function getMyMembership(userId) {
  const { data } = await supabaseAdmin
    .from('team_members')
    .select('role, team_id, teams(id, name, created_by)')
    .eq('user_id', userId)
    .limit(1)
    .single();
  return data;
}

export default withAuth(async (req, res, user) => {
  if (req.method === 'GET') {
    const m = await getMyMembership(user.id);
    if (!m) return res.json(null);
    return res.json({ id: m.teams.id, name: m.teams.name, createdBy: m.teams.created_by, myRole: m.role });
  }

  if (req.method === 'POST') {
    const { name } = req.body || {};
    if (!name?.trim()) throw { status: 400, message: 'name required' };

    const existing = await getMyMembership(user.id);
    if (existing) throw { status: 409, message: 'Already in a team' };

    const { data: team, error } = await supabaseAdmin
      .from('teams')
      .insert({ name: name.trim(), created_by: user.id })
      .select()
      .single();
    if (error) throw { status: 500, message: error.message };

    await supabaseAdmin.from('team_members').insert({ team_id: team.id, user_id: user.id, role: 'admin' });
    return res.status(201).json({ id: team.id, name: team.name, createdBy: user.id, myRole: 'admin' });
  }

  if (req.method === 'DELETE') {
    const m = await getMyMembership(user.id);
    if (!m) throw { status: 404, message: 'Not in a team' };
    if (m.role !== 'admin') throw { status: 403, message: 'Admin required' };

    await supabaseAdmin.from('teams').delete().eq('id', m.team_id);
    return res.json({ success: true });
  }

  if (req.method === 'PATCH') {
    const m = await getMyMembership(user.id);
    if (!m) throw { status: 404, message: 'Not in a team' };
    if (m.role !== 'admin') throw { status: 403, message: 'Admin required' };

    const { name } = req.body || {};
    if (!name?.trim()) throw { status: 400, message: 'name required' };
    await supabaseAdmin.from('teams').update({ name: name.trim() }).eq('id', m.team_id);
    return res.json({ success: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
});
