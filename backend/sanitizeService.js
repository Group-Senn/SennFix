function sanitizeValue(val) {
  if (typeof val === 'string') {
    return val
      .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim();
  }
  if (Array.isArray(val)) {
    return val.map(sanitizeValue);
  }
  if (val !== null && typeof val === 'object') {
    const sanitized = {};
    for (const key in val) {
      sanitized[key] = sanitizeValue(val[key]);
    }
    return sanitized;
  }
  return val;
}

export function sanitizeMiddleware(req, res, next) {
  if (req.body) {
    req.body = sanitizeValue(req.body);
  }
  if (req.query) {
    // En Express 5 req.query se recalcula en cada lectura: se fija la versión saneada
    Object.defineProperty(req, 'query', { value: sanitizeValue({ ...req.query }), writable: true, configurable: true });
  }
  if (req.params) {
    for (const key in req.params) {
      req.params[key] = sanitizeValue(req.params[key]);
    }
  }
  next();
}
