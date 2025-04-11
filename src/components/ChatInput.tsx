'use client';

import { useEffect, useState, useRef } from 'react';

export default function ChatInput({
  onSend,
  disabled,
}: {
  onSend: (content: string) => void;
  disabled: boolean;
}) {
  const [input, setInput] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [power, setPower] = useState<number | null>(null); // ✅ 当前算力
  const lastImageTimeRef = useRef<number>(0);

  useEffect(() => {
    async function fetchPower() {
      try {
        const res = await fetch('/api/me', {
          credentials: 'include',
        });
        const data = await res.json();
        setPower(data?.user?.power ?? null);
      } catch (err) {
        console.error('⚠️ 获取用户算力失败:', err);
      }
    }

    fetchPower();

    // ✅ 监听全局刷新算力事件（消息发送后触发）
    const handler = () => fetchPower();
    window.addEventListener('power-updated', handler);
    return () => window.removeEventListener('power-updated', handler);
  }, []);

  const handleSubmit = () => {
    const content = [input.trim(), previewImage].filter(Boolean).join('\n');
    if (!content) return;

    // ✅ 算力低于或等于 10，弹窗提示
    if (power !== null && power <= 10) {
      alert('亲爱的，我的算力不足了，让我继续陪伴你身边，请尽快为智充值哦。');
    }

    onSend(content);
    setInput('');
    setPreviewImage(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) await handleImageUpload(file);
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const file = Array.from(e.clipboardData.files)?.[0];
    if (file) await handleImageUpload(file);
  };

  const handleImageUpload = async (file: File) => {
    const now = Date.now();
    if (now - lastImageTimeRef.current < 60_000) {
      alert('图片发送太频繁，请稍后再试（每分钟仅限一张）');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.status === 429) {
        alert(data?.error || '上传太频繁');
        return;
      }

      if (res.ok && data?.url) {
        setPreviewImage(data.url);
        lastImageTimeRef.current = now;
      } else {
        alert(data?.error || '上传失败，请重试');
      }
    } catch (err) {
      console.error('图片上传失败:', err);
      alert('上传失败，请检查网络或稍后再试');
    }
  };

  return (
    <div className="flex flex-col w-full px-4 py-3 bg-white border-t border-gray-200 shadow-sm">
      {/* ✅ 图片预览 */}
      {previewImage && (
        <div className="mb-2 flex items-center justify-between bg-gray-100 p-2 rounded-md border border-gray-300">
          <img
            src={previewImage}
            alt="预览图片"
            className="w-20 h-20 object-cover rounded"
          />
          <button
            onClick={() => setPreviewImage(null)}
            className="text-xs text-red-500 hover:underline ml-2"
          >
            移除图片
          </button>
        </div>
      )}

      <div className="flex items-center">
        <textarea
          className="flex-1 resize-none bg-gray-100 rounded-md p-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onDrop={handleDrop}
          onPaste={handlePaste}
          rows={2}
          disabled={disabled}
          placeholder="输入文字或粘贴 / 拖拽图片，按 Enter 发送"
        />
        <button
          onClick={handleSubmit}
          disabled={disabled}
          className="ml-3 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          发送
        </button>
      </div>
    </div>
  );
}