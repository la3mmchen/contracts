// Configuration for "The Coverage Matrix" dashboard.
//
// Each Life Category groups a set of baseline necessities. A contract is
// considered to satisfy a baseline when its category, one of its tags, or its
// name/company matches one of the baseline's `keywords` (case-insensitive
// substring match).
//
// The active configuration is loaded at runtime from `public/coverage.json`
// (see `loadCoverageConfig`), so admins can edit or volume-mount their own
// file without rebuilding. `DEFAULT_COVERAGE_CATEGORIES` is used as a seed for
// the first render and as a fallback when the file is missing or invalid.

export interface CoverageBaseline {
  /** Stable id used as a React key. */
  id: string;
  /** Human-readable label shown in the matrix. */
  label: string;
  /**
   * Keywords used to match a contract to this baseline. Matched (case
   * insensitively) against the contract's category, tags, name and company.
   */
  keywords: string[];
}

export interface CoverageCategory {
  id: string;
  label: string;
  baselines: CoverageBaseline[];
}

export const DEFAULT_COVERAGE_CATEGORIES: CoverageCategory[] = [
  {
    id: 'housing',
    label: 'Housing',
    baselines: [
      { id: 'rent-mortgage', label: 'Rent/Mortgage', keywords: ['rent', 'mortgage', 'lease', 'miete'] },
      { id: 'home-insurance', label: 'Home Insurance', keywords: ['home insurance', 'household', 'contents', 'hausrat', 'building insurance'] },
      { id: 'electricity', label: 'Electricity', keywords: ['electric', 'power', 'strom', 'energy'] },
      { id: 'internet', label: 'Internet', keywords: ['internet', 'broadband', 'fiber', 'fibre', 'dsl', 'wifi'] },
    ],
  },
  {
    id: 'mobility',
    label: 'Mobility',
    baselines: [
      { id: 'car-insurance', label: 'Car Insurance', keywords: ['car insurance', 'auto insurance', 'vehicle', 'kfz', 'motor insurance'] },
      { id: 'public-transit', label: 'Public Transit', keywords: ['transit', 'transport', 'metro', 'bus', 'train', 'bahn', 'ticket'] },
    ],
  },
  {
    id: 'insurance',
    label: 'Insurance',
    baselines: [
      { id: 'health-insurance', label: 'Health Insurance', keywords: ['health', 'medical', 'krankenversicherung', 'dental'] },
      { id: 'liability-insurance', label: 'Liability Insurance', keywords: ['liability', 'haftpflicht'] },
    ],
  },
  {
    id: 'connectivity',
    label: 'Connectivity',
    baselines: [
      { id: 'mobile-phone', label: 'Mobile Phone', keywords: ['mobile', 'phone', 'cell', 'handy', 'sim'] },
    ],
  },
];

// Minimal runtime validation for the fetched JSON. Returns the parsed config if
// it structurally matches CoverageCategory[], otherwise null.
const parseCoverageConfig = (data: unknown): CoverageCategory[] | null => {
  if (!data || typeof data !== 'object') return null;
  const categories = (data as { categories?: unknown }).categories;
  if (!Array.isArray(categories)) return null;

  const isString = (v: unknown): v is string => typeof v === 'string';

  const valid = categories.every((cat) => {
    if (!cat || typeof cat !== 'object') return false;
    const c = cat as Record<string, unknown>;
    if (!isString(c.id) || !isString(c.label) || !Array.isArray(c.baselines)) return false;
    return c.baselines.every((b) => {
      if (!b || typeof b !== 'object') return false;
      const base = b as Record<string, unknown>;
      return (
        isString(base.id) &&
        isString(base.label) &&
        Array.isArray(base.keywords) &&
        base.keywords.every(isString)
      );
    });
  });

  return valid ? (categories as CoverageCategory[]) : null;
};

let cached: CoverageCategory[] | null = null;

/**
 * Load the Coverage Matrix configuration from `public/coverage.json` at runtime.
 * Respects the `/contracts/` base path (GitHub Pages). Falls back to
 * DEFAULT_COVERAGE_CATEGORIES if the file is missing, unparseable, or invalid.
 */
export const loadCoverageConfig = async (): Promise<CoverageCategory[]> => {
  if (cached) return cached;

  try {
    const basePath = window.location.pathname.includes('/contracts/') ? '/contracts' : '';
    const response = await fetch(`${basePath}/coverage.json`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = JSON.parse(await response.text());
    const parsed = parseCoverageConfig(data);
    if (!parsed) {
      throw new Error('coverage.json does not match the expected structure');
    }
    cached = parsed;
    return cached;
  } catch (error) {
    console.warn('Failed to load coverage.json, using defaults:', error);
    cached = DEFAULT_COVERAGE_CATEGORIES;
    return cached;
  }
};
