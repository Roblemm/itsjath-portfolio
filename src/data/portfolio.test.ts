import { describe, expect, it } from 'vitest';
import {
  forestlyGamesCaseStudy,
  getPublishedPortfolioExperiences,
  getPortfolioExperienceBySlug,
  getPortfolioWorkGroups,
  getWorkPortfolioExperiences,
  portfolioExperiences,
} from './portfolio';

const expectedSlugs = [
  'forestlygames',
  'forestlygames-operations-platform',
  'boss-battles',
  'roempires',
  'encaved',
  'escape-bruno-head',
  'evil-pets',
  'forestlydevs-marketplace',
  'purdue-dining-revamp',
  'jat-app',
  'frontera',
];

describe('portfolio data source', () => {
  it('contains every current portfolio case-study slug in one central list', () => {
    expect(portfolioExperiences.map((project) => project.slug)).toEqual(expectedSlugs);
  });

  it('finds an experience by slug for the dynamic case-study route', () => {
    expect(getPortfolioExperienceBySlug('forestlygames')?.title).toBe('ForestlyGames');
    expect(getPortfolioExperienceBySlug('missing-project')).toBeUndefined();
  });

  it('groups Work page content without hardcoding full project records in the page', () => {
    const groups = getPortfolioWorkGroups();

    expect(groups.featuredProduct?.slug).toBe('forestlygames');
    expect(groups.featuredEngineering?.slug).toBe('forestlygames-operations-platform');
    expect(groups.productChapters.map((project) => project.slug)).toEqual([]);
    expect(groups.selectedProjects.map((project) => project.slug)).toEqual([
      'forestlydevs-marketplace',
      'purdue-dining-revamp',
      'jat-app',
      'frontera',
    ]);
  });

  it('keeps only ForestlyGames routable in the publish-now configuration', () => {
    const publishedSlugs = getPublishedPortfolioExperiences().map((project) => project.slug);

    expect(publishedSlugs).toEqual(['forestlygames']);
  });

  it('keeps non-routable Work projects visible when showOnWork is enabled', () => {
    expect(getWorkPortfolioExperiences().map((project) => project.slug)).toEqual([
      'forestlygames',
      'forestlygames-operations-platform',
      'forestlydevs-marketplace',
      'purdue-dining-revamp',
      'jat-app',
      'frontera',
    ]);

    expect(getPortfolioExperienceBySlug('forestlygames')?.showOnWork).toBe(true);
    expect(getPortfolioExperienceBySlug('forestlygames')?.publishCaseStudy).toBe(true);
    expect(getPortfolioExperienceBySlug('forestlygames-operations-platform')?.showOnWork).toBe(true);
    expect(getPortfolioExperienceBySlug('forestlygames-operations-platform')?.publishCaseStudy).toBe(false);
  });

  it('allows optional media and metrics fields to be omitted per project', () => {
    const purdue = getPortfolioExperienceBySlug('purdue-dining-revamp');

    expect(purdue?.metrics).toBeUndefined();
    expect(purdue?.gallery).toBeUndefined();
  });

  it('provides cover art for Work cards that previously fell back to the code placeholder', () => {
    expect(getPortfolioExperienceBySlug('forestlygames-operations-platform')?.cover).toBe(
      '/images/work/operations-platform/cover.svg',
    );
    expect(getPortfolioExperienceBySlug('jat-app')?.cover).toBe('/images/work/jat-app/cover.svg');
  });

  it('uses a custom ForestlyGames case-study payload with the requested section order', () => {
    const forestlyGames = getPortfolioExperienceBySlug('forestlygames');

    expect(forestlyGames?.layout?.caseStudyVariant).toBe('forestlygames-studio');
    expect(forestlyGames?.role).toBe('Founder & Technical Product Lead');
    expect(forestlyGames?.dates.timeline).toBe('July 2020 to Present');
    expect(forestlyGames?.metrics).toEqual([
      { value: '54M+', label: 'Total game visits' },
      { value: '6.3M+', label: 'Hours played' },
      { value: '24M+', label: 'YouTube views' },
      { value: '100+', label: 'Developers collaborated' },
    ]);

    expect(forestlyGamesCaseStudy.sections.map((section) => section.title)).toEqual([
      'Across the Product Lifecycle',
      'Selected Games',
      'Leadership and Studio Operations',
      'Skills and Tools',
    ]);
    expect(forestlyGamesCaseStudy.lifecycle.map((area) => area.points.map((point) => point.label))).toEqual([
      ['Team assembly', 'Delivery ops'],
      ['Roblox systems', 'Full build'],
      ['Market research', 'Analytics'],
      ['Creator campaigns', 'Studio ops'],
    ]);
    expect(forestlyGamesCaseStudy.heroReel).toEqual({
      title: 'ForestlyGames Studio Reel',
      label: 'Studio reel',
      src: '/images/work/forestlygames/studio/fg-showcase-260129-v003.mp4',
      poster: '/images/work/forestlygames/studio/fg-showcase-poster.jpg',
    });
    expect(forestlyGamesCaseStudy.mediaHighlights.map((video) => video.title)).toEqual([
      'RoEmpires Official Trailer',
      'Encaved Feature Video',
    ]);
    expect(forestlyGamesCaseStudy.mediaHighlights[0].poster).toBe(
      '/images/work/forestlygames/studio/roempires-trailer-19s.jpg',
    );
    expect(forestlyGamesCaseStudy.featuredGames.map((game) => game.title)).toEqual([
      'Escape Bruno Running Head',
      'RoEmpires',
    ]);
    expect(forestlyGamesCaseStudy.featuredGames[0].bullets).toEqual([
      'End-to-end Lua build',
      'Readable game loop',
      'Creator launch path',
    ]);
    expect(forestlyGamesCaseStudy.galleryGames.find((game) => game.title === 'Encaved')?.image.src).toBe(
      '/images/work/forestlygames/studio/encaved-cave-entrance.png',
    );
    expect(forestlyGamesCaseStudy.operations.map((item) => item.label)).toEqual([
      'teams',
      'scope',
      'parallel work',
      'growth',
      'platform',
    ]);
    expect(JSON.stringify(forestlyGamesCaseStudy)).not.toContain('20% to 60%');
    expect(JSON.stringify(forestlyGamesCaseStudy)).not.toContain('can focus on');
    forestlyGamesCaseStudy.skillGroups.forEach((group) => {
      expect(group.title).toBe(group.title.toLowerCase());
      group.skills.forEach((skill) => expect(skill).toBe(skill.toLowerCase()));
    });
  });
});
