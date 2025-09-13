export function getCoverFromBook(book: any): string | null {
  if (!book) return null;

  // Common direct fields
  const candidates = [
    'coverImage',
    'coverImageURL',
    'cover_image',
    'coverUrl',
    'imageUrl',
    'image',
    'cover',
    'cover_url',
    'thumbnail',
    'thumbnailUrl',
  ];

  for (const key of candidates) {
    if (book[key]) return book[key];
  }

  // Nested object fields
  if (book.cover && typeof book.cover === 'object') {
    if (book.cover.url) return book.cover.url;
    if (book.cover.src) return book.cover.src;
  }

  if (book.image && typeof book.image === 'object') {
    if (book.image.url) return book.image.url;
    if (book.image.src) return book.image.src;
  }

  // Arrays of images
  if (Array.isArray(book.covers) && book.covers.length) {
    const c = book.covers[0];
    if (typeof c === 'string') return c;
    if (c.url) return c.url;
    if (c.src) return c.src;
  }

  if (Array.isArray(book.images) && book.images.length) {
    const c = book.images[0];
    if (typeof c === 'string') return c;
    if (c.url) return c.url;
    if (c.src) return c.src;
  }

  // Some APIs nest attributes
  if (book.attributes && typeof book.attributes === 'object') {
    const a = book.attributes;
    if (a.cover) {
      if (typeof a.cover === 'string') return a.cover;
      if (a.cover.url) return a.cover.url;
    }
    if (a.image) {
      if (typeof a.image === 'string') return a.image;
      if (a.image.url) return a.image.url;
    }
  }

  return null;
}

export default getCoverFromBook;
