export function validate(schema, target = 'body') {
  return function validateMiddleware(req, res, next) {
    const parsed = schema.safeParse(req[target]);

    if (!parsed.success) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        details: parsed.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    req[target] = parsed.data;
    return next();
  };
}
