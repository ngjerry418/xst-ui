'use client';

import { useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export default function RechargeModal({ onClose }: { onClose: () => void }) {
  const [selectedAmount, setSelectedAmount] = useState<number>(5);
  const [paymentMethod, setPaymentMethod] = useState<'alipay' | 'wechat'>('alipay');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!API_BASE) {
      alert('系统配置错误，请稍后再试');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/pay/prepare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: selectedAmount, method: paymentMethod }),
      });

      const data = await res.json();

      if (res.ok && data?.qrcodeUrl) {
        // ✅ 弹出支付二维码页（建议新窗口）
        window.open(data.qrcodeUrl, '_blank');
        onClose();
      } else {
        alert(data?.error || '支付请求失败，请稍后再试');
      }
    } catch (err) {
      console.error('❌ 支付接口异常:', err);
      alert('网络异常或服务器错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-80 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">充值算力</h2>

        <div className="space-y-2">
          <p className="text-sm text-gray-700">选择充值金额：</p>
          <div className="flex gap-3">
            {[5, 20, 50].map((amt) => (
              <button
                key={amt}
                onClick={() => setSelectedAmount(amt)}
                className={`px-4 py-2 rounded-md border text-sm font-medium transition ${
                  selectedAmount === amt
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {amt} 元
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-gray-700">支付方式：</p>
          <div className="flex gap-3">
            <label className="flex items-center gap-1 text-sm">
              <input
                type="radio"
                value="alipay"
                checked={paymentMethod === 'alipay'}
                onChange={() => setPaymentMethod('alipay')}
              />
              支付宝
            </label>
            <label className="flex items-center gap-1 text-sm">
              <input
                type="radio"
                value="wechat"
                checked={paymentMethod === 'wechat'}
                onChange={() => setPaymentMethod('wechat')}
              />
              微信
            </label>
          </div>
        </div>

        <div className="flex justify-between items-center pt-3">
          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700"
            disabled={loading}
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            确认充值
          </button>
        </div>
      </div>
    </div>
  );
}