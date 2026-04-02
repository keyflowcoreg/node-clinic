import { store } from '../services/store'

export function trackConversion(event: string, data?: Record<string, unknown>): void {
  store.funnel.track({
    funnel: 'conversion',
    step: event,
    conversion_type: event,
    conversion_value: (data?.value as number) ?? undefined,
  })
}

export function trackPageView(page: string): void {
  store.funnel.track({ funnel: 'navigation', step: 'page_view', page })
}

export function trackFormSubmission(formId: string, _data?: Record<string, unknown>): void {
  store.funnel.track({ funnel: 'forms', step: 'form_complete', form_id: formId })
}

export function trackFormStart(formId: string): void {
  store.funnel.track({ funnel: 'forms', step: 'form_start', form_id: formId })
}

export function trackFunnelStep(funnel: string, step: string): void {
  store.funnel.track({ funnel, step })
}
