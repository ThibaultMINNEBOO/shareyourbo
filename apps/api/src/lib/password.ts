// PBKDF2 via Web Crypto: native in Workers, unlike better-auth's default JS
// scrypt which can exceed the Workers CPU budget.
// 100k iterations is the maximum Workers allows for PBKDF2.
const ITERATIONS = 100_000;
const SALT_BYTES = 16;
const KEY_BITS = 256;
const PREFIX = "pbkdf2-sha256";

const encoder = new TextEncoder();

function toBase64(bytes: Uint8Array) {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function fromBase64(value: string) {
  return Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
}

async function derive(password: string, salt: Uint8Array<ArrayBuffer>, iterations: number) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    key,
    KEY_BITS,
  );
  return new Uint8Array(bits);
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i]! ^ b[i]!;
  return diff === 0;
}

export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const hash = await derive(password, salt, ITERATIONS);
  return `${PREFIX}$${ITERATIONS}$${toBase64(salt)}$${toBase64(hash)}`;
}

export async function verifyPassword({ hash, password }: { hash: string; password: string }) {
  const [prefix, iterations, salt, expected] = hash.split("$");
  if (prefix !== PREFIX || !iterations || !salt || !expected) return false;
  const actual = await derive(password, fromBase64(salt), Number(iterations));
  return timingSafeEqual(actual, fromBase64(expected));
}
