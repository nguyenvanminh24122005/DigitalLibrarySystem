import { mockBooks } from '../data/mockData';

const API_BASE = `${(import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '') || window.location.origin}/api`;

function getToken() {
  return localStorage.getItem('digilib_token') || localStorage.getItem('reader_token') || '';
}

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const token = getToken();
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    },
    ...options
  });
  if (!res.ok) {
    let message = `API lỗi ${res.status}`;
    try {
      const data = await res.json();
      message = data.message || data.title || message;
    } catch {}
    throw new Error(message);
  }
  if (res.status === 204) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

function pick(obj, names, fallback = undefined) {
  for (const name of names) {
    if (obj && obj[name] !== undefined && obj[name] !== null) return obj[name];
  }
  return fallback;
}

function asText(value, fallback = 'Đang cập nhật') {
  if (value === undefined || value === null || value === '') return fallback;
  if (Array.isArray(value)) return value.map(item => asText(item, '')).filter(Boolean).join(', ') || fallback;
  if (typeof value === 'object') {
    return value.name || value.fullName || value.title || value.value || value.label || fallback;
  }
  return String(value);
}

function asTags(value, fallback = []) {
  if (!value) return fallback;
  if (Array.isArray(value)) return value.map(item => asText(item, '')).filter(Boolean);
  if (typeof value === 'string') return value.split(/[;,|]/).map(x => x.trim()).filter(Boolean);
  return fallback;
}

function asNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function makeAssetUrl(value) {
  const url = asText(value, '').trim();
  if (!url) return '';
  if (/^(https?:)?\/\//i.test(url) || url.startsWith('data:') || url.startsWith('blob:')) return url;
  try {
    const origin = new URL(API_BASE).origin;
    return `${origin}${url.startsWith('/') ? url : `/${url}`}`;
  } catch {
    return url;
  }
}

export function normalizeCopy(copy = {}, index = 0) {
  const rawStatus = String(pick(copy, ['status', 'copyStatus', 'availabilityStatus'], 'Available')).toLowerCase();
  const isPending = rawStatus.includes('pending') || rawStatus.includes('chờ') || rawStatus.includes('cho duyet') || rawStatus.includes('duyệt');
  const isBorrowed = rawStatus.includes('borrow') || rawStatus.includes('mượn');
  const isUnavailable = rawStatus.includes('unavailable') || rawStatus.includes('hỏng') || rawStatus.includes('lost') || rawStatus.includes('mất');
  return {
    id: pick(copy, ['id', 'copyId', 'bookCopyId'], index + 1),
    copyId: pick(copy, ['copyId', 'id', 'bookCopyId'], index + 1),
    barcode: pick(copy, ['barcode', 'copyCode', 'code', 'inventoryCode'], `BK${String(index + 1).padStart(5, '0')}`),
    location: pick(copy, ['location', 'shelfLocation', 'shelf', 'position'], 'Kho A - Kệ 01'),
    condition: pick(copy, ['condition', 'physicalCondition', 'bookCondition'], 'Tốt'),
    status: isUnavailable ? 'Unavailable' : isPending ? 'PendingApproval' : isBorrowed ? 'Borrowed' : 'Available',
    dueDate: pick(copy, ['dueDate', 'expectedReturnDate', 'returnDate'], null)
  };
}

export function normalizeBook(book = {}, index = 0) {
  const id = pick(book, ['id', 'bookId', 'bookID'], index + 1);
  const rawCopies = pick(book, ['copies', 'bookCopies', 'items'], []);
  const copies = Array.isArray(rawCopies) ? rawCopies.map(normalizeCopy) : [];
  const availableCopies = asNumber(pick(book, ['availableCopies', 'available', 'availableCount', 'quantityAvailable'], copies.filter(c => c.status === 'Available').length), 0);
  const totalCopies = asNumber(pick(book, ['totalCopies', 'total', 'copyCount', 'quantity'], copies.length || availableCopies), availableCopies);
  const title = asText(pick(book, ['title', 'name', 'bookTitle']), 'Chưa có tên sách');
  const author = asText(pick(book, ['author', 'authors', 'authorName']), 'Đang cập nhật');
  const category = asText(pick(book, ['category', 'categoryName', 'genre']), 'Khác');
  return {
    id,
    title,
    author,
    publisher: asText(pick(book, ['publisher', 'publisherName', 'publishingHouse']), 'Đang cập nhật'),
    category,
    language: asText(pick(book, ['language']), 'Tiếng Việt'),
    isbn: asText(pick(book, ['isbn', 'ISBN']), ''),
    publishedYear: asText(pick(book, ['publishedYear', 'publicationYear', 'year']), ''),
    pages: asText(pick(book, ['pages', 'pageCount']), ''),
    size: asText(pick(book, ['size', 'dimensions']), '14 x 20.5 cm'),
    rating: asNumber(pick(book, ['rating', 'averageRating'], 4.6), 4.6),
    reviews: asNumber(pick(book, ['reviews', 'reviewCount'], 0), 0),
    views: asNumber(pick(book, ['views', 'viewCount'], 0), 0),
    status: availableCopies > 0 ? 'Có thể mượn' : 'Hết sách',
    availableCopies,
    totalCopies: totalCopies || availableCopies,
    location: asText(pick(book, ['location', 'shelfLocation'], copies[0]?.location), 'Kho A - Kệ 01'),
    coverUrl: makeAssetUrl(asText(pick(book, ['coverUrl', 'coverImageUrl', 'imageUrl', 'thumbnailUrl', 'coverImage', 'image', 'thumbnail', 'imagePath', 'cover', 'photoUrl'], ''), '')),
    isEbook: Boolean(pick(book, ['isEbook', 'ebookAvailable'], false)),
    isNew: Boolean(pick(book, ['isNew'], index < 4)),
    isFeatured: Boolean(pick(book, ['isFeatured'], index < 5)),
    description: asText(pick(book, ['description', 'summary']), 'Thông tin mô tả sách đang được cập nhật.'),
    tags: asTags(pick(book, ['tags', 'keywords'], []), category ? [category] : []),
    copies
  };
}

export async function getBooks(params = {}) {
  try {
    const query = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null)).toString();
    const data = await request(`/books${query ? `?${query}` : ''}`);
    const list = Array.isArray(data) ? data : data?.items || data?.data || data?.results || [];
    return list.map(normalizeBook);
  } catch (error) {
    console.warn('Dùng dữ liệu mẫu vì chưa gọi được GET /api/books:', error.message);
    return mockBooks.map(normalizeBook);
  }
}

