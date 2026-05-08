import { useEffect, useRef } from 'react'

export function useEventSource(
  url: string | null | undefined,
  token: string | null | undefined,
  onMessage: (data: string) => void,
  enabled = true,
) {
  const onMessageRef = useRef(onMessage)
  onMessageRef.current = onMessage

  useEffect(() => {
    if (!url || !enabled) return

    let cancelled = false
    let retryTimeout: ReturnType<typeof setTimeout> | null = null
    const abortCtrl = new AbortController()

    async function connect() {
      if (!url) return
      try {
        const res = await fetch(url, {
          headers: {
            Accept: 'text/event-stream',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: 'include',
          signal: abortCtrl.signal,
        })

        if (!res.ok) {
          console.error(`EventSource error: HTTP ${res.status}`)
          if (!cancelled) {
            retryTimeout = setTimeout(connect, 3000)
          }
          return
        }

        if (!res.body) return

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let eventData = ''

        while (!cancelled) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data:')) {
              eventData += (eventData ? '\n' : '') + line.slice(5).trimStart()
            } else if (line.trim() === '') {
              if (eventData) {
                onMessageRef.current(eventData)
                eventData = ''
              }
            }
          }
        }
      } catch (err) {
        if (!cancelled) {
          retryTimeout = setTimeout(connect, 3000)
        }
      }
    }

    connect()

    return () => {
      cancelled = true
      abortCtrl.abort()
      if (retryTimeout) clearTimeout(retryTimeout)
    }
  }, [url, token, enabled])
}
