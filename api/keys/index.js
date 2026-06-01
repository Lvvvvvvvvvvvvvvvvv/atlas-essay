import { withAuth } from '../_lib/auth.js';
import { supabaseAdmin } from '../_lib/supabase.js';
import { encrypt } from '../_lib/crypto.js';

export default withAuth(async (req, res, user) => {
  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('api_keys')
      .select('id, provider, api_url, label, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw { status: 500, message: error.message };
    return res.json(data); // key_enc is never returned
  }

  if (req.method === 'POST') {
    const { provider, apiKey, apiUrl, label } = req.body || {};
    if (!provider || !apiKey) throw { status: 400, message: 'provider and apiKey required' };

    const key_enc = encrypt(apiKey);
    const { data, error } = await supabaseAdmin
      .from('api_keys')
      .insert({ user_id: user.id, provider, api_url: apiUrl || null, key_enc, label: label || provider })
      .select('id')
      .single();

    if (error) throw { status: 500, message: error.message };
    return res.status(201).json({ id: data.id });
  }

  res.status(405).json({ error: 'Method not allowed' });
});
