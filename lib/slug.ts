// Turns a title into a URL-safe slug, e.g. "Seaview Villa" -> "seaview-villa".
// Collision handling (appending -2, -3...) happens in the server action,
// since only it can check the database.
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Generates a reference like "PR-2026-0427". Not guaranteed unique on its
// own (two references could collide by chance) — the server action retries
// on a unique-constraint violation, which is simpler and more reliable than
// a sequence table for this volume of listings.
export function generateReference(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `PR-${year}-${random}`;
}
