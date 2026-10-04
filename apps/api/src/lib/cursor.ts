// Opaque keyset-pagination cursors: base64url-encoded JSON tuples.

export function encodeCursor(values: (string | number)[]) {
  return btoa(JSON.stringify(values)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeCursor(cursor: string | undefined): (string | number)[] | null {
  if (!cursor) return null;
  try {
    const value: unknown = JSON.parse(atob(cursor.replace(/-/g, "+").replace(/_/g, "/")));
    return Array.isArray(value) ? value : null;
  } catch {
    return null;
  }
}
