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

    expect(content.indexOf('Featured product project')).toBeLessThan(
      content.indexOf('Featured engineering project'),
    );
    expect(content).toContain('productChapterIds');
    expect(content).toContain('work-product-chapters');
    expect(content).toContain('escape-bruno-head');
    expect(content).toContain('boss-battles');
    expect(content).toContain('roempires');
    expect(content).toContain('encaved');
    expect(content).toContain('evil-pets');
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
