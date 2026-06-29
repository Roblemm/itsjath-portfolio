import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectDir = fileURLToPath(new URL('.', import.meta.url));

function readProject(name: string): string {
  return readFileSync(join(projectDir, name), 'utf8');
}

function readAllProjectContent(): string {
  return readdirSync(projectDir)
    .filter((name) => name.endsWith('.md'))
    .map(readProject)
    .join('\n');
}

function readSource(relativePath: string): string {
  return readFileSync(join(projectDir, relativePath), 'utf8');
}

function readPublicPortfolioCopy(): string {
  return [
    readAllProjectContent(),
    readSource('../../layouts/CaseStudyLayout.astro'),
    readSource('../../pages/work/index.astro'),
  ].join('\n');
}

describe('portfolio content positioning', () => {
  it('uses Frontera instead of stale Project Ignite or BuildPurdue naming', () => {
    const content = readAllProjectContent();

    expect(content).toContain('title: Frontera');
    expect(content).not.toContain('title: Project Ignite');
    expect(content).not.toContain('BuildPurdue');
    expect(content).not.toContain('Build Purdue');
  });

  it('does not publish unaudited Purdue Dining metrics', () => {
    const content = readProject('purdue-dining-revamp.md');

    expect(content).not.toContain('100+');
    expect(content).not.toContain('Submissions in 24h');
    expect(content).not.toContain('status: Active');
    expect(content).toContain('Product research');
  });

  it('frames ForestlyGames as a studio portfolio rather than only Escape Bruno', () => {
    const content = readProject('forestlygames.md');

    expect(content).toContain('Across the ForestlyGames portfolio');
    expect(content).toContain('Escape Bruno Running Head');
    expect(content).toContain('Boss Battles');
    expect(content).toContain('RoEmpires');
    expect(content).toContain('Encaved');
  });

  it('keeps the featured product and game chapters visible on the Work page', () => {
    const content = readSource('../../pages/work/index.astro');

    expect(content.indexOf('work-featured__side-pill--product')).toBeLessThan(
      content.indexOf('work-featured__side-pill--software'),
    );
    expect(content).toContain('productChapterIds');
    expect(content).toContain('work-product-chapters');
    expect(content).toContain('escape-bruno-head');
    expect(content).toContain('boss-battles');
    expect(content).toContain('roempires');
    expect(content).toContain('encaved');
    expect(content).toContain('evil-pets');
  });

  it('labels the two ForestlyGames feature sides and keeps the columns top-aligned', () => {
    const page = readSource('../../pages/work/index.astro');
    const styles = readSource('../../styles/work.css');

    expect(page.indexOf('work-featured__side-pill work-featured__side-pill--product')).toBeLessThan(
      page.indexOf('work-featured__side-pill work-featured__side-pill--software'),
    );
    expect(page).toContain('work-featured__side-pill work-featured__side-pill--product');
    expect(page).toContain('work-featured__side-pill work-featured__side-pill--software');
    expect(page).toContain('Product');
    expect(page).toContain('Software');
    expect(styles).toContain('align-items: start;');
    expect(styles).not.toContain('.work-featured .work-card {\n  height: 100%;\n}');
  });

  it('makes the Work hero scannable with identity, roles, and quick facts', () => {
    const page = readSource('../../pages/work/index.astro');
    const styles = readSource('../../styles/work.css');

    expect(page).toContain('Jathniel Ahonsi');
    expect(page).toContain('Software engineer');
    expect(page).toContain('Product founder');
    expect(page).toContain('Game studio operator');
    expect(page).toContain('At a glance');
    expect(page).toContain('CS + Business Analytics');
    expect(page).toContain('Games, platforms, community growth');
    expect(page).not.toContain('turning messy ideas into shipped products');
    expect(styles).toContain('.work-hero__roles');
    expect(styles).toContain('.work-hero__snapshot');
    expect(styles).toContain('grid-template-columns: minmax(0, 1fr) minmax(18rem, 28rem);');
  });

  it('preserves ForestlyGames #1 trending copy in YAML frontmatter', () => {
    const content = readProject('forestlygames.md');
    const outcome = content.split('\n').find((line) => line.startsWith('outcome:'));

    expect(outcome).toContain('"');
    expect(outcome).toContain('#1 trending on YouTube Gaming');
  });

  it('avoids telling recruiters how to evaluate the work', () => {
    const content = readPublicPortfolioCopy();

    expect(content).not.toMatch(/recruiters? should/i);
    expect(content).not.toMatch(/recruiters? can verify/i);
    expect(content).not.toContain('Why this matters to recruiters');
  });
});
