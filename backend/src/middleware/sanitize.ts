import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { Request, Response, NextFunction } from 'express';

// Create a DOMPurify instance for Node.js
const window = new JSDOM('').window;
const purify = DOMPurify(window as any);

// Configure DOMPurify to be very strict
purify.setConfig({
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'p', 'br', 'ul', 'ol', 'li', 'a', 'code', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
  ALLOWED_ATTR: ['href', 'target', 'rel'],
  ALLOW_DATA_ATTR: false,
  ALLOW_UNKNOWN_PROTOCOLS: false,
});

/**
 * Sanitize string to prevent XSS attacks
 */
export const sanitizeInput = (input: any): any => {
  if (typeof input === 'string') {
    return purify.sanitize(input, { RETURN_DOM_FRAGMENT: false });
  }
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const key in input) {
      if (input.hasOwnProperty(key)) {
        sanitized[key] = sanitizeInput(input[key]);
      }
    }
    return sanitized;
  }
  return input;
};

/**
 * Express middleware to sanitize request body, query, and params
 */
export const sanitizeMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.body) {
    req.body = sanitizeInput(req.body);
  }
  if (req.query) {
    req.query = sanitizeInput(req.query);
  }
  if (req.params) {
    req.params = sanitizeInput(req.params);
  }
  next();
};

/**
 * Sanitize only specific fields that allow HTML content
 */
export const sanitizeHtmlFields = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.body) {
      fields.forEach(field => {
        if (req.body[field]) {
          req.body[field] = purify.sanitize(req.body[field]);
        }
      });
    }
    next();
  };
};
