// Security module tests
import { describe, it, expect, beforeEach } from 'vitest';
import { 
  validators, 
  validateAppData, 
  checkRateLimit, 
  getSecurityHeaders,
  sanitizeOutput 
} from '../src/security.js';

describe('Security Module', () => {
  describe('Validators', () => {
    describe('URL validator', () => {
      it('should accept valid HTTPS URLs', () => {
        const result = validators.url('https://example.com');
        expect(result.valid).toBe(true);
        expect(result.value).toBe('https://example.com');
      });

      it('should accept valid HTTP URLs', () => {
        const result = validators.url('http://example.com');
        expect(result.valid).toBe(true);
      });

      it('should reject invalid URLs', () => {
        const result = validators.url('not-a-url');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Invalid URL format');
      });

      it('should reject non-HTTP protocols', () => {
        const result = validators.url('ftp://example.com');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Only HTTP/HTTPS URLs are allowed');
      });

      it('should reject localhost URLs', () => {
        const result = validators.url('http://localhost:3000');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Private/localhost URLs are not allowed');
      });

      it('should reject private IP addresses', () => {
        const tests = [
          'http://192.168.1.1',
          'http://10.0.0.1',
          'http://172.16.0.1'
        ];
        
        tests.forEach(url => {
          const result = validators.url(url);
          expect(result.valid).toBe(false);
          expect(result.error).toContain('Private/localhost URLs are not allowed');
        });
      });
    });

    describe('App name validator', () => {
      it('should accept valid app names', () => {
        const result = validators.appName('My App');
        expect(result.valid).toBe(true);
        expect(result.value).toBe('My App');
      });

      it('should trim whitespace', () => {
        const result = validators.appName('  My App  ');
        expect(result.valid).toBe(true);
        expect(result.value).toBe('My App');
      });

      it('should reject empty names', () => {
        const result = validators.appName('');
        expect(result.valid).toBe(false);
      });

      it('should reject names that are too short', () => {
        const result = validators.appName('A');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('must be between 2-100 characters');
      });

      it('should reject names that are too long', () => {
        const longName = 'A'.repeat(101);
        const result = validators.appName(longName);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('must be between 2-100 characters');
      });

      it('should reject XSS attempts', () => {
        const xssAttempts = [
          '<script>alert("xss")</script>',
          'javascript:alert("xss")',
          'onclick=alert("xss")'
        ];
        
        xssAttempts.forEach(name => {
          const result = validators.appName(name);
          expect(result.valid).toBe(false);
          expect(result.error).toContain('Invalid characters');
        });
      });
    });

    describe('UUID validator', () => {
      it('should accept valid UUIDs', () => {
        const uuid = '123e4567-e89b-12d3-a456-426614174000';
        const result = validators.uuid(uuid);
        expect(result.valid).toBe(true);
        expect(result.value).toBe(uuid);
      });

      it('should reject invalid UUIDs', () => {
        const invalidUuids = [
          'not-a-uuid',
          '123',
          '123e4567-e89b-12d3-a456-42661417400', // too short
          '123e4567-e89b-12d3-a456-4266141740000' // too long
        ];
        
        invalidUuids.forEach(uuid => {
          const result = validators.uuid(uuid);
          expect(result.valid).toBe(false);
          expect(result.error).toContain('Invalid ID format');
        });
      });
    });
  });

  describe('App data validation', () => {
    it('should validate complete app data', () => {
      const appData = {
        name: 'Test App',
        url: 'https://example.com',
        description: 'A test application',
        category: 'web',
        check_interval: 300,
        timeout: 5000,
        enable_alerts: true
      };

      const result = validateAppData(appData);
      expect(result.valid).toBe(true);
      expect(result.data.name).toBe('Test App');
      expect(result.data.url).toBe('https://example.com');
    });

    it('should handle missing optional fields', () => {
      const appData = {
        name: 'Test App',
        url: 'https://example.com'
      };

      const result = validateAppData(appData);
      expect(result.valid).toBe(true);
      expect(result.data.name).toBe('Test App');
      expect(result.data.url).toBe('https://example.com');
    });

    it('should reject invalid data', () => {
      const appData = {
        name: '', // invalid
        url: 'not-a-url' // invalid
      };

      const result = validateAppData(appData);
      expect(result.valid).toBe(false);
      expect(result.errors.name).toBeDefined();
      expect(result.errors.url).toBeDefined();
    });
  });

  describe('Rate limiting', () => {
    it('should allow requests within limit', () => {
      const mockRequest = {
        headers: {
          get: (name) => {
            if (name === 'CF-Connecting-IP') return '192.168.1.1';
            return null;
          }
        }
      };

      const result = checkRateLimit(mockRequest);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeGreaterThan(0);
    });

    it('should track different IP addresses separately', () => {
      const mockRequest1 = {
        headers: {
          get: (name) => {
            if (name === 'CF-Connecting-IP') return '192.168.1.1';
            return null;
          }
        }
      };

      const mockRequest2 = {
        headers: {
          get: (name) => {
            if (name === 'CF-Connecting-IP') return '192.168.1.2';
            return null;
          }
        }
      };

      const result1 = checkRateLimit(mockRequest1);
      const result2 = checkRateLimit(mockRequest2);
      
      expect(result1.allowed).toBe(true);
      expect(result2.allowed).toBe(true);
      expect(result1.identifier).not.toBe(result2.identifier);
    });
  });

  describe('Security headers', () => {
    it('should return comprehensive security headers', () => {
      const headers = getSecurityHeaders();
      
      expect(headers['X-Frame-Options']).toBe('DENY');
      expect(headers['X-Content-Type-Options']).toBe('nosniff');
      expect(headers['X-XSS-Protection']).toBe('1; mode=block');
      expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
      expect(headers['Strict-Transport-Security']).toContain('max-age=31536000');
      expect(headers['Content-Security-Policy']).toContain("default-src 'self'");
    });
  });

  describe('Output sanitization', () => {
    it('should sanitize strings with HTML characters', () => {
      const input = '<script>alert("xss")</script>';
      const result = sanitizeOutput(input);
      expect(result).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    });

    it('should sanitize objects recursively', () => {
      const input = {
        name: '<script>alert("xss")</script>',
        nested: {
          value: 'test&amp;'
        }
      };
      
      const result = sanitizeOutput(input);
      expect(result.name).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
      expect(result.nested.value).toBe('test&amp;amp;');
    });

    it('should sanitize arrays', () => {
      const input = ['<script>', 'normal text', '&amp;'];
      const result = sanitizeOutput(input);
      
      expect(result[0]).toBe('&lt;script&gt;');
      expect(result[1]).toBe('normal text');
      expect(result[2]).toBe('&amp;amp;');
    });

    it('should handle non-string values', () => {
      expect(sanitizeOutput(123)).toBe(123);
      expect(sanitizeOutput(true)).toBe(true);
      expect(sanitizeOutput(null)).toBe(null);
    });
  });
});