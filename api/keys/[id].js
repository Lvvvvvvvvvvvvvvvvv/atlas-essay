import { withAuth } from '../_lib/auth.js';
import { supabaseAdmin } from '../_lib/supabase.js';

export default withAuth(async (req, res, user) => {
  const { id } = req.query;

  if (req.method === 'DELETE') {
    const { error } = await supabaseAdmin
      .from('api_keys')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw { status: 500, message: error.message };
    return res.json({ ok: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
});
