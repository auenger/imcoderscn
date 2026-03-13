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

const podcast = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    duration: z.string().optional(),
    audioUrl: z.string().optional(),
    guest: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog, podcast };
