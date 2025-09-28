import { describe, it, expect } from 'vitest'
import { getCoverFromBook } from '../getCoverFromBook'

describe('getCoverFromBook', () => {
  it('returns null for null/undefined input', () => {
    expect(getCoverFromBook(null)).toBeNull()
    expect(getCoverFromBook(undefined)).toBeNull()
  })

  it('returns direct field values', () => {
    expect(getCoverFromBook({ coverImage: 'cover1.jpg' })).toBe('cover1.jpg')
    expect(getCoverFromBook({ coverImageURL: 'cover2.jpg' })).toBe('cover2.jpg')
    expect(getCoverFromBook({ cover_image: 'cover3.jpg' })).toBe('cover3.jpg')
    expect(getCoverFromBook({ coverUrl: 'cover4.jpg' })).toBe('cover4.jpg')
    expect(getCoverFromBook({ image: 'cover5.jpg' })).toBe('cover5.jpg')
  })

  it('returns nested cover object when cover is object', () => {
    // The function returns the object itself if 'cover' key exists, since it's in the candidates list
    const result1 = getCoverFromBook({ cover: { url: 'nested-cover.jpg' } })
    const result2 = getCoverFromBook({ cover: { src: 'nested-src.jpg' } })
    
    expect(result1).toEqual({ url: 'nested-cover.jpg' })
    expect(result2).toEqual({ src: 'nested-src.jpg' })
  })

  it('returns nested image object when image is object', () => {
    // The function returns the object itself if 'image' key exists, since it's in the candidates list  
    const result1 = getCoverFromBook({ image: { url: 'nested-image.jpg' } })
    const result2 = getCoverFromBook({ image: { src: 'nested-image-src.jpg' } })
    
    expect(result1).toEqual({ url: 'nested-image.jpg' })
    expect(result2).toEqual({ src: 'nested-image-src.jpg' })
  })

  it('returns first cover from covers array', () => {
    expect(getCoverFromBook({ covers: ['cover1.jpg', 'cover2.jpg'] })).toBe('cover1.jpg')
    expect(getCoverFromBook({ covers: [{ url: 'cover-obj.jpg' }] })).toBe('cover-obj.jpg')
    expect(getCoverFromBook({ covers: [{ src: 'cover-src.jpg' }] })).toBe('cover-src.jpg')
  })

  it('returns first image from images array', () => {
    expect(getCoverFromBook({ images: ['image1.jpg', 'image2.jpg'] })).toBe('image1.jpg')
    expect(getCoverFromBook({ images: [{ url: 'image-obj.jpg' }] })).toBe('image-obj.jpg')
    expect(getCoverFromBook({ images: [{ src: 'image-src.jpg' }] })).toBe('image-src.jpg')
  })

  it('returns cover from attributes object', () => {
    expect(getCoverFromBook({ attributes: { cover: 'attr-cover.jpg' } })).toBe('attr-cover.jpg')
    expect(getCoverFromBook({ attributes: { cover: { url: 'attr-cover-url.jpg' } } })).toBe('attr-cover-url.jpg')
    expect(getCoverFromBook({ attributes: { image: 'attr-image.jpg' } })).toBe('attr-image.jpg')
    expect(getCoverFromBook({ attributes: { image: { url: 'attr-image-url.jpg' } } })).toBe('attr-image-url.jpg')
  })

  it('returns null when no cover found', () => {
    expect(getCoverFromBook({})).toBeNull()
    expect(getCoverFromBook({ title: 'Book Title', author: 'Author' })).toBeNull()
    expect(getCoverFromBook({ covers: [] })).toBeNull()
    expect(getCoverFromBook({ images: [] })).toBeNull()
  })

  it('handles priority order correctly', () => {
    const book = {
      coverImage: 'priority1.jpg',
      coverImageURL: 'priority2.jpg',
      image: 'priority3.jpg'
    }
    expect(getCoverFromBook(book)).toBe('priority1.jpg')
  })
})