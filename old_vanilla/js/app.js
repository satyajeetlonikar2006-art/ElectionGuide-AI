/* ═══════════════════════════════════════════════════════════════════════════
   ElectionGuide AI — Chat Engine
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── DOM Elements ────────────────────────────────────────────────────────
  const messagesContainer = document.getElementById('messages');
  const chatArea = document.getElementById('chat-area');
  const messageInput = document.getElementById('message-input');
  const sendBtn = document.getElementById('send-btn');
  const charCurrent = document.getElementById('char-current');
  const charCount = document.getElementById('char-count');

  // ── State ───────────────────────────────────────────────────────────────
  let isWaiting = false;
  const sessionId = getOrCreateSessionId();

  // ── Session Management ──────────────────────────────────────────────────
  function getOrCreateSessionId() {
    let id = sessionStorage.getItem('eg_session_id');
    if (!id) {
      id = crypto.randomUUID ? crypto.randomUUID() : generateFallbackId();
      sessionStorage.setItem('eg_session_id', id);
    }
    return id;
  }

  function generateFallbackId() {
    return 'xxxx-xxxx-xxxx'.replace(/x/g, () =>
      Math.floor(Math.random() * 16).toString(16)
    );
  }

  // ── Markdown-lite Renderer ──────────────────────────────────────────────
  function renderMarkdown(text) {
    // Escape HTML
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Headers (## and ###)
    html = html.replace(/^### (.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^## (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^# (.+)$/gm, '<h2>$1</h2>');

    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Inline code
    html = html.replace(/`(.+?)`/g, '<code>$1</code>');

    // Links — [text](url)
    html = html.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    // Bare URLs
    html = html.replace(
      /(?<!")(https?:\/\/[^\s<]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    // Horizontal separator lines (━━━ or ───)
    html = html.replace(/^[━─]{3,}.*$/gm, '<hr class="msg-separator">');

    // Unordered list items
    html = html.replace(/^[\s]*[-•]\s+(.+)$/gm, '<li>$1</li>');

    // Wrap consecutive <li> in <ul>
    html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

    // Paragraphs — split on double newlines
    const blocks = html.split(/\n{2,}/);
    html = blocks
      .map(block => {
        block = block.trim();
        if (!block) return '';
        // Don't wrap block-level elements
        if (/^<(h[2-4]|ul|ol|hr|div|li)/.test(block)) return block;
        return `<p>${block.replace(/\n/g, '<br>')}</p>`;
      })
      .join('');

    return html;
  }

  // ── Extract Quick Replies from AI Text ──────────────────────────────────
  function extractQuickReplies(text) {
    const replies = [];
    // Match → [A] ... or → [B] ... or → [C] ...
    const pattern = /→\s*\[([A-C])\]\s*(.+)/g;
    let match;
    while ((match = pattern.exec(text)) !== null) {
      replies.push({
        label: match[1],
        text: match[2].trim()
      });
    }
    return replies;
  }

  function removeQuickReplyLines(text) {
    // Remove the follow-up block including the header
    let cleaned = text;
    // Remove separator lines around quick replies
    cleaned = cleaned.replace(/[━─]{3,}[^\n]*\n?/g, '');
    // Remove the "What would you like to explore" header
    cleaned = cleaned.replace(/🗳️\s*What would you like to explore next\??\s*\n?/gi, '');
    // Remove → [A/B/C] lines
    cleaned = cleaned.replace(/→\s*\[([A-C])\]\s*.+\n?/g, '');
    // Remove Quick Start header
    cleaned = cleaned.replace(/🗳️\s*Quick Start:\s*\n?/gi, '');
    return cleaned.trim();
  }

  // ── Render Messages ─────────────────────────────────────────────────────
  function addMessage(content, type, quickReplies = []) {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${type}`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = type === 'bot' ? '🗳️' : '👤';

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';

    if (type === 'bot') {
      bubble.innerHTML = renderMarkdown(content);

      // Add quick reply buttons
      if (quickReplies.length > 0) {
        const repliesDiv = document.createElement('div');
        repliesDiv.className = 'quick-replies';
        quickReplies.forEach(reply => {
          const btn = document.createElement('button');
          btn.className = 'quick-reply-btn';
          btn.innerHTML = `<span class="quick-reply-label">[${reply.label}]</span> ${escapeHtml(reply.text)}`;
          btn.addEventListener('click', () => {
            if (!isWaiting) {
              sendMessage(reply.text);
              // Disable all quick reply buttons in this message
              repliesDiv.querySelectorAll('.quick-reply-btn').forEach(b => {
                b.disabled = true;
                b.style.opacity = '0.4';
                b.style.pointerEvents = 'none';
              });
            }
          });
          repliesDiv.appendChild(btn);
        });
        bubble.appendChild(repliesDiv);
      }
    } else {
      bubble.textContent = content;
    }

    messageEl.appendChild(avatar);
    messageEl.appendChild(bubble);
    messagesContainer.appendChild(messageEl);

    scrollToBottom();
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ── Typing Indicator ───────────────────────────────────────────────────
  function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.id = 'typing-indicator';

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.style.background = 'var(--accent-gradient)';
    avatar.style.boxShadow = '0 2px 12px var(--accent-glow)';
    avatar.textContent = '🗳️';

    const bubble = document.createElement('div');
    bubble.className = 'typing-bubble';
    bubble.innerHTML = `
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
    `;

    indicator.appendChild(avatar);
    indicator.appendChild(bubble);
    messagesContainer.appendChild(indicator);
    scrollToBottom();
  }

  function hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
  }

  // ── Scroll ──────────────────────────────────────────────────────────────
  function scrollToBottom() {
    requestAnimationFrame(() => {
      chatArea.scrollTo({
        top: chatArea.scrollHeight,
        behavior: 'smooth'
      });
    });
  }

  // ── API Communication ──────────────────────────────────────────────────
  async function sendMessage(text) {
    if (isWaiting || !text.trim()) return;

    const trimmed = text.trim();

    // Client-side validation
    if (trimmed.length > 500) {
      addMessage(
        "That's a lot to unpack! Could you share your most important question first and we'll go from there?",
        'bot'
      );
      return;
    }

    const codePatterns = /<script|<\/script|<iframe|<img\s|javascript:|on\w+\s*=/i;
    if (codePatterns.test(trimmed)) {
      addMessage(
        "Looks like something went wrong with your message — could you rephrase your question?",
        'bot'
      );
      return;
    }

    // Show user message
    addMessage(trimmed, 'user');
    messageInput.value = '';
    updateCharCount();
    autoResize();
    updateSendButton();

    // Show typing
    isWaiting = true;
    updateSendButton();
    showTypingIndicator();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, sessionId })
      });

      const data = await res.json();

      hideTypingIndicator();

      if (!res.ok) {
        addMessage(data.message || "Something went wrong. Please try again!", 'bot');
      } else {
        const quickReplies = extractQuickReplies(data.response);
        const cleanedText = removeQuickReplyLines(data.response);
        addMessage(cleanedText, 'bot', quickReplies);
      }
    } catch (err) {
      hideTypingIndicator();
      addMessage(
        "I'm having trouble connecting right now. Please check your internet connection and try again!",
        'bot'
      );
      console.error('Chat error:', err);
    } finally {
      isWaiting = false;
      updateSendButton();
      messageInput.focus();
    }
  }

  // ── Input Handling ─────────────────────────────────────────────────────
  function updateCharCount() {
    const len = messageInput.value.length;
    charCurrent.textContent = len;

    charCount.classList.remove('warning', 'danger');
    if (len >= 480) {
      charCount.classList.add('danger');
    } else if (len >= 400) {
      charCount.classList.add('warning');
    }
  }

  function updateSendButton() {
    sendBtn.disabled = isWaiting || !messageInput.value.trim();
  }

  function autoResize() {
    messageInput.style.height = 'auto';
    messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
  }

  // ── Event Listeners ────────────────────────────────────────────────────
  messageInput.addEventListener('input', () => {
    updateCharCount();
    updateSendButton();
    autoResize();
  });

  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!sendBtn.disabled) {
        sendMessage(messageInput.value);
      }
    }
  });

  sendBtn.addEventListener('click', () => {
    sendMessage(messageInput.value);
  });

  // ── Opening Message ────────────────────────────────────────────────────
  function showOpeningMessage() {
    const welcomeContent = `👋 **Welcome to ElectionGuide!** I'm here to help you understand how elections work — from registering to vote all the way to inauguration day.

Whether you're a first-time voter, a new citizen, a student, or someone returning after years away — I've got you covered. Just ask me anything about the election process!`;

    const quickReplies = [
      { label: 'A', text: 'I want to register to vote' },
      { label: 'B', text: 'I want to understand how the whole election process works' },
      { label: 'C', text: "Election Day is coming — what do I need to know?" }
    ];

    // Small delay for visual effect
    setTimeout(() => {
      addMessage(welcomeContent, 'bot', quickReplies);
    }, 400);
  }

  // ── Initialize ─────────────────────────────────────────────────────────
  showOpeningMessage();
  messageInput.focus();

})();
