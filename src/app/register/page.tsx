'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleRegister = async () => {
    setError('');
    if (!email || !password) {
      return setError('请输入邮箱和密码');
    }
    if (password.length < 6) {
      return setError('密码长度不能少于 6 位');
    }

    if (!baseUrl) {
      return setError('系统配置错误，请联系管理员');
    }

    setLoading(true);
    try {
      // 注册
      const res = await fetch(`${baseUrl}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return setError(data.error || '注册失败');
      }

      // 自动登录
      const loginRes = await fetch(`${baseUrl}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginRes.json();
      if (!loginRes.ok) {
        return setError(loginData.error || '注册成功但自动登录失败');
      }

      // 获取会话列表
      const convoRes = await fetch(`${baseUrl}/api/conversation`, {
        credentials: 'include',
      });
      const convoData = await convoRes.json();
      const first = convoData.conversations?.[0];

      if (first?.id) {
        router.push(`/chat/${first.id}`);
      } else {
        router.push('/chat');
      }
    } catch (err) {
      console.error('注册请求出错:', err);
      setError('网络错误，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 to-indigo-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">注册 Xst-Ai</h1>

        <input
          type="email"
          className="w-full p-3 bg-gray-100 text-gray-900 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="请输入邮箱"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full p-3 bg-gray-100 text-gray-900 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="请输入密码（6位以上）"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? '注册中...' : '注册'}
        </button>

        <p className="text-center text-sm mt-4 text-gray-600">
          已有账号？<a href="/login" className="text-blue-600 hover:underline">点此登录</a>
        </p>
      </div>
    </div>
  );
}