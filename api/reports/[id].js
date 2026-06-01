import { withAuth } from '../_lib/auth.js';
import { supabaseAdmin } from '../_lib/supabase.js';

export default withAuth(async (req, res, user) => {
  const { id } = req.query;

  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('reports')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) throw { status: 404, message: 'Report not found' };
    return res.json(data);
  }

  if (req.method === 'PATCH') {
    const updates = req.body || {};
    const { error } = await supabaseAdmin
      .from('reports')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw { status: 500, message: error.message };
    return res.json({ ok: true });
  }

  if (req.method === 'DELETE') {
    const { error } = await supabaseAdmin
      .from('reports')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw { status: 500, message: error.message };
    return res.json({ ok: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
});
