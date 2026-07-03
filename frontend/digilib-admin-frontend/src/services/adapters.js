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

export function toArray(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.value)) return data.value
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.$values)) return data.$values
  return []
}

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
  const text = String(v || '').toLowerCase()
  if (v === CatalogStatus.Inactive || text.includes('inactive') || text.includes('ngưng') || text.includes('ngung')) return 'Ngưng sử dụng'
  return 'Hoạt động'
}

export function conditionText(condition) {
  const v = enumValue(condition)
  const text = String(v || '').toLowerCase()
  if (v === CopyCondition.Damaged || text.includes('damaged') || text.includes('hỏng') || text.includes('hong')) return 'Hư hỏng'
  if (v === CopyCondition.Lost || text.includes('lost') || text.includes('mất') || text.includes('mat')) return 'Mất / thất lạc'
  if (v === CopyCondition.Maintenance || text.includes('maintenance') || text.includes('bảo trì')) return 'Bảo trì'
  if (text.includes('cũ') || text.includes('cu') || text.includes('old')) return 'Cũ'
  return condition || 'Sẵn sàng'
}

export function borrowStatusText(status) {
  const v = enumValue(status)
  const text = String(v || '').toLowerCase()
  if (v === BorrowStatus.Borrowed || text.includes('borrowed') || text.includes('đang') || text.includes('dang')) return 'Đang được mượn'
  if (v === BorrowStatus.Unavailable || text.includes('unavailable') || text.includes('không') || text.includes('khong')) return 'Không mượn được'
  return 'Có thể mượn'
}

export function accountStatusText(status) {
  const v = enumValue(status)
  if (v === AccountStatus.Locked || v === 'Locked') return 'Tạm khóa'
  if (v === AccountStatus.Inactive || v === 'Inactive') return 'Không hoạt động'
  return 'Hoạt động'
}

export function mapBook(b = {}) {
  const copies = toArray(b.copies ?? b.Copies)
  const borrowedCopies = copies.filter(c => borrowStatusText(c.status ?? c.Status ?? c.borrowStatus ?? c.BorrowStatus) === 'Đang được mượn').length
  const problemCopies = copies.filter(c => ['Hư hỏng', 'Mất / thất lạc'].includes(conditionText(c.condition ?? c.Condition))).length
  const availableCopies = Math.max(0, copies.length - borrowedCopies - problemCopies)

  return {
    id: b.id ?? b.Id,
    title: b.title ?? b.Title ?? 'Chưa có tiêu đề',
    subtitle: b.subtitle ?? b.Subtitle ?? b.description ?? b.Description ?? '',
    isbn: b.isbn ?? b.ISBN ?? b.Isbn ?? '',
    author: b.author ?? b.Author ?? b.authorName ?? b.AuthorName ?? b.author?.name ?? 'Chưa rõ',
    category: b.category ?? b.Category ?? b.categoryName ?? b.CategoryName ?? b.category?.name ?? 'Chưa phân loại',
    publisher: b.publisher ?? b.Publisher ?? b.publisherName ?? b.PublisherName ?? b.publisher?.name ?? 'Chưa rõ',
    year: b.publishedYear ?? b.PublishedYear ?? b.publishYear ?? b.publicationYear ?? b.year ?? '',
    pages: b.pageCount ?? b.pages ?? '',
    copies: b.copyCount ?? b.totalCopies ?? copies.length,
    availableCopies: b.availableCopies ?? availableCopies,
    borrowedCopies: b.borrowedCopies ?? borrowedCopies,
    damagedCopies: b.damagedCopies ?? problemCopies,
    lostCopies: b.lostCopies ?? 0,
    canBorrow: Boolean(b.canBorrow ?? availableCopies > 0),
    authorId: b.authorId ?? '',
    categoryId: b.categoryId ?? '',
    publisherId: b.publisherId ?? '',
    status: catalogStatus(b.status ?? b.Status),
    cover: b.coverImage ?? b.CoverImage ?? b.coverImageUrl ?? b.coverUrl ?? defaultCover,
    createdAt: formatDate(b.createdAt ?? b.CreatedAt, true),
    updatedAt: formatDate(b.updatedAt ?? b.UpdatedAt, true),
    raw: b
  }
}

