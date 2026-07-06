import { describe, expect, it } from "vitest";
import {
  forestlyGamesCaseStudy,
  getPortfolioDisciplines,
  getPublishedPortfolioExperiences,
  getPortfolioExperienceBySlug,
  getPortfolioWorkGroups,
  getWorkPortfolioExperiences,
  portfolioExperiences,
} from "./portfolio";

const expectedSlugs = [
  "forestlygames",
  "forestlygames-operations-platform",
  "boss-battles",
  "roempires",
  "encaved",
  "escape-bruno-head",
  "evil-pets",
  "forestlydevs-marketplace",
  "purdue-dining-revamp",
  "jat-app",
  "frontera",
  "dataannotation",
  "amobant",
  "independent-game-design",
  "forestlygames-roblox-backend-systems",
  "bleep",
  "convergence-msu-neuralgrid",
  "rise-n-grind-smart-alarm",
  "give-me-dirt",
  "forestlygames-discord-bot",
  "roscouts",
  "the-livingston",
];

describe("portfolio data source", () => {
  it("contains every current portfolio case-study slug in one central list", () => {
    expect(portfolioExperiences.map((project) => project.slug)).toEqual(
      expectedSlugs,
    );
  });

  it("finds an experience by slug for the dynamic case-study route", () => {
    expect(getPortfolioExperienceBySlug("forestlygames")?.title).toBe(
      "ForestlyGames",
    );
    expect(getPortfolioExperienceBySlug("missing-project")).toBeUndefined();
  });

  it("groups Work page content without hardcoding full project records in the page", () => {
    const groups = getPortfolioWorkGroups();

    expect(groups.featuredProduct?.slug).toBe("forestlygames");
    expect(groups.featuredEngineering?.slug).toBe(
      "forestlygames-operations-platform",
    );
    expect(groups.productChapters.map((project) => project.slug)).toEqual([]);
    expect(groups.selectedProjects.map((project) => project.slug)).toEqual([
      "forestlydevs-marketplace",
      "purdue-dining-revamp",
      "jat-app",
      "frontera",
      "dataannotation",
      "amobant",
      "bleep",
      "convergence-msu-neuralgrid",
      "rise-n-grind-smart-alarm",
      "give-me-dirt",
      "forestlygames-discord-bot",
      "roscouts",
      "the-livingston",
    ]);
  });

  it("keeps only ForestlyGames routable in the publish-now configuration", () => {
    const publishedSlugs = getPublishedPortfolioExperiences().map(
      (project) => project.slug,
    );

    expect(publishedSlugs).toEqual(["forestlygames"]);
  });

  it("keeps non-routable Work projects visible when showOnWork is enabled", () => {
    expect(
      getWorkPortfolioExperiences().map((project) => project.slug),
    ).toEqual([
      "forestlygames",
      "forestlygames-operations-platform",
      "forestlydevs-marketplace",
      "purdue-dining-revamp",
      "jat-app",
      "frontera",
      "dataannotation",
      "amobant",
      "bleep",
      "convergence-msu-neuralgrid",
      "rise-n-grind-smart-alarm",
      "give-me-dirt",
      "forestlygames-discord-bot",
      "roscouts",
      "the-livingston",
    ]);

    expect(getPortfolioExperienceBySlug("forestlygames")?.showOnWork).toBe(
      true,
    );
    expect(
      getPortfolioExperienceBySlug("forestlygames")?.publishCaseStudy,
    ).toBe(true);
    expect(
      getPortfolioExperienceBySlug("forestlygames-operations-platform")
        ?.showOnWork,
    ).toBe(true);
    expect(
      getPortfolioExperienceBySlug("forestlygames-operations-platform")
        ?.publishCaseStudy,
    ).toBe(false);
  });

  it("keeps newly added preview cards non-routable", () => {
    const previewSlugs = [
      "dataannotation",
      "amobant",
      "bleep",
      "convergence-msu-neuralgrid",
      "rise-n-grind-smart-alarm",
      "give-me-dirt",
      "forestlygames-discord-bot",
      "roscouts",
      "the-livingston",
    ];

    previewSlugs.forEach((slug) => {
      const project = getPortfolioExperienceBySlug(slug);
      expect(project?.showOnWork).toBe(true);
      expect(project?.publishCaseStudy).toBe(false);
      expect(project?.caseStudy).toBeUndefined();
    });
  });

  it("keeps preview cards recruiter-useful for software engineering roles", () => {
    expect(
      getPortfolioExperienceBySlug("independent-game-design")?.showOnWork,
    ).toBe(false);
    expect(
      getPortfolioExperienceBySlug("forestlygames-roblox-backend-systems")
        ?.showOnWork,
    ).toBe(false);

    const dataAnnotation = getPortfolioExperienceBySlug("dataannotation");
    expect(dataAnnotation?.cardSignals).toEqual([
      "Python/Java/C#",
      "JavaScript/TypeScript",
      "SQL/Lua",
      "HTML/CSS",
      "Docker/Git",
    ]);
    expect(dataAnnotation?.technologies).toEqual(
      expect.arrayContaining([
        "Python",
        "Java",
        "JavaScript",
        "TypeScript",
        "C#",
        "SQL",
        "Lua",
        "Docker",
        "Git",
      ]),
    );
    expect(dataAnnotation?.metrics).toEqual([
      { value: "9+", label: "Languages reviewed" },
      { value: "Tests", label: "Failure detection" },
      { value: "Docker", label: "Repo environments" },
    ]);

    const bleep = getPortfolioExperienceBySlug("bleep");
    expect(bleep?.role).not.toContain("Lead");
    expect(JSON.stringify(bleep)).not.toContain("Majority");
    expect(bleep?.technologies).toEqual(
      expect.arrayContaining([
        "Java",
        "Client-server architecture",
        "Networking",
        "Persistence",
        "Software testing",
      ]),
    );

    const rise = getPortfolioExperienceBySlug("rise-n-grind-smart-alarm");
    expect(rise?.cardSignals).toEqual([
      "TypeScript",
      "Kotlin",
      "C++ firmware",
      "Firebase",
      "ESP32",
    ]);
    expect(rise?.technologies).toEqual(
      expect.arrayContaining([
        "TypeScript",
        "Kotlin",
        "Firebase",
        "ESP32",
        "PlatformIO",
        "C++",
      ]),
    );

    const discord = getPortfolioExperienceBySlug("forestlygames-discord-bot");
    expect(discord?.dates.display).toBe("2026");
    expect(discord?.cardSignals).toEqual([
      "Discord API",
      "Bot workflows",
      "Review queues",
      "Permission gates",
      "Status panels",
    ]);

    expect(getPortfolioExperienceBySlug("roscouts")?.metrics).toBeUndefined();
    expect(
      getPortfolioExperienceBySlug("the-livingston")?.metrics,
    ).toBeUndefined();
    expect(
      getPortfolioExperienceBySlug("convergence-msu-neuralgrid")?.metrics,
    ).toBeUndefined();
    expect(getPortfolioExperienceBySlug("give-me-dirt")?.metrics).toEqual([
      { value: "1,557", label: "CurseForge downloads" },
      { value: "701", label: "Spigot downloads" },
      { value: "12", label: "Public updates" },
    ]);
  });

  it("renders high-level work-card focus pills from data", () => {
    getWorkPortfolioExperiences().forEach((project) => {
      expect(
        getPortfolioDisciplines(project).length,
        project.slug,
      ).toBeGreaterThan(0);
    });
  });

  it("does not contain mojibake replacement text in portfolio data", () => {
    expect(JSON.stringify(portfolioExperiences)).not.toMatch(
      /\u00c3|\u00e2|\uFFFD/,
    );
  });

  it("allows optional media and metrics fields to be omitted per project", () => {
    const livingston = getPortfolioExperienceBySlug("the-livingston");

    expect(livingston?.metrics).toBeUndefined();
    expect(livingston?.gallery).toBeUndefined();
  });

  it("keeps corrected project facts and private values off Work cards", () => {
    const operations = getPortfolioExperienceBySlug(
      "forestlygames-operations-platform",
    );
    expect(operations?.metrics).toBeUndefined();
    expect(operations?.highlight).not.toContain("54M");

    const forestlyDevs = getPortfolioExperienceBySlug(
      "forestlydevs-marketplace",
    );
    expect(forestlyDevs?.status).toBe("Active");
    expect(forestlyDevs?.dates.display).toBe("2020-Present");
    expect(forestlyDevs?.metrics).toContainEqual({
      value: "8,500+",
      label: "Opportunities, portfolios, and jobs",
    });

    const purdue = getPortfolioExperienceBySlug("purdue-dining-revamp");
    expect(purdue?.title).toBe("Purdue Dining Revamp");
    expect(purdue?.status).toBe("Completed");
    expect(purdue?.dates.display).toBe("2024");
    expect(purdue?.metrics).toEqual([
      { value: "100+", label: "Form submissions in 24h" },
    ]);
    expect(purdue?.cardSignals).toEqual([
      "Consumer research",
      "Survey analysis",
      "Marketing strategy",
      "Data analysis",
      "Stakeholder management",
    ]);

    const jat = getPortfolioExperienceBySlug("jat-app");
    expect(jat?.status).toBe("Alpha");
    expect(jat?.outcome).toContain("alpha Spring Boot REST API");

    const frontera = getPortfolioExperienceBySlug("frontera");
    expect(frontera?.role).toBe("Cofounder");
    expect(frontera?.shortSummary).toContain("Intercollegiate student club");

    const dataAnnotation = getPortfolioExperienceBySlug("dataannotation");
    expect(dataAnnotation?.status).toBe("Completed");
    expect(dataAnnotation?.dates.display).toBe("2024-2026");

    const amobant = getPortfolioExperienceBySlug("amobant");
    expect(amobant?.role).toBe(
      "Information and Communications Technology Associate",
    );
    expect(JSON.stringify(amobant)).not.toContain("$47.7K");
    expect(JSON.stringify(amobant)).not.toContain("Catalog value");

    const roScouts = getPortfolioExperienceBySlug("roscouts");
    expect(roScouts?.role).toBe("Independent Game Scout");
    expect(roScouts?.disciplines).toEqual(["research", "product"]);
    expect(roScouts?.cardSignals).toEqual([
      "Market research",
      "Game analytics",
      "Acquisition outreach",
      "Performance analysis",
      "AI-assisted synthesis",
    ]);
  });

  it("provides cover art for Work cards that previously fell back to the code placeholder", () => {
    expect(
      getPortfolioExperienceBySlug("forestlygames-operations-platform")?.cover,
    ).toBe("/images/work/operations-platform/cover.svg");
    expect(getPortfolioExperienceBySlug("jat-app")?.cover).toBe(
      "/images/work/jat-app/cover.svg",
    );
  });

  it("uses a custom ForestlyGames case-study payload with the requested section order", () => {
    const forestlyGames = getPortfolioExperienceBySlug("forestlygames");

    expect(forestlyGames?.layout?.caseStudyVariant).toBe(
      "forestlygames-studio",
    );
    expect(forestlyGames?.role).toBe("Founder & Technical Product Lead");
    expect(forestlyGames?.dates.timeline).toBe("July 2020 to Present");
    expect(forestlyGames?.metrics).toEqual([
      { value: "54M+", label: "Total game visits" },
      { value: "6.3M+", label: "Hours played" },
      { value: "24M+", label: "YouTube views" },
      { value: "100+", label: "Collaborators led" },
    ]);

    expect(
      forestlyGamesCaseStudy.sections.map((section) => section.title),
    ).toEqual([
      "Across the Product Lifecycle",
      "Selected Games",
      "Leadership and Studio Operations",
      "Skills and Tools",
    ]);
    expect(
      forestlyGamesCaseStudy.lifecycle.map((area) =>
        area.points.map((point) => point.label),
      ),
    ).toEqual([
      ["Team assembly", "Delivery ops"],
      ["Roblox systems", "Full build"],
      ["Market research", "Analytics"],
      ["Creator campaigns", "Studio ops"],
    ]);
    expect(forestlyGamesCaseStudy.heroReel).toEqual({
      title: "ForestlyGames Studio Reel",
      label: "Studio reel",
      src: "/images/work/forestlygames/studio/fg-showcase-260129-v003.mp4",
      poster: "/images/work/forestlygames/studio/fg-showcase-poster.jpg",
    });
    expect(
      forestlyGamesCaseStudy.mediaHighlights.map((video) => video.title),
    ).toEqual(["RoEmpires Official Trailer", "Encaved Feature Video"]);
    expect(forestlyGamesCaseStudy.mediaHighlights[0].poster).toBe(
      "/images/work/forestlygames/studio/roempires-trailer-19s.jpg",
    );
    expect(
      forestlyGamesCaseStudy.featuredGames.map((game) => game.title),
    ).toEqual(["Escape Bruno Running Head", "RoEmpires"]);
    expect(forestlyGamesCaseStudy.featuredGames[0].bullets).toEqual([
      "End-to-end Lua build",
      "Readable game loop",
      "Creator launch path",
    ]);
    expect(
      forestlyGamesCaseStudy.galleryGames.find(
        (game) => game.title === "Encaved",
      )?.image.src,
    ).toBe("/images/work/forestlygames/studio/encaved-cave-entrance.png");
    expect(forestlyGamesCaseStudy.operations.map((item) => item.label)).toEqual(
      ["teams", "scope", "parallel work", "growth", "platform"],
    );
    expect(JSON.stringify(forestlyGamesCaseStudy)).not.toContain("20% to 60%");
    expect(JSON.stringify(forestlyGamesCaseStudy)).not.toContain(
      "can focus on",
    );
    forestlyGamesCaseStudy.skillGroups.forEach((group) => {
      expect(group.title).toBe(group.title.toLowerCase());
      group.skills.forEach((skill) => expect(skill).toBe(skill.toLowerCase()));
    });
  });
});
