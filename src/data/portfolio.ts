export type PortfolioCategory = 'software' | 'platform' | 'creative' | 'studio';

export interface PortfolioMetric {
  value: string;
  label: string;
}

export interface PortfolioImage {
  src: string;
  alt?: string;
}

export interface PortfolioVideo {
  youtubeId: string;
  title: string;
  note?: string;
}

export interface PortfolioDemo {
  youtubeId: string;
  label?: string;
}

export interface PortfolioLinks {
  live?: string;
  github?: string;
  [key: string]: string | undefined;
}

export type PortfolioText =
  | string
  | Array<
      | string
      | {
          text: string;
          href?: string;
          emphasis?: boolean;
        }
    >;

export interface PortfolioParagraphBlock {
  type: 'paragraph';
  text: PortfolioText;
}

export interface PortfolioListBlock {
  type: 'list';
  items: PortfolioText[];
}

export type PortfolioSectionBlock = PortfolioParagraphBlock | PortfolioListBlock;

export interface PortfolioCaseStudySection {
  /**
   * Change this title to rename a case-study section. Reorder sections in the
   * array to change page order. Remove a section entirely when a project does
   * not need that heading; the template only renders what exists.
   */
  title: string;
  blocks: PortfolioSectionBlock[];
}

export interface PortfolioLayoutOptions {
  /**
   * Reserved for project-specific presentation tweaks. Keep this small: prefer
   * the shared layout unless a project genuinely needs a different treatment.
   */
  caseStudyVariant?: 'standard' | 'forestlygames-studio';
}

export interface ForestlyGamesLifecycleArea {
  title: string;
  points: Array<{
    label: string;
    text: string;
  }>;
}

export interface ForestlyGamesFeaturedGame {
  title: string;
  href?: string;
  eyebrow: string;
  image: PortfolioImage;
  focus: string;
  body: string;
  bullets: string[];
}

export interface ForestlyGamesGalleryGame {
  title: string;
  href?: string;
  image: PortfolioImage;
  role: string;
  contribution: string;
}

export interface ForestlyGamesMediaHighlight {
  title: string;
  label: string;
  src: string;
  poster?: string;
}

export interface ForestlyGamesSkillGroup {
  title: string;
  skills: string[];
}

export interface ForestlyGamesOperationArea {
  label: string;
  text: string;
}

export interface ForestlyGamesCaseStudyContent {
  sections: Array<{ title: string }>;
  heroReel: ForestlyGamesMediaHighlight;
  mediaHighlights: ForestlyGamesMediaHighlight[];
  lifecycle: ForestlyGamesLifecycleArea[];
  featuredGames: ForestlyGamesFeaturedGame[];
  galleryGames: ForestlyGamesGalleryGame[];
  operations: ForestlyGamesOperationArea[];
  skillGroups: ForestlyGamesSkillGroup[];
}

export interface PortfolioExperience {
  /** URL slug used by /work/[slug]. Keep stable once published. */
  slug: string;
  title: string;
  category: PortfolioCategory;
  organization?: string;
  /** `display` is what appears on cards today; `timeline` appears in the case-study summary. */
  dates: {
    display: string;
    timeline?: string;
  };
  status?: string;
  role?: string;
  shortSummary: string;
  problem?: string;
  contribution?: string;
  outcome?: string;
  technologies?: string[];
  takeaway?: string;
  highlight?: string;
  metrics?: PortfolioMetric[];
  cover?: string;
  gallery?: PortfolioImage[];
  demo?: PortfolioDemo;
  videos?: PortfolioVideo[];
  links?: PortfolioLinks;
  featured?: boolean;
  flagship?: boolean;
  /** Set to false to keep a project in data without showing it on /work. Defaults to visible. */
  showOnWork?: boolean;
  /** Set to false when an experience should stay in data but not publish a /work/[slug] page. */
  publishCaseStudy?: boolean;
  layout?: PortfolioLayoutOptions;
  /**
   * Ordered case-study body. Add multiple summaries by creating more sections,
   * or omit this entirely for a project that only needs the top summary fields.
   */
  caseStudy?: {
    sections: PortfolioCaseStudySection[];
  };
}

export const categoryLabels: Record<PortfolioCategory, string> = {
  creative: 'Games & creative',
  platform: 'Platform',
  software: 'Software',
  studio: 'Studio',
};

export const productChapterSlugs = [
  'boss-battles',
  'roempires',
  'encaved',
  'escape-bruno-head',
  'evil-pets',
] as const;

const forestlyGamesMediaBase = '/images/work/forestlygames/studio';

