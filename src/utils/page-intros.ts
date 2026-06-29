export type PageIntroVariant = 'fade' | 'slide' | 'type' | 'split';

export interface PageIntroConfig {
  lines: string[];
  variant: PageIntroVariant;
  /** Accent line index — gets purple/gold gradient treatment */
  accent?: number;
}

const DEFAULTS: Record<string, PageIntroConfig> = {
  '/work/': {
    lines: ['Proof.', 'Selected work.'],
    variant: 'slide',
    accent: 1,
  },
  '/about/': {
    lines: ['Person.', 'Background & direction.'],
    variant: 'type',
    accent: 0,
  },
  '/contact/': {
    lines: ['Connection.', 'Open channel.'],
    variant: 'fade',
    accent: 1,
  },
};

export function getPageIntro(
  pathname: string,
  override?: PageIntroConfig | null,
): PageIntroConfig | null {
  if (pathname === '/' || pathname === '') return null;
  if (pathname.includes('.')) return null;

  if (override) return override;

  const normalized =
    pathname.endsWith('/') && pathname.length > 1 ? pathname : `${pathname}/`;

  if (DEFAULTS[normalized]) return DEFAULTS[normalized];

  if (normalized.startsWith('/work/') && normalized !== '/work/') {
    return {
      lines: ['Case study.'],
      variant: 'split',
      accent: 0,
    };
  }

  return {
    lines: ['itsjath.'],
    variant: 'fade',
  };
}

export function caseStudyIntro(title: string): PageIntroConfig {
  return {
    lines: ['Case study.', title],
    variant: 'split',
    accent: 1,
  };
}
