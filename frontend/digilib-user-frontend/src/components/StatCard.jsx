import React from 'react';
export default function StatCard({ icon, label, value, note, className = '' }) {
  return (
    <div className={`stat-card ${className}`}>
      <div className="stat-icon">{icon}</div>
      <div><b>{value}</b><span>{label}</span>{note && <small>{note}</small>}</div>
    </div>
  );
}
