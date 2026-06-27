import React from 'react';
import { RotateCcw, Info } from 'lucide-react';
import Modal from './Modal';
import BookCover from './BookCover';
import { currencyVND, daysLeft, formatDate, todayISO } from '../utils/storage';

export default function ReturnConfirmModal({ open, book, loan, onClose, onConfirm, loading }) {
  if (!open || !book || !loan) return null;
  const left = daysLeft(loan.dueDate);
  const overdueDays = left < 0 ? Math.abs(left) : 0;
  const fine = overdueDays * 2000;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Xác nhận trả sách"
      subtitle="Vui lòng kiểm tra thông tin trước khi xác nhận trả sách."
      icon={<RotateCcw size={25} />}
      footer={<><button className="btn btn-outline" onClick={onClose}>Hủy</button><button className="btn btn-primary" onClick={() => onConfirm(loan)} disabled={loading}>✓ Xác nhận trả sách</button></>}
    >
      <div className="confirm-book compact">
        <BookCover book={book} />
        <div className="confirm-info">
          <h3>{book.title}</h3>
          <p className="muted">{book.author}</p>
          <dl className="two-cols">
            <dt>Mã bản sao:</dt><dd>{loan.barcode}</dd>
            <dt>Tình trạng sách hiện tại:</dt><dd><span className="pill green-soft">Tốt</span></dd>
            <dt>Vị trí:</dt><dd>{loan.location || book.location}</dd>
            <dt>Trạng thái mượn:</dt><dd><span className="pill blue-soft">Đang mượn</span></dd>
          </dl>
        </div>
      </div>
      <div className="info-box">
        <b>Thông tin trả sách</b>
        <dl className="two-cols">
          <dt>Ngày mượn:</dt><dd>{formatDate(loan.borrowedAt)}</dd>
          <dt>Tình trạng trả:</dt><dd><span className={`pill ${overdueDays ? 'orange-soft' : 'green-soft'}`}>{overdueDays ? `Quá hạn ${overdueDays} ngày` : 'Đúng hạn'}</span></dd>
          <dt>Hạn trả:</dt><dd>{formatDate(loan.dueDate)}</dd>
          <dt>Phí quá hạn:</dt><dd>{currencyVND(fine)}</dd>
          <dt>Ngày trả:</dt><dd>{formatDate(todayISO())}</dd>
          <dt>Ghi chú:</dt><dd>{fine ? 'Vui lòng thanh toán phí theo quy định.' : 'Cảm ơn bạn đã trả sách đúng hạn.'}</dd>
        </dl>
      </div>
      <div className="info-strip"><Info size={18} /> Vui lòng kiểm tra tình trạng sách trước khi hoàn tất trả sách.</div>
    </Modal>
  );
}
