'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import clsx from 'clsx';

type Conversation = {
  id: string;
  title: string;
  createdAt: string;
};

export default function ConversationList() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [creating, setCreating] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const activeId = pathname.split('/').pop();
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  // 加载会话列表函数
  const loadConversations = async () => {
    if (!baseUrl) {
      console.error('环境变量 NEXT_PUBLIC_API_BASE_URL 未定义');
      return;
    }

    try {
      const res = await fetch(`${baseUrl}/api/conversation`, {
        credentials: 'include',
      });
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch (err) {
      console.error('获取会话失败:', err);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [baseUrl]);

  // 新建会话
  const createNew = async () => {
    setCreating(true);
    try {
      const res = await fetch(`${baseUrl}/api/conversation`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();

      if (!res.ok || !data.conversationId) {
        alert(data.error || '创建会话失败');
        return;
      }

      router.push(`/chat/${data.conversationId}`);
      await loadConversations(); // ✅ 创建后刷新列表
    } catch (err) {
      console.error('新建会话失败:', err);
      alert('网络异常，请稍后再试');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={createNew}
        disabled={creating}
        className={clsx(
          'w-full py-1 px-2 text-sm rounded transition',
          creating
            ? 'bg-blue-300 text-white cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        )}
      >
        {creating ? '创建中...' : '+ 新建会话'}
      </button>

      {conversations.length === 0 && (
        <p className="text-sm text-gray-400 px-2 mt-4">暂无会话，点击上方按钮新建</p>
      )}

      {conversations.map((c) => {
        const isActive = c.id === activeId;
        return (
          <div
            key={c.id}
            onClick={() => {
              if (!isActive) router.push(`/chat/${c.id}`);
            }}
            title={c.title || '未命名会话'}
            className={clsx(
              'cursor-pointer px-2 py-1 rounded text-sm truncate transition-colors',
              isActive
                ? 'bg-blue-100 text-blue-700 font-semibold'
                : 'text-gray-800 hover:bg-gray-100'
            )}
          >
            {c.title || <span className="text-gray-400 italic">未命名会话</span>}
          </div>
        );
      })}
    </div>
  );
}