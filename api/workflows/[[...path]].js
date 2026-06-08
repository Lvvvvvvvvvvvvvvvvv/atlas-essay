import { withAuth } from '../_lib/auth.js';
import { supabaseAdmin } from '../_lib/supabase.js';
import { Client } from '@upstash/qstash';

export const config = { maxDuration: 60 };

const qstash = new Client({ token: process.env.QSTASH_TOKEN || '' });
const WORKER_URL = `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://atlas-essay.vercel.app'}/api/tasks/worker`;

async function getUserTeamId(userId) {
  const { data } = await supabaseAdmin
    .from('team_members').select('team_id').eq('user_id', userId).limit(1).single();
  return data?.team_id || null;
}

// Parse path segments from the request. Handles Vercel catch-all quirks.
function resolveSegments(req) {
  const q = req.query?.path;
  if (Array.isArray(q) && q.length) return q;
  if (typeof q === 'string' && q) return q.split('/').filter(Boolean);
  const pathOnly = String(req.url || '').split('?')[0].split('#')[0];
  const m = pathOnly.match(/\/workflows(\/.*)?$/);
  if (m?.[1]) return m[1].split('/').filter(Boolean);
  return [];
}

export default withAuth(async (req, res, user) => {
  const segs = resolveSegments(req);

  // ── /api/workflows ───────────────────────────────────────────────────────
  if (segs.length === 0) {
    if (req.method === 'GET') {
      const teamId = await getUserTeamId(user.id);
      let query = supabaseAdmin
        .from('workflows')
        .select('id, name, description, is_template, created_at, updated_at')
        .order('updated_at', { ascending: false });
      query = teamId
        ? query.or(`user_id.eq.${user.id},team_id.eq.${teamId}`)
        : query.eq('user_id', user.id);
      const { data, error } = await query;
      if (error) throw { status: 500, message: error.message };
      return res.json(data || []);
    }

    if (req.method === 'POST') {
      const { name, description, definition, isTemplate } = req.body || {};
      if (!name?.trim()) throw { status: 400, message: 'name required' };
      if (!Array.isArray(definition?.nodes) || definition.nodes.length === 0)
        throw { status: 400, message: 'definition.nodes must be a non-empty array' };
      const teamId = await getUserTeamId(user.id);
      const { data, error } = await supabaseAdmin
        .from('workflows')
        .insert({
          user_id: user.id,
          team_id: teamId,
          name: name.trim(),
          description: description || '',
          definition,
          is_template: !!isTemplate,
        })
        .select('id').single();
      if (error) throw { status: 500, message: error.message };
      return res.status(201).json({ id: data.id });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  }

  const [workflowId, action] = segs;

  // ── /api/workflows/:id/run  (POST) ───────────────────────────────────────
  if (action === 'run') {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const { data: wf } = await supabaseAdmin.from('workflows').select('*').eq('id', workflowId).single();
    if (!wf) throw { status: 404, message: 'Workflow not found' };

    const overrides = req.body?.overrides || {};
    const taskInput = { workflowId, definition: wf.definition, overrides };

    const { data: task, error } = await supabaseAdmin
      .from('tasks')
      .insert({ user_id: user.id, type: 'workflow', status: 'queued', input: taskInput })
      .select('id').single();
    if (error) throw { status: 500, message: error.message };

    await qstash.publishJSON({
      url: WORKER_URL,
      body: { taskId: task.id, userId: user.id, input: taskInput },
      retries: 1,
    });

    return res.status(201).json({ taskId: task.id });
  }

  // ── /api/workflows/:id/runs  (GET) ──────────────────────────────────────
  if (action === 'runs') {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    const { data } = await supabaseAdmin
      .from('tasks')
      .select('id, status, meta, output, error, created_at, updated_at')
      .eq('type', 'workflow')
      .eq('user_id', user.id)
      .filter('input->>workflowId', 'eq', workflowId)
      .order('created_at', { ascending: false })
      .limit(10);
    return res.json(data || []);
  }

  // ── /api/workflows/:id  (GET | PUT | DELETE) ─────────────────────────────
  if (!action) {
    if (req.method === 'GET') {
      const { data, error } = await supabaseAdmin
        .from('workflows').select('*').eq('id', workflowId).single();
      if (error || !data) throw { status: 404, message: 'Workflow not found' };
      return res.json(data);
    }

    if (req.method === 'PUT') {
      const { name, description, definition } = req.body || {};
      const updates = { updated_at: new Date().toISOString() };
      if (name?.trim())             updates.name        = name.trim();
      if (description !== undefined) updates.description = description;
      if (definition?.nodes)         updates.definition  = definition;
      const { error } = await supabaseAdmin
        .from('workflows').update(updates).eq('id', workflowId).eq('user_id', user.id);
      if (error) throw { status: 500, message: error.message };
      return res.json({ success: true });
    }

    if (req.method === 'DELETE') {
      await supabaseAdmin.from('workflows').delete().eq('id', workflowId).eq('user_id', user.id);
      return res.json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  }

  return res.status(404).json({ error: 'Not found' });
});
