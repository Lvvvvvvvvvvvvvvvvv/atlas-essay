import { withAuth } from '../_lib/auth.js';
import { supabaseAdmin } from '../_lib/supabase.js';
import { Client } from '@upstash/qstash';

const qstash = new Client({
  token: process.env.QSTASH_TOKEN || '',
  baseUrl: process.env.QSTASH_URL || undefined,
});
const WORKER_URL = `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://atlas-essay.vercel.app'}/api/tasks/worker`;

export default withAuth(async (req, res, user) => {
  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('tasks')
      .select('id, type, status, input, created_at, updated_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw { status: 500, message: error.message };
    return res.json(data);
  }

  if (req.method === 'POST') {
    const { type = 'full', input } = req.body || {};
    if (!input) throw { status: 400, message: 'input required' };

    // Create task record
    const { data: task, error } = await supabaseAdmin
      .from('tasks')
      .insert({ user_id: user.id, type, status: 'queued', input })
      .select('id')
      .single();

    if (error) throw { status: 500, message: error.message };

    // Enqueue to QStash — worker will pick it up and run generation
    await qstash.publishJSON({
      url: WORKER_URL,
      body: { taskId: task.id, userId: user.id, input },
      retries: 1,
    });

    return res.status(201).json({ taskId: task.id });
  }

  res.status(405).json({ error: 'Method not allowed' });
});
