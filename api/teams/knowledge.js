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
    const { type } = req.query;
    let q = supabaseAdmin.from('team_knowledge').select('*').eq('team_id', m.team_id).order('created_at', { ascending: false });
    if (type) q = q.eq('type', type);
    const { data } = await q;
    return res.json(data || []);
  }

  if (!['admin','editor'].includes(m.role)) throw { status: 403, message: 'Editor or Admin required' };

  if (req.method === 'POST') {
    const { type, name, content } = req.body || {};
    if (!type || !name || !content) throw { status: 400, message: 'type, name, content required' };
    if (!['template','language','prompt_extra'].includes(type)) throw { status: 400, message: 'invalid type' };

    const { data, error } = await supabaseAdmin
      .from('team_knowledge')
      .insert({ team_id: m.team_id, created_by: user.id, type, name, content })
      .select('id').single();
    if (error) throw { status: 500, message: error.message };
    return res.status(201).json({ id: data.id });
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) throw { status: 400, message: 'id required' };
    await supabaseAdmin.from('team_knowledge').delete().eq('id', id).eq('team_id', m.team_id);
    return res.json({ success: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
});
