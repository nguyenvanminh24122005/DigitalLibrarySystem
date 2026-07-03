import React, { useEffect, useMemo, useState } from 'react'
import './styles.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

function getToken() {
  return (
    localStorage.getItem('user_token') ||
    localStorage.getItem('digilib_token') ||
    localStorage.getItem('token') ||
    localStorage.getItem('auth_token') ||
    ''
  )
}

function getToken() {
  return (
    localStorage.getItem('user_token') ||
    localStorage.getItem('digilib_token') ||
    ''
  )
}

function logout() {
  localStorage.removeItem('user_token')
  localStorage.removeItem('digilib_token')
  localStorage.removeItem('reader_card')
  window.location.reload()
}

async function apiRequest(path, options = {}) {
  const token = getToken()

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  })

  if (res.status === 401) {
    logout()
    throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
  }

  if (!res.ok) {
    let message = `API lỗi ${res.status}`

    try {
      const data = await res.json()
      message = data.message || data.title || data.error || message
    } catch {
      try {
        const text = await res.text()
        if (text) message = text
      } catch {}
    }

    throw new Error(message)
  }

  if (res.status === 204) return null
  return res.json()
}

async function apiRequest(path, options = {}, retry = true) {
  let token = getToken()

  if (!token && path.startsWith('/api/readers')) {
    token = await autoLoginForDemo()
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  })

  if (res.status === 401 && retry && path.startsWith('/api/readers')) {
    localStorage.removeItem('digilib_token')
    const newToken = await autoLoginForDemo()

    return apiRequest(
      path,
      {
        ...options,
        headers: {
          ...(options.headers || {}),
          ...(newToken ? { Authorization: `Bearer ${newToken}` } : {})
        }
      },
      false
    )
  }

  if (!res.ok) {
    let message = `API lỗi ${res.status}`

    try {
      const data = await res.json()
      message = data.message || data.title || data.error || message
    } catch {
      try {
        const text = await res.text()
        if (text) message = text
      } catch {}
    }

    throw new Error(message)
  }

  if (res.status === 204) return null
  return res.json()
}

function toArray(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.value)) return data.value
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.results)) return data.results
  if (Array.isArray(data?.$values)) return data.$values
  return []
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function formatDate(value) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('vi-VN')
}

function daysLeft(value) {
  if (!value) return 0

  const today = new Date()
  const due = new Date(value)

  today.setHours(0, 0, 0, 0)
  due.setHours(0, 0, 0, 0)

  return Math.ceil((due - today) / (1000 * 60 * 60 * 24))
}

function isAvailable(status) {
  const value = normalizeText(status)
  return value.includes('available') || value.includes('co the muon')
}

function isBorrowed(status) {
  return normalizeText(status).includes('borrow')
}

function isReturned(status) {
  return normalizeText(status).includes('return')
}

function normalizeCopy(item = {}) {
  return {
    id: item.id ?? item.Id ?? item.copyId ?? item.CopyId,
    bookId: item.bookId ?? item.BookId,
    bookTitle:
      item.bookTitle ??
      item.BookTitle ??
      item.title ??
      item.Title ??
      item.book?.title ??
      item.Book?.Title ??
      '',
    isbn: item.isbn ?? item.ISBN ?? item.book?.isbn ?? item.Book?.ISBN ?? '',
    coverImage:
      item.coverImage ?? item.CoverImage ?? item.book?.coverImage ?? item.Book?.CoverImage ?? '',
    copyCode: item.copyCode ?? item.CopyCode ?? item.barcode ?? item.Barcode ?? '',
    barcode: item.barcode ?? item.Barcode ?? item.copyCode ?? item.CopyCode ?? '',
    status: item.status ?? item.Status ?? item.borrowStatus ?? item.BorrowStatus ?? 'Available',
    condition: item.condition ?? item.Condition ?? 'Mới',
    location: item.location ?? item.Location ?? item.shelfLocation ?? item.ShelfLocation ?? ''
  }
}

