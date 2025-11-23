// middleware/validate.ts
import { ZodObject, ZodError } from 'zod';
import { RequestHandler } from 'express';

export const validate =
  (schema: ZodObject, where: 'body' | 'params' | 'query' = 'body'): RequestHandler =>
  (req, res, next) => {
    const input = (req as any)[where];
    const result = schema.safeParse(input);
    if (!result.success) {
      const e: ZodError = result.error;
      return res.status(400).json({
        error: 'ValidationError',
        issues: e.issues.map(i => ({ path: i.path.join('.'), message: i.message, code: i.code })),
      });
    }
    (req as any)[where] = result.data; // normalisoitu data sisään
    next();
  };