export const forestlyGamesCaseStudy = {
  sections: [
    { title: 'Across the Product Lifecycle' },
    { title: 'Selected Games' },
    { title: 'Leadership and Studio Operations' },
    { title: 'Skills and Tools' },
  ],
  heroReel: {
    title: 'ForestlyGames Studio Reel',
    label: 'Studio reel',
    src: `${forestlyGamesMediaBase}/fg-showcase-260129-v003.mp4`,
    poster: `${forestlyGamesMediaBase}/fg-showcase-poster.jpg`,
  },
  mediaHighlights: [
    {
      title: 'RoEmpires Official Trailer',
      label: 'Official trailer',
      src: 'https://www.forestlygames.com/games/roempires/trailer.mp4',
      poster: '/images/work/forestlygames/studio/roempires-trailer-19s.jpg',
    },
    {
      title: 'Encaved Feature Video',
      label: 'Prototype video',
      src: 'https://www.forestlygames.com/games/encaved/the-mines-behind-in-front-updated.mp4',
      poster: 'https://www.forestlygames.com/games/encaved/encaved-header-poster.jpg',
    },
  ],
  lifecycle: [
    {
      title: 'Leadership and Delivery',
      points: [
        {
          label: 'Team assembly',
          text: 'Programmers, builders, UI designers, artists, audio specialists, marketers, and testers.',
        },
        {
          label: 'Delivery ops',
          text: 'Hiring, scope, budgets, deadlines, reviews, QA, blockers, and release readiness.',
        },
      ],
    },
    {
      title: 'Engineering',
      points: [
        {
          label: 'Roblox systems',
          text: 'Gameplay systems, interfaces, persistence, progression, monetization, live ops, and analytics support.',
        },
        {
          label: 'Full build',
          text: 'Programmed Escape Bruno Running Head from end to end.',
        },
      ],
    },
    {
      title: 'Product and Analytics',
      points: [
        {
          label: 'Market research',
          text: 'Market research, competitor scans, concepts, core loops, progression, economies, monetization, and onboarding.',
        },
        {
          label: 'Analytics',
          text: 'Playtesting and player analytics to identify onboarding and product problems before release.',
        },
      ],
    },
    {
      title: 'Growth and Studio Operations',
      points: [
        {
          label: 'Creator campaigns',
          text: 'Paid ads, creator campaigns, audience targeting, community growth, investors, and partners.',
        },
        {
          label: 'Studio ops',
          text: 'Staffing, payments, funding allocations, project documentation, and internal process.',
        },
      ],
    },
  ],
  featuredGames: [
    {
      title: 'Escape Bruno Running Head',
      eyebrow: 'Complete programming ownership',
      image: {
        src: `${forestlyGamesMediaBase}/escape-bruno-mirabel-glow.png`,
        alt: 'Escape Bruno Running Head character artwork with green glowing eyes.',
      },
      focus: 'Solo-programmed release',
      body: 'Programmed the game from end to end, then helped package the release around a clear creator-friendly loop.',
      bullets: ['End-to-end Lua build', 'Readable game loop', 'Creator launch path'],
    },
    {
      title: 'RoEmpires',
      eyebrow: 'Technical ambition and systems work',
      image: {
        src: `${forestlyGamesMediaBase}/roempires-thumbnail.png`,
        alt: 'RoEmpires battle key art with armored Roblox troops.',
      },
      focus: 'RTS kingdom builder',
      body: 'Contributed to a systems-heavy strategy project across construction, economy, combat, progression, and alpha iteration.',
      bullets: ['Strategy systems', 'Economy loops', 'Alpha leadership'],
    },
  ],
  galleryGames: [
    {
      title: 'Boss Battles',
      image: {
        src: `${forestlyGamesMediaBase}/boss-battles-thumbnail.png`,
        alt: 'Boss Battles dungeon combat hero artwork.',
      },
      role: 'Founder & Product Lead',
      contribution: 'Co-op combat, boss raids, live events',
    },
    {
      title: 'Encaved',
      image: {
        src: `${forestlyGamesMediaBase}/encaved-cave-entrance.png`,
        alt: 'Encaved mine entrance gameplay screenshot with hazard signs and glowing arrows.',
      },
      role: 'Founder & Creative Director',
      contribution: 'Horror survival, mine worlds, prototype loop',
    },
    {
      title: 'Evil Pets',
      image: {
        src: `${forestlyGamesMediaBase}/evil-pets-thumbnail.png`,
        alt: 'Evil Pets bright tycoon interior thumbnail.',
      },
      role: 'Founder & Product Lead',
      contribution: 'Pet tycoon hook, build acceleration',
    },
    {
      title: 'Turning Red Tycoon',
      image: {
        src: `${forestlyGamesMediaBase}/turning-red-tycoon-shot-1.png`,
        alt: 'Turning Red Tycoon school exterior gameplay screenshot.',
      },
      role: 'Studio founder & product operator',
      contribution: 'Tycoon progression, release capture',
    },
    {
      title: 'Raise a Brainrot',
      image: {
        src: `${forestlyGamesMediaBase}/raise-a-brainrot-thumbnail.png`,
        alt: 'Raise a Brainrot game thumbnail.',
      },
      role: 'Studio founder & product operator',
      contribution: 'Creator challenge, repeat-session hook',
    },
  ],
  operations: [
    {
      label: 'teams',
      text: 'assembled programmers, builders, UI designers, artists, audio, marketing, testers, and contractors',
    },
    {
      label: 'scope',
      text: 'defined concepts, priorities, budgets, deadlines, reviews, blockers, QA, and release readiness',
    },
    {
      label: 'parallel work',
      text: 'tracked staffing, docs, payments, funding, investor updates, testing, and launches across productions',
    },
    {
      label: 'growth',
      text: 'coordinated paid ads, creator campaigns, audience targeting, community needs, and launch operations',
    },
    {
      label: 'platform',
      text: 'built the Operations Platform when spreadsheets stopped scaling for budgets, staffing, payments, and reporting',
    },
  ],
  skillGroups: [
    {
      title: 'engineering',
      skills: ['lua', 'roblox studio', 'gameplay systems', 'persistence', 'analytics', 'debugging'],
    },
    {
      title: 'product',
      skills: ['game design', 'product strategy', 'market research', 'monetization', 'onboarding'],
    },
    {
      title: 'leadership',
      skills: ['project management', 'program management', 'hiring', 'budgeting', 'qa'],
    },
    {
      title: 'growth',
      skills: ['paid advertising', 'audience targeting', 'creator marketing', 'community growth'],
    },
  ],
} satisfies ForestlyGamesCaseStudyContent;