function normalizeBook(item = {}, allCopies = []) {
  const bookId = item.id ?? item.Id
  const copiesInBook = toArray(item.copies ?? item.Copies).map(normalizeCopy)
  const copiesFromApi = allCopies.filter((c) => String(c.bookId) === String(bookId))
  const copies = copiesFromApi.length ? copiesFromApi : copiesInBook
  const availableCopies = copies.filter((c) => isAvailable(c.status)).length

  return {
    id: bookId,
    title: item.title ?? item.Title ?? 'Chưa rõ tên sách',
    isbn: item.isbn ?? item.ISBN ?? item.Isbn ?? '',
    author: item.author ?? item.Author ?? 'Chưa rõ tác giả',
    category: item.category ?? item.Category ?? 'Chưa phân loại',
    publisher: item.publisher ?? item.Publisher ?? 'Chưa rõ NXB',
    publishedYear: item.publishedYear ?? item.PublishedYear ?? '',
    description: item.description ?? item.Description ?? 'Chưa có mô tả cho sách này.',
    coverImage: item.coverImage ?? item.CoverImage ?? '',
    copies,
    availableCopies,
    totalCopies: copies.length,
    rating: item.rating ?? item.Rating ?? 4.6
  }
}

function normalizeReader(item = {}, index = 0) {
  const rawId = item.id ?? item.Id ?? item.readerId ?? item.ReaderId
  const numericId = Number(rawId)

  return {
    id: rawId,
    numericId: Number.isFinite(numericId) && numericId > 0 ? numericId : index + 1,
    fullName: item.fullName ?? item.FullName ?? item.name ?? item.Name ?? 'Chưa rõ tên',
    email: item.email ?? item.Email ?? '',
    phone: item.phone ?? item.Phone ?? '',
    address: item.address ?? item.Address ?? '',
    memberType: item.memberType ?? item.MemberType ?? 'Thành viên',
    readerCode: item.readerCode ?? item.ReaderCode ?? '',
    cardNumber:
      item.cardNumber ??
      item.CardNumber ??
      item.readerCode ??
      item.ReaderCode ??
      `LIB${String(index + 1).padStart(3, '0')}`,
    borrowLimit: item.borrowLimit ?? item.BorrowLimit ?? 5,
    hasValidCard: item.hasValidCard ?? item.HasValidCard ?? true
  }
}

function normalizeRecord(item = {}) {
  return {
    id: item.id ?? item.Id,
    readerId: item.readerId ?? item.ReaderId,
    readerName: item.readerName ?? item.ReaderName ?? '',
    cardNumber: item.cardNumber ?? item.CardNumber ?? '',
    bookId: item.bookId ?? item.BookId,
    bookTitle: item.bookTitle ?? item.BookTitle ?? 'Chưa rõ sách',
    copyCode: item.copyCode ?? item.CopyCode ?? '',
    borrowDate: item.borrowDate ?? item.BorrowDate,
    dueDate: item.dueDate ?? item.DueDate,
    returnDate: item.returnDate ?? item.ReturnDate,
    status: item.status ?? item.Status ?? 'Borrowed',
    fine: item.fine ?? item.Fine ?? 0
  }
}

function BookCover({ book, small = false }) {
  if (book?.coverImage) {
    return (
      <img
        className={small ? 'cover small-cover' : 'cover'}
        src={book.coverImage}
        alt={book.title || book.bookTitle || 'Sách'}
        onError={(e) => {
          e.currentTarget.style.display = 'none'
          const next = e.currentTarget.nextElementSibling
          if (next) next.style.display = 'grid'
        }}
      />
    )
  }

  return (
    <div className={small ? 'fake-cover small-cover' : 'fake-cover'}>
      <span>{String(book?.title || book?.bookTitle || 'Sách').slice(0, 2).toUpperCase()}</span>
    </div>
  )
}

