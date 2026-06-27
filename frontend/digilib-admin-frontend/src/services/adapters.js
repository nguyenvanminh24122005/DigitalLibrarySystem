export const CatalogStatus = { Active: 1, Inactive: 2 }
export const CopyCondition = { Good: 1, Damaged: 2, Lost: 3, Maintenance: 4 }
export const BorrowStatus = { Available: 1, Borrowed: 2, Unavailable: 3 }
export const AccountStatus = { Active: 1, Locked: 2, Inactive: 3 }

export const defaultCover = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="220" height="300" viewBox="0 0 220 300">
  <rect width="220" height="300" rx="18" fill="#eff6ff"/>
  <path d="M66 86h58c18 0 30 12 30 30v98H82c-10 0-16 6-16 16V86z" fill="#2563eb" opacity="0.14"/>
  <path d="M66 86h58c18 0 30 12 30 30v98H82c-10 0-16 6-16 16V86z" fill="none" stroke="#2563eb" stroke-width="7" stroke-linejoin="round"/>
  <path d="M94 118h38M94 146h38M94 174h30" stroke="#2563eb" stroke-width="7" stroke-linecap="round" opacity="0.55"/>
  <text x="110" y="262" text-anchor="middle" font-family="Arial" font-size="20" font-weight="700" fill="#2563eb">DIGILIB</text>
</svg>`)

function enumValue(value) {
  if (typeof value === 'number') return value
  if (typeof value === 'string' && /^\d+$/.test(value)) return Number(value)
  return value
}

export function formatDate(value, withTime = false) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return withTime ? date.toLocaleString('vi-VN') : date.toLocaleDateString('vi-VN')
}

export function catalogStatus(status) {
  const v = enumValue(status)
  if (v === CatalogStatus.Active || v === 'Active') return 'Hoạt động'
  if (v === CatalogStatus.Inactive || v === 'Inactive') return 'Ngưng sử dụng'
  return status || 'Hoạt động'
}

export function conditionText(condition) {
  const v = enumValue(condition)
  const map = {
    [CopyCondition.Good]: 'Sẵn sàng',
    [CopyCondition.Damaged]: 'Hư hỏng',
    [CopyCondition.Lost]: 'Mất / thất lạc',
    [CopyCondition.Maintenance]: 'Bảo trì',
    Good: 'Sẵn sàng',
    Damaged: 'Hư hỏng',
    Lost: 'Mất / thất lạc',
    Maintenance: 'Bảo trì'
  }
  return map[v] || condition || 'Sẵn sàng'
}

export function borrowStatusText(status) {
  const v = enumValue(status)
  const map = {
    [BorrowStatus.Available]: 'Có thể mượn',
    [BorrowStatus.Borrowed]: 'Đang được mượn',
    [BorrowStatus.Unavailable]: 'Không mượn được',
    Available: 'Có thể mượn',
    Borrowed: 'Đang được mượn',
    Unavailable: 'Không mượn được'
  }
  return map[v] || status || 'Có thể mượn'
}

export function accountStatusText(status) {
  const v = enumValue(status)
  const map = {
    [AccountStatus.Active]: 'Hoạt động',
    [AccountStatus.Locked]: 'Tạm khóa',
    [AccountStatus.Inactive]: 'Không hoạt động',
    Active: 'Hoạt động',
    Locked: 'Tạm khóa',
    Inactive: 'Không hoạt động'
  }
  return map[v] || status || 'Hoạt động'
}

export function mapBook(b = {}) {
  return {
    id: b.id,
    title: b.title || 'Chưa có tiêu đề',
    subtitle: b.subtitle || b.description || '',
    isbn: b.isbn || b.ISBN || '',
    author: b.authorName || b.author?.name || 'Chưa rõ',
    category: b.categoryName || b.category?.name || 'Chưa phân loại',
    publisher: b.publisherName || b.publisher?.name || 'Chưa rõ',
    year: b.publishYear || b.publicationYear || b.year || '',
    pages: b.pageCount || b.pages || '',
    copies: b.totalCopies || 0,
    availableCopies: b.availableCopies || 0,
    borrowedCopies: b.borrowedCopies || 0,
    damagedCopies: b.damagedCopies || 0,
    lostCopies: b.lostCopies || 0,
    canBorrow: Boolean(b.canBorrow ?? b.availableCopies > 0),
    authorId: b.authorId || '',
    categoryId: b.categoryId || '',
    publisherId: b.publisherId || '',
    status: catalogStatus(b.status),
    cover: b.coverImageUrl || b.coverUrl || defaultCover,
    createdAt: formatDate(b.createdAt, true),
    updatedAt: formatDate(b.updatedAt, true),
    raw: b
  }
}

export function mapCopy(c = {}) {
  return {
    id: c.id,
    bookId: c.bookId,
    code: c.copyCode || c.code || c.id,
    book: c.bookTitle || c.book?.title || '',
    isbn: c.isbn || c.ISBN || '',
    location: c.shelfLocation || c.location || '',
    condition: conditionText(c.condition),
    conditionValue: enumValue(c.condition),
    borrowStatus: c.currentBorrowTicketCode || borrowStatusText(c.borrowStatus),
    borrowStatusValue: enumValue(c.borrowStatus),
    currentBorrowTicketCode: c.currentBorrowTicketCode || '',
    createdAt: formatDate(c.createdAt),
    updatedAt: formatDate(c.updatedAt, true),
    note: c.note || '',
    cover: c.coverImageUrl || defaultCover,
    raw: c
  }
}

export function mapUser(u = {}) {
  return {
    id: u.id,
    name: u.fullName || u.name || '',
    username: u.username || '',
    email: u.email || '',
    phone: u.phone || '',
    role: u.roleName || u.role || '',
    status: accountStatusText(u.status),
    statusValue: enumValue(u.status),
    createdAt: formatDate(u.createdAt, true),
    raw: u
  }
}

export function mapReader(r = {}) {
  return {
    id: r.id,
    code: r.readerCode || '',
    name: r.fullName || '',
    email: r.email || '',
    phone: r.phone || '',
    dob: r.dateOfBirth ? new Date(r.dateOfBirth).toISOString().slice(0, 10) : '',
    dobText: formatDate(r.dateOfBirth),
    gender: r.gender || '',
    address: r.address || '',
    memberType: r.memberType || 'Thành viên',
    cardNumber: r.cardNumber || '',
    cardIssuedAt: formatDate(r.cardIssuedAt),
    cardExpiredAt: formatDate(r.cardExpiredAt),
    cardStatus: r.cardStatus ? accountStatusText(r.cardStatus) : 'Chưa cấp thẻ',
    cardStatusValue: enumValue(r.cardStatus),
    borrowLimit: r.borrowLimit || 0,
    hasValidCard: Boolean(r.hasValidCard),
    createdAt: formatDate(r.createdAt),
    status: accountStatusText(r.status),
    statusValue: enumValue(r.status),
    raw: r
  }
}

export function mapLookup(x = {}, type = 'category') {
  return {
    id: x.id,
    name: x.name || '',
    description: x.description || '',
    country: x.country || x.nationality || '',
    nationality: x.nationality || '',
    address: x.address || '',
    email: x.email || '',
    phone: x.phone || '',
    status: catalogStatus(x.status),
    statusValue: enumValue(x.status),
    updatedAt: formatDate(x.updatedAt),
    books: x.bookCount || x.books || 0,
    borrowed: x.borrowed || 0,
    type,
    raw: x
  }
}