export const portfolioExperiences = [
  {
    slug: 'forestlygames',
    title: 'ForestlyGames',
    category: 'studio',
    organization: 'ForestlyGames',
    status: 'Operating',
    dates: {
      display: '2020-Present',
      timeline: 'July 2020 to Present',
    },
    role: 'Founder & Technical Product Lead',
    shortSummary:
      'Building Roblox games from concept to launch across engineering, product development, team leadership, marketing, and business operations.',
    problem:
      'Turn Roblox game ideas into playable releases by coordinating engineering, product development, team leadership, marketing, and business operations.',
    outcome:
      'Helped deliver 15+ Roblox game projects, with games and creator campaigns reaching more than 78 million combined plays and video views. One coordinated launch reached #1 trending on YouTube Gaming, and ForestlyGames grew into a community of more than 4,000 members.',
    technologies: [
      'Product direction',
      'Lua game programming',
      'Team leadership',
      'Creator partnerships',
      'Marketing strategy',
      'Live operations',
    ],
    takeaway:
      'Shows technical product leadership across engineering, launch strategy, marketing, team leadership, and live community operations.',
    highlight: 'Founded ForestlyGames in 2020 and helped turn game concepts into playable releases.',
    metrics: [
      { value: '54M+', label: 'Total game visits' },
      { value: '6.3M+', label: 'Hours played' },
      { value: '24M+', label: 'YouTube views' },
      { value: '100+', label: 'Developers collaborated' },
    ],
    featured: true,
    flagship: true,
    showOnWork: true,
    publishCaseStudy: true,
    cover: '/images/work/forestlygames/cover.png',
    gallery: [
      { src: '/images/work/boss-battles/cover.png' },
      { src: '/images/work/roempires/cover.png' },
      { src: '/images/work/encaved/cover.png' },
      { src: '/images/work/escape-bruno/cover.png' },
    ],
    links: {
      live: 'https://forestlygames.com',
    },
    layout: {
      caseStudyVariant: 'forestlygames-studio',
    },
    caseStudy: {
      sections: [
        {
          title: 'The studio',
          blocks: [
            {
              type: 'paragraph',
              text: 'Across the ForestlyGames portfolio, the work was not one single game or one single job. I founded and operated a Roblox game studio that combined programming, product direction, hiring, creator partnerships, advertising, community events, and investor communication.',
            },
            {
              type: 'paragraph',
              text: 'The important part is the repeatability: taking ideas from rough concepts into shipped games, then learning from players, creators, and the community to make the next release stronger.',
            },
          ],
        },
        {
          title: 'Selected games',
          blocks: [
            {
              type: 'paragraph',
              text: [
                'Escape Bruno Running Head',
                ' was the breakout release. I programmed the game myself, and it became the project that pulled the widest creator coverage and the strongest public attention. It was not the most visually impressive ForestlyGames project, but it proved the studio could ship a simple, readable game loop that creators wanted to play on camera.',
              ],
            },
            {
              type: 'paragraph',
              text: [
                'Boss Battles',
                ' shows the more systems-heavy side of the portfolio: combat pacing, encounter design, progression thinking, and the kind of moment-to-moment readability that keeps a multiplayer game understandable under pressure.',
              ],
            },
            {
              type: 'paragraph',
              text: [
                'RoEmpires',
                ' is an alpha strategy project. It belongs in the portfolio as evidence of broader product ambition: economy loops, territory control, player motivation, and long-form systems design.',
              ],
            },
            {
              type: 'paragraph',
              text: [
                'Encaved',
                " represents the studio's moodier adventure and survival direction, with more emphasis on environment, pacing, and atmosphere than the breakout horror-obby format.",
              ],
            },
            {
              type: 'paragraph',
              text: [
                'Evil Pets',
                ' added another angle to the portfolio: character-driven, collectible-style product thinking with a clearer marketing hook.',
              ],
            },
          ],
        },
        {
          title: 'Building and operating the studio',
          blocks: [
            {
              type: 'list',
              items: [
                'Delivered 6 game projects by coordinating programming, design, QA, launch, and iteration',
                'Planned creator outreach and collaborations that helped projects reach millions of viewers',
                'Grew a 4,000-member community through events, communication, and consistent updates',
                'Built investor and developer relationships through contracts, reporting, and project planning',
                'Ran promotional campaigns, giveaways, pricing experiments, and paid advertising',
              ],
            },
          ],
        },
        {
          title: 'What it taught me',
          blocks: [
            {
              type: 'paragraph',
              text: 'ForestlyGames is the clearest example of how my engineering and product sides connect. The games had to work, the teams had to move, the community had to care, and the public launch had to make sense. That combination is the actual story: not just one viral game, but a studio that repeatedly turned messy creative work into shipped products.',
            },
          ],
        },
      ],
    },
  },
  {
    slug: 'forestlygames-operations-platform',
    title: 'ForestlyGames Operations Platform',
    category: 'software',
    organization: 'ForestlyGames',
    status: 'In production',
    dates: {
      display: '2025â€“Present',
      timeline: '2025 â€“ present',
    },
    role: 'Founder & lead engineer',
    shortSummary: 'Production Next.js platform for studio budgets, staffing, payments, and delivery.',
    problem:
      'ForestlyGames needed a single system to manage projects, budgets, staffing, payments, and delivery across multiple studios â€” not spreadsheets and scattered tools.',
    outcome:
      'Deployed a production platform on Vercel with Discord OAuth, protected routes, cron jobs, and relational accounting rules for studio operations.',
    technologies: ['Next.js', 'TypeScript', 'PostgreSQL', 'Drizzle ORM', 'REST API design', 'Auth'],
    takeaway:
      'Full-stack ownership of a real operations product â€” schema design, auth, background jobs, and business rules in production.',
    highlight: 'The internal system running budgets, staffing, and payments across a studio with 54M+ game visits.',
    metrics: [
      { value: '54M+', label: 'Game visits' },
      { value: '6.3M+', label: 'Hours played' },
      { value: '24M+', label: 'YouTube views' },
    ],
    featured: true,
    flagship: false,
    showOnWork: true,
    publishCaseStudy: false,
    cover: '/images/work/operations-platform/cover.svg',
    links: {
      live: 'https://forestlygames.com',
    },
    caseStudy: {
      sections: [
        {
          title: 'Overview',
          blocks: [
            {
              type: 'paragraph',
              text: [
                'Built and deployed a production operations platform to manage projects, budgets, staffing, payments, and delivery across ForestlyGames studios. Pairs with the public ',
                { text: 'ForestlyGames marketing site', href: 'https://forestlygames.com' },
                ' â€” 54M+ visits, 6.3M+ hours played, 24M+ YouTube views across the portfolio.',
              ],
            },
          ],
        },
        {
          title: 'Technical work',
          blocks: [
            {
              type: 'list',
              items: [
                'Designed a relational schema covering studios, funding sources, financial commitments, payments, resource assignments, and open roles',
                'Implemented Discord OAuth with an authorized-user allowlist and protected routes',
                'Added bot endpoints, scheduled cron jobs, and automated daily digests',
                'Encoded accounting rules for budget caps, reserves, and Robux-to-USD payments',
              ],
            },
          ],
        },
        {
          title: 'Relevance',
          blocks: [
            {
              type: 'paragraph',
              text: 'Demonstrates backend architecture, data modeling, and shipping internal tools that teams depend on daily.',
            },
          ],
        },
      ],
    },
  },
  {
    slug: 'boss-battles',
    title: 'Boss Battles',
    category: 'creative',
    organization: 'ForestlyGames',
    publishCaseStudy: false,
    status: 'Released',
    dates: {
      display: '2023',
      timeline: 'Design through release',
    },
    role: 'Founder & Product Lead, ForestlyGames',
    shortSummary: 'Co-op dungeon fighter with class builds, boss raids, and live event content.',
    problem:
      'Deliver a replayable co-op combat experience with clear progression, social play, and room for seasonal events.',
    outcome:
      'Released a dungeon fighter with upgradeable swords, class optimization, team boss fights, and event content including FNAF-themed dungeons.',
    technologies: ['Product direction', 'Game systems', 'Live events', 'Team coordination'],
    takeaway:
      'Led a shipped multiplayer product with progression systems and event-driven retention â€” relevant to any live service or platform product.',
    highlight: 'Co-op dungeon fighter with class builds, boss raids, and FNAF-themed live events.',
    metrics: [
      { value: 'Released', label: 'Shipped' },
      { value: 'Live', label: 'Event content' },
    ],
    featured: true,
    flagship: false,
    showOnWork: false,
    cover: '/images/work/boss-battles/cover.png',
    gallery: [
      { src: '/images/work/boss-battles/gallery-1.png' },
      { src: '/images/work/boss-battles/gallery-2.png' },
    ],
    links: {
      live: 'https://forestlygames.com',
    },
    caseStudy: {
      sections: [
        {
          title: 'Overview',
          blocks: [
            {
              type: 'paragraph',
              text: 'Boss Battles is a dungeon combat co-op game where players upgrade gear, optimize class builds, and team up against bosses across themed dungeons including Entombed, Nature, Winter, and limited-time events.',
            },
          ],
        },
        {
          title: 'Execution',
          blocks: [
            {
              type: 'list',
              items: [
                "Scoped combat readability and co-op coordination for Roblox's audience",
                'Shipped progression loops around missions, loot, and class identity',
                'Ran live events to re-engage players and extend session depth',
              ],
            },
          ],
        },
        {
          title: 'Relevance',
          blocks: [
            {
              type: 'paragraph',
              text: 'Evidence of operating a live game product â€” not a one-time launch, but ongoing content and systems players return to.',
            },
          ],
        },
      ],
    },
  },
  {
    slug: 'roempires',
    title: 'RoEmpires',
    category: 'creative',
    organization: 'ForestlyGames',
    publishCaseStudy: false,
    status: 'Alpha',
    dates: {
      display: '2024',
      timeline: 'Prototype through alpha',
    },
    role: 'Founder & Product Lead, ForestlyGames',
    shortSummary: 'Real-time strategy kingdom builder in alpha â€” villages, troops, and multiplayer combat.',
    problem:
      "Build a strategy experience on Roblox that feels deep enough for repeat sessions but approachable for the platform's audience.",
    outcome:
      'Shipped an alpha with kingdom building, troop training, SP/MP combat, and a progression loop that supports ongoing live development.',
    technologies: ['Product direction', 'Game systems design', 'Live operations', 'Team leadership'],
    takeaway:
      'Shows ability to scope and ship a complex multiplayer product category â€” strategy, economy, and combat systems under studio constraints.',
    highlight: 'RTS kingdom builder in alpha â€” villages, troops, PvP/PvE, and live progression systems.',
    metrics: [
      { value: 'Alpha', label: 'Shipped stage' },
      { value: 'RTS', label: 'Product category' },
    ],
    featured: true,
    flagship: false,
    showOnWork: false,
    cover: '/images/work/roempires/cover.png',
    gallery: [
      { src: '/images/work/roempires/gallery-1.png' },
      { src: '/images/work/roempires/gallery-2.png' },
    ],
    links: {
      live: 'https://forestlygames.com',
    },
    caseStudy: {
      sections: [
        {
          title: 'Overview',
          blocks: [
            {
              type: 'paragraph',
              text: 'RoEmpires is a real-time strategy builder where players construct villages, train troops, and attack or defend in single-player and multiplayer modes. Buildings upgrade over time as players expand their empire.',
            },
          ],
        },
        {
          title: 'Product work',
          blocks: [
            {
              type: 'list',
              items: [
                'Defined core loop around construction, army growth, and PvP/PvE combat',
                'Led cross-discipline development through alpha with iterative playtesting',
                'Positioned the title as a flagship in-development release on the ForestlyGames showcase',
              ],
            },
          ],
        },
        {
          title: 'Relevance',
          blocks: [
            {
              type: 'paragraph',
              text: 'Demonstrates product thinking for systems-heavy games â€” economy, progression, and multiplayer balance â€” not just one-off experiences.',
            },
          ],
        },
      ],
    },
  },
  {
    slug: 'encaved',
    title: 'Encaved',
    category: 'creative',
    organization: 'ForestlyGames',
    publishCaseStudy: false,
    status: 'In development',
    dates: {
      display: '2025',
      timeline: 'Pre-production through active development',
    },
    role: 'Founder & Creative Director, ForestlyGames',
    shortSummary: 'Horror survival adventure set in ancient mines â€” co-op, crafting, and minecart traversal.',
    problem:
      'Create a horror survival experience that blends exploration, resource systems, and co-op tension without losing Roblox accessibility.',
    outcome:
      'In-development flagship with mine environments, character roster, upgrade loops, and prototype gameplay validated through internal playtests.',
    technologies: ['Creative direction', 'Systems design', 'Narrative worldbuilding', 'Production leadership'],
    takeaway:
      'Shows current creative leadership on a flagship title â€” scoping ambition, art direction, and multi-system gameplay before public launch.',
    highlight: 'Horror survival in ancient mines â€” co-op, crafting, minecarts, and a flagship in-development title.',
    metrics: [
      { value: 'In dev', label: 'Flagship title' },
      { value: 'Co-op', label: 'Multiplayer' },
    ],
    featured: true,
    flagship: false,
    showOnWork: false,
    cover: '/images/work/encaved/cover.png',
    gallery: [
      { src: '/images/work/encaved/gallery-1.png' },
      { src: '/images/work/encaved/gallery-2.png' },
    ],
    links: {
      live: 'https://forestlygames.com',
    },
    caseStudy: {
      sections: [
        {
          title: 'Overview',
          blocks: [
            {
              type: 'paragraph',
              text: 'Encaved is a horror survival adventure through ancient mines filled with monsters, secrets, and unpredictable events. Players ride minecarts, mine resources, upgrade tools, and fight spirits â€” blending horror with simulator-style progression.',
            },
          ],
        },
        {
          title: 'Direction',
          blocks: [
            {
              type: 'list',
              items: [
                'Built a cohesive world around the mine setting, character cast, and escalating threat',
                'Prototyped core loops â€” exploration, mining stations, upgrades, and co-op survival',
                'Featured as a primary showcase title on the ForestlyGames studio site',
              ],
            },
          ],
        },
        {
          title: 'Relevance',
          blocks: [
            {
              type: 'paragraph',
              text: 'Demonstrates forward-looking product leadership â€” shaping a multi-system game before launch, not only shipping what already exists.',
            },
          ],
        },
      ],
    },
  },
  {
    slug: 'escape-bruno-head',
    title: 'Escape Bruno Running Head',
    category: 'creative',
    organization: 'ForestlyGames',
    publishCaseStudy: false,
    status: 'Released',
    dates: {
      display: '2023',
      timeline: 'Concept through viral spread',
    },
    role: 'Solo programmer & founder, ForestlyGames',
    shortSummary:
      "Solo-programmed Roblox horror-obby that became ForestlyGames' breakout creator-covered release.",
    problem:
      'Turn a fast-paced obstacle horror concept into a readable Roblox release that creators could understand immediately and audiences could react to quickly.',
    outcome:
      'Became the ForestlyGames breakout release, drawing major creator coverage and helping the broader studio portfolio reach tens of millions of plays and views.',
    technologies: [
      'Lua programming',
      'Game systems',
      'Product direction',
      'Creator distribution',
      'Live iteration',
    ],
    takeaway:
      'Shows solo technical ownership of a shipped entertainment product, plus the judgment to turn a simple loop into a widely shared release.',
    highlight:
      'Solo-programmed breakout release with creator coverage from DenisDaily, FGTeeV, LankyBox, and GravyCatMan.',
    metrics: [
      { value: '9M+', label: 'DenisDaily video views' },
      { value: '4M+', label: 'GravyCatMan video views' },
      { value: '3.2M+', label: 'FGTeeV video views' },
      { value: '2.1M+', label: 'LankyBox video views' },
    ],
    demo: {
      youtubeId: 'ICKrc9I2npI',
      label: 'Escape Bruno gameplay',
    },
    videos: [
      { title: 'DenisDaily', youtubeId: 'XxteSlNAd2s', note: '9M+ views' },
      { title: 'GravyCatMan', youtubeId: 'M2YAK8UDoaA', note: '4M+ views' },
      { title: 'FGTeeV', youtubeId: 'gJBWB2fpCQ8', note: '3.2M+ views' },
      { title: 'LankyBox', youtubeId: 'AocMjuPPjFE', note: '2.1M+ views' },
    ],
    featured: false,
    flagship: false,
    showOnWork: false,
    cover: '/images/work/escape-bruno/cover.png',
    gallery: [
      { src: '/images/work/escape-bruno/gallery-1.png' },
      { src: '/images/work/escape-bruno/gallery-2.png' },
      { src: '/images/work/escape-bruno/gallery-3.png' },
    ],
    links: {
      live: 'https://forestlygames.com',
    },
    caseStudy: {
      sections: [
        {
          title: 'Context',
          blocks: [
            {
              type: 'paragraph',
              text: "Escape Bruno Running Head is a Roblox obstacle horror game where players outrun Bruno across maps filled with traps and set pieces. I programmed the game myself, then ForestlyGames pushed it through the studio's launch, creator, and community channels.",
            },
          ],
        },
        {
          title: 'The honest positioning',
          blocks: [
            {
              type: 'paragraph',
              text: 'This was the biggest breakout release, not the most visually ambitious project in the portfolio. The strength was the product loop: simple, readable, fast to react to, and easy for creators to turn into a video.',
            },
            {
              type: 'paragraph',
              text: 'That is why it works best as a chapter in the broader ForestlyGames case study. It proves solo implementation and distribution instincts, while the studio page carries the full product, leadership, and portfolio story.',
            },
          ],
        },
        {
          title: 'Decisions and execution',
          blocks: [
            {
              type: 'list',
              items: [
                'Programmed the core gameplay loop, obstacle pacing, and Roblox implementation',
                'Scoped the experience around tension, readability, and clip-friendly moments',
                'Used creator coverage as the distribution engine instead of relying only on platform discovery',
                'Iterated around player and viewer response once the release started spreading',
              ],
            },
          ],
        },
        {
          title: 'Evidence',
          blocks: [
            {
              type: 'paragraph',
              text: 'Creator coverage included DenisDaily, GravyCatMan, FGTeeV, LankyBox, and other Roblox creators. The release helped ForestlyGames prove that a small, focused game could break through when the concept, implementation, and creator timing lined up.',
            },
          ],
        },
        {
          title: 'Lessons',
          blocks: [
            {
              type: 'paragraph',
              text: 'Entertainment products do not always win because they are the most visually polished. They win when the loop is clear, the audience understands the joke or tension instantly, and the launch path matches the product.',
            },
          ],
        },
      ],
    },
  },
  {
    slug: 'evil-pets',
    title: 'Evil Pets',
    category: 'creative',
    organization: 'ForestlyGames',
    publishCaseStudy: false,
    status: 'Active development',
    dates: {
      display: '2024',
      timeline: 'Live development',
    },
    role: 'Founder & Product Lead, ForestlyGames',
    shortSummary: 'Pet-powered tycoon where allies accelerate builds and defend against enemy waves.',
    problem: 'Stand out in the Roblox tycoon genre with a hook that combines base-building and combat pressure.',
    outcome:
      'Active title with pet allies that speed construction and defend bases against waves â€” positioned for repeat sessions and short-form clips.',
    technologies: ['Product direction', 'Game loops', 'Live iteration'],
    takeaway: 'Shows range across genres within one studio â€” horror, strategy, and tycoon-action hybrids.',
    highlight: 'Pet-powered tycoon with build acceleration and wave defense â€” built for clip-friendly sessions.',
    featured: false,
    flagship: false,
    showOnWork: false,
    cover: '/images/work/evil-pets/cover.png',
    gallery: [{ src: '/images/work/evil-pets/gallery-1.png' }],
    links: {
      live: 'https://forestlygames.com',
    },
    caseStudy: {
      sections: [
        {
          title: 'Overview',
          blocks: [
            {
              type: 'paragraph',
              text: 'Evil Pets is a tycoon where pet allies help players build faster and defend against enemy waves. The design pairs progression satisfaction with action pressure to keep sessions engaging.',
            },
          ],
        },
        {
          title: 'Relevance',
          blocks: [
            {
              type: 'paragraph',
              text: 'Part of a portfolio demonstrating genre breadth and the ability to identify hooks that travel on short-form platforms.',
            },
          ],
        },
      ],
    },
  },
  {
    slug: 'forestlydevs-marketplace',
    title: 'ForestlyDevs Marketplace',
    category: 'platform',
    status: 'Operated 2020â€“2024',
    dates: {
      display: '2020â€“2024',
      timeline: 'Jul 2020 â€“ Jul 2024',
    },
    role: 'Founder & Platform Manager',
    shortSummary: 'Two-sided developer marketplace that grew to 1,200+ users and 8,500+ portfolios.',
    problem:
      'Creators needed a trusted place to find collaborators, post work, and showcase portfolios â€” with onboarding that did not stall after signup.',
    outcome:
      'Grew to 1,200+ users hosting 8,500+ portfolios; redesigned onboarding to increase engagement 500%+ and facilitate 40 new development projects in one month.',
    technologies: ['Platform operations', 'Onboarding design', 'Community growth', 'Product iteration'],
    takeaway:
      'Built and operated a real marketplace â€” growth, onboarding optimization, and facilitating transactions between developers.',
    highlight: 'Redesigned onboarding for a 500%+ engagement lift â€” 1,200+ users and 8,500+ portfolios hosted.',
    metrics: [
      { value: '1,200+', label: 'Users' },
      { value: '8,500+', label: 'Portfolios hosted' },
      { value: '500%', label: 'Onboarding lift' },
      { value: '40', label: 'Projects in one month' },
    ],
    featured: true,
    flagship: false,
    showOnWork: true,
    publishCaseStudy: false,
    cover: '/images/work/forestlydevs/cover.png',
    caseStudy: {
      sections: [
        {
          title: 'Overview',
          blocks: [
            {
              type: 'paragraph',
              text: [
                'ForestlyDevs began as a place by developers, for developers, with the motto ',
                { text: 'Grow Together', emphasis: true },
                '. The platform hosted portfolios, job postings, and project listings for Roblox and game-development creators.',
              ],
            },
          ],
        },
        {
          title: 'Operating work',
          blocks: [
            {
              type: 'list',
              items: [
                'Ran the two-sided marketplace end to end',
                'Onboarded and coached 100+ developers, converting interest into 40 new projects in one month',
                'Redesigned onboarding flows based on drop-off analysis â€” 500%+ engagement lift the following week',
                'Connected users with 8,500+ investment opportunities, portfolios, and job postings',
              ],
            },
          ],
        },
        {
          title: 'Relevance',
          blocks: [
            {
              type: 'paragraph',
              text: 'Shows ability to create and operate a platform business â€” not just write code, but grow usage and facilitate real collaborations.',
            },
          ],
        },
      ],
    },
  },
  {
    slug: 'purdue-dining-revamp',
    title: 'Purdue Dining Product Research',
    category: 'platform',
    status: 'Research archive',
    dates: {
      display: '2024',
      timeline: 'Aug 2024',
    },
    role: 'Product research & strategy lead',
    shortSummary: 'Student-led product research initiative around Purdue Dining app and service friction.',
    problem:
      "Purdue's dining app and services had friction students felt daily, but feedback was scattered and hard to act on.",
    outcome:
      'Collected student feedback, analyzed recurring pain points, and prepared data-informed recommendations for Purdue administration.',
    technologies: ['Consumer research', 'Marketing strategy', 'Data analysis', 'Stakeholder management'],
    takeaway: 'Shows product-minded research and stakeholder communication around a real campus service.',
    highlight: 'Product research translating student dining feedback into clearer recommendations.',
    featured: false,
    flagship: false,
    showOnWork: true,
    publishCaseStudy: false,
    cover: '/images/work/purdue-dining/cover.png',
    caseStudy: {
      sections: [
        {
          title: 'Overview',
          blocks: [
            {
              type: 'paragraph',
              text: 'Product research initiative focused on understanding student friction with Purdue Dining services and the dining app experience.',
            },
          ],
        },
        {
          title: 'Work',
          blocks: [
            {
              type: 'list',
              items: [
                'Conducted consumer surveys to identify issues with the Purdue dining app',
                'Coordinated meetings with Purdue administration to present data analytics and actionable insights',
                'Helped shape marketing and outreach strategy so more student feedback could be collected and understood',
                'Turned scattered student feedback into clearer problem areas for service and app improvements',
              ],
            },
          ],
        },
        {
          title: 'Relevance',
          blocks: [
            {
              type: 'paragraph',
              text: 'Demonstrates product-minded marketing and the ability to translate user feedback into organizational action.',
            },
          ],
        },
      ],
    },
  },
  {
    slug: 'jat-app',
    title: 'Jat App',
    category: 'software',
    status: 'Shipped',
    dates: {
      display: '2026',
      timeline: '2026',
    },
    role: 'Solo full-stack engineer',
    shortSummary: 'Full-stack productivity platform for goals, tasks, and job applications.',
    problem:
      'Needed a personal system to track goals, tasks, and job applications with proper domain modeling and test coverage â€” not another untyped side project.',
    outcome:
      'Shipped a Spring Boot REST API and Next.js front end with JUnit tests, DTOs, centralized exception handling, and Docker deployment.',
    technologies: ['Java', 'Spring Boot', 'Next.js', 'PostgreSQL', 'Docker', 'Automated testing'],
    takeaway:
      'Classic full-stack delivery â€” API design, persistence, front end, tests, and containerization.',
    highlight: 'Spring Boot + Next.js productivity stack with JUnit coverage and Docker deployment.',
    metrics: [
      { value: 'Full-stack', label: 'Solo build' },
      { value: 'JUnit', label: 'Test coverage' },
    ],
    featured: false,
    flagship: false,
    showOnWork: true,
    publishCaseStudy: false,
    cover: '/images/work/jat-app/cover.svg',
    caseStudy: {
      sections: [
        {
          title: 'Overview',
          blocks: [
            {
              type: 'paragraph',
              text: 'Built a full-stack productivity application for goals, tasks, and job applications.',
            },
          ],
        },
        {
          title: 'Technical work',
          blocks: [
            {
              type: 'list',
              items: [
                'Designed entities, repositories, services, and DTOs in Spring Boot',
                'Implemented centralized exception handling and JUnit test coverage',
                'Built the Next.js / React front end in TypeScript',
                'Containerized the stack with Docker for reproducible local and deployment workflows',
              ],
            },
          ],
        },
        {
          title: 'Relevance',
          blocks: [
            {
              type: 'paragraph',
              text: 'Direct evidence of backend engineering fundamentals for internship and new-grad software roles.',
            },
          ],
        },
      ],
    },
  },
  {
    slug: 'frontera',
    title: 'Frontera',
    category: 'platform',
    status: 'Completed',
    dates: {
      display: '2024-2025',
      timeline: 'Aug 2024 - Apr 2025',
    },
    role: 'Marketing Lead',
    shortSummary: 'Marketing and community operations for a Purdue student entrepreneurship organization.',
    problem:
      'An early student founder community needed clearer marketing, stronger engagement, and more reliable operating rhythms as it grew.',
    outcome:
      'Supported Frontera marketing initiatives, improved team engagement, and helped scale an online community from 0 to 200 members in three months.',
    technologies: ['Community growth', 'Marketing operations', 'Team coordination', 'Process improvement'],
    takeaway:
      'Shows community-building and operating discipline in a student organization with real growth pressure.',
    highlight: 'Scaled an online community from 0 to 200 members in three months.',
    metrics: [{ value: '200', label: 'Members in 3 months' }],
    featured: false,
    flagship: false,
    showOnWork: true,
    publishCaseStudy: false,
    cover: '/images/work/project-ignite/cover.png',
    caseStudy: {
      sections: [
        {
          title: 'Overview',
          blocks: [
            {
              type: 'paragraph',
              text: 'Frontera is a student entrepreneurship organization at Purdue. My work sat between marketing, operations, and community building: helping the team communicate more clearly, organize internal work, and turn early interest into a more active online community.',
            },
          ],
        },
        {
          title: 'Work',
          blocks: [
            {
              type: 'list',
              items: [
                'Supported marketing initiatives across Frontera channels and community touchpoints',
                'Improved team engagement through clearer operating processes and coordination',
                'Built and scaled an online community server from 0 to 200 members in three months',
                "Helped translate the organization's identity into practical outreach and member-facing systems",
              ],
            },
          ],
        },
        {
          title: 'Relevance',
          blocks: [
            {
              type: 'paragraph',
              text: 'This work shows the same pattern as the studio projects in a campus context: build the operating layer, clarify the message, and help a young community become easier to join and easier to run.',
            },
          ],
        },
      ],
    },
  },
] satisfies PortfolioExperience[];