export function mapCopy(c = {}) {
  return {
    id: c.id ?? c.Id ?? c.copyId ?? c.CopyId,
    bookId: c.bookId ?? c.BookId,
    code: c.copyCode ?? c.CopyCode ?? c.barcode ?? c.Barcode ?? c.code ?? c.Code ?? c.id,
    copyCode: c.copyCode ?? c.CopyCode ?? c.barcode ?? c.Barcode ?? c.code ?? c.Code ?? c.id,
    book: c.bookTitle ?? c.BookTitle ?? c.book?.title ?? c.Book?.Title ?? '',
    isbn: c.isbn ?? c.ISBN ?? c.Isbn ?? '',
    location: c.location ?? c.Location ?? c.shelfLocation ?? c.ShelfLocation ?? '',
    condition: conditionText(c.condition ?? c.Condition),
    conditionValue: enumValue(c.condition ?? c.Condition),
    borrowStatus: borrowStatusText(c.status ?? c.Status ?? c.borrowStatus ?? c.BorrowStatus),
    borrowStatusValue: enumValue(c.status ?? c.Status ?? c.borrowStatus ?? c.BorrowStatus),
    currentBorrowTicketCode: c.currentBorrowTicketCode ?? c.CurrentBorrowTicketCode ?? '',
    createdAt: formatDate(c.createdAt ?? c.CreatedAt),
    updatedAt: formatDate(c.updatedAt ?? c.UpdatedAt, true),
    note: c.note ?? c.Note ?? '',
    cover: c.coverImage ?? c.CoverImage ?? c.coverImageUrl ?? defaultCover,
    raw: c
  }
}

export function mapUser(u = {}) {
  return {
    id: u.id ?? u.Id,
    name: u.fullName ?? u.FullName ?? u.name ?? '',
    username: u.username ?? u.Username ?? '',
    email: u.email ?? u.Email ?? '',
    phone: u.phone ?? u.Phone ?? '',
    role: u.roleName ?? u.RoleName ?? u.role ?? '',
    status: accountStatusText(u.status ?? u.Status),
    statusValue: enumValue(u.status ?? u.Status),
    createdAt: formatDate(u.createdAt ?? u.CreatedAt, true),
    raw: u
  }
}

export function mapReader(r = {}) {
  return {
    id: r.id ?? r.Id,
    code: r.readerCode ?? r.ReaderCode ?? '',
    name: r.fullName ?? r.FullName ?? '',
    email: r.email ?? r.Email ?? '',
    phone: r.phone ?? r.Phone ?? '',
    dob: r.dateOfBirth ? new Date(r.dateOfBirth).toISOString().slice(0, 10) : '',
    dobText: formatDate(r.dateOfBirth ?? r.DateOfBirth),
    gender: r.gender ?? r.Gender ?? '',
    address: r.address ?? r.Address ?? '',
    memberType: r.memberType ?? r.MemberType ?? 'Thành viên',
    cardNumber: r.cardNumber ?? r.CardNumber ?? '',
    cardIssuedAt: formatDate(r.cardIssuedAt ?? r.CardIssuedAt),
    cardExpiredAt: formatDate(r.cardExpiredAt ?? r.CardExpiredAt),
    cardStatus: r.cardStatus ? accountStatusText(r.cardStatus) : 'Chưa cấp thẻ',
    cardStatusValue: enumValue(r.cardStatus ?? r.CardStatus),
    borrowLimit: r.borrowLimit ?? r.BorrowLimit ?? 0,
    hasValidCard: Boolean(r.hasValidCard ?? r.HasValidCard),
    createdAt: formatDate(r.createdAt ?? r.CreatedAt),
    status: accountStatusText(r.status ?? r.Status),
    statusValue: enumValue(r.status ?? r.Status),
    raw: r
  }
}

export function mapLookup(x = {}, type = 'category') {
  return {
    id: x.id ?? x.Id,
    name: x.name ?? x.Name ?? '',
    description: x.description ?? x.Description ?? '',
    country: x.country ?? x.Country ?? x.nationality ?? x.Nationality ?? '',
    nationality: x.nationality ?? x.Nationality ?? '',
    address: x.address ?? x.Address ?? '',
    email: x.email ?? x.Email ?? '',
    phone: x.phone ?? x.Phone ?? '',
    status: catalogStatus(x.status ?? x.Status),
    statusValue: enumValue(x.status ?? x.Status),
    updatedAt: formatDate(x.updatedAt ?? x.UpdatedAt),
    books: x.bookCount ?? x.BookCount ?? x.books ?? 0,
    borrowed: x.borrowed ?? 0,
    type,
    raw: x
  }
}
