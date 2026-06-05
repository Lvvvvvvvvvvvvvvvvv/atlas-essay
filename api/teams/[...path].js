import { withAuth } from '../_lib/auth.js';
import { supabaseAdmin } from '../_lib/supabase.js';
import { encrypt } from '../_lib/crypto.js';

async function getMyMembership(userId, includeTeam = false) {
  const select = includeTeam ? 'role, team_id, teams(id, name, created_by)' : 'role, team_id';
  const { data } = await supabaseAdmin
    .from('team_members')
    .select(select)
    .eq('user_id', userId)
    .limit(1)
    .single();
  return data;
}

// /api/teams/members
async function handleMembers(req, res, user) {
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

  if (req.method === 'DELETE') {
    const { userId } = req.query;
    if (!userId) throw { status: 400, message: 'userId required' };
    // Allow leaving team (self-removal for non-admins)
    if (userId !== user.id && m.role !== 'admin') throw { status: 403, message: 'Admin required' };
    if (userId === user.id && m.role === 'admin') throw { status: 400, message: '管理员不能退出团队，请先转让管理员权限' };

    await supabaseAdmin.from('team_members').delete().eq('team_id', m.team_id).eq('user_id', userId);
    return res.json({ success: true });
  }

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

  return res.status(405).json({ error: 'Method not allowed' });
}

// /api/teams/keys
async function handleKeys(req, res, user) {
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
    const { provider, apiKey, apiUrl, label, fromPersonalId } = req.body || {};

    // Import a server-side personal key into the team: copy the already-encrypted
    // blob (same SECRET) — no decryption needed, plaintext never leaves the server.
    if (fromPersonalId) {
      const { data: src } = await supabaseAdmin
        .from('api_keys')
        .select('provider, api_url, key_enc, label')
        .eq('id', fromPersonalId)
        .eq('user_id', user.id)
        .single();
      if (!src) throw { status: 404, message: 'Personal key not found' };
      const { data, error } = await supabaseAdmin
        .from('api_keys')
        .insert({ team_id: m.team_id, created_by: user.id, provider: src.provider, api_url: src.api_url, key_enc: src.key_enc, label: label || src.label || src.provider })
        .select('id').single();
      if (error) throw { status: 500, message: error.message };
      return res.status(201).json({ id: data.id });
    }

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

  return res.status(405).json({ error: 'Method not allowed' });
}

// /api/teams/knowledge
async function handleKnowledge(req, res, user) {
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

  return res.status(405).json({ error: 'Method not allowed' });
}

// /api/teams/invite
async function handleInvite(req, res, user) {
  if (req.method === 'GET') {
    const m = await getMyMembership(user.id);
    if (!m) throw { status: 404, message: 'Not in a team' };
    if (m.role !== 'admin') throw { status: 403, message: 'Admin required' };

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabaseAdmin
      .from('team_invites')
      .insert({ team_id: m.team_id, created_by: user.id, expires_at: expiresAt })
      .select('id')
      .single();
    if (error) throw { status: 500, message: error.message };

    return res.json({ token: data.id });
  }

  if (req.method === 'POST') {
    const { token } = req.query;
    if (!token) throw { status: 400, message: 'token required' };

    const { data: invite } = await supabaseAdmin
      .from('team_invites')
      .select('team_id, expires_at, used_at')
      .eq('id', token)
      .single();

    if (!invite) throw { status: 404, message: '邀请链接无效' };
    if (invite.used_at) throw { status: 410, message: '邀请链接已被使用' };
    if (new Date(invite.expires_at) < new Date()) throw { status: 410, message: '邀请链接已过期' };

    const existing = await getMyMembership(user.id);
    if (existing) throw { status: 409, message: '您已在一个团队中，请先退出当前团队' };

    await supabaseAdmin.from('team_members').insert({ team_id: invite.team_id, user_id: user.id, role: 'editor' });
    await supabaseAdmin.from('team_invites').update({ used_at: new Date().toISOString() }).eq('id', token);

    return res.json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// /api/teams/reports
async function handleReports(req, res, user) {
  const m = await getMyMembership(user.id);
  if (!m) throw { status: 404, message: 'Not in a team' };

  if (req.method === 'GET') {
    const { id } = req.query;
    if (id) {
      const { data } = await supabaseAdmin
        .from('team_reports')
        .select('*')
        .eq('id', id)
        .eq('team_id', m.team_id)
        .single();
      if (!data) throw { status: 404, message: 'Report not found' };
      return res.json(data);
    }
    const { data } = await supabaseAdmin
      .from('team_reports')
      .select('id, title, prompt, word_count, created_by, created_at, shared_by_email')
      .eq('team_id', m.team_id)
      .order('created_at', { ascending: false });
    return res.json(data || []);
  }

  if (req.method === 'POST') {
    const { title, prompt, content, wordCount, sharedByEmail } = req.body || {};
    if (!content) throw { status: 400, message: 'content required' };
    const { data, error } = await supabaseAdmin
      .from('team_reports')
      .insert({ team_id: m.team_id, created_by: user.id, title, prompt, content, word_count: wordCount || 0, shared_by_email: sharedByEmail || '' })
      .select('id').single();
    if (error) {
      const missing = /team_reports/.test(error.message || '') && /(exist|schema cache|relation)/i.test(error.message || '');
      throw { status: 500, message: missing ? '团队报告表未创建：请在 Supabase 执行 team_reports 建表 SQL' : error.message };
    }
    return res.status(201).json({ id: data.id });
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) throw { status: 400, message: 'id required' };
    if (m.role !== 'admin') throw { status: 403, message: 'Admin required' };
    await supabaseAdmin.from('team_reports').delete().eq('id', id).eq('team_id', m.team_id);
    return res.json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default withAuth(async (req, res, user) => {
  const segments = req.query.path || [];
  const resource = Array.isArray(segments) ? segments[0] : segments;

  if (resource === 'members') return handleMembers(req, res, user);
  if (resource === 'keys')    return handleKeys(req, res, user);
  if (resource === 'knowledge') return handleKnowledge(req, res, user);
  if (resource === 'invite')  return handleInvite(req, res, user);
  if (resource === 'reports') return handleReports(req, res, user);

  return res.status(404).json({ error: 'Not found' });
});
