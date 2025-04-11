type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
};

export default function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  // 判断是否为图片链接（支持常见后缀和 base64）
  const isImageLine = (line: string): boolean => {
    const trimmed = line.trim();
    return (
      /^https?:\/\/.*\.(png|jpe?g|gif|webp)$/i.test(trimmed) ||
      trimmed.startsWith('data:image/')
    );
  };

  // 将内容按行拆分并清洗
  const lines = message.content
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-sm px-3 py-2 rounded-lg text-sm whitespace-pre-wrap break-words shadow ${
          isUser ? 'bg-blue-500 text-white' : 'bg-gray-100 text-black'
        }`}
      >
        {lines.map((line, idx) =>
          isImageLine(line) ? (
            <img
              key={idx}
              src={line}
              alt="图片"
              className="max-w-full max-h-60 my-2 rounded border"
            />
          ) : (
            <div key={idx} className="mb-1 leading-relaxed">
              {line}
            </div>
          )
        )}
      </div>
    </div>
  );
}