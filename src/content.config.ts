import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Shared schema for date-ordered article collections (chronicles, field notes).
// prev/next are NOT frontmatter: the [...slug] routes derive them from the
// date-sorted collection, so new entries slot into the chain automatically.
const articleCollection = (base: string) =>
  defineCollection({
    loader: glob({ pattern: '**/*.mdx', base }),
    schema: ({ image }) =>
      z.object({
        title: z.string(),
        description: z.string(),
        date: z.coerce.date(),
        heroImage: image().optional(),
        meta: z.string(),
        draft: z.boolean().default(false),
        sourceUrl: z.string().optional(),
        sourcesConsidered: z.array(z.string()).optional(),
        sources: z.array(z.object({
          title: z.string(),
          url: z.string().url(),
          publisher: z.string().optional(),
          publishedAt: z.string().optional(),
        })).optional(),
      }),
  });

const chronicles = articleCollection('./src/content/chronicles');
const fieldNotes = articleCollection('./src/content/field-notes');

const courses = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/courses' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      architect: z.string(),
      year: z.number(),
      location: z.string(),
      heroImage: image(),
      courseNumber: z.string(),
      style: z.string().optional(),
      draft: z.boolean().default(false),
      prev: z
        .object({
          slug: z.string(),
          title: z.string(),
        })
        .optional(),
      next: z
        .object({
          slug: z.string(),
          title: z.string(),
        })
        .optional(),
    }),
});

export const collections = { chronicles, courses, fieldNotes };
