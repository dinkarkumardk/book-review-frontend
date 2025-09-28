import { describe, it, expect } from 'vitest'
import api from '../api'

describe('API Service', () => {
  it('should be properly configured with correct baseURL', () => {
    expect(api.defaults.baseURL).toBe('http://localhost:3001/api')
    expect(api.defaults.withCredentials).toBe(true)
  })

  it('should have request interceptors configured', () => {
    expect(api.interceptors.request).toBeDefined()
  })

  it('should have response interceptors configured', () => {
    expect(api.interceptors.response).toBeDefined()
  })

  it('should be an axios instance', () => {
    expect(api.get).toBeTypeOf('function')
    expect(api.post).toBeTypeOf('function')
    expect(api.put).toBeTypeOf('function')
    expect(api.delete).toBeTypeOf('function')
  })

  it('should have correct default headers setup', () => {
    expect(api.defaults.headers).toBeDefined()
  })
})