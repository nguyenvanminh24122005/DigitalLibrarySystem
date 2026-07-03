import React from 'react';
export default function QRCodeBox({ label = 'DG202400128' }) {
  return (
    <div className="qr-card">
      <strong>Thư viện của bạn</strong>
      <span>Mã độc giả: {label}</span>
      <div className="fake-qr" aria-label="QR code">
        {Array.from({ length: 49 }).map((_, i) => <i key={i} className={(i * 7 + i) % 5 < 2 ? 'dark' : ''} />)}
      </div>
    </div>
  );
}
