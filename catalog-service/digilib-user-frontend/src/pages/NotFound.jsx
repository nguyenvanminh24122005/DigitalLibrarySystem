import React from 'react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
export default function NotFound() { const navigate = useNavigate(); return <EmptyState type="search" title="404 - Không tìm thấy trang" message="Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển." actionLabel="Quay lại trang chủ" onAction={() => navigate('/')}/>; }
