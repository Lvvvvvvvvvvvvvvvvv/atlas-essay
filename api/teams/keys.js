import { withAuth } from '../_lib/auth.js';
import { supabaseAdmin } from '../_lib/supabase.js';
import { encrypt } from '../_lib/crypto.js';

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
      .from('api_keys')
      .select('id, provider, api_url, label, created_at')
      .eq('team_id', m.team_id)
      .order('created_at', { ascending: false });
    return res.json(data || []);
  }

  if (m.role !== 'admin') throw { status: 403, message: 'Admin required' };

  if (req.method === 'POST') {
    const { provider, apiKey, apiUrl, label } = req.body || {};
    if (!provider || !apiKey) throw { status: 400, message: 'provider and apiKey required' };

    const key_enc = encrypt(apiKey);
    const { data, error } = await supabaseAdmin
      .from('api_keys')
      .insert({ team_id: m.team_id, created_by: user.id, provider, api_url: apiUrl || null, key_enc, label: label || provider })
      .select('id').single();
    if (error) throw { status: 500, message: error.message };
    return res.status(201).json({ id: data.id });
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) throw { status: 400, message: 'id required' };
    await supabaseAdmin.from('api_keys').delete().eq('id', id).eq('team_id', m.team_id);
    return res.json({ success: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
});
