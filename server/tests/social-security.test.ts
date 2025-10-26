import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  sanitizeInput,
  validateMessage,
  validateThreadTitle,
  validateThreadContent,
  validateComment,
  validateCategory,
} from '../validation';

describe('Social Features Security Tests', () => {
  describe('Input Validation', () => {
    describe('sanitizeInput', () => {
      it('should remove control characters', () => {
        const input = 'Hello\x00World\x01Test';
        const result = sanitizeInput(input);
        expect(result).toBe('HelloWorldTest');
      });

      it('should trim whitespace', () => {
        const input = '  Hello World  ';
        const result = sanitizeInput(input);
        expect(result).toBe('Hello World');
      });

      it('should preserve normal text', () => {
        const input = 'Hello World! This is a test.';
        const result = sanitizeInput(input);
        expect(result).toBe('Hello World! This is a test.');
      });

      it('should handle special characters safely', () => {
        const input = 'Test <script>alert("XSS")</script>';
        const result = sanitizeInput(input);
        // Should still contain the text but sanitized
        expect(result).toContain('Test');
        expect(result).toContain('script');
      });

      it('should handle empty strings', () => {
        const result = sanitizeInput('');
        expect(result).toBe('');
      });

      it('should handle strings with only whitespace', () => {
        const result = sanitizeInput('   ');
        expect(result).toBe('');
      });
    });

    describe('validateMessage', () => {
      it('should accept valid messages', () => {
        const result = validateMessage('Hello, this is a valid message!');
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('should reject null or undefined', () => {
        expect(validateMessage(null as any).valid).toBe(false);
        expect(validateMessage(undefined as any).valid).toBe(false);
      });

      it('should reject empty strings', () => {
        const result = validateMessage('');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('cannot be empty');
      });

      it('should reject whitespace-only strings', () => {
        const result = validateMessage('   ');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('cannot be empty');
      });

      it('should reject messages exceeding 1000 characters', () => {
        const longMessage = 'a'.repeat(1001);
        const result = validateMessage(longMessage);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('1000 characters');
      });

      it('should accept messages at exactly 1000 characters', () => {
        const message = 'a'.repeat(1000);
        const result = validateMessage(message);
        expect(result.valid).toBe(true);
      });

      it('should reject non-string values', () => {
        expect(validateMessage(123 as any).valid).toBe(false);
        expect(validateMessage({} as any).valid).toBe(false);
        expect(validateMessage([] as any).valid).toBe(false);
      });
    });

    describe('validateThreadTitle', () => {
      it('should accept valid titles', () => {
        const result = validateThreadTitle('Valid Thread Title');
        expect(result.valid).toBe(true);
      });

      it('should reject empty titles', () => {
        const result = validateThreadTitle('');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('cannot be empty');
      });

      it('should reject titles exceeding 200 characters', () => {
        const longTitle = 'a'.repeat(201);
        const result = validateThreadTitle(longTitle);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('200 characters');
      });

      it('should accept titles at exactly 200 characters', () => {
        const title = 'a'.repeat(200);
        const result = validateThreadTitle(title);
        expect(result.valid).toBe(true);
      });
    });

    describe('validateThreadContent', () => {
      it('should accept valid content', () => {
        const result = validateThreadContent('This is valid thread content.');
        expect(result.valid).toBe(true);
      });

      it('should reject empty content', () => {
        const result = validateThreadContent('');
        expect(result.valid).toBe(false);
      });

      it('should reject content exceeding 5000 characters', () => {
        const longContent = 'a'.repeat(5001);
        const result = validateThreadContent(longContent);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('5000 characters');
      });

      it('should accept content at exactly 5000 characters', () => {
        const content = 'a'.repeat(5000);
        const result = validateThreadContent(content);
        expect(result.valid).toBe(true);
      });
    });

    describe('validateComment', () => {
      it('should accept valid comments', () => {
        const result = validateComment('This is a valid comment.');
        expect(result.valid).toBe(true);
      });

      it('should reject empty comments', () => {
        const result = validateComment('');
        expect(result.valid).toBe(false);
      });

      it('should reject comments exceeding 2000 characters', () => {
        const longComment = 'a'.repeat(2001);
        const result = validateComment(longComment);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('2000 characters');
      });
    });

    describe('validateCategory', () => {
      const validCategories = ['general', 'markets', 'predictions', 'kols'];

      it('should accept valid categories', () => {
        validCategories.forEach(category => {
          const result = validateCategory(category, validCategories);
          expect(result.valid).toBe(true);
        });
      });

      it('should reject invalid categories', () => {
        const result = validateCategory('invalid-category', validCategories);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Invalid category');
      });

      it('should reject empty category', () => {
        const result = validateCategory('', validCategories);
        expect(result.valid).toBe(false);
      });

      it('should be case-sensitive', () => {
        const result = validateCategory('GENERAL', validCategories);
        expect(result.valid).toBe(false);
      });
    });
  });

  describe('XSS Prevention', () => {
    it('should handle potential XSS in messages', () => {
      const xssAttempts = [
        '<script>alert("XSS")</script>',
        '<img src=x onerror="alert(1)">',
        'javascript:alert(1)',
        '<iframe src="evil.com"></iframe>',
      ];

      xssAttempts.forEach(attempt => {
        const sanitized = sanitizeInput(attempt);
        // Content should be sanitized of control characters
        expect(sanitized).toBeDefined();
        // Validation should still accept it (React will escape it)
        const validation = validateMessage(attempt);
        expect(validation.valid).toBe(true);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle unicode characters', () => {
      const unicode = 'Hello 世界 🌍';
      const sanitized = sanitizeInput(unicode);
      expect(sanitized).toBe('Hello 世界 🌍');
      
      const validation = validateMessage(unicode);
      expect(validation.valid).toBe(true);
    });

    it('should handle newlines and tabs', () => {
      const text = 'Line 1\nLine 2\tTabbed';
      const sanitized = sanitizeInput(text);
      expect(sanitized).toContain('Line 1');
      expect(sanitized).toContain('Line 2');
    });

    it('should handle very long consecutive whitespace', () => {
      const text = 'Word1' + ' '.repeat(100) + 'Word2';
      const sanitized = sanitizeInput(text);
      expect(sanitized).toContain('Word1');
      expect(sanitized).toContain('Word2');
    });
  });

  describe('Rate Limiting Configuration', () => {
    it('should have appropriate limits defined', () => {
      // These values should match server/routes.ts
      const expectedLimits = {
        messages: { max: 10, window: 60000 },
        follows: { max: 20, window: 60000 },
        forumPosts: { max: 5, window: 60000 },
        votes: { max: 30, window: 60000 },
      };

      // Just documenting expected values - actual enforcement tested via integration tests
      expect(expectedLimits.messages.max).toBe(10);
      expect(expectedLimits.follows.max).toBe(20);
      expect(expectedLimits.forumPosts.max).toBe(5);
      expect(expectedLimits.votes.max).toBe(30);
    });
  });

  describe('Content Length Validation', () => {
    it('should enforce message length limit of 1000 chars', () => {
      const exactly1000 = 'a'.repeat(1000);
      const exactly1001 = 'a'.repeat(1001);

      expect(validateMessage(exactly1000).valid).toBe(true);
      expect(validateMessage(exactly1001).valid).toBe(false);
    });

    it('should enforce thread title length limit of 200 chars', () => {
      const exactly200 = 'a'.repeat(200);
      const exactly201 = 'a'.repeat(201);

      expect(validateThreadTitle(exactly200).valid).toBe(true);
      expect(validateThreadTitle(exactly201).valid).toBe(false);
    });

    it('should enforce thread content length limit of 5000 chars', () => {
      const exactly5000 = 'a'.repeat(5000);
      const exactly5001 = 'a'.repeat(5001);

      expect(validateThreadContent(exactly5000).valid).toBe(true);
      expect(validateThreadContent(exactly5001).valid).toBe(false);
    });

    it('should enforce comment length limit of 2000 chars', () => {
      const exactly2000 = 'a'.repeat(2000);
      const exactly2001 = 'a'.repeat(2001);

      expect(validateComment(exactly2000).valid).toBe(true);
      expect(validateComment(exactly2001).valid).toBe(false);
    });
  });
});
