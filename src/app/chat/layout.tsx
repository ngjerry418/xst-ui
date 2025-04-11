'use client';

import { useEffect, useState } from 'react';
import ConversationList from '@/components/ConversationList';
import RechargeModal from '@/components/RechargeModal';

type User = {
  email: string;
  power: number;
};

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRecharge, setShowRecharge] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  async function fetchUser() {
    try {
      const res = await fetch(`${baseUrl}/api/me`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('未登录');
      const data = await res.json();
      setUser(data.user);
    } catch (err) {
      console.error('获取用户信息失败:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUser();
    const handler = () => fetchUser();
    window.addEventListener('power-updated', handler);
    return () => window.removeEventListener('power-updated', handler);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500 text-base">
        加载中...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen text-lg font-bold text-red-500">
        请先登录
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-50 border-r border-gray-200 p-4 flex flex-col overflow-y-auto shadow-md">
        <ConversationList />

        <div className="mt-auto space-y-1 text-sm text-gray-800 pt-4 border-t border-gray-200">
          <p className="font-semibold truncate">📧 {user.email}</p>

          <div className="flex items-center justify-between">
            <span>⚡️ 剩余算力：{user.power}</span>
            <button
              onClick={() => setShowRecharge(true)}
              className="text-xs text-blue-500 hover:underline ml-2"
            >
              充值
            </button>
          </div>

          <button
            onClick={async () => {
              await fetch(`${baseUrl}/api/logout`, {
                method: 'POST',
                credentials: 'include',
              });
              window.location.href = '/login';
            }}
            className="text-sm text-red-500 hover:text-red-600 underline mt-1"
          >
            退出登录
          </button>
        </div>
      </aside>

      <main className="flex-1 bg-white overflow-hidden">{children}</main>

      {showRecharge && <RechargeModal onClose={() => setShowRecharge(false)} />}
    </div>
  );
}