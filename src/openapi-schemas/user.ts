import { z } from '@hono/zod-openapi';

// User schema matching your database model
export const userSchema = z.object({
  id: z.number(),
  email: z.string().email().nullable(),
  name: z.string().nullable(),
  // Add other user fields as needed
}).openapi("User");

export const usersResponseSchema = z.object({
  users: z.array(userSchema)
});

export type UsersResponse = z.infer<typeof usersResponseSchema>;


