export default function ChatMessage({ message = {} }) {
  const { text = '', sender = 'user', timestamp = '' } = message;
  const isUser = sender === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] rounded-xl px-md py-sm text-body-sm ${
        isUser
          ? 'rounded-tr-sm bg-primary text-on-primary'
          : 'rounded-tl-sm border border-outline-variant bg-surface text-on-surface'
      }`}>
        <p className="whitespace-pre-wrap">{text}</p>
        {timestamp && (
          <p className={`mt-xs text-xs ${isUser ? 'text-on-primary/70' : 'text-on-surface-variant'}`}>{timestamp}</p>
        )}
      </div>
    </div>
  );
}