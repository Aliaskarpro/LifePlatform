/**
 * MIDDLEWARE SECURITY TESTS
 */

import { transformKeysToCamel, transformKeysToSnake } from '../src/middleware/transform';
import { sanitizeInput } from '../src/middleware/sanitize';

describe('Transform Middleware', () => {
  describe('snake_case to camelCase transformation', () => {
    test('should convert snake_case keys to camelCase', () => {
      const input = {
        first_name: 'John',
        last_name: 'Doe',
        email_address: 'john@example.com',
      };
      const expected = {
        firstName: 'John',
        lastName: 'Doe',
        emailAddress: 'john@example.com',
      };
      expect(transformKeysToCamel(input)).toEqual(expected);
    });

    test('should handle nested objects', () => {
      const input = {
        user_info: {
          first_name: 'John',
          last_name: 'Doe',
        },
        contact_details: {
          phone_number: '123456',
        },
      };
      const expected = {
        userInfo: {
          firstName: 'John',
          lastName: 'Doe',
        },
        contactDetails: {
          phoneNumber: '123456',
        },
      };
      expect(transformKeysToCamel(input)).toEqual(expected);
    });

    test('should handle arrays', () => {
      const input = [
        { user_id: 1, user_name: 'Alice' },
        { user_id: 2, user_name: 'Bob' },
      ];
      const expected = [
        { userId: 1, userName: 'Alice' },
        { userId: 2, userName: 'Bob' },
      ];
      expect(transformKeysToCamel(input)).toEqual(expected);
    });

    test('should handle null and undefined', () => {
      expect(transformKeysToCamel(null)).toBeNull();
      expect(transformKeysToCamel(undefined)).toBeUndefined();
    });
  });

  describe('camelCase to snake_case transformation', () => {
    test('should convert camelCase keys to snake_case', () => {
      const input = {
        firstName: 'John',
        lastName: 'Doe',
        emailAddress: 'john@example.com',
      };
      const expected = {
        first_name: 'John',
        last_name: 'Doe',
        email_address: 'john@example.com',
      };
      expect(transformKeysToSnake(input)).toEqual(expected);
    });

    test('should handle nested objects', () => {
      const input = {
        userInfo: {
          firstName: 'John',
          lastName: 'Doe',
        },
        contactDetails: {
          phoneNumber: '123456',
        },
      };
      const expected = {
        user_info: {
          first_name: 'John',
          last_name: 'Doe',
        },
        contact_details: {
          phone_number: '123456',
        },
      };
      expect(transformKeysToSnake(input)).toEqual(expected);
    });
  });
});

describe('Sanitization Middleware - XSS Prevention', () => {
  test('should remove script tags', () => {
    const malicious = '<script>alert("XSS")</script>Hello';
    const sanitized = sanitizeInput(malicious);
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).not.toContain('alert');
  });

  test('should remove event handlers', () => {
    const malicious = '<img src=x onerror="alert(1)">';
    const sanitized = sanitizeInput(malicious);
    expect(sanitized).not.toContain('onerror');
    expect(sanitized).not.toContain('alert');
  });

  test('should remove javascript: protocol', () => {
    const malicious = '<a href="javascript:alert(1)">Click</a>';
    const sanitized = sanitizeInput(malicious);
    expect(sanitized).not.toContain('javascript:');
  });

  test('should sanitize nested objects', () => {
    const malicious = {
      title: '<script>alert(1)</script>Safe Title',
      content: '<img src=x onerror=alert(1)>',
      tags: ['<script>xss</script>', 'safe-tag'],
    };
    const sanitized = sanitizeInput(malicious);
    expect(sanitized.title).not.toContain('<script>');
    expect(sanitized.content).not.toContain('onerror');
    expect(sanitized.tags[0]).not.toContain('<script>');
  });

  test('should preserve safe HTML tags', () => {
    const safe = '<p><strong>Bold</strong> and <em>italic</em> text</p>';
    const sanitized = sanitizeInput(safe);
    expect(sanitized).toContain('<strong>');
    expect(sanitized).toContain('<em>');
    expect(sanitized).toContain('<p>');
  });

  test('should handle arrays of strings', () => {
    const malicious = [
      'Safe string',
      '<script>alert(1)</script>',
      '<img src=x onerror=alert(1)>',
    ];
    const sanitized = sanitizeInput(malicious);
    expect(sanitized[0]).toBe('Safe string');
    expect(sanitized[1]).not.toContain('<script>');
    expect(sanitized[2]).not.toContain('onerror');
  });
});

export {};
