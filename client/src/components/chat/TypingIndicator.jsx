const TypingIndicator = ({ usernames }) => {
  if (!usernames || usernames.length === 0) return null;

  const displayText = usernames.length === 1
    ? `${usernames[0]} is typing`
    : usernames.length === 2
    ? `${usernames[0]} and ${usernames[1]} are typing`
    : `${usernames.length} people are typing`;

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm text-text-muted">
      <div className="flex gap-1">
        <span className="typing-dot w-2 h-2 bg-accent rounded-full"></span>
        <span className="typing-dot w-2 h-2 bg-accent rounded-full"></span>
        <span className="typing-dot w-2 h-2 bg-accent rounded-full"></span>
      </div>
      <span>{displayText}...</span>
    </div>
  );
};

export default TypingIndicator;