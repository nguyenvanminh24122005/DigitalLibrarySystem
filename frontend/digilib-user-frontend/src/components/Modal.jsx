import React from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, title, subtitle, icon, onClose, children, footer, className = '' }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" role="presentation">
      <div className={`modal ${className}`} role="dialog" aria-modal="true">
        <div className="modal-head">
          <div className="modal-title-wrap">
            {icon && <span className="modal-icon">{icon}</span>}
            <div>
              <h2>{title}</h2>
              {subtitle && <p>{subtitle}</p>}
            </div>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Đóng"><X size={20} /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
