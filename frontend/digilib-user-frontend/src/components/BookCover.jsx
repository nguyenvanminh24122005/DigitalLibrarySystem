import React, { useMemo, useState } from 'react';
import { BookOpen } from 'lucide-react';

const coverThemes = [
  ['#0f172a', '#2563eb'],
  ['#7f1d1d', '#ef4444'],
  ['#14532d', '#22c55e'],
  ['#312e81', '#7c3aed'],
  ['#78350f', '#f59e0b'],
  ['#164e63', '#06b6d4']
];

function hashText(text = '') {
  return Array.from(text).reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

export default function BookCover({ book, className = '' }) {
  const [failed, setFailed] = useState(false);
  const title = String(book?.title || 'Sách').trim();
  const author = String(book?.author || '').trim();
  const coverUrl = String(book?.coverUrl || '').trim();
  const [from, to] = useMemo(() => coverThemes[hashText(title) % coverThemes.length], [title]);

  if (coverUrl && !failed) {
    return (
      <img
        className={`book-cover ${className}`}
        src={coverUrl}
        alt={title}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      className={`book-cover cover-fallback ${className}`}
      style={{ '--cover-from': from, '--cover-to': to }}
      title={title}
      aria-label={title}
    >
      <span className="fallback-mark"><BookOpen size={18} /></span>
      <strong>{title}</strong>
      {author && <em>{author}</em>}
    </div>
  );
}
