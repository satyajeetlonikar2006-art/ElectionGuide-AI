/**
 * @fileoverview Integration tests for the Express API server.
 * @module tests/server
 */
import express from 'express';
import { validateInput, sanitizeSessionId, ERROR_MESSAGES } from '../utils/validation.cjs';

/** Creates a test Express app with mock Gemini. */
function createTestApp(mockGemini) {
  const app = express();
  app.use(express.json({ limit: '10kb' }));
  const sessions = new Map();

  app.post('/api/chat', async (req, res) => {
    try {
      const { message, sessionId } = req.body;
      const validation = validateInput(message);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.reason, message: ERROR_MESSAGES[validation.reason] });
      }
      const sid = sanitizeSessionId(sessionId);
      if (!sessions.has(sid)) sessions.set(sid, { history: [], lastActive: Date.now() });
      const session = sessions.get(sid);
      session.lastActive = Date.now();
      const aiText = mockGemini ? await mockGemini(session.history, validation.message) : `Mock: ${validation.message}`;
      if (!aiText) throw new Error('Empty response');
      session.history.push({ role: 'user', text: validation.message });
      session.history.push({ role: 'model', text: aiText });
      if (session.history.length > 40) session.history = session.history.slice(-40);
      res.json({ response: aiText });
    } catch (error) {
      res.status(500).json({ error: 'server_error', message: 'Something went wrong.' });
    }
  });

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  return app;
}

let testApp, server;

beforeAll(() => {
  testApp = createTestApp();
  server = testApp.listen(0);
});

afterAll(() => { server?.close(); });

async function post(path, body) {
  const addr = server.address();
  const res = await fetch(`http://localhost:${addr.port}${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  return { status: res.status, data: await res.json() };
}

async function get(path) {
  const addr = server.address();
  const res = await fetch(`http://localhost:${addr.port}${path}`);
  return { status: res.status, data: await res.json() };
}

describe('GET /api/health', () => {
  it('should return status ok', async () => {
    const { status, data } = await get('/api/health');
    expect(status).toBe(200);
    expect(data.status).toBe('ok');
    expect(data.timestamp).toBeDefined();
  });
});

describe('POST /api/chat — valid requests', () => {
  it('should return a response for a valid message', async () => {
    const { status, data } = await post('/api/chat', { message: 'How do I register to vote?', sessionId: 'test-1' });
    expect(status).toBe(200);
    expect(data.response).toBeDefined();
    expect(data.response.length).toBeGreaterThan(0);
  });

  it('should handle messages without a sessionId', async () => {
    const { status, data } = await post('/api/chat', { message: 'What is the Electoral College?' });
    expect(status).toBe(200);
    expect(data.response).toBeDefined();
  });

  it('should maintain session history across requests', async () => {
    await post('/api/chat', { message: 'First', sessionId: 'hist-1' });
    const { data } = await post('/api/chat', { message: 'Second', sessionId: 'hist-1' });
    expect(data.response).toBeDefined();
  });
});

describe('POST /api/chat — invalid requests', () => {
  it('should reject empty message', async () => {
    const { status, data } = await post('/api/chat', { message: '', sessionId: 'test' });
    expect(status).toBe(400);
    expect(data.error).toBe('empty');
  });

  it('should reject null message', async () => {
    const { status, data } = await post('/api/chat', { message: null });
    expect(status).toBe(400);
    expect(data.error).toBe('empty');
  });

  it('should reject missing message field', async () => {
    const { status, data } = await post('/api/chat', { sessionId: 'test' });
    expect(status).toBe(400);
    expect(data.error).toBe('empty');
  });

  it('should reject too-long messages', async () => {
    const { status, data } = await post('/api/chat', { message: 'a'.repeat(501) });
    expect(status).toBe(400);
    expect(data.error).toBe('too_long');
  });

  it('should reject script injection', async () => {
    const { status, data } = await post('/api/chat', { message: '<script>alert("xss")</script>' });
    expect(status).toBe(400);
    expect(data.error).toBe('code_detected');
  });

  it('should reject iframe injection', async () => {
    const { status, data } = await post('/api/chat', { message: '<iframe src="evil.com">' });
    expect(status).toBe(400);
    expect(data.error).toBe('code_detected');
  });
});

describe('POST /api/chat — error handling', () => {
  it('should return 500 when AI returns empty', async () => {
    const app = createTestApp(async () => null);
    const s = app.listen(0);
    const addr = s.address();
    try {
      const res = await fetch(`http://localhost:${addr.port}/api/chat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Hello' }),
      });
      expect(res.status).toBe(500);
    } finally { s.close(); }
  });

  it('should return 500 when AI throws', async () => {
    const app = createTestApp(async () => { throw new Error('boom'); });
    const s = app.listen(0);
    const addr = s.address();
    try {
      const res = await fetch(`http://localhost:${addr.port}/api/chat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Hello' }),
      });
      expect(res.status).toBe(500);
    } finally { s.close(); }
  });
});

describe('Session management', () => {
  it('should sanitize session IDs with special characters', async () => {
    const { status } = await post('/api/chat', { message: 'Test', sessionId: 'sess!@#$%' });
    expect(status).toBe(200);
  });

  it('should handle concurrent sessions independently', async () => {
    const [r1, r2] = await Promise.all([
      post('/api/chat', { message: 'Session A', sessionId: 'concurrent-a' }),
      post('/api/chat', { message: 'Session B', sessionId: 'concurrent-b' }),
    ]);
    expect(r1.status).toBe(200);
    expect(r2.status).toBe(200);
    expect(r1.data.response).not.toBe(r2.data.response);
  });
});
