import { useState, useRef, useEffect } from 'react';
import { chatApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const SUGGESTIONS = [
  'What books are available right now?',
  'How do I borrow a book?',
  'Recommend a book for me',
  'What are today\'s library hours?',
  'How do I reserve a book?',
];

export default function AIAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const send = async (text) => {
    const trim = (text || '').trim();
    if (!trim || loading) return;
    setError(null);
    const userMsg = { role: 'user', content: trim };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await chatApi.sendMessage(trim);
      const botText = res?.reply ?? res?.response ?? res?.message ?? res?.text ?? 'Sorry, the assistant had no response.';
      setMessages((prev) => [...prev, { role: 'assistant', content: botText }]);
    } catch (err) {
      setError(err.message || 'Failed to reach the assistant.');
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-lg">
      <div>
        <h1 className="text-headline-lg font-bold text-on-surface">AI Library Assistant</h1>
        <p className="text-body-sm text-on-surface-variant mt-xs">
          Hi {user?.fullName?.split(' ')[0] || 'there'} — ask me anything about the library.
        </p>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-md overflow-y-auto pr-sm">
        {/* Welcome (only before conversation) */}
        {messages.length === 0 && !loading && (
          <div className="rounded-xl border border-outline-variant bg-surface p-md">
            <div className="flex items-center gap-sm">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-white material-symbols-outlined">auto_awesome</span>
              <p className="text-body-sm font-semibold text-on-surface">Assistant</p>
            </div>
            <p className="mt-sm text-body-sm text-on-surface-variant">I can help you find books, understand borrowing, and answer library questions. Try one of these:</p>
            <div className="mt-md flex flex-wrap gap-sm">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)} disabled={loading}
                  className="rounded-full border border-outline-variant bg-surface-container-low px-sm py-1.5 text-label-lg text-on-surface-variant hover:border-primary/40 hover:text-primary transition-colors cursor-pointer disabled:opacity-50">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-xl px-md py-sm text-body-sm ${
              m.role === 'user'
                ? 'bg-primary text-on-primary'
                : 'rounded-tl-sm border border-outline-variant bg-surface text-on-surface'
            } whitespace-pre-wrap`}>
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-sm rounded-xl border border-outline-variant bg-surface px-md py-sm text-body-sm text-on-surface-variant">
              <span className="material-symbols-outlined animate-pulse">auto_awesome</span>
              <span className="flex gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-on-surface-variant" style={{ animationDelay: '0ms' }} />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-on-surface-variant" style={{ animationDelay: '120ms' }} />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-on-surface-variant" style={{ animationDelay: '240ms' }} />
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-error/30 bg-error-container/20 p-md text-body-sm text-error">{error}</div>
      )}

      {/* Input */}
      <div className="flex items-end gap-sm rounded-xl border border-outline-variant bg-surface p-sm">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          rows={1}
          placeholder="Ask your question..."
          className="flex-1 resize-none rounded-lg bg-transparent px-sm py-sm text-body-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none max-h-28"
        />
        <button onClick={() => send(input)} disabled={loading || !input.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-on-primary shadow-sm transition hover:bg-primary/90 disabled:opacity-40 cursor-pointer">
          <span className="material-symbols-outlined">send</span>
        </button>
      </div>
    </div>
  );
}