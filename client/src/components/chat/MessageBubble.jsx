import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const MessageBubble = ({ message, isOwnMessage }) => {
  const formatTime = (timestamp) => {
    return dayjs(timestamp).format('HH:mm');
  };

  return (
    <div
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4 message-enter`}
    >
      <div className={`max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
        {!isOwnMessage && (
          <span className="text-xs text-accent-cyan font-medium mb-1 px-1">
            {message.username || message.from}
          </span>
        )}
        <div
          className={`rounded-2xl px-4 py-2.5 ${
            isOwnMessage
              ? 'bg-chat-sender text-white rounded-br-sm'
              : 'bg-chat-receiver text-text-primary rounded-bl-sm'
          } shadow-lg`}
        >
          <p className="text-sm leading-relaxed break-words">{message.content}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs opacity-70">
              {formatTime(message.timestamp)}
            </span>
            {isOwnMessage && message.delivered !== undefined && (
              <span className="text-xs opacity-70">
                {message.delivered ? '✓✓' : '✓'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;