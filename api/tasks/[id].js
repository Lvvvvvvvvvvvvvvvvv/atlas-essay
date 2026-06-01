import { withAuth } from '../_lib/auth.js';
import { supabaseAdmin } from '../_lib/supabase.js';

export default withAuth(async (req, res, user) => {
  const { id } = req.query;

  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('tasks')
      .select('id, type, status, input, output, error, created_at, updated_at')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) throw { status: 404, message: 'Task not found' };
    return res.json(data);
  }

  res.status(405).json({ error: 'Method not allowed' });
});
