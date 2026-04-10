import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const chronicles = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/chronicles' }),
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

const fieldNotes = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/field-notes' }),
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
