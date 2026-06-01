import crypto from 'crypto';

const ALGO   = 'aes-256-gcm';
const SECRET = process.env.API_KEY_ENCRYPTION_SECRET || '';

export function encrypt(plaintext) {
  const key = Buffer.from(SECRET, 'hex');
  const iv  = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return JSON.stringify({ iv: iv.toString('hex'), tag: tag.toString('hex'), data: enc.toString('hex') });
}

export function decrypt(stored) {
  const { iv, tag, data } = JSON.parse(stored);
  const key     = Buffer.from(SECRET, 'hex');
  const decipher = crypto.createDecipheriv(ALGO, key, Buffer.from(iv, 'hex'));
  decipher.setAuthTag(Buffer.from(tag, 'hex'));
  return decipher.update(Buffer.from(data, 'hex')) + decipher.final('utf8');
}
