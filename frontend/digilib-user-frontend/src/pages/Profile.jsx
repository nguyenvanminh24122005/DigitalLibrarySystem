import React, { useEffect, useMemo, useState } from 'react';
import { Bell, BookOpen, Download, Heart, KeyRound, Mail, Phone, RotateCcw, Save, UserRound } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import QRCodeBox from '../components/QRCode';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';
import { getBorrowingHistory, getCurrentBorrowings, getFavoriteBooks } from '../services/catalogApi';
import { useToast } from '../components/ToastProvider';
import { useProfile } from '../context/ProfileContext';

function toInputDate(value) {
  if (!value) return '';
  const parts = String(value).split('/');
  if (parts.length === 3) return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  try { return new Date(value).toISOString().slice(0, 10); } catch { return ''; }
}

export default function Profile() {
  const { profile, setProfile, saveProfile: saveProfileApi } = useProfile();
  const [stats, setStats] = useState({ loans: 0, history: 0, favorites: 0, resources: 24 });
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    async function load() {
      const [loans, history, favorites] = await Promise.all([
        getCurrentBorrowings().catch(() => []),
        getBorrowingHistory().catch(() => []),
        getFavoriteBooks().catch(() => [])
      ]);
      setStats({ loans: loans.filter(x => x.status === 'Borrowed').length, history: history.length, favorites: favorites.length, resources: 24 });
    }
    load();
  }, []);

  const user = useMemo(() => profile, [profile]);

  function openEdit() {
    setForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      studentCode: user.studentCode || '',
      readerCode: user.readerCode || '',
      faculty: user.faculty || '',
      className: user.className || '',
      role: user.role || 'Sinh viên',
      address: user.address || '',
      gender: user.gender || 'Nữ',
      dateOfBirth: toInputDate(user.dateOfBirth),
      avatar: user.avatar || ''
    });
    setEditing(true);
  }

  function updateField(name, value) {
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function saveProfile() {
    setSaving(true);
    try {
      const saved = await saveProfileApi({
        name: form.name,
        role: form.role,
        avatar: form.avatar,
        email: form.email,
        phone: form.phone,
        studentCode: form.studentCode,
        readerCode: form.readerCode,
        faculty: form.faculty,
        className: form.className,
        status: user.status || 'Đang hoạt động',
        address: form.address,
        gender: form.gender,
        dateOfBirth: form.dateOfBirth || null
      });
      setProfile(saved);
      toast.show('Thông tin cá nhân đã được cập nhật trên toàn hệ thống.', 'success', 'Cập nhật thành công');
      setEditing(false);
    } catch (error) {
      const localProfile = setProfile({ ...user, ...form, name: form.name });
      toast.show('Đã cập nhật giao diện hiện tại, nhưng backend chưa lưu được. Kiểm tra API profile.', 'warning', 'Lưu tạm');
      console.warn(error.message, localProfile);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  return <div className="page-fade"><PageHeader title="Hồ sơ cá nhân" description="Quản lý thông tin tài khoản và thẻ thư viện của bạn."/><section className="profile-top"><div className="profile-card panel"><img src={user.avatar} alt={user.name}/><div><h1>{user.name} <span className="pill blue-soft">{user.role}</span></h1><div className="profile-grid"><span><UserRound size={16}/>Mã sinh viên: {user.studentCode}</span><span>🎓 Khoa / Ngành: {user.faculty}</span><span><Mail size={16}/>Email: {user.email}</span><span>🏫 Lớp: {user.className}</span><span><Phone size={16}/>Số điện thoại: {user.phone}</span><span>⏱ Ngày tham gia: {user.joinedAt}</span><span>⚙ Trạng thái: <b className="pill green-soft">{user.status}</b></span></div><button className="btn btn-outline" onClick={openEdit}><Save size={17}/>Chỉnh sửa hồ sơ</button><button className="btn btn-soft"><KeyRound size={17}/>Đổi mật khẩu</button></div></div><div className="panel library-card"><h2>Thẻ thư viện</h2><div className="library-card-row"><QRCodeBox label={user.readerCode}/><dl><dt>Mã độc giả</dt><dd>{user.readerCode}</dd><dt>Hạng thành viên</dt><dd>Thành viên</dd><dt>Ngày hết hạn</dt><dd>{user.cardExpiredAt}</dd><dt>Trạng thái thẻ</dt><dd><span className="pill green-soft">Đang hoạt động</span></dd></dl></div><button className="btn btn-outline"><Download size={17}/>Tải thẻ</button></div></section><div className="stat-grid four"><StatCard icon={<BookOpen/>} value={stats.loans} label="Sách đang mượn"/><StatCard icon={<RotateCcw/>} value={stats.history} label="Đã mượn"/><StatCard icon={<Heart/>} value={stats.favorites} label="Sách yêu thích"/><StatCard icon={<Download/>} value={stats.resources} label="Tài liệu đã lưu"/></div><section className="profile-bottom"><div className="panel"><h2>Thông tin cá nhân</h2><div className="info-grid"><span>Họ và tên</span><b>{user.name}</b><span>Địa chỉ</span><b>{user.address}</b><span>Email</span><b>{user.email}</b><span>Khoa / Đơn vị</span><b>{user.faculty}</b><span>Số điện thoại</span><b>{user.phone}</b><span>Vai trò</span><b>{user.role}</b><span>Ngày sinh</span><b>{user.dateOfBirth}</b><span>Giới tính</span><b>{user.gender}</b></div></div><div className="panel"><h2>Tùy chọn tài khoản</h2>{['Nhận thông báo email','Nhắc hạn trả sách','Hiển thị hồ sơ công khai','Giao diện sáng'].map((x,i)=><label className="switch-line" key={x}>{i===0?<Mail/>:i===1?<Bell/>:<UserRound/>}<span>{x}</span><input type="checkbox" defaultChecked={i!==2}/></label>)}<label className="switch-line"><span>Ngôn ngữ</span><select><option>Tiếng Việt</option><option>English</option></select></label></div></section><section className="panel"><div className="section-head"><h2>Mục tiêu đọc</h2><b>12 / 20 cuốn trong năm</b></div><div className="progress tall"><i style={{width:'60%'}}/></div><p>Bạn đang đi đúng hướng! Cố gắng hoàn thành mục tiêu đọc năm nay nhé.</p></section>

  <Modal open={editing} title="Chỉnh sửa hồ sơ" subtitle="Cập nhật thông tin cá nhân hiển thị trên hệ thống." icon={<UserRound size={24}/>} onClose={() => setEditing(false)} className="profile-edit-modal" footer={<><button className="btn btn-outline" onClick={() => setEditing(false)}>Hủy</button><button className="btn btn-primary" onClick={saveProfile} disabled={saving}><Save size={17}/>{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</button></>}>
    <div className="edit-form-grid">
      <label>Họ và tên<input value={form.name || ''} onChange={e => updateField('name', e.target.value)} /></label>
      <label>Email<input value={form.email || ''} onChange={e => updateField('email', e.target.value)} /></label>
      <label>Số điện thoại<input value={form.phone || ''} onChange={e => updateField('phone', e.target.value)} /></label>
      <label>Mã sinh viên<input value={form.studentCode || ''} onChange={e => updateField('studentCode', e.target.value)} /></label>
      <label>Mã độc giả<input value={form.readerCode || ''} onChange={e => updateField('readerCode', e.target.value)} /></label>
      <label>Khoa / Ngành<input value={form.faculty || ''} onChange={e => updateField('faculty', e.target.value)} /></label>
      <label>Lớp<input value={form.className || ''} onChange={e => updateField('className', e.target.value)} /></label>
      <label>Vai trò<select value={form.role || 'Sinh viên'} onChange={e => updateField('role', e.target.value)}><option>Sinh viên</option><option>Giảng viên</option><option>Độc giả</option></select></label>
      <label>Ngày sinh<input type="date" value={form.dateOfBirth || ''} onChange={e => updateField('dateOfBirth', e.target.value)} /></label>
      <label>Giới tính<select value={form.gender || 'Nữ'} onChange={e => updateField('gender', e.target.value)}><option>Nữ</option><option>Nam</option><option>Khác</option></select></label>
      <label className="span-2">Địa chỉ<input value={form.address || ''} onChange={e => updateField('address', e.target.value)} /></label>
      <label className="span-2">Ảnh đại diện URL<input value={form.avatar || ''} onChange={e => updateField('avatar', e.target.value)} /></label>
    </div>
  </Modal>
  </div>;
}
