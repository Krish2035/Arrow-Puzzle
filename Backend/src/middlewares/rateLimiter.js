import rateLimit from 'express-rate-limit';

/**
 * General API Rate Limiter
 * 300 requests per 15 minutes per IP
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP. Please try again after 15 minutes.',
    retryAfterMinutes: 15
  }
});

/**
 * Stricter Rate Limiter for Game Actions (Level completions, profile sync)
 * 60 requests per 1 minute per IP
 */
export const actionLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many action requests. Please slow down.',
    retryAfterSeconds: 60
  }
});
