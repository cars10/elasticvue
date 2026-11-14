import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { visibleInterval } from '../../../src/helpers/visibleInterval'

describe('visibleInterval', () => {
  let listeners: (() => void)[]
  let fakeDocument: { hidden: boolean; addEventListener: unknown; removeEventListener: unknown }

  const setHidden = (hidden: boolean) => {
    fakeDocument.hidden = hidden
    listeners.forEach((listener) => listener())
  }

  beforeEach(() => {
    vi.useFakeTimers()
    listeners = []
    fakeDocument = {
      hidden: false,
      addEventListener: (_event: string, listener: () => void) => listeners.push(listener),
      removeEventListener: (_event: string, listener: () => void) => {
        listeners = listeners.filter((l) => l !== listener)
      }
    }
    vi.stubGlobal('document', fakeDocument)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('runs the action on every tick while visible', () => {
    const action = vi.fn()
    visibleInterval(action, 1000)

    vi.advanceTimersByTime(3000)
    expect(action).toHaveBeenCalledTimes(3)
  })

  it('skips ticks while hidden and runs once when visible again', () => {
    const action = vi.fn()
    visibleInterval(action, 1000)

    setHidden(true)
    vi.advanceTimersByTime(5000)
    expect(action).not.toHaveBeenCalled()

    setHidden(false)
    expect(action).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(1000)
    expect(action).toHaveBeenCalledTimes(2)
  })

  it('does not run on becoming visible when no tick was missed', () => {
    const action = vi.fn()
    visibleInterval(action, 1000)

    setHidden(true)
    setHidden(false)
    expect(action).not.toHaveBeenCalled()
  })

  it('stops ticking and listening after stop', () => {
    const action = vi.fn()
    const stop = visibleInterval(action, 1000)

    stop()
    vi.advanceTimersByTime(3000)
    expect(action).not.toHaveBeenCalled()
    expect(listeners).toHaveLength(0)
  })
})
