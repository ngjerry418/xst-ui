'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleLogin = async () => {
    setError('');

    if (!email || !password) {
      return setError('请输入邮箱和密码');
    }

    if (!baseUrl) {
      return setError('未配置后端地址');
    }

    try {
      const res = await fetch(`${baseUrl}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return setError(data.error || '登录失败');
      }

      // 获取会话
      const convoRes = await fetch(`${baseUrl}/api/conversation`, {
        credentials: 'include',
      });

      const convoData = await convoRes.json();
      const first = convoData.conversations?.[0];

      if (first?.id) {
        router.push(`/chat/${first.id}`);
      } else {
        // ✅ 如果没有会话，跳转 chat 主页面
        router.push('/chat');
      }
    } catch (err) {
      console.error('登录出错:', err);
      setError('服务器异常，请稍后重试');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/login-bg.png')" }}
    >
      <div className="bg-white bg-opacity-90 p-8 rounded shadow-md w-full max-w-md backdrop-blur">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">登录 Xst-Ai</h1>

        <input
          type="email"
          className="w-full p-2 border border-gray-300 rounded mb-4 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="请输入邮箱"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full p-2 border border-gray-300 rounded mb-4 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="请输入密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors"
        >
          登录
        </button>

        <p className="text-sm mt-4 text-center text-gray-700">
          没有账号？<a href="/register" className="text-blue-600 underline">点此注册</a>
        </p>
      </div>
    </div>
  );
}