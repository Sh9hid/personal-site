import { defineCollection, z } from 'astro:content';

const publishSchema = z.object({
  id: z.string(),
  title: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  type: z.enum(['project', 'build', 'reading', 'note', 'daily']),
  tags: z.array(z.string()),
  abstract: z.string(),
  publish: z.boolean(),
  url: z.string().optional(),
  repo: z.string().optional(),
});

export const collections = {
  publish: defineCollection({
    type: 'content',
    schema: publishSchema,
  }),
};
