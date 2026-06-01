import { withAuth } from '../_lib/auth.js';
import { supabaseAdmin } from '../_lib/supabase.js';

export default withAuth(async (req, res, user) => {
  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('reports')
      .select('id, prompt, title, meta, created_at, updated_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw { status: 500, message: error.message };
    return res.json(data);
  }

  if (req.method === 'POST') {
    const { id, prompt, title, content, meta } = req.body || {};
    const { data, error } = await supabaseAdmin
      .from('reports')
      .upsert({ id, user_id: user.id, prompt, title, content, meta, updated_at: new Date() })
      .select('id')
      .single();

    if (error) throw { status: 500, message: error.message };
    return res.status(201).json(data);
  }

  res.status(405).json({ error: 'Method not allowed' });
});