export async function searchBooks(params = {}) {
  try {
    const query = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null)).toString();
    const data = await request(`/books/search${query ? `?${query}` : ''}`);
    const list = Array.isArray(data) ? data : data?.items || data?.data || data?.results || [];
    return list.map(normalizeBook);
  } catch {
    const books = await getBooks();
    const keyword = String(params.keyword || params.q || '').toLowerCase();
    return books.filter(book => {
      const text = `${book.title} ${book.author} ${book.category} ${book.publisher} ${book.isbn}`.toLowerCase();
      const okKeyword = !keyword || text.includes(keyword);
      const okCategory = !params.category || params.category === 'Tất cả' || book.category === params.category;
      const okAvailable = params.available === undefined || params.available === '' || (String(params.available) === 'true' ? book.availableCopies > 0 : true);
      return okKeyword && okCategory && okAvailable;
    });
  }
}

export async function getBookById(id) {
  try {
    const data = await request(`/books/${id}`);
    return normalizeBook(data);
  } catch {
    const book = mockBooks.map(normalizeBook).find(b => String(b.id) === String(id));
    if (!book) throw new Error('Không tìm thấy sách');
    return book;
  }
}

export async function getBookAvailability(id) {
  try {
    const data = await request(`/books/${id}/availability`);
    const copies = data?.copies || data?.bookCopies || data?.items || [];
    return {
      availableCopies: pick(data, ['availableCopies', 'available', 'availableCount'], undefined),
      totalCopies: pick(data, ['totalCopies', 'total', 'copyCount'], undefined),
      copies: Array.isArray(copies) ? copies.map(normalizeCopy) : []
    };
  } catch {
    const book = mockBooks.map(normalizeBook).find(b => String(b.id) === String(id));
    return {
      availableCopies: book?.availableCopies || 0,
      totalCopies: book?.totalCopies || 0,
      copies: book?.copies || []
    };
  }
}

export async function borrowCopy(bookId, copyId) {
  // Luồng User chỉ gửi yêu cầu mượn. Không gọi API catalog borrow trực tiếp,
  // vì bản sao chỉ được chuyển sang Borrowed sau khi thủ thư duyệt.
  return await borrowBookReal(bookId, copyId);
}

