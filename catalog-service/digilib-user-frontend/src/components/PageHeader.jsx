import React from 'react';
export default function PageHeader({ current, title, description, right }) {
  return (
    <div className="page-head">
      <div>
        <div className="breadcrumb">Trang chủ <span>/</span> {current || title}</div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {right}
    </div>
  );
}
