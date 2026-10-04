import { useEffect, useRef, useState } from 'react'

/** A pausable clock in game seconds (LotV game time runs in real time). */
export function useGameClock() {
  const [running, setRunning] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const base = useRef({ startedAt: 0, offset: 0 })

  useEffect(() => {
    if (!running) return
    base.current.startedAt = performance.now()
    const id = setInterval(() => {
      setSeconds(base.current.offset + (performance.now() - base.current.startedAt) / 1000)
    }, 200)
    return () => {
      clearInterval(id)
      base.current.offset += (performance.now() - base.current.startedAt) / 1000
    }
  }, [running])

  return {
    seconds,
    running,
    toggle: () => setRunning((r) => !r),
    reset: () => {
      setRunning(false)
      base.current = { startedAt: 0, offset: 0 }
      setSeconds(0)
    },
    seek: (value: number) => {
      base.current = { startedAt: performance.now(), offset: value }
      setSeconds(value)
    },
  }
}

/** Keeps the screen awake while active (best effort; unsupported browsers ignore it). */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return
    let lock: WakeLockSentinel | null = null
    let cancelled = false
    navigator.wakeLock
      .request('screen')
      .then((l) => {
        if (cancelled) void l.release()
        else lock = l
      })
      .catch(() => {})
    return () => {
      cancelled = true
      lock?.release().catch(() => {})
    }
  }, [active])
}