function App() {
  const [page, setPage] = useState('home')
  const [books, setBooks] = useState([])
  const [copies, setCopies] = useState([])
  const [readers, setReaders] = useState([])
  const [records, setRecords] = useState([])

  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Tất cả')
  const [selectedBook, setSelectedBook] = useState(null)

  const [readerCard, setReaderCard] = useState(localStorage.getItem('reader_card') || 'CARD-DG20260001')
  const [cardInput, setCardInput] = useState(localStorage.getItem('reader_card') || 'CARD-DG20260001')

  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const [booksRes, copiesRes, readersRes, recordsRes] = await Promise.allSettled([
        apiRequest('/api/books'),
        apiRequest('/api/copies'),
        apiRequest('/api/readers'),
        apiRequest('/api/borrow-records')
      ])

      const copyList =
        copiesRes.status === 'fulfilled' ? toArray(copiesRes.value).map(normalizeCopy) : []

      const bookList =
        booksRes.status === 'fulfilled'
          ? toArray(booksRes.value).map((b) => normalizeBook(b, copyList))
          : []

      const readerList =
        readersRes.status === 'fulfilled'
          ? toArray(readersRes.value).map((r, i) => normalizeReader(r, i))
          : []

      const recordList =
        recordsRes.status === 'fulfilled'
          ? toArray(recordsRes.value).map(normalizeRecord)
          : []

      setCopies(copyList)
      setBooks(bookList)
      setReaders(readerList)
      setRecords(recordList)

      const failed = [booksRes, copiesRes, readersRes, recordsRes].filter(
        (x) => x.status === 'rejected'
      )

      if (failed.length) {
        setError('Một số API chưa tải được. Kiểm tra Gateway hoặc token đăng nhập.')
      }
    } catch (e) {
      setError(e.message || 'Không tải được dữ liệu từ API.')
    } finally {
      setLoading(false)
    }
  }

  function saveReaderCard() {
    const value = cardInput.trim()

    if (!value) {
      setError('Bạn cần nhập mã thẻ độc giả.')
      return
    }

    localStorage.setItem('reader_card', value)
    setReaderCard(value)
    setError('')
    setSuccess(`Đã chọn mã thẻ: ${value}`)
  }

  const selectedReader = useMemo(() => {
    const key = normalizeText(readerCard)

    if (!key) return null

    return (
      readers.find((r) =>
        [r.cardNumber, r.readerCode, r.fullName, r.email, r.phone, r.id].some((x) =>
          normalizeText(x).includes(key)
        )
      ) || null
    )
  }, [readers, readerCard])

  const myRecords = useMemo(() => {
    const key = normalizeText(readerCard)

    if (!key) return []

    return records.filter((r) =>
      [r.cardNumber, r.readerName, r.readerId].some((x) => normalizeText(x).includes(key))
    )
  }, [records, readerCard])

  const borrowing = useMemo(() => myRecords.filter((r) => isBorrowed(r.status)), [myRecords])
  const history = useMemo(() => myRecords.filter((r) => isReturned(r.status) || r.returnDate), [myRecords])

  const categories = useMemo(() => {
    return ['Tất cả', ...new Set(books.map((b) => b.category).filter(Boolean))]
  }, [books])

  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      const q = normalizeText(query)
      const matchQuery =
        !q ||
        [b.title, b.author, b.isbn, b.category, b.publisher].some((x) =>
          normalizeText(x).includes(q)
        )

      const matchCategory = category === 'Tất cả' || b.category === category

      return matchQuery && matchCategory
    })
  }, [books, query, category])

  const notifications = useMemo(() => {
    const list = []

    borrowing.forEach((r) => {
      const left = daysLeft(r.dueDate)

      if (left < 0) {
        list.push({
          icon: '⚠️',
          title: `Sách “${r.bookTitle}” đã quá hạn`,
          text: `Bạn đã quá hạn ${Math.abs(left)} ngày. Vui lòng liên hệ thủ thư để xử lý.`
        })
      } else if (left <= 3) {
        list.push({
          icon: '🔔',
          title: `Sách “${r.bookTitle}” sắp đến hạn trả`,
          text: `Còn ${left} ngày nữa đến hạn trả sách. Hạn trả: ${formatDate(r.dueDate)}.`
        })
      }
    })

    return list
  }, [borrowing])

  const stats = {
    readers: readers.length,
    books: books.length,
    copies: copies.length,
    borrowing: borrowing.length,
    overdue: borrowing.filter((r) => daysLeft(r.dueDate) < 0).length,
    history: history.length,
    notify: notifications.length,
    records: records.length
  }

  const readerName = selectedReader?.fullName || 'Độc giả'
  const readerCode = selectedReader?.cardNumber || readerCard || 'Chưa chọn mã thẻ'

  function go(target) {
    setPage(target)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function findAvailableCopy(book) {
    return copies.find(
      (c) => String(c.bookId) === String(book.id) && isAvailable(c.status) && c.copyCode
    )
  }

  async function borrowBook(book) {
    setError('')
    setSuccess('')

    if (!readerCard) {
      setError('Bạn cần nhập mã thẻ độc giả trước khi mượn sách.')
      setPage('profile')
      return
    }

    if (!selectedReader) {
      setError('Không tìm thấy độc giả theo mã thẻ này trong /api/readers.')
      setPage('profile')
      return
    }

    const copy = findAvailableCopy(book)

    if (!copy) {
      setError('Sách này hiện không còn bản sao Available để mượn.')
      return
    }

    const ok = window.confirm(`Xác nhận mượn sách "${book.title}" với mã bản sao ${copy.copyCode}?`)
    if (!ok) return

    setActionLoading(true)

    try {
      await apiRequest('/api/borrow-records', {
        method: 'POST',
        body: JSON.stringify({
          readerId: Number(selectedReader.numericId || selectedReader.id || 1),
          readerName: selectedReader.fullName,
          cardNumber: selectedReader.cardNumber,
          copyCode: copy.copyCode,
          bookId: Number(book.id),
          bookTitle: book.title,
          borrowDate: new Date().toISOString()
        })
      })

      setSuccess(`Đã mượn sách "${book.title}" thành công.`)
      setSelectedBook(null)
      await loadData()
      setPage('borrowing')
    } catch (e) {
      setError(e.message || 'Không mượn được sách.')
    } finally {
      setActionLoading(false)
    }
  }

  async function renewRecord(record) {
    setError('')
    setSuccess('')

    if (!record?.id) return

    if (daysLeft(record.dueDate) < 0) {
      setError('Phiếu đã quá hạn, không thể gia hạn.')
      return
    }

    const ok = window.confirm(`Gia hạn thêm 7 ngày cho sách "${record.bookTitle}"?`)
    if (!ok) return

    setActionLoading(true)

    try {
      await apiRequest(`/api/borrow-records/${record.id}/renew`, {
        method: 'POST',
        body: JSON.stringify({
          days: 7,
          note: 'Độc giả yêu cầu gia hạn'
        })
      })

      setSuccess(`Đã gia hạn sách "${record.bookTitle}" thêm 7 ngày.`)
      await loadData()
    } catch (e) {
      setError(e.message || 'Không gia hạn được.')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="site-header">
        <div className="header-inner">
          <div className="brand" onClick={() => go('home')}>
            <div className="logo-icon">📖</div>
            <div>
              <strong>Thư viện số</strong>
              <span>Digital Library</span>
            </div>
          </div>

          <nav className="main-nav">
            <button className={page === 'home' ? 'active' : ''} onClick={() => go('home')}>
              Trang chủ
            </button>
            <button className={page === 'search' ? 'active' : ''} onClick={() => go('search')}>
              Tra cứu sách
            </button>
            <button className={page === 'borrowing' ? 'active' : ''} onClick={() => go('borrowing')}>
              Sách đang mượn
            </button>
            <button className={page === 'history' ? 'active' : ''} onClick={() => go('history')}>
              Lịch sử mượn
            </button>
            <button className={page === 'profile' ? 'active' : ''} onClick={() => go('profile')}>
              Hồ sơ
            </button>
            <button className={page === 'notification' ? 'active' : ''} onClick={() => go('notification')}>
              Thông báo
            </button>
          </nav>

          <div className="header-actions">
            <button className="small-icon" onClick={loadData}>↻</button>
            <button className="login-btn" onClick={() => go('profile')}>Độc giả</button>
            <button className="signup-btn" onClick={() => go('profile')}>{readerName}</button>
          </div>
        </div>
      </header>

      <main>
        {page === 'home' && (
          <>
            <section className="hero-section">
              <div className="hero-left">
                <div className="welcome-pill">Chào mừng đến với Thư viện số</div>

                <h1>
                  Tri thức không giới hạn
                  <br />
                  trong <span>tầm tay bạn</span>
                </h1>

                <p>
                  Thư viện số cung cấp nguồn tài liệu, sách điện tử, luận văn, báo cáo và
                  nhiều nguồn học liệu giá trị khác.
                </p>

                <div className="hero-search">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setPage('search')}
                    placeholder="Tìm kiếm tài liệu, sách, tác giả..."
                  />
                  <button onClick={() => go('search')}>🔍</button>
                </div>

                <div className="hero-buttons">
                  <button className="primary-btn" onClick={() => go('search')}>
                    Khám phá ngay 📖
                  </button>
                  <button className="outline-btn" onClick={() => go('borrowing')}>
                    Sách của tôi ⓘ
                  </button>
                </div>

                <div className="hero-stats">
                  <div>
                    <b>{stats.books}+</b>
                    <span>Tài liệu</span>
                  </div>
                  <div>
                    <b>{stats.readers}+</b>
                    <span>Độc giả</span>
                  </div>
                  <div>
                    <b>{stats.records}+</b>
                    <span>Lượt mượn</span>
                  </div>
                </div>
              </div>

              <div className="hero-right">
                <div className="floating-icon book">📘</div>
                <div className="floating-icon cap">🎓</div>
                <div className="floating-icon list">📄</div>

                <div className="laptop">
                  <div className="laptop-screen">
                    <div className="screen-bar"></div>
                    <div className="screen-grid">
                      <span></span>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                  <div className="laptop-base"></div>
                </div>

                <div className="book-stack-art">📚</div>
                <div className="plant-art">🪴</div>
              </div>
            </section>

            <section className="feature-section">
              <div className="section-kicker">TÍNH NĂNG NỔI BẬT</div>
              <h2>Hệ thống hiện đại - Trải nghiệm thông minh</h2>
              <p>Được thiết kế để giúp bạn tìm kiếm, quản lý và khai thác tri thức một cách dễ dàng nhất.</p>

              <div className="feature-grid">
                <Feature icon="📖" title="Kho tài liệu phong phú" text="Hàng ngàn sách, tài liệu thuộc nhiều lĩnh vực khác nhau." />
                <Feature icon="💳" title="Quản lý thẻ thư viện" text="Tra cứu hồ sơ, mã thẻ và thông tin độc giả." />
                <Feature icon="🔁" title="Mượn - Trả linh hoạt" text="Theo dõi sách đang mượn, lịch sử và gia hạn trực tuyến." />
                <Feature icon="📊" title="Báo cáo & Thống kê" text="Theo dõi tình trạng sách, lượt mượn và dữ liệu thư viện." />
              </div>
            </section>

            <section className="blue-stats">
              <div className="section-kicker light">THỐNG KÊ ẤN TƯỢNG</div>
              <h2>Những con số biết nói</h2>
              <p>Cùng nhìn lại hành trình phát triển của thư viện số.</p>

              <div className="blue-grid">
                <div>
                  <span>👥</span>
                  <b>{stats.readers}+</b>
                  <p>Độc giả đăng ký</p>
                </div>
                <div>
                  <span>📚</span>
                  <b>{stats.books}+</b>
                  <p>Tài liệu số</p>
                </div>
                <div>
                  <span>↔️</span>
                  <b>{stats.records}+</b>
                  <p>Lượt mượn</p>
                </div>
                <div>
                  <span>👁️</span>
                  <b>{stats.copies}+</b>
                  <p>Bản sao sách</p>
                </div>
              </div>
            </section>

            <section className="home-books-section">
  <div className="showcase-head">
    <div>
      <div className="section-kicker">SÁCH NỔI BẬT</div>
      <h2>Sách nổi bật trong thư viện</h2>
      <p>Những đầu sách đang có trong hệ thống và có thể tra cứu trực tiếp.</p>
    </div>

    <button onClick={() => go('search')}>Xem tất cả</button>
  </div>

  <div className="featured-book-grid">
    {books.slice(0, 4).map((book) => (
      <FeaturedBookCard key={book.id} book={book} onSelect={setSelectedBook} />
    ))}
  </div>

  {!books.length && <div className="empty">Chưa có sách trong API /api/books.</div>}
</section>

<section className="home-books-section">
  <div className="showcase-head">
    <div>
      <div className="section-kicker">DANH SÁCH SÁCH</div>
      <h2>Danh sách sách trong thư viện</h2>
      <p>Hiển thị dữ liệu thật từ Catalog Service.</p>
    </div>

    <button onClick={() => go('search')}>Tra cứu sách</button>
  </div>

  <div className="library-book-grid">
    {books.map((book) => (
      <BookCard key={book.id} book={book} onSelect={setSelectedBook} />
    ))}
  </div>

  {!books.length && <div className="empty">Chưa có sách trong thư viện.</div>}
</section>

            <section className="review-section">
              <div className="section-kicker">ĐÁNH GIÁ ĐỘC GIẢ</div>
              <h2>Khách hàng nói gì về chúng tôi</h2>

              <div className="review-grid">
                <Review name="Nguyễn Thị Lan" role="Sinh viên" text="Thư viện số giúp mình tìm được rất nhiều tài liệu học tập chất lượng." />
                <Review name="Trần Minh Quân" role="Giảng viên" text="Nguồn tài liệu phong phú, cập nhật thường xuyên, rất thuận tiện." />
                <Review name="Phạm Thu Hà" role="Nghiên cứu sinh" text="Giao diện dễ dùng, phù hợp cho việc tra cứu và quản lý sách." />
              </div>
            </section>

            <section className="cta-section">
              <div>📖</div>
              <h2>Bắt đầu hành trình khám phá tri thức ngay hôm nay!</h2>
              <p>Đăng ký tài khoản để trải nghiệm tất cả tính năng của thư viện số.</p>
              <button onClick={() => go('profile')}>Hồ sơ độc giả</button>
            </section>
          </>
        )}

        {page === 'search' && (
          <PagePanel title="Tra cứu sách" subtitle="Tìm kiếm sách theo tên, tác giả, ISBN hoặc thể loại.">
            <div className="filter-box">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nhập tên sách, tác giả, ISBN..."
              />

              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>

              <button>Tìm kiếm</button>
            </div>

            <div className="chip-row">
              {categories.map((c) => (
                <button
                  key={c}
                  className={category === c ? 'chip active' : 'chip'}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="book-grid">
              {filteredBooks.map((book) => (
                <BookCard key={book.id} book={book} onSelect={setSelectedBook} />
              ))}
            </div>

            {!filteredBooks.length && <div className="empty">Không có sách phù hợp.</div>}
          </PagePanel>
        )}

        {page === 'borrowing' && (
          <PagePanel title="Sách đang mượn" subtitle="Theo dõi sách đang mượn và hạn trả của bạn.">
            <BorrowingList records={borrowing} actionLoading={actionLoading} onRenew={renewRecord} />
          </PagePanel>
        )}

        {page === 'history' && (
          <PagePanel title="Lịch sử mượn trả" subtitle="Danh sách sách đã trả và lịch sử sử dụng thư viện.">
            <div className="table-card">
              <table>
                <thead>
                  <tr>
                    <th>Sách</th>
                    <th>Mã bản sao</th>
                    <th>Ngày mượn</th>
                    <th>Ngày trả</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>

                <tbody>
                  {history.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <b>{item.bookTitle}</b>
                        <span>Phiếu #{item.id}</span>
                      </td>
                      <td>{item.copyCode || '-'}</td>
                      <td>{formatDate(item.borrowDate)}</td>
                      <td>{formatDate(item.returnDate)}</td>
                      <td>
                        <span className="status success">Đã trả</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!history.length && <div className="empty">Chưa có lịch sử mượn trả.</div>}
          </PagePanel>
        )}

        {page === 'profile' && (
          <PagePanel title="Hồ sơ độc giả" subtitle="Nhập mã thẻ để lọc dữ liệu mượn trả theo độc giả.">
            <div className="card-input">
              <input
                value={cardInput}
                onChange={(e) => setCardInput(e.target.value)}
                placeholder="Ví dụ CARD-DG20260001"
              />
              <button onClick={saveReaderCard}>Lưu mã thẻ</button>
            </div>

            <div className="profile-grid">
              <div className="profile-card">
                <div className="profile-avatar">{readerName.charAt(0).toUpperCase()}</div>
                <h2>{readerName}</h2>
                <p>{selectedReader?.memberType || 'Thành viên'}</p>
                <div className="profile-code">{readerCode}</div>
              </div>

              <InfoCard
                title="Thông tin cá nhân"
                rows={[
                  ['Email', selectedReader?.email || '-'],
                  ['Số điện thoại', selectedReader?.phone || '-'],
                  ['Địa chỉ', selectedReader?.address || '-'],
                  ['Loại thành viên', selectedReader?.memberType || '-']
                ]}
              />

              <InfoCard
                title="Thống kê"
                rows={[
                  ['Sách đang mượn', stats.borrowing],
                  ['Lịch sử mượn', stats.history],
                  ['Sách quá hạn', stats.overdue],
                  ['Thông báo', stats.notify]
                ]}
              />
            </div>
          </PagePanel>
        )}

        {page === 'notification' && (
          <PagePanel title="Thông báo" subtitle="Thông báo được sinh từ dữ liệu mượn trả thật.">
            <div className="notification-list">
              {notifications.map((item, index) => (
                <div className="notification-card" key={index}>
                  <div>{item.icon}</div>
                  <section>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </section>
                </div>
              ))}
            </div>

            {!notifications.length && <div className="empty">Hiện chưa có thông báo.</div>}
          </PagePanel>
        )}

        {error && <div className="toast error">{error}</div>}
        {success && <div className="toast success">{success}</div>}
        {loading && <div className="toast">Đang tải dữ liệu...</div>}
      </main>

      {selectedBook && (
        <div className="modal-backdrop" onClick={() => setSelectedBook(null)}>
          <div className="book-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedBook(null)}>×</button>
            <BookCover book={selectedBook} />

            <div className="modal-info">
              <h2>{selectedBook.title}</h2>
              <p>{selectedBook.author}</p>

              <div className="modal-meta">
                <span>{selectedBook.category}</span>
                <span>{selectedBook.publisher}</span>
                <span>{selectedBook.publishedYear}</span>
                <span>ISBN: {selectedBook.isbn}</span>
              </div>

              <p className="book-desc">{selectedBook.description}</p>

              <div className="available-box">
                <span>Còn {selectedBook.availableCopies}/{selectedBook.totalCopies} bản</span>
                <button
                  disabled={actionLoading || selectedBook.availableCopies <= 0}
                  onClick={() => borrowBook(selectedBook)}
                >
                  {selectedBook.availableCopies > 0 ? 'Mượn sách' : 'Hết bản'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="site-footer">
        <div>
          <h3>📖 Thư viện số</h3>
          <p>Nền tảng thư viện hiện đại, cung cấp nguồn tài liệu phong phú và trải nghiệm thông minh.</p>
        </div>

        <div>
          <h4>Thư viện</h4>
          <p>Tài liệu</p>
          <p>Thể loại</p>
          <p>Thẻ thư viện</p>
          <p>Hướng dẫn mượn trả</p>
        </div>

        <div>
          <h4>Hỗ trợ</h4>
          <p>Câu hỏi thường gặp</p>
          <p>Hướng dẫn sử dụng</p>
          <p>Chính sách bảo mật</p>
          <p>Điều khoản sử dụng</p>
        </div>

        <div>
          <h4>Liên hệ</h4>
          <p>123 Đường Tri Thức, TP. Hồ Chí Minh</p>
          <p>(028) 1234 5678</p>
          <p>support@thuvien.so</p>
        </div>
      </footer>
    </div>
  )
}

function Feature({ icon, title, text }) {
  return (
    <div className="feature-card">
      <div>{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  )
}

function BookShowcase({ title, books, onSelect, onViewAll }) {
  return (
    <section className="book-showcase">
      <div className="showcase-head">
        <div>
          <div className="section-kicker">TÀI LIỆU NỔI BẬT</div>
          <h2>{title}</h2>
        </div>
        <button onClick={onViewAll}>Xem tất cả</button>
      </div>

      <div className="book-row">
        {books.map((book) => (
          <BookCard key={book.id} book={book} onSelect={onSelect} />
        ))}
      </div>

      {!books.length && <div className="empty">Chưa có sách trong API.</div>}
    </section>
  )
}

function BookCard({ book, onSelect }) {
  return (
    <article className="book-card" onClick={() => onSelect(book)}>
      <BookCover book={book} />
      <h3>{book.title}</h3>
      <p>{book.author}</p>
      <div className="book-meta">
        <span>⭐ {book.rating}</span>
        <small>{book.availableCopies} bản có sẵn</small>
      </div>
    </article>
  )
}

function FeaturedBookCard({ book, onSelect }) {
  return (
    <article className="featured-book-card" onClick={() => onSelect(book)}>
      <div className="featured-cover">
        <BookCover book={book} />
      </div>

      <div className="featured-info">
        <span className="featured-badge">Nổi bật</span>
        <h3>{book.title}</h3>
        <p>{book.description}</p>

        <div className="featured-meta">
          <span>👤 {book.author}</span>
          <span>🏷️ {book.category}</span>
          <span>📚 Còn {book.availableCopies}/{book.totalCopies} bản</span>
        </div>

        <button type="button">Xem chi tiết</button>
      </div>
    </article>
  )
}

function Review({ name, role, text }) {
  return (
    <div className="review-card">
      <div className="stars">★★★★★</div>
      <h3>{name}</h3>
      <span>{role}</span>
      <p>{text}</p>
    </div>
  )
}

function PagePanel({ title, subtitle, children }) {
  return (
    <section className="page-panel">
      <div className="page-title">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {children}
    </section>
  )
}

function BorrowingList({ records, actionLoading, onRenew }) {
  if (!records.length) return <div className="empty">Không có sách đang mượn.</div>

  return (
    <div className="borrow-list">
      {records.map((item) => {
        const left = daysLeft(item.dueDate)

        return (
          <div className="borrow-item" key={item.id}>
            <BookCover book={{ title: item.bookTitle }} small />
            <div>
              <h3>{item.bookTitle}</h3>
              <p>Mã bản sao: {item.copyCode || '-'}</p>
              <span>Phiếu #{item.id}</span>
            </div>
            <div>
              <span>Ngày mượn</span>
              <b>{formatDate(item.borrowDate)}</b>
            </div>
            <div>
              <span>Hạn trả</span>
              <b>{formatDate(item.dueDate)}</b>
            </div>
            <div>
              <strong className={left < 0 ? 'status danger' : 'status success'}>
                {left < 0 ? `Quá hạn ${Math.abs(left)} ngày` : `Còn ${left} ngày`}
              </strong>
              <button disabled={actionLoading || left < 0} onClick={() => onRenew(item)}>
                Gia hạn 7 ngày
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function InfoCard({ title, rows }) {
  return (
    <div className="info-card">
      <h3>{title}</h3>
      {rows.map(([label, value]) => (
        <div className="info-row" key={label}>
          <span>{label}</span>
          <b>{value}</b>
        </div>
      ))}
    </div>
  )
}

export default App