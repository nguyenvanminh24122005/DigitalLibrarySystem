import React, { useEffect, useState } from 'react';
import { Bell, BookOpen, CheckCircle2, Gift, Info, RotateCcw, Timer } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import { mockNotifications } from '../data/mockData';
import { getNotifications, markAllNotificationsRead } from '../services/catalogApi';
import { useToast } from '../components/ToastProvider';

const typeIcons = { due: Timer, success: CheckCircle2, book: BookOpen, info: Info, resource: BookOpen, promo: Gift };

export default function Notifications() {
  const [items, setItems] = useState(mockNotifications);
  const [tab, setTab] = useState('all');
  const toast = useToast();
  useEffect(() => { getNotifications().then(real => { setItems(real); }).catch(() => {}); }, []);
  const shown = items.filter(n => tab === 'all' || n.type === tab);
  async function markAllRead() { try { await markAllNotificationsRead(); } catch {} setItems(prev => prev.map(x => ({ ...x, unread: false }))); toast.show('Đã đánh dấu tất cả thông báo là đã đọc.', 'success'); }
  return <div className="page-fade two-col-page"><main><PageHeader title="Thông báo" description="Cập nhật các thông báo mới nhất từ thư viện." right={<button className="btn btn-soft" onClick={markAllRead}>Đánh dấu tất cả đã đọc</button>}/><div className="tabs"><button className={tab==='all'?'active':''} onClick={()=>setTab('all')}>Tất cả <b>{items.length}</b></button><button className={tab==='due'?'active':''} onClick={()=>setTab('due')}>Sắp đến hạn</button><button className={tab==='success'?'active':''} onClick={()=>setTab('success')}>Mượn & trả sách</button><button className={tab==='book'?'active':''} onClick={()=>setTab('book')}>Tin tức</button><button className={tab==='promo'?'active':''} onClick={()=>setTab('promo')}>Khuyến mãi</button></div><section className="notification-list">{shown.length ? shown.map(n => { const Icon = typeIcons[n.type] || Bell; return <article className={`notify-item ${n.unread ? 'unread' : ''}`} key={n.id}><span className={`notify-icon type-${n.type}`}><Icon size={24}/></span><div><h3>{n.title}</h3><p>{n.message}</p></div><time>{n.time}</time>{n.unread && <i/>}</article>}) : <EmptyState type="notify" title="Không có thông báo nào" message="Khi có thông báo mới, bạn sẽ thấy ở đây."/>}<button className="link-more">Xem thêm⌄</button></section></main><aside className="right-col static-side"><section className="panel"><h2>Bộ lọc thông báo</h2>{['Tất cả','Sắp đến hạn','Mượn & trả sách','Tin tức','Khuyến mãi','Thông báo hệ thống'].map(x => <label className="check-line" key={x}><input type="checkbox" defaultChecked/> {x}</label>)}<hr/><h3>Thời gian</h3>{['Tất cả thời gian','Hôm nay','7 ngày qua','30 ngày qua','Tùy chọn'].map((x,i)=> <label className="check-line" key={x}><input type="radio" name="time" defaultChecked={i===0}/> {x}</label>)}<button className="btn btn-primary btn-full">Áp dụng bộ lọc</button><button className="btn btn-outline btn-full"><RotateCcw size={17}/>Xóa bộ lọc</button></section></aside></div>;
}
