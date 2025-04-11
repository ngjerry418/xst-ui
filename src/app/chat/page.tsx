'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ChatRedirectPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    if (!baseUrl) {
      setError('系统配置错误，请联系管理员');
      setLoading(false);
      return;
    }

    const goToFirstConversation = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/conversation`, {
          credentials: 'include',
        });
        const data = await res.json();

        if (res.status === 401 || !data.conversations) {
          router.replace('/login');
          return;
        }

        const first = data.conversations[0];
        if (first?.id) {
          router.replace(`/chat/${first.id}`);
        } else {
          setError('未找到任何会话。请点击左侧“新建会话”开始使用。');
        }
      } catch (err) {
        console.error('获取会话失败:', err);
        setError('网络错误，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    goToFirstConversation();
  }, [router, baseUrl]);

  return (
    <div className="flex items-center justify-center h-screen text-gray-600 text-lg">
      {loading ? (
        '正在进入会话，请稍候...'
      ) : error ? (
        <div className="text-red-500 text-center px-4">{error}</div>
      ) : null}
    </div>
  );
}