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

  it('uses the concise Work hero and What I Bring scan block', () => {
    const page = readSource('../../pages/work/index.astro');
    const styles = readSource('../../styles/work.css');

    expect(page).toContain('Products that reach millions.');
    expect(page).toContain('<span class="work-hero__title-accent">millions</span>');
    expect(page).toContain('Software, platforms, and systems built for real users, teams, and outcomes.');
    expect(page).toContain('SOFTWARE ENGINEER');
    expect(page).toContain('PRODUCT BUILDER');
    expect(page).toContain('FOUNDER &amp; OPERATOR');
    expect(page).toContain('What I bring');
    expect(page).toContain('Fast engineering execution');
    expect(page).toContain('2601-speed.li');
    expect(page).toContain('Backend systems, full-stack products, databases, APIs, and automation');
    expect(page).toContain('Product ownership');
    expect(page).toContain('47-to-do-list.li');
    expect(page).toContain('Problem definition, product decisions, launch, iteration, and operations');
    expect(page).toContain('Real-world experience');
    expect(page).toContain('187-suitcase.li');
    expect(page).toContain('Real users, teams, budgets, deadlines, production constraints, and measurable results');
    expect(page).not.toContain('Jathniel Ahonsi');
    expect(styles).toContain('.work-hero__pills');
    expect(styles).toContain('.work-hero__title-accent');
    expect(styles).toContain('.work-hero__icon lord-icon');
    expect(styles).toContain('color: var(--purple-300);');
    expect(styles).toContain('.work-hero__pills li:hover');
    expect(styles).toContain('.work-hero__pills li:focus-within');
    expect(styles).toContain('border: 1px solid color-mix(in srgb, var(--white-500) 20%, transparent);');
    expect(styles).toContain('color: var(--white-300);');
    expect(styles).toContain('border-color: color-mix(in srgb, var(--gold-500) 42%, transparent);');
    expect(styles).toContain('color: var(--gold-100);');
    expect(styles).toContain('.work-hero__bring');
    expect(styles).toContain('.work-hero__capabilities');
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
