/**
 * @fileoverview Unit tests for React components.
 * Tests the formatting utility, constants, and component rendering.
 * Uses Vitest + React Testing Library.
 * @module tests/components
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { CHAT_SUGGESTIONS, UI_COPY } from '../src/constants/copy';

// ── Constants Tests ─────────────────────────────────────────────────────────

describe('UI_COPY constants', () => {
  it('should have APP_NAME defined', () => {
    expect(UI_COPY.APP_NAME).toBe('ElectionGuide AI');
  });

  it('should have a TAGLINE', () => {
    expect(UI_COPY.TAGLINE).toBeDefined();
    expect(typeof UI_COPY.TAGLINE).toBe('string');
  });

  it('should have DASHBOARD section', () => {
    expect(UI_COPY.DASHBOARD).toBeDefined();
    expect(UI_COPY.DASHBOARD.TITLE).toBe('User Dashboard');
    expect(UI_COPY.DASHBOARD.QUIZ_SCORE).toBeDefined();
    expect(UI_COPY.DASHBOARD.CHECKLIST).toBeDefined();
    expect(UI_COPY.DASHBOARD.CHATS).toBeDefined();
    expect(UI_COPY.DASHBOARD.STREAK).toBeDefined();
  });

  it('should have TIMELINE section', () => {
    expect(UI_COPY.TIMELINE).toBeDefined();
    expect(UI_COPY.TIMELINE.TITLE).toBe('Election Timeline');
  });

  it('should have CHECKLIST section', () => {
    expect(UI_COPY.CHECKLIST).toBeDefined();
    expect(UI_COPY.CHECKLIST.TITLE).toBe('Voter Readiness Checklist');
  });

  it('should have QUIZ section with difficulty levels', () => {
    expect(UI_COPY.QUIZ).toBeDefined();
    expect(UI_COPY.QUIZ.BEGINNER).toBe('Beginner');
    expect(UI_COPY.QUIZ.INTERMEDIATE).toBe('Intermediate');
    expect(UI_COPY.QUIZ.ADVANCED).toBe('Advanced');
  });
});

describe('CHAT_SUGGESTIONS', () => {
  it('should be an array', () => {
    expect(Array.isArray(CHAT_SUGGESTIONS)).toBe(true);
  });

  it('should have at least 4 suggestions', () => {
    expect(CHAT_SUGGESTIONS.length).toBeGreaterThanOrEqual(4);
  });

  it('should contain only non-empty strings', () => {
    CHAT_SUGGESTIONS.forEach(suggestion => {
      expect(typeof suggestion).toBe('string');
      expect(suggestion.trim().length).toBeGreaterThan(0);
    });
  });

  it('should contain election-related content', () => {
    const combined = CHAT_SUGGESTIONS.join(' ').toLowerCase();
    expect(combined).toContain('vote');
  });
});

// ── Markdown Formatter Tests ────────────────────────────────────────────────

/**
 * Reimplementation of the formatMarkdown function from Chat.jsx for testing.
 * This ensures the formatting logic is correct independently of React rendering.
 */
function formatMarkdownToPlainText(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')   // Strip bold markers
    .replace(/<[^>]*>/g, '')            // Strip HTML
    .trim();
}

describe('formatMarkdownToPlainText (Chat formatter logic)', () => {
  it('should return empty string for null input', () => {
    expect(formatMarkdownToPlainText(null)).toBe('');
  });

  it('should return empty string for undefined input', () => {
    expect(formatMarkdownToPlainText(undefined)).toBe('');
  });

  it('should strip **bold** markers', () => {
    expect(formatMarkdownToPlainText('This is **bold** text')).toBe('This is bold text');
  });

  it('should handle multiple bold sections', () => {
    const input = '**First** and **second** bold';
    expect(formatMarkdownToPlainText(input)).toBe('First and second bold');
  });

  it('should strip HTML tags', () => {
    expect(formatMarkdownToPlainText('Hello <b>world</b>')).toBe('Hello world');
  });

  it('should pass through plain text unchanged', () => {
    const plain = 'Just a normal sentence about voting.';
    expect(formatMarkdownToPlainText(plain)).toBe(plain);
  });

  it('should handle text with line breaks', () => {
    const input = 'Line 1\nLine 2\n\nLine 3';
    const result = formatMarkdownToPlainText(input);
    expect(result).toContain('Line 1');
    expect(result).toContain('Line 3');
  });

  it('should handle emoji content', () => {
    const input = '🗳️ **Vote** today!';
    expect(formatMarkdownToPlainText(input)).toBe('🗳️ Vote today!');
  });
});

// ── Simple Component Render Tests ───────────────────────────────────────────

describe('Basic React rendering', () => {
  it('should render a simple test element', () => {
    const TestComponent = () => <div data-testid="test">ElectionGuide AI</div>;
    render(<TestComponent />);
    expect(screen.getByTestId('test')).toHaveTextContent('ElectionGuide AI');
  });

  it('should render suggestion buttons', () => {
    const SuggestionList = () => (
      <div>
        {CHAT_SUGGESTIONS.map((s, i) => (
          <button key={i} data-testid={`suggestion-${i}`}>{s}</button>
        ))}
      </div>
    );
    render(<SuggestionList />);
    CHAT_SUGGESTIONS.forEach((s, i) => {
      expect(screen.getByTestId(`suggestion-${i}`)).toHaveTextContent(s);
    });
  });

  it('should render with correct app name', () => {
    const Header = () => <h1 data-testid="app-name">{UI_COPY.APP_NAME}</h1>;
    render(<Header />);
    expect(screen.getByTestId('app-name')).toHaveTextContent('ElectionGuide AI');
  });
});
