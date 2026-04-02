const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid'] as const;

type UtmKey = typeof UTM_KEYS[number];

export type UtmParams = Partial<Record<UtmKey, string>>;

const STORAGE_KEY = 'utm_params';

export function captureUtmParams(): void {
  const params = new URLSearchParams(window.location.search);
  const captured: UtmParams = {};
  let hasNew = false;

  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) {
      captured[key] = value;
      hasNew = true;
    }
  }

  if (hasNew) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(captured));
  }
}

export function getUtmParams(): UtmParams {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as UtmParams;
  } catch {
    return {};
  }
}

export function clearUtmParams(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

// Auto-capture on module load
captureUtmParams();
