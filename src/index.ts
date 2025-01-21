import { instrument } from "@fiberplane/hono-otel";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { users } from "./db/schema";
import { createMiddleware } from "@fiberplane/embedded";
import { createRoute } from '@hono/zod-openapi';
import { OpenAPIHono } from '@hono/zod-openapi'
import { userSchema, usersResponseSchema } from './openapi-schemas/user'



type Bindings = {
  DATABASE_URL: string;
};

const app = new OpenAPIHono<{ Bindings: Bindings }>();

const user = userSchema;

//not working middleware
app.use(
  "/fp/*",
  createMiddleware({
    // @ts-expect-error - The imported spec does not match our expected OpenAPIv3 type
    spec: app.getOpenAPIDocument({
      openapi: "3.0.0",
      info: {
        title: "My Hono OpenAPI API",
        version: "0.0.1",
        description: "API documentation for my hono api",
      },
      servers: [
      ],
    }),
  }),
);

// working middleware
// app.use(
//   "/fp/*",
//   createMiddleware({
//     spec: "/doc",
//   }),
// );


app.get("/", (c) => {
  return c.text("Honc! 🪿");
});

const getUsersRoute = createRoute({
  method: 'get',
  path: '/api/users',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: usersResponseSchema,
        },
      },
      description: 'Returns list of users',
    },
  },
  tags: ['Users'],
});

app.openapi(getUsersRoute, async (c) => {
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  return c.json({
    users: await db.select().from(users),
  });
});

// The OpenAPI documentation will be available at /doc
app.doc('/doc', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'My API',
  },
})

export default instrument(app);
