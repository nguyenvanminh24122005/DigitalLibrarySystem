import React from 'react';
import { Search, BookOpen, Heart, Bell, FolderOpen, AlertTriangle, Lock, ServerCrash } from 'lucide-react';

export default function EmptyState({ type = 'empty', title, message, actionLabel, onAction }) {
  const map = {
    search: Search,
    books: BookOpen,
    favorite: Heart,
    notify: Bell,
    resource: FolderOpen,
    error: AlertTriangle,
    lock: Lock,
    server: ServerCrash,
    empty: FolderOpen
  };
  const Icon = map[type] || FolderOpen;
  return (
    <div className={`empty-state empty-${type}`}>
      <Icon size={70} />
      <h3>{title}</h3>
      <p>{message}</p>
      {actionLabel && <button className="btn btn-soft" onClick={onAction}>{actionLabel}</button>}
    </div>
  );
}
