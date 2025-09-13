# Updating Book Cover Images in the Database

If your database currently has no `coverImage` values for books, you can either:

- Update the backend to generate and serve cover URLs; or
- Populate the `coverImage` column in your database with real image URLs (CDN or external), or store generated placeholder URLs.

Below are example approaches.

## 1) Quick SQL update (Postgres example)

If you want to populate the `coverImage` with a DiceBear initials avatar based on the title:

```sql
UPDATE books
SET cover_image = CONCAT('https://api.dicebear.com/8.x/initials/svg?seed=', encodeURIComponent(title), '&backgroundType=gradient&radius=12')
WHERE cover_image IS NULL;
```

Note: `encodeURIComponent` is not available in plain SQL — the example shows intent. In Postgres you'd use `replace` and `regexp_replace` or update via a small script.

## 2) Update via a backend script (Node.js example)

Run a script that fetches books and updates `coverImage` for books missing it.

```js
// update-covers.js
const axios = require('axios');
const db = require('./db'); // your DB helper

async function run() {
  const books = await db.query('SELECT id, title FROM books WHERE cover_image IS NULL');

  for (const b of books.rows) {
    const url = `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(b.title)}&backgroundType=gradient&radius=12`;
    await db.query('UPDATE books SET cover_image = $1 WHERE id = $2', [url, b.id]);
  }
  console.log('Done');
}

run().catch(console.error);
```

## 3) Update via REST API (curl example)

If your backend exposes an endpoint to update a book, use a small loop to `PATCH`:

```bash
curl -X PATCH "http://localhost:3001/api/books/123" -H "Content-Type: application/json" -d '{"coverImage":"https://example.com/cover-123.jpg"}'
```

Or script multiple updates using the Node.js snippet above but calling the API instead of the DB directly.

## 4) Recommended: store canonical URLs in DB

- Prefer storing canonical CDN/image URLs in your DB rather than generated `dicebear` URLs unless those placeholders are acceptable permanently.
- If you later add real covers, update the `coverImage` column with the hosted image URL.

If you want, I can generate and write a small backend script tailored to your backend stack (Express + Postgres, Prisma, MongoDB, etc.). Tell me which stack you use and I will prepare the script and, if allowed, run a local test (or provide step-by-step instructions to run it on your machine).
