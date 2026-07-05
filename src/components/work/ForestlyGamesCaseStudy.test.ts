import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const componentDir = fileURLToPath(new URL('.', import.meta.url));
const srcDir = join(componentDir, '..', '..');

function readSource(relativePath: string): string {
  return readFileSync(join(componentDir, relativePath), 'utf8');
}

function readProductionSources(dir: string): string {
  return readdirSync(dir)
    .filter((name) => !name.endsWith('.test.ts') && name !== 'content')
    .map((name) => {
      const path = join(dir, name);
      const stats = statSync(path);

      if (stats.isDirectory()) return readProductionSources(path);
      if (!/\.(astro|css|ts|tsx)$/.test(name)) return '';

      return readFileSync(path, 'utf8');
    })
    .join('\n');
}

describe('ForestlyGames custom case study', () => {
  it('is routed through a custom component instead of the generic case-study body', () => {
    const layout = readSource('../../layouts/CaseStudyLayout.astro');

    expect(layout).toContain("import ForestlyGamesCaseStudy from '../components/work/ForestlyGamesCaseStudy.astro'");
    expect(layout).toContain("project.layout?.caseStudyVariant === 'forestlygames-studio'");
  });

  it('renders the requested studio page structure', () => {
    const component = readSource('ForestlyGamesCaseStudy.astro');

    expect(component).toContain('fg-case');
    expect(component).toContain('Across the Product Lifecycle');
    expect(component).toContain('Selected Games');
    expect(component).toContain('Leadership and Studio Operations');
    expect(component).toContain('Skills and Tools');
    expect(component).toContain('>ForestlyGames</h1>');
    expect(component).not.toContain('<span>Forestly</span>');
    expect(component).not.toContain('<span>Games</span>');
    expect(component).toContain('fg-hero__subtitle');
    expect(component).toContain('fg-hero__content');
    expect(component).toContain('fg-hero__media-fill');
    expect(component).toContain('Visit ForestlyGames');
    expect(component).toContain('forestlyGamesCaseStudy.heroReel');
    expect(component).toContain('fg-hero__video-shell');
    expect(component).toContain('fg-hero__video');
    const heroVideo = component.match(/<video[\s\S]*?class="fg-hero__video"[\s\S]*?><\/video>/)?.[0] ?? '';
    expect(heroVideo).toContain('autoplay');
    expect(heroVideo).toContain('loop');
    expect(heroVideo).toContain('muted');
    expect(heroVideo).toContain('aria-hidden="true"');
    expect(heroVideo).not.toContain('controls');
    expect(component).toContain('Studio reel');
    expect(component).not.toContain('heroImages');
    expect(component).not.toContain('fg-hero__frame');
    expect(component).not.toContain('media collage');
    expect(component).toContain('forestlyGamesCaseStudy.mediaHighlights');
    expect(component).toContain('fg-showcase');
    expect(component).toContain('Featured footage');
    expect(component).not.toContain('ForestlyGames in motion');
    expect(component).toContain('fg-lifecycle__chips');
    expect(component).toContain('fg-lifecycle__chip');
    expect(component).toContain('fg-scan-list');
    expect(component).toContain('fg-scan-label');
    expect(component).toContain('fg-scan-text');
    expect(component).toContain('area.points.map');
    expect(component).not.toContain('splitIntoScanItems');
    expect(component).toContain('fg-launch-note__inner');
    expect(component).toContain('fg-ops__grid');
    expect(component).toContain('fg-ops-card');
    expect(component).not.toContain('fg-ops__rail');
    expect(component).toContain('fg-skill-token');
    expect(component).toContain('forestlyGamesCaseStudy.featuredGames');
    expect(component).toContain('forestlyGamesCaseStudy.galleryGames');
    expect(component).toContain('forestlyGamesCaseStudy.skillGroups');
    expect(component).not.toContain('padStart');
    expect(component).not.toContain('fg-lifecycle__number');
    expect(component).not.toContain('View individual case study');
    expect(component).not.toContain('Open page');
  });

  it('does not use little numbered section labels anywhere in production source', () => {
    const source = readProductionSources(srcDir);

    expect(source).not.toContain('padStart');
    expect(source).not.toContain('fg-lifecycle__number');
    expect(source).not.toMatch(/>\s*0[1-9]\s*</);
    expect(source).not.toMatch(/counter-(reset|increment)/);
  });
});
