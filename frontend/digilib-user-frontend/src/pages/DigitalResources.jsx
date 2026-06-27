import { Link } from 'react-router-dom';
import { Download, Eye, FileText, Search } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import PageHeader from '../components/PageHeader';
import { mockResources } from '../data/mockData';
import { getDigitalResources } from '../services/catalogApi';

export default function DigitalResources() {
  const [resources, setResources] = useState(mockResources);
  const [keyword, setKeyword] = useState('');
  const [type, setType] = useState('');
  const cards = [ ['Luận văn / Khóa luận', '1.256 tài liệu'], ['Báo cáo nghiên cứu', '2.345 tài liệu'], ['Đề tài / Dự án', '987 tài liệu'], ['Giáo trình / Bài giảng', '1.873 tài liệu'], ['Tạp chí khoa học', '3.421 tài liệu'], ['Văn bản pháp luật', '2.156 tài liệu'] ];

  useEffect(() => { getDigitalResources().then(list => { if (list.length) setResources(list); }).catch(() => {}); }, []);

  const shown = useMemo(() => resources.filter(r => {
    const text = `${r.title} ${r.author} ${r.type} ${r.field}`.toLowerCase();
    return (!keyword || text.includes(keyword.toLowerCase())) && (!type || r.type === type);
  }), [resources, keyword, type]);
  const types = [...new Set(resources.map(r => r.type).filter(Boolean))];

  return <div className="page-fade"><PageHeader title="Tài liệu số" description="Kho tài liệu học tập, nghiên cứu và tham khảo đa dạng, hữu ích."/><div className="resource-cats">{cards.map((c) => <div className="resource-cat" key={c[0]}><FileText size={30}/><div><b>{c[0]}</b><span>{c[1]}</span></div></div>)}</div><div className="search-panel slim"><label><input placeholder="Tìm kiếm trong tài liệu số..." value={keyword} onChange={e => setKeyword(e.target.value)}/></label><label><select value={type} onChange={e => setType(e.target.value)}><option value="">Tất cả loại tài liệu</option>{types.map(t => <option key={t}>{t}</option>)}</select></label><label><select><option>Tất cả lĩnh vực</option></select></label><label><select><option>Mới nhất</option></select></label><button className="btn btn-soft" onClick={() => { setKeyword(''); setType(''); }}><Search size={17}/>Bỏ lọc</button></div><section><div className="section-head"><h2>Tài liệu mới</h2><Link to="/resources">Xem tất cả →</Link></div><div className="resource-grid">{shown.map(r => <Link to={`/resources/${r.id}`} className="resource-card" key={r.id}><div className="resource-cover" style={{ backgroundImage: `url(${r.coverUrl})` }}><span>{r.format}</span></div><h3>{r.title}</h3><p>{r.type}</p><span>{r.author}</span><small>{r.year}</small><div><em><Eye size={14}/>{r.views}</em><em><Download size={14}/>{r.downloads}</em><em>♡</em></div></Link>)}</div></section><section className="resource-layout"><div className="panel"><h2>Tài liệu xem nhiều</h2><table className="data-table"><thead><tr><th>#</th><th>Tên tài liệu</th><th>Loại tài liệu</th><th>Lượt xem</th><th>Ngày cập nhật</th></tr></thead><tbody>{shown.map((r, i) => <tr key={r.id}><td>{i+1}</td><td><Link to={`/resources/${r.id}`}>{r.title}</Link></td><td>{r.type}</td><td>{r.views}</td><td>{r.updatedAt}</td></tr>)}</tbody></table></div><aside className="panel tags-panel"><h2>Chủ đề nổi bật</h2>{['Trí tuệ nhân tạo','Kinh tế học','Chuyển đổi số','Quản trị kinh doanh','Năng lượng tái tạo','Giáo dục','Y tế - Sức khỏe','Môi trường'].map(t => <span key={t} className="tag blue-soft">{t}</span>)}</aside></section></div>;
}