export async function returnCopy(bookId, copyId, loanId = null) {
  try {
    if (loanId) return await returnLoanReal(loanId);
    return await request(`/books/${bookId}/copies/${copyId}/return`, { method: 'PUT' });
  } catch (error) {
    console.warn('API trả sách chưa sẵn sàng, xử lý local:', error.message);
    return { ok: true, mocked: true };
  }
}

export const USER_ID = import.meta.env.VITE_USER_ID || 'demo-user';

function normalizeLoan(item = {}) {
  const book = item.book ? normalizeBook(item.book) : null;
  return {
    loanId: pick(item, ['loanId', 'id'], `L${Date.now()}`),
    loanCode: pick(item, ['loanCode'], ''),
    bookId: pick(item, ['bookId'], book?.id),
    copyId: pick(item, ['copyId'], undefined),
    barcode: pick(item, ['barcode', 'copyCode'], ''),
    borrowedAt: String(pick(item, ['borrowedAt', 'borrowDate'], '')).slice(0, 10),
    dueDate: String(pick(item, ['dueDate'], '')).slice(0, 10),
    returnedAt: pick(item, ['returnedAt', 'returnDate'], null) ? String(pick(item, ['returnedAt', 'returnDate'], '')).slice(0, 10) : null,
    status: pick(item, ['status'], 'Borrowed'),
    renewed: Boolean(pick(item, ['renewed'], false)) || asNumber(pick(item, ['renewCount'], 0), 0) > 0,
    renewCount: asNumber(pick(item, ['renewCount'], 0), 0),
    fineAmount: asNumber(pick(item, ['fineAmount'], 0), 0),
    location: pick(item, ['location'], book?.location || 'Kho A - Kệ 01'),
    book
  };
}

export function normalizeResource(item = {}) {
  const id = pick(item, ['id', 'resourceId'], 'r1');
  return {
    id: String(id),
    rawId: id,
    title: asText(pick(item, ['title', 'name']), 'Chưa có tên tài liệu'),
    author: asText(pick(item, ['author', 'authors']), 'Đang cập nhật'),
    publisher: asText(pick(item, ['publisher']), 'Đang cập nhật'),
    type: asText(pick(item, ['type', 'documentType']), 'Tài liệu'),
    field: asText(pick(item, ['field', 'category']), 'Khác'),
    year: asNumber(pick(item, ['year', 'publishedYear'], new Date().getFullYear()), new Date().getFullYear()),
    language: asText(pick(item, ['language']), 'Tiếng Việt'),
    size: asText(pick(item, ['size', 'fileSize']), '1 MB'),
    pages: asNumber(pick(item, ['pages'], 0), 0),
    views: asNumber(pick(item, ['views'], 0), 0),
    downloads: asNumber(pick(item, ['downloads'], 0), 0),
    format: asText(pick(item, ['format'], 'PDF'), 'PDF'),
    updatedAt: String(pick(item, ['updatedAt'], '')).slice(0, 10) || '2025-06-10',
    coverUrl: makeAssetUrl(asText(pick(item, ['coverUrl', 'coverImage'], ''), '')),
    fileUrl: makeAssetUrl(asText(pick(item, ['fileUrl'], ''), '')),
    description: asText(pick(item, ['description'], ''), 'Tài liệu đang được cập nhật mô tả.'),
    keywords: asTags(pick(item, ['keywords'], []), []),
    contents: Array.isArray(item.contents) ? item.contents : []
  };
}

export async function getProfile(userId = USER_ID) {
  if (getToken()) return await request('/profile');
  const data = await request(`/user-portal/${encodeURIComponent(userId)}/profile`);
  return data;
}

export async function updateProfile(userId = USER_ID, profile) {
  if (getToken()) return await request('/profile', { method: 'PUT', body: JSON.stringify(profile) });
  return await request(`/user-portal/${encodeURIComponent(userId)}/profile`, { method: 'PUT', body: JSON.stringify(profile) });
}

export async function getFavoriteBooks(userId = USER_ID) {
  try {
    const data = await request(`/user-portal/${encodeURIComponent(userId)}/favorites`);
    const list = Array.isArray(data) ? data : data?.items || [];
    return list.map(x => x.book ? normalizeBook(x.book) : normalizeBook(x));
  } catch (error) {
    console.warn('Dùng favorite local vì API chưa sẵn sàng:', error.message);
    return [];
  }
}

