import { Request, Response, NextFunction } from 'express';

/**
 * Convert snake_case keys to camelCase
 */
function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Recursively transform object keys from snake_case to camelCase
 */
export function transformKeysToCamel(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(transformKeysToCamel);
  }

  if (typeof obj === 'object' && obj.constructor === Object) {
    const transformed: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const camelKey = snakeToCamel(key);
        transformed[camelKey] = transformKeysToCamel(obj[key]);
      }
    }
    return transformed;
  }

  return obj;
}

/**
 * Middleware to transform response data from snake_case to camelCase
 * This ensures frontend receives consistent camelCase data
 */
export const transformResponse = (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json.bind(res);

  res.json = function (data: any) {
    // Transform the data before sending
    const transformed = transformKeysToCamel(data);
    return originalJson(transformed);
  };

  next();
};

/**
 * Convert camelCase keys to snake_case
 */
function camelToSnake(str: string): string {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

/**
 * Recursively transform object keys from camelCase to snake_case
 */
export function transformKeysToSnake(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(transformKeysToSnake);
  }

  if (typeof obj === 'object' && obj.constructor === Object) {
    const transformed: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const snakeKey = camelToSnake(key);
        transformed[snakeKey] = transformKeysToSnake(obj[key]);
      }
    }
    return transformed;
  }

  return obj;
}

/**
 * Middleware to transform request data from camelCase to snake_case
 * This ensures database receives consistent snake_case data
 */
export const transformRequest = (req: Request, res: Response, next: NextFunction) => {
  if (req.body) {
    req.body = transformKeysToSnake(req.body);
  }
  if (req.query) {
    req.query = transformKeysToSnake(req.query);
  }
  next();
};
