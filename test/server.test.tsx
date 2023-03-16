import { isServer } from 'solid-js/web'
import { describe, expect, it } from 'vitest'

describe('environment', () => {
  it('runs on server', () => {
    expect(typeof window).toBe('object')
    expect(isServer).toBe(false)
  })
})
