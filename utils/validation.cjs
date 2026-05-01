/**
 * @fileoverview Server-side input validation and sanitization utilities.
 * Provides robust input cleaning to prevent XSS, injection, and abuse.
 * Exported for both server use and unit testing.
 * @module utils/validation
 */

/**
 * Maximum allowed message length in characters.
 * @constant {number}
 */
const MAX_MESSAGE_LENGTH = 500;

/**
 * Regex pattern to detect common HTML/script injection attempts.
 * @constant {RegExp}
 */
const CODE_INJECTION_PATTERN = /<script|<\/script|<iframe|<img\s|javascript:|on\w+\s*=|<object|<embed|<svg\s|<link\s/i;

/**
 * Regex pattern to detect SQL injection keywords.
 * @constant {RegExp}
 */
const SQL_INJECTION_PATTERN = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|EXEC)\b\s)/i;

/**
 * Validates and sanitizes a user chat message.
 * Checks for empty messages, excessive length, and injection attacks.
 *
 * @param {*} message - The raw user input to validate.
 * @returns {Object} Validation result.
 * @returns {boolean} result.valid - Whether the message passed validation.
 * @returns {string} [result.reason] - Reason for failure (if invalid).
 * @returns {string} [result.message] - Sanitized message (if valid).
 *
 * @example
 * const result = validateInput("How do I register to vote?");
 * // { valid: true, message: "How do I register to vote?" }
 *
 * @example
 * const result = validateInput("<script>alert('xss')</script>");
 * // { valid: false, reason: "code_detected" }
 */
function validateInput(message) {
  if (!message || typeof message !== 'string') {
    return { valid: false, reason: 'empty' };
  }

  const trimmed = message.trim();

  if (trimmed.length === 0) {
    return { valid: false, reason: 'empty' };
  }

  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return { valid: false, reason: 'too_long' };
  }

  if (CODE_INJECTION_PATTERN.test(trimmed)) {
    return { valid: false, reason: 'code_detected' };
  }

  if (SQL_INJECTION_PATTERN.test(trimmed)) {
    return { valid: false, reason: 'code_detected' };
  }

  // Sanitize: strip any remaining HTML tags as a safety net
  const sanitized = trimmed.replace(/<[^>]*>/g, '');

  return { valid: true, message: sanitized };
}

/**
 * Validates a session ID string.
 * Must be alphanumeric, 1-64 characters.
 *
 * @param {*} sessionId - The session ID to validate.
 * @returns {string} A safe session ID string.
 */
function sanitizeSessionId(sessionId) {
  if (!sessionId || typeof sessionId !== 'string') {
    return 'default';
  }
  // Only allow alphanumeric, dashes, and underscores
  const cleaned = sessionId.replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 64);
  return cleaned || 'default';
}

/**
 * Maps validation failure reasons to user-friendly error messages.
 * @constant {Object<string, string>}
 */
const ERROR_MESSAGES = {
  empty: "It looks like your message was empty. What would you like to know about elections?",
  too_long: "That's a lot to unpack! Could you share your most important question first and we'll go from there?",
  code_detected: "Looks like something went wrong with your message — could you rephrase your question?",
};

module.exports = {
  validateInput,
  sanitizeSessionId,
  ERROR_MESSAGES,
  MAX_MESSAGE_LENGTH,
  CODE_INJECTION_PATTERN,
};
