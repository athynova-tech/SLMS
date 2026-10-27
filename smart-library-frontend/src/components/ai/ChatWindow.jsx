import { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';

export default function ChatWindow({ messages = [], onSend, loading = false, placeholder = 'Type a message...' }) {
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || loading) return;
    onSend?.(text);
    setInput('');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[28rem] flex-col rounded-xl border border-outline-variant bg-surface">
      <div ref={scrollRef} className="flex-1 space-y-md overflow-y-auto p-md">
        {messages.length === 0 ? (
          <p className="pt-lg text-center text-body-sm text-on-surface-variant">No messages yet. Say hello!</p>
        ) : (
          messages.map((m, i) => <ChatMessage key={i} message={m} />)
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-sm rounded-xl border border-outline-variant bg-surface px-md py-sm text-body-sm text-on-surface-variant">
              <span className="flex gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-on-surface-variant" style={{ animationDelay: '0ms' }} />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-on-surface-variant" style={{ animationDelay: '120ms' }} />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-on-surface-variant" style={{ animationDelay: '240ms' }} />
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="flex items-end gap-sm border-t border-outline-variant p-sm">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          rows={1}
          placeholder={placeholder}
          className="max-h-28 flex-1 resize-none rounded-lg bg-surface-container-low px-sm py-sm text-body-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none"
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-on-primary transition hover:bg-primary/90 disabled:opacity-40 cursor-pointer">
          <span className="material-symbols-outlined">send</span>
        </button>
      </div>
    </div>
  );
}