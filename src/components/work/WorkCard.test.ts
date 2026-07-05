import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const componentDir = fileURLToPath(new URL('.', import.meta.url));

function readSource(relativePath: string): string {
  return readFileSync(join(componentDir, relativePath), 'utf8');
}

describe('WorkCard publish affordance', () => {
  it('renders published case studies as links and draft proof cards as static articles', () => {
    const component = readSource('WorkCard.astro');

    expect(component).toContain('project.publishCaseStudy !== false');
    expect(component).toContain("const CardTag = isPublishedCaseStudy ? 'a' : 'article'");
    expect(component).toContain("href={isPublishedCaseStudy ? `/work/${project.slug}/` : undefined}");
    expect(component).toContain('{isPublishedCaseStudy && <span class="link-arrow">View case study');
    expect(component).not.toContain('<a\n  href={`/work/${project.slug}/`}');
  });
});
