import { supabaseAdmin } from './supabase.js';

// Validates the Bearer JWT from the request and returns the user.
// Throws with { status, message } on failure.
export async function requireAuth(req) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) throw { status: 401, message: 'Missing auth token' };

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) throw { status: 401, message: 'Invalid or expired token' };

  return user;
}

// Wraps a Vercel handler with auth + standard error handling.
// Usage: export default withAuth(async (req, res, user) => { ... })
export function withAuth(handler) {
  return async (req, res) => {
    try {
      const user = await requireAuth(req);
      await handler(req, res, user);
    } catch (err) {
      const status  = err.status  || 500;
      const message = err.message || 'Internal server error';
      res.status(status).json({ error: message });
    }
  };
}
