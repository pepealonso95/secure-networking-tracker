import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import type { ContentfulStatusCode } from "hono/utils/http-status";

import { createContactSchema, updateContactSchema, zodFieldErrors } from "./contact-schema.js";
import { apiError, parseBearerToken } from "./http.js";
import { createDataClient, type DataClient } from "./neon.js";

type Variables = { token: string };
type ClientFactory = (token: string) => DataClient;

const contactFields =
  "id,name,company,role,where_met,notes,priority,created_at,updated_at" as const;

function allowedOrigins(): Set<string> {
  return new Set(
    (process.env.CORS_ALLOWED_ORIGINS ?? "http://localhost:3000")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  );
}

function isPositiveId(value: string): boolean {
  return /^[1-9]\d*$/.test(value);
}

function databaseFailure(message: string) {
  console.error("Database request failed", { message });
  return apiError("internal_error", "The contact service could not complete the request");
}

export function createApp(clientFactory: ClientFactory = createDataClient) {
  const app = new Hono<{ Variables: Variables }>().basePath("/api");

  app.use("*", logger());
  app.use(
    "*",
    cors({
      origin: (origin) => (allowedOrigins().has(origin) ? origin : ""),
      allowHeaders: ["Authorization", "Content-Type"],
      allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
      maxAge: 86400,
    }),
  );

  app.get("/health", (c) =>
    c.json({
      data: {
        status: "ok",
        service: "secure-networking-tracker-api",
      },
    }),
  );

  app.use("/contacts", async (c, next) => {
    const token = parseBearerToken(c.req.header("Authorization"));
    if (!token) {
      return c.json(apiError("unauthorized", "A valid bearer token is required"), 401);
    }
    c.set("token", token);
    await next();
  });

  app.use("/contacts/*", async (c, next) => {
    const token = parseBearerToken(c.req.header("Authorization"));
    if (!token) {
      return c.json(apiError("unauthorized", "A valid bearer token is required"), 401);
    }
    c.set("token", token);
    await next();
  });

  app.get("/contacts", async (c) => {
    const client = clientFactory(c.get("token"));
    const { data, error } = await client
      .from("contacts")
      .select(contactFields)
      .order("updated_at", { ascending: false });

    if (error) return c.json(databaseFailure(error.message), 500);
    return c.json({ data: data ?? [] });
  });

  app.post("/contacts", async (c) => {
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json(apiError("bad_request", "Request body must be valid JSON"), 400);
    }

    const parsed = createContactSchema.safeParse(body);
    if (!parsed.success) {
      return c.json(
        apiError("validation_error", "Please correct the highlighted fields", zodFieldErrors(parsed.error)),
        400,
      );
    }

    const client = clientFactory(c.get("token"));
    const { data, error } = await client
      .from("contacts")
      .insert(parsed.data)
      .select(contactFields)
      .single();

    if (error) return c.json(databaseFailure(error.message), 500);
    return c.json({ data }, 201);
  });

  app.patch("/contacts/:id", async (c) => {
    const id = c.req.param("id");
    if (!isPositiveId(id)) {
      return c.json(apiError("bad_request", "Contact id must be a positive integer"), 400);
    }

    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json(apiError("bad_request", "Request body must be valid JSON"), 400);
    }

    const parsed = updateContactSchema.safeParse(body);
    if (!parsed.success) {
      return c.json(
        apiError("validation_error", "Please correct the highlighted fields", zodFieldErrors(parsed.error)),
        400,
      );
    }

    const client = clientFactory(c.get("token"));
    const { data, error } = await client
      .from("contacts")
      .update(parsed.data)
      .eq("id", Number(id))
      .select(contactFields)
      .maybeSingle();

    if (error) return c.json(databaseFailure(error.message), 500);
    if (!data) return c.json(apiError("not_found", "Contact not found"), 404);
    return c.json({ data });
  });

  app.delete("/contacts/:id", async (c) => {
    const id = c.req.param("id");
    if (!isPositiveId(id)) {
      return c.json(apiError("bad_request", "Contact id must be a positive integer"), 400);
    }

    const client = clientFactory(c.get("token"));
    const { data, error } = await client
      .from("contacts")
      .delete()
      .eq("id", Number(id))
      .select("id")
      .maybeSingle();

    if (error) return c.json(databaseFailure(error.message), 500);
    if (!data) return c.json(apiError("not_found", "Contact not found"), 404);
    return c.json({ data: { id: data.id } });
  });

  app.notFound((c) => c.json(apiError("not_found", "Route not found"), 404));
  app.onError((error, c) => {
    console.error("Unhandled API error", { message: error.message });
    return c.json(
      apiError("internal_error", "An unexpected error occurred"),
      500 as ContentfulStatusCode,
    );
  });

  return app;
}

export const app = createApp();
