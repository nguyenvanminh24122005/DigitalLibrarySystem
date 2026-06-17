const BOOKS_KEY = 'dl_books'
const READERS_KEY = 'dl_readers'
const BORROWS_KEY = 'dl_borrows'
const SETTINGS_KEY = 'dl_settings'

const todayIso = () => new Date().toISOString().slice(0, 10)

const addDays = (days) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

const read = (key, fallback) => {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

const write = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value))
}

const seedBooks = [
  {
    id: 'B001',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    isbn: '9780132350884',
    category: 'Công nghệ',
    publisher: 'Prentice Hall',
    year: 2008,
    totalCopies: 8,
    availableCopies: 5,
    location: 'Kệ A1',
    cover: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=600&auto=format&fit=crop',
    description: 'Nguyên tắc viết mã sạch, dễ bảo trì và phù hợp cho đội phát triển phần mềm.'
  },
  {
    id: 'B002',
    title: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    isbn: '9781449373320',
    category: 'Công nghệ',
    publisher: "O'Reilly",
    year: 2017,
    totalCopies: 6,
    availableCopies: 2,
    location: 'Kệ A2',
    cover: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=600&auto=format&fit=crop',
    description: 'Nền tảng về hệ thống dữ liệu, lưu trữ, xử lý phân tán và độ tin cậy.'
  },
  {
    id: 'B003',
    title: 'Tư duy nhanh và chậm',
    author: 'Daniel Kahneman',
    isbn: '9786043441290',
    category: 'Tâm lý',
    publisher: 'NXB Thế Giới',
    year: 2022,
    totalCopies: 10,
    availableCopies: 7,
    location: 'Kệ B4',
    cover: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=600&auto=format&fit=crop',
    description: 'Một góc nhìn sâu sắc về cách con người ra quyết định trong đời sống.'
  },
  {
    id: 'B004',
    title: 'Nhà giả kim',
    author: 'Paulo Coelho',
    isbn: '9786043441238',
    category: 'Văn học',
    publisher: 'NXB Hội Nhà Văn',
    year: 2020,
    totalCopies: 12,
    availableCopies: 0,
    location: 'Kệ C2',
    cover: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=600&auto=format&fit=crop',
    description: 'Câu chuyện biểu tượng về hành trình theo đuổi ước mơ cá nhân.'
  },
  {
    id: 'B005',
    title: 'Lược sử thời gian',
    author: 'Stephen Hawking',
    isbn: '9786043909714',
    category: 'Khoa học',
    publisher: 'NXB Trẻ',
    year: 2023,
    totalCopies: 7,
    availableCopies: 4,
    location: 'Kệ D1',
    cover: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=600&auto=format&fit=crop',
    description: 'Khám phá vũ trụ học hiện đại qua lối diễn giải gần gũi.'
  },
  {
    id: 'B006',
    title: 'Atomic Habits',
    author: 'James Clear',
    isbn: '9786043927893',
    category: 'Kỹ năng',
    publisher: 'NXB Lao Động',
    year: 2021,
    totalCopies: 9,
    availableCopies: 6,
    location: 'Kệ E3',
    cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=600&auto=format&fit=crop',
    description: 'Hệ thống xây dựng thói quen nhỏ tạo thay đổi lớn và bền vững.'
  }
]

const seedReaders = [
  {
    id: 'R001',
    name: 'Nguyễn Độc Giả',
    email: 'user@thuvien.com',
    phone: '0901 234 567',
    cardId: 'LIB-2026-0001',
    status: 'Hoạt động',
    issueDate: '2026-01-08',
    expireDate: '2027-01-08'
  },
  {
    id: 'R002',
    name: 'Trần Minh Anh',
    email: 'minhanh@example.com',
    phone: '0912 777 888',
    cardId: 'LIB-2026-0018',
    status: 'Hoạt động',
    issueDate: '2026-03-12',
    expireDate: '2027-03-12'
  }
]

const seedBorrows = [
  {
    id: 'BR001',
    readerId: 'R001',
    readerName: 'Nguyễn Độc Giả',
    bookId: 'B001',
    bookTitle: 'Clean Code',
    status: 'borrowing',
    requestDate: '2026-06-10',
    borrowDate: '2026-06-11',
    dueDate: '2026-06-25',
    returnDate: '',
    fine: 0,
    note: 'Mượn tại quầy'
  },
  {
    id: 'BR002',
    readerId: 'R001',
    readerName: 'Nguyễn Độc Giả',
    bookId: 'B003',
    bookTitle: 'Tư duy nhanh và chậm',
    status: 'returned',
    requestDate: '2026-05-18',
    borrowDate: '2026-05-19',
    dueDate: '2026-06-02',
    returnDate: '2026-06-01',
    fine: 0,
    note: 'Đã trả đúng hạn'
  },
  {
    id: 'BR003',
    readerId: 'R002',
    readerName: 'Trần Minh Anh',
    bookId: 'B005',
    bookTitle: 'Lược sử thời gian',
    status: 'overdue',
    requestDate: '2026-05-20',
    borrowDate: '2026-05-21',
    dueDate: '2026-06-04',
    returnDate: '',
    fine: 65000,
    note: 'Cần nhắc trả'
  }
]

export const defaultSettings = {
  maxBorrowDays: 14,
  maxBooksPerReader: 5,
  finePerDay: 5000,
  libraryName: 'Thư viện số'
}

