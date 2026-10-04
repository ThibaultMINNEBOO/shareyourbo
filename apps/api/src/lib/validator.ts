import { zValidator } from "@hono/zod-validator";
import type { ValidationTargets } from "hono";
import type { z } from "zod";

/** zValidator that answers 400 with `{ error, issues }` like the rest of the API. */
export function validator<T extends z.ZodType, Target extends keyof ValidationTargets>(target: Target, schema: T) {
  return zValidator(target, schema, (result, c) => {
    if (!result.success) {
      const first = result.error.issues[0];
      const error = first ? `${first.path.join(".") || target}: ${first.message}` : "Invalid request";
      return c.json({ error, issues: result.error.issues }, 400);
    }
  });
}
