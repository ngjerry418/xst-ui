'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
};

export default function ChatPage() {
  const { conversationId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  // 自动滚动到底部
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 加载历史消息
  useEffect(() => {
    if (!baseUrl) {
      console.error('❌ NEXT_PUBLIC_API_BASE_URL 未设置');
      return;
    }

    async function fetchMessages() {
      try {
        const res = await fetch(`${baseUrl}/api/message/list?conversationId=${conversationId}`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });

        const data = await res.json();
        if (Array.isArray(data.messages)) {
          setMessages(data.messages);
        } else {
          setMessages([]);
        }
      } catch (err) {
        console.error('加载消息失败:', err);
        setMessages([]);
      }
    }

    fetchMessages();
  }, [conversationId, baseUrl]);

  // 发送消息
  const sendMessage = async (content: string) => {
    if (!content.trim() || !baseUrl) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await fetch(`${baseUrl}/api/message/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ conversationId, content }),
      });

      const data = await res.json();
      if (data.reply) {
        const aiReply: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data.reply,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiReply]);

        window.dispatchEvent(new Event('power-updated'));
      }
    } catch (err) {
      console.error('发送失败:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 text-gray-800 text-base">
        {messages.length === 0 && !loading && (
          <p className="text-gray-400 text-sm text-center mt-4">暂无对话内容</p>
        )}

        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {loading && (
          <ChatMessage
            message={{
              id: 'loading',
              role: 'assistant',
              content: '正在思考中...',
              createdAt: '',
            }}
          />
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-gray-300 bg-white">
        <ChatInput onSend={sendMessage} disabled={loading} />
      </div>
    </div>
  );
}