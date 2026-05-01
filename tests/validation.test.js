/**
 * @fileoverview Unit tests for server-side input validation and sanitization.
 * @module tests/validation
 */
import { validateInput, sanitizeSessionId, ERROR_MESSAGES, MAX_MESSAGE_LENGTH } from '../utils/validation.cjs';

describe('validateInput', () => {
  it('should accept a normal civic question', () => {
    const result = validateInput('How do I register to vote?');
    expect(result.valid).toBe(true);
    expect(result.message).toBe('How do I register to vote?');
  });

  it('should trim whitespace from valid messages', () => {
    const result = validateInput('   What is the Electoral College?   ');
    expect(result.valid).toBe(true);
    expect(result.message).toBe('What is the Electoral College?');
  });

  it('should accept single character messages', () => {
    const result = validateInput('A');
    expect(result.valid).toBe(true);
  });

  it('should accept messages at the max length boundary', () => {
    const maxMsg = 'a'.repeat(MAX_MESSAGE_LENGTH);
    const result = validateInput(maxMsg);
    expect(result.valid).toBe(true);
    expect(result.message).toHaveLength(MAX_MESSAGE_LENGTH);
  });

  it('should reject null input', () => {
    expect(validateInput(null)).toEqual({ valid: false, reason: 'empty' });
  });

  it('should reject undefined input', () => {
    expect(validateInput(undefined)).toEqual({ valid: false, reason: 'empty' });
  });

  it('should reject empty string', () => {
    expect(validateInput('')).toEqual({ valid: false, reason: 'empty' });
  });

  it('should reject whitespace-only string', () => {
    expect(validateInput('   ')).toEqual({ valid: false, reason: 'empty' });
  });

  it('should reject non-string types (number)', () => {
    expect(validateInput(123)).toEqual({ valid: false, reason: 'empty' });
  });

  it('should reject non-string types (object)', () => {
    expect(validateInput({ text: 'hello' })).toEqual({ valid: false, reason: 'empty' });
  });

  it('should reject non-string types (array)', () => {
    expect(validateInput(['hello'])).toEqual({ valid: false, reason: 'empty' });
  });

  it('should reject messages exceeding max length', () => {
    const longMsg = 'a'.repeat(MAX_MESSAGE_LENGTH + 1);
    expect(validateInput(longMsg)).toEqual({ valid: false, reason: 'too_long' });
  });

  it('should reject very long messages (10000 chars)', () => {
    expect(validateInput('x'.repeat(10000)).reason).toBe('too_long');
  });

  it('should reject <script> tags', () => {
    expect(validateInput('<script>alert("xss")</script>').reason).toBe('code_detected');
  });

  it('should reject <iframe> tags', () => {
    expect(validateInput('<iframe src="evil.com"></iframe>').reason).toBe('code_detected');
  });

  it('should reject <img onerror> injection', () => {
    expect(validateInput('<img src=x onerror=alert(1)>').reason).toBe('code_detected');
  });

  it('should reject javascript: protocol', () => {
    expect(validateInput('javascript:void(0)').reason).toBe('code_detected');
  });

  it('should reject inline event handlers', () => {
    expect(validateInput('onmouseover=alert(1)').reason).toBe('code_detected');
  });

  it('should reject <svg> injection', () => {
    expect(validateInput('<svg onload=alert(1)>').reason).toBe('code_detected');
  });

  it('should reject <object> tag', () => {
    expect(validateInput('<object data="evil.swf">').reason).toBe('code_detected');
  });

  it('should reject SQL SELECT injection', () => {
    expect(validateInput("SELECT * FROM users").reason).toBe('code_detected');
  });

  it('should reject SQL DROP injection', () => {
    expect(validateInput("DROP TABLE users").reason).toBe('code_detected');
  });

  it('should reject SQL UNION injection', () => {
    expect(validateInput("UNION SELECT password FROM admin").reason).toBe('code_detected');
  });

  it('should strip benign HTML tags from valid messages', () => {
    const result = validateInput('What is a <b>primary</b> election?');
    expect(result.valid).toBe(true);
    expect(result.message).toBe('What is a primary election?');
  });
});

describe('sanitizeSessionId', () => {
  it('should return the ID for a valid alphanumeric session', () => {
    expect(sanitizeSessionId('abc123')).toBe('abc123');
  });

  it('should allow dashes and underscores', () => {
    expect(sanitizeSessionId('session-123_abc')).toBe('session-123_abc');
  });

  it('should strip special characters', () => {
    expect(sanitizeSessionId('sess!@#$%ion')).toBe('session');
  });

  it('should return "default" for null', () => {
    expect(sanitizeSessionId(null)).toBe('default');
  });

  it('should return "default" for undefined', () => {
    expect(sanitizeSessionId(undefined)).toBe('default');
  });

  it('should return "default" for empty string', () => {
    expect(sanitizeSessionId('')).toBe('default');
  });

  it('should return "default" for non-string types', () => {
    expect(sanitizeSessionId(12345)).toBe('default');
  });

  it('should truncate session IDs longer than 64 characters', () => {
    expect(sanitizeSessionId('a'.repeat(100))).toHaveLength(64);
  });
});

describe('ERROR_MESSAGES', () => {
  it('should have a message for "empty"', () => {
    expect(typeof ERROR_MESSAGES.empty).toBe('string');
  });

  it('should have a message for "too_long"', () => {
    expect(typeof ERROR_MESSAGES.too_long).toBe('string');
  });

  it('should have a message for "code_detected"', () => {
    expect(typeof ERROR_MESSAGES.code_detected).toBe('string');
  });
});
