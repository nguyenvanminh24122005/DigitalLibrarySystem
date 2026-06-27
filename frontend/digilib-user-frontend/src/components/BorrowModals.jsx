import React from 'react';
import { CheckCircle2, ClipboardCheck, FileCheck2, Info } from 'lucide-react';
import Modal from './Modal';
import BookCover from './BookCover';
import { addDaysISO, formatDate, todayISO } from '../utils/storage';

export function BorrowConfirmModal({ book, copy, open, onClose, onConfirm, loading }) {
  if (!book || !copy) return null;
  const dueDate = addDaysISO(14);
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Gửi yêu cầu mượn sách"
      subtitle="Yêu cầu sẽ được gửi đến thủ thư. Bạn chỉ nhận sách sau khi thủ thư duyệt."
      icon={<FileCheck2 size={24} />}
      footer={<><button className="btn btn-outline" onClick={onClose}>Hủy</button><button className="btn btn-primary" onClick={() => onConfirm(book, copy)} disabled={loading}><ClipboardCheck size={17}/> {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}</button></>}
    >
      <div className="confirm-book">
        <BookCover book={book} />
        <div className="confirm-info">
          <h3>{book.title}</h3>
          <p className="blue-text">{book.author}</p>
          <dl>
            <dt>Mã bản sao:</dt><dd>{copy.barcode}</dd>
            <dt>Vị trí:</dt><dd>{copy.location || book.location}</dd>
            <dt>Tình trạng:</dt><dd><span className="pill green-soft">{copy.condition}</span></dd>
            <dt>Trạng thái:</dt><dd><span className="pill blue-soft">Sẵn sàng gửi yêu cầu</span></dd>
          </dl>
        </div>
      </div>
      <div className="info-box">
        <b>Thông tin dự kiến</b>
        <dl className="two-cols">
          <dt>Ngày gửi yêu cầu:</dt><dd>{formatDate(todayISO())}</dd>
          <dt>Hạn trả dự kiến:</dt><dd className="orange-text">{formatDate(dueDate)} (14 ngày sau khi được duyệt)</dd>
          <dt>Trạng thái sau khi gửi:</dt><dd><span className="pill blue-soft">Chờ thủ thư duyệt</span></dd>
          <dt>Ghi chú:</dt><dd>Thủ thư sẽ kiểm tra bản sao và xác nhận yêu cầu mượn.</dd>
        </dl>
      </div>
      <div className="warn-box"><Info size={18} /> Sau khi gửi yêu cầu, vui lòng theo dõi trang “Sách đang mượn” hoặc “Thông báo” để biết kết quả duyệt.</div>
    </Modal>
  );
}

export function BorrowSuccessModal({ open, book, loan, onClose, onGoLoans }) {
  if (!book || !loan) return null;
  const isPending = loan.status === 'PendingApproval' || loan.status === 'Pending';
  return (
    <Modal open={open} onClose={onClose} title={isPending ? 'Đã gửi yêu cầu mượn' : 'Mượn sách thành công'} subtitle={isPending ? 'Yêu cầu của bạn đang chờ thủ thư duyệt. Chưa được tính là đang mượn.' : 'Bạn đã mượn sách thành công.'} icon={<CheckCircle2 size={34} />} className="success-modal"
      footer={<><button className="btn btn-outline" onClick={onClose}>Tiếp tục khám phá</button><button className="btn btn-primary" onClick={onGoLoans}>Theo dõi yêu cầu</button></>}
    >
      <div className="success-card">
        <BookCover book={book} />
        <div>
          <h3>{book.title}</h3>
          <p className="blue-text">{book.author}</p>
          <dl>
            <dt>Mã bản sao:</dt><dd>{loan.barcode}</dd>
            <dt>Ngày gửi:</dt><dd className="blue-text">{formatDate(loan.borrowedAt || loan.requestedAt)}</dd>
            <dt>Hạn trả dự kiến:</dt><dd className="orange-text">{formatDate(loan.dueDate)} (sau khi duyệt)</dd>
            <dt>Vị trí:</dt><dd>{loan.location || book.location}</dd>
            <dt>Trạng thái:</dt><dd><span className="pill blue-soft">{isPending ? 'Chờ thủ thư duyệt' : 'Đã mượn thành công'}</span></dd>
          </dl>
        </div>
      </div>
      <div className="warn-box"><Info size={18} /> Thủ thư sẽ duyệt yêu cầu. Khi được duyệt, hệ thống mới chuyển sách sang trạng thái đang mượn.</div>
    </Modal>
  );
}
