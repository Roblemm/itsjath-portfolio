import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    one_line_summary: z.string(),
    category: z.enum(['software', 'platform', 'creative', 'studio']),
    status: z.string(),
    year: z.string(),
    role: z.string(),
    team_size: z.string().optional(),
    timeline: z.string().optional(),
    problem: z.string(),
    outcome: z.string(),
    skills: z.array(z.string()),
    recruiter_takeaway: z.string(),
    highlight: z.string().optional(),
    metrics: z
      .array(
        z.object({
          value: z.string(),
          label: z.string(),
        }),
      )
      .optional(),
    demo: z
      .object({
        youtubeId: z.string(),
        label: z.string().optional(),
      })
      .optional(),
    videos: z
      .array(
        z.object({
          title: z.string(),
          youtubeId: z.string(),
          note: z.string().optional(),
        }),
      )
      .optional(),
    featured: z.boolean().default(false),
    flagship: z.boolean().default(false),
    cover: z.string().optional(),
    gallery: z.array(z.string()).optional(),
    links: z
      .object({
        live: z.string().url().optional(),
        github: z.string().url().optional(),
      })
      .optional(),
  }),
});

export const collections = { projects };
