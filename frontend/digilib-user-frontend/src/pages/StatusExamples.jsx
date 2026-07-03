import React from 'react';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';

export default function StatusExamples() {
  const states = [
    ['search','Không tìm thấy kết quả','Không tìm thấy sách phù hợp với từ khóa “kỹ năng giao tiếp”.','Thử tìm kiếm khác'],
    ['books','Bạn chưa mượn sách nào','Bạn chưa có sách nào đang mượn. Hãy khám phá và mượn sách nhé!','Tìm sách để mượn'],
    ['favorite','Bạn chưa có sách yêu thích','Hãy thêm những cuốn sách yêu thích để dễ dàng tìm lại sau này.','Khám phá sách'],
    ['notify','Bạn chưa có thông báo mới','Khi có thông báo mới, bạn sẽ thấy ở đây.','Quay lại trang chủ'],
    ['resource','Không có tài liệu số','Chưa có tài liệu số nào được cập nhật. Vui lòng quay lại sau nhé!','Quay lại trang chủ'],
    ['error','Đã xảy ra lỗi','Hệ thống đang gặp sự cố. Vui lòng thử lại sau ít phút.','Thử lại'],
    ['lock','Không có quyền truy cập','Bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị viên.','Quay lại trang chủ'],
    ['server','500 - Lỗi máy chủ','Máy chủ đang gặp sự cố và không thể xử lý yêu cầu của bạn.','Thử lại sau']
  ];
  return <div className="page-fade"><PageHeader title="Trạng thái" description="Các trạng thái hiển thị trong hệ thống"/><div className="state-grid">{states.map(([type,title,message,action]) => <EmptyState key={title} type={type} title={title} message={message} actionLabel={action}/>)}</div></div>;
}