export async function addFavoriteBook(bookId, userId = USER_ID) {
  return await request(`/user-portal/${encodeURIComponent(userId)}/favorites/${bookId}`, { method: 'POST' });
}

export async function removeFavoriteBook(bookId, userId = USER_ID) {
  return await request(`/user-portal/${encodeURIComponent(userId)}/favorites/${bookId}`, { method: 'DELETE' });
}

export async function getCurrentBorrowings(userId = USER_ID) {
  const data = await request(`/user-portal/${encodeURIComponent(userId)}/borrowings/current`);
  const list = Array.isArray(data) ? data : data?.items || [];
  return list.map(normalizeLoan);
}

export async function getBorrowingHistory(userId = USER_ID) {
  const data = await request(`/user-portal/${encodeURIComponent(userId)}/borrowings/history`);
  const list = Array.isArray(data) ? data : data?.items || [];
  return list.map(normalizeLoan);
}

export async function borrowBookReal(bookId, copyId, userId = USER_ID) {
  const data = await request(`/user-portal/${encodeURIComponent(userId)}/borrowings`, { method: 'POST', body: JSON.stringify({ bookId: Number(bookId), copyId: Number(copyId), days: 14 }) });
  return normalizeLoan(data);
}

export async function returnLoanReal(loanId, userId = USER_ID) {
  const data = await request(`/user-portal/${encodeURIComponent(userId)}/borrowings/${loanId}/return`, { method: 'PUT' });
  return normalizeLoan(data);
}

export async function renewLoanReal(loanId, userId = USER_ID) {
  const data = await request(`/user-portal/${encodeURIComponent(userId)}/borrowings/${loanId}/renew`, { method: 'PUT' });
  return normalizeLoan(data);
}

export async function approveBorrowingRequest(loanId, userId = USER_ID) {
  const data = await request(`/user-portal/${encodeURIComponent(userId)}/borrowings/${loanId}/approve`, { method: 'PUT' });
  return normalizeLoan(data);
}

export async function rejectBorrowingRequest(loanId, reason = '', userId = USER_ID) {
  const data = await request(`/user-portal/${encodeURIComponent(userId)}/borrowings/${loanId}/reject`, { method: 'PUT', body: JSON.stringify({ reason }) });
  return normalizeLoan(data);
}

export async function getNotifications(userId = USER_ID) {
  const data = await request(`/user-portal/${encodeURIComponent(userId)}/notifications`);
  const list = Array.isArray(data) ? data : data?.items || [];
  return list.map(x => ({
    id: x.id,
    type: x.type || 'system',
    title: x.title,
    message: x.message,
    unread: !x.isRead,
    time: x.createdAt ? new Date(x.createdAt).toLocaleString('vi-VN') : '',
    createdAt: x.createdAt
  }));
}

export async function markAllNotificationsRead(userId = USER_ID) {
  return await request(`/user-portal/${encodeURIComponent(userId)}/notifications/read-all`, { method: 'PUT' });
}

export async function getReadingProgress(userId = USER_ID) {
  const data = await request(`/user-portal/${encodeURIComponent(userId)}/reading-progress`);
  const result = {};
  for (const item of Array.isArray(data) ? data : []) result[item.bookId] = item.progress;
  return result;
}

export async function updateReadingProgress(bookId, progress, userId = USER_ID) {
  return await request(`/user-portal/${encodeURIComponent(userId)}/reading-progress/${bookId}`, { method: 'PUT', body: JSON.stringify({ progress }) });
}

export async function getDigitalResources(params = {}) {
  const query = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null)).toString();
  const data = await request(`/digital-documents${query ? `?${query}` : ''}`);
  const list = Array.isArray(data) ? data : data?.items || [];
  return list.map(normalizeResource);
}

export async function getDigitalResourceById(id) {
  const data = await request(`/digital-documents/${id}`);
  return normalizeResource(data);
}

export async function viewDigitalResource(id) {
  const data = await request(`/digital-documents/${id}/view`, { method: 'POST' });
  return normalizeResource(data);
}

export async function downloadDigitalResource(id) {
  const data = await request(`/digital-documents/${id}/download`, { method: 'POST' });
  return normalizeResource(data);
}
