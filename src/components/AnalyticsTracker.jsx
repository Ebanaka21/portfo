import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { trackPageView } from '../analytics'

export default function AnalyticsTracker() {
  const location = useLocation()

  useEffect(() => {
    trackPageView(location.pathname)
  }, [location.pathname])

  useEffect(() => {
    const handleConsentChange = () => trackPageView(window.location.pathname)
    window.addEventListener('analytics-consent-changed', handleConsentChange)
    return () => window.removeEventListener('analytics-consent-changed', handleConsentChange)
  }, [])

  return null
}
