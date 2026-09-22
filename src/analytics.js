const CONSENT_KEY = 'karol_cookie_consent_v1'
const SESSION_KEY = 'karol_analytics_session_v1'

let lastPageView = { path: '', at: 0 }

function hasConsent() {
  try {
    const consent = JSON.parse(window.localStorage.getItem(CONSENT_KEY) || 'null')
    return consent?.version === 1 && consent.analytics === true
  } catch {
    return false
  }
}

function getSessionId() {
  try {
    const existing = window.localStorage.getItem(SESSION_KEY)
    if (existing) return existing

    const value = window.crypto?.randomUUID?.() || `session-${Date.now()}-${Math.random().toString(36).slice(2)}`
    window.localStorage.setItem(SESSION_KEY, value)
    return value
  } catch {
    return ''
  }
}

export function clearAnalyticsSession() {
  try {
    window.localStorage.removeItem(SESSION_KEY)
  } catch {
    // localStorage can be unavailable in privacy-restricted browsers.
  }
}

export function trackEvent(event, { projectId = '', metadata = {} } = {}) {
  if (!hasConsent()) return

  void fetch('/api/analytics/events', {
    method: 'POST',
    credentials: 'omit',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event,
      session_id: getSessionId(),
      path: window.location.pathname,
      project_id: projectId,
      metadata,
    }),
    keepalive: true,
  }).catch(() => {})
}

export function trackPageView(path) {
  if (!hasConsent()) return
  const now = Date.now()
  if (lastPageView.path === path && now - lastPageView.at < 1500) return
  lastPageView = { path, at: now }
  trackEvent('page_view')
}
