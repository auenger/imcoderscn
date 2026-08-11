import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    author: z.string().default('杨正武'),
    image: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const playbook = defineCollection({
  type: 'content',
  schema: z.object({
    book: z.enum(['harness', 'agent']),
    title: z.string(),
    description: z.string(),
    order: z.number(),
    part: z.string(),
    chapter: z.string(),
    updatedAt: z.coerce.date(),
    sourceUrl: z.string().url().optional(),
    sourceRevision: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog, playbook };