export const ensureLibraryData = () => {
  if (!localStorage.getItem(BOOKS_KEY)) write(BOOKS_KEY, seedBooks)
  if (!localStorage.getItem(READERS_KEY)) write(READERS_KEY, seedReaders)
  if (!localStorage.getItem(BORROWS_KEY)) write(BORROWS_KEY, seedBorrows)
  if (!localStorage.getItem(SETTINGS_KEY)) write(SETTINGS_KEY, defaultSettings)
}

export const getBooks = () => {
  ensureLibraryData()
  return read(BOOKS_KEY, [])
}

export const saveBooks = (books) => write(BOOKS_KEY, books)

export const getReaders = () => {
  ensureLibraryData()
  const readers = read(READERS_KEY, [])
  const registered = read('library_registered_users', [])

  registered.forEach((user) => {
    if (!readers.some((reader) => reader.email === user.email)) {
      readers.unshift({
        id: user.id || `R${Date.now()}`,
        name: user.name || user.fullName,
        email: user.email,
        phone: user.phone || '',
        cardId: user.cardId || user.libraryCard?.cardId || `LIB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        status: user.cardStatus || 'Hoạt động',
        issueDate: user.issueDate || todayIso(),
        expireDate: user.expireDate || addDays(365)
      })
    }
  })

  write(READERS_KEY, readers)
  return readers
}

export const saveReaders = (readers) => write(READERS_KEY, readers)

export const getBorrows = () => {
  ensureLibraryData()
  return read(BORROWS_KEY, [])
}

export const saveBorrows = (borrows) => write(BORROWS_KEY, borrows)

export const getSettings = () => {
  ensureLibraryData()
  return { ...defaultSettings, ...read(SETTINGS_KEY, {}) }
}

export const saveSettings = (settings) => write(SETTINGS_KEY, settings)

export const getCurrentReader = (user) => {
  const readers = getReaders()
  const email = user?.email?.toLowerCase()
  const matched = readers.find((reader) => reader.email?.toLowerCase() === email)

  if (matched) return matched

  const reader = {
    id: user?.id || `R${Date.now()}`,
    name: user?.name || user?.fullName || 'Độc giả',
    email: user?.email || 'reader@example.com',
    phone: user?.phone || '',
    cardId: user?.cardId || `LIB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    status: user?.cardStatus || 'Hoạt động',
    issueDate: user?.issueDate || todayIso(),
    expireDate: user?.expireDate || addDays(365)
  }

  readers.unshift(reader)
  saveReaders(readers)
  return reader
}

export const createBorrowRequest = (reader, book) => {
  const books = getBooks()
  const borrows = getBorrows()
  const settings = getSettings()
  const currentBook = books.find((item) => item.id === book.id)

  if (!currentBook || Number(currentBook.availableCopies) <= 0) {
    throw new Error('Sách hiện không còn bản sẵn sàng để mượn.')
  }

  const activeCount = borrows.filter((item) => {
    return item.readerId === reader.id && ['pending', 'borrowing', 'overdue'].includes(item.status)
  }).length

  if (activeCount >= Number(settings.maxBooksPerReader)) {
    throw new Error(`Bạn đã đạt giới hạn ${settings.maxBooksPerReader} sách đang xử lý.`)
  }

  const request = {
    id: `BR${Date.now()}`,
    readerId: reader.id,
    readerName: reader.name,
    bookId: currentBook.id,
    bookTitle: currentBook.title,
    status: 'pending',
    requestDate: todayIso(),
    borrowDate: '',
    dueDate: '',
    returnDate: '',
    fine: 0,
    note: 'Yêu cầu mượn từ cổng độc giả'
  }

  borrows.unshift(request)
  saveBorrows(borrows)
  return request
}

export const approveBorrow = (borrowId) => {
  const books = getBooks()
  const borrows = getBorrows()
  const settings = getSettings()
  const borrow = borrows.find((item) => item.id === borrowId)
  const book = books.find((item) => item.id === borrow?.bookId)

  if (!borrow || !book || book.availableCopies <= 0) return false

  borrow.status = 'borrowing'
  borrow.borrowDate = todayIso()
  borrow.dueDate = addDays(Number(settings.maxBorrowDays))
  book.availableCopies = Math.max(0, Number(book.availableCopies) - 1)

  saveBooks(books)
  saveBorrows(borrows)
  return true
}

export const returnBorrow = (borrowId) => {
  const books = getBooks()
  const borrows = getBorrows()
  const settings = getSettings()
  const borrow = borrows.find((item) => item.id === borrowId)
  const book = books.find((item) => item.id === borrow?.bookId)

  if (!borrow) return false

  const now = new Date(todayIso())
  const due = borrow.dueDate ? new Date(borrow.dueDate) : now
  const lateDays = Math.max(0, Math.ceil((now - due) / 86400000))

  borrow.status = 'returned'
  borrow.returnDate = todayIso()
  borrow.fine = lateDays * Number(settings.finePerDay)

  if (book) {
    book.availableCopies = Math.min(Number(book.totalCopies), Number(book.availableCopies) + 1)
  }

  saveBooks(books)
  saveBorrows(borrows)
  return true
}

export const rejectBorrow = (borrowId) => {
  const borrows = getBorrows().map((item) => {
    return item.id === borrowId ? { ...item, status: 'rejected', note: 'Đã từ chối yêu cầu' } : item
  })

  saveBorrows(borrows)
}

export const formatMoney = (value) => {
  return `${Number(value || 0).toLocaleString('vi-VN')} đ`
}

export const statusText = (status) => {
  const map = {
    pending: 'Chờ duyệt',
    borrowing: 'Đang mượn',
    overdue: 'Quá hạn',
    returned: 'Đã trả',
    rejected: 'Từ chối'
  }

  return map[status] || 'Không rõ'
}
