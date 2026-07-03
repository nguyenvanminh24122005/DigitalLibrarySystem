import { Link, useParams } from 'react-router-dom';
import { Download, Eye, Share2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import { mockResources } from '../data/mockData';
import { downloadDigitalResource, getDigitalResourceById, getDigitalResources, viewDigitalResource } from '../services/catalogApi';
import { useToast } from '../components/ToastProvider';

export default function DigitalResourceDetail() {
  const { id } = useParams();
  const [resource, setResource] = useState(mockResources.find(r => String(r.id) === String(id)) || mockResources[0]);
  const [related, setRelated] = useState(mockResources.slice(0, 3));
  const toast = useToast();

  useEffect(() => {
    async function load() {
      const item = await getDigitalResourceById(id);
      setResource(item);
      const list = await getDigitalResources();
      setRelated(list.filter(r => String(r.id) !== String(item.id)).slice(0, 3));
    }
    load().catch(() => {});
  }, [id]);

  async function openOnline() {
    try { await viewDigitalResource(resource.rawId || resource.id); } catch {}
    toast.show('Đang mở tài liệu trực tuyến.', 'info');
  }

  async function download() {
    try { await downloadDigitalResource(resource.rawId || resource.id); } catch {}
    toast.show('Tài liệu đã được tải xuống.', 'success');
  }

  if (!resource) return <EmptyState type="resource" title="Không tìm thấy tài liệu" message="Tài liệu có thể đã bị xóa hoặc chuyển vị trí."/>;
  return <div className="page-fade"><PageHeader title="Chi tiết tài liệu" current="Tài liệu số / Chi tiết tài liệu"/><section className="resource-detail-hero"><div><div className="resource-big-cover" style={{ backgroundImage: `url(${resource.coverUrl})` }}><b>{resource.title}</b><span>{resource.year}</span></div><button className="btn btn-outline btn-full">♡ Lưu vào thư viện</button></div><div className="resource-info"><h1>{resource.title} <span className="pill green-soft">{resource.format}</span></h1><dl className="meta-list"><dt>Tác giả:</dt><dd>{resource.author}</dd><dt>Nhà xuất bản:</dt><dd>{resource.publisher || 'Đang cập nhật'}</dd><dt>Năm xuất bản:</dt><dd>{resource.year}</dd><dt>Ngôn ngữ:</dt><dd>{resource.language}</dd><dt>Loại tài liệu:</dt><dd>{resource.type}</dd><dt>Chủ đề:</dt><dd>{resource.field}</dd><dt>Dung lượng:</dt><dd>{resource.size}</dd><dt>Lượt xem:</dt><dd>{resource.views}</dd><dt>Lượt tải:</dt><dd>{resource.downloads}</dd><dt>Ngày cập nhật:</dt><dd>{resource.updatedAt}</dd></dl></div><aside className="resource-actions"><button className="btn btn-primary" onClick={openOnline}><Eye size={18}/>Đọc trực tuyến</button><button className="btn btn-outline" onClick={download}><Download size={18}/>Tải xuống</button><button className="btn btn-outline"><Share2 size={18}/>Chia sẻ</button><div className="panel"><h2>Mô tả</h2><p>{resource.description}</p><a className="blue-link">Xem thêm</a><h3>Từ khóa</h3><div className="tag-list">{(resource.keywords || []).map(k => <span className="tag" key={k}>{k}</span>)}</div></div></aside></section><section className="resource-tabs"><div className="panel"><div className="tabbar"><a className="active">Nội dung</a><a>Thông tin chi tiết</a><a>Tài liệu liên quan (5)</a><a>Bình luận (12)</a></div><h3>Mục lục</h3>{(resource.contents || []).map((row, idx) => { const title = Array.isArray(row) ? row[0] : row.title || `Mục ${idx + 1}`; const page = Array.isArray(row) ? row[1] : row.page || idx + 1; return <div className="toc-row" key={`${title}-${idx}`}><span>{title}</span><b>{page}</b></div>; })}</div><aside className="panel"><div className="section-head"><h2>Tài liệu liên quan</h2><Link to="/resources">Xem tất cả →</Link></div>{related.map(r => <Link className="side-book" to={`/resources/${r.id}`} key={r.id}><div className="doc-icon">PDF</div><div><b>{r.title}</b><span>{r.author}</span></div><small>⭐ 4.7</small></Link>)}</aside></section></div>;
}