export function getPortfolioExperienceBySlug(slug: string): PortfolioExperience | undefined {
  return portfolioExperiences.find((project) => project.slug === slug);
}

export function getPublishedPortfolioExperiences(): PortfolioExperience[] {
  return portfolioExperiences.filter((project) => project.publishCaseStudy !== false);
}

export function getWorkPortfolioExperiences(): PortfolioExperience[] {
  return portfolioExperiences.filter((project) => project.showOnWork !== false);
}

export function getPortfolioWorkGroups() {
  const workExperiences = getWorkPortfolioExperiences();
  const featuredProduct = workExperiences.find((project) => project.slug === 'forestlygames');
  const featuredEngineering = workExperiences.find((project) => project.slug === 'forestlygames-operations-platform');
  const featuredSlugs = new Set(
    [featuredProduct?.slug, featuredEngineering?.slug].filter((slug): slug is string => Boolean(slug)),
  );
  const productChapters = productChapterSlugs
    .map((slug) => getPortfolioExperienceBySlug(slug))
    .filter((project): project is PortfolioExperience => {
      if (!project) return false;
      return project.showOnWork !== false && project.publishCaseStudy !== false;
    });
  const chapterSlugs = new Set<string>(productChapterSlugs);
  const selectedProjects = workExperiences.filter(
    (project) => !featuredSlugs.has(project.slug) && !chapterSlugs.has(project.slug),
  );

  return {
    featuredProduct,
    featuredEngineering,
    productChapters,
    selectedProjects,
  };
}
