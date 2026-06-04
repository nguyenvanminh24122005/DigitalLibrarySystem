<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from "vue";
import api, { checkGatewayConnection, localApi, login as gatewayLogin, onGatewayRouteFallback, onUnauthorized } from "./services/api";

const FINE_PER_DAY = 5000;

const readers = ref([]);
const books = ref([]);
const records = ref([]);
const debts = ref([]);
const overdue = ref([]);
const loading = ref(false);
const saving = ref(false);
const useLocalData = ref(false);
const darkMode = ref(false);
const activeSection = ref("overview");
const selectedRecord = ref(null);
const modal = ref("");
const loginLoading = ref(false);
const authenticated = ref(Boolean(localStorage.getItem("token")));
const authenticatedUsername = ref(localStorage.getItem("username") || "");
const gatewayRouteFallback = ref(false);
const notice = reactive({ type: "", message: "" });
const gateway = reactive({
  url: import.meta.env.VITE_API_GATEWAY_URL,
  status: "checking",
  responseTime: null
});

const today = () => new Date().toISOString().slice(0, 10);

function addDays(value, days) {
  const date = new Date(`${value}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

const filters = reactive({
  keyword: "",
  status: "all",
  readerId: "",
  bookId: "",
  borrowDate: "",
  dueDate: ""
});

const borrowForm = reactive({
  readerCode: "",
  readerName: "",
  bookCode: "",
  bookTitle: "",
  borrowDate: today(),
  dueDate: addDays(today(), 14)
});

const readerForm = reactive({ code: "", name: "", email: "", phone: "" });
const bookForm = reactive({ code: "", title: "", author: "", category: "" });
const loginForm = reactive({ username: "admin", password: "admin123" });

const money = (value) => `${Number(value || 0).toLocaleString("vi-VN")} đ`;
const formatDate = (value) => value ? new Date(`${value}T00:00:00`).toLocaleDateString("vi-VN") : "Chưa có";

function responseData(response) {
  return response.data?.data ?? response.data ?? [];
}

function showNotice(type, message) {
  Object.assign(notice, { type, message });
  window.setTimeout(() => {
    if (notice.message === message) {
      Object.assign(notice, { type: "", message: "" });
    }
  }, 4200);
}

function errorMessage(error, fallback) {
  return error.response?.data?.message || error.message || fallback;
}

function normalizeSearchText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

function normalizeStatus(record) {
  if (record.status === "Đang mượn") return "BORROWED";
  if (record.status === "Đã trả") return "RETURNED";
  return record.status;
}

function isOverdue(record) {
  return normalizeStatus(record) === "BORROWED" && record.dueDate < today();
}

function statusLabel(record) {
  if (isOverdue(record)) return "Quá hạn";
  return normalizeStatus(record) === "RETURNED" ? "Đã trả" : "Đang mượn";
}

function statusClass(record) {
  if (isOverdue(record)) return "badge-danger";
  return normalizeStatus(record) === "RETURNED" ? "badge-success" : "badge-info";
}

function daysLate(dueDate, returnDate = today()) {
  const due = new Date(`${dueDate}T00:00:00`);
  const returned = new Date(`${returnDate}T00:00:00`);
  return Math.max(Math.ceil((returned - due) / 86400000), 0);
}

function dataApi() {
  return useLocalData.value || !authenticated.value ? localApi : api;
}

async function writeWithFallback(action) {
  try {
    return await action(dataApi());
  } catch (error) {
    const canFallback = dataApi() !== localApi && (!error.response || error.response.status >= 500 || error.response.status === 404);
    if (!canFallback) throw error;
    useLocalData.value = true;
    gatewayRouteFallback.value = true;
    return action(localApi);
  }
}

async function writeLocal(action) {
  useLocalData.value = true;
  return action(localApi);
}

async function loadAllData() {
  console.log("loadAllData() clicked/run");
  loading.value = true;
  try {
    const currentApi = dataApi();
    const [readerRes, bookRes, recordRes, debtRes, overdueRes, statsRes] = await Promise.all([
      currentApi.get("/readers"),
      currentApi.get("/books"),
      currentApi.get("/records"),
      currentApi.get("/debts"),
      currentApi.get("/overdue"),
      currentApi.get("/stats")
    ]);
    console.log("GET /api/stats result:", responseData(statsRes));

    const readerRows = responseData(readerRes);
    const bookRows = responseData(bookRes);
    const recordRows = responseData(recordRes);

    readers.value = readerRows.map((reader) => ({ ...reader, code: reader.code || reader.id }));
    books.value = bookRows.map((book) => ({ ...book, code: book.code || book.id }));
    records.value = recordRows.map((record) => ({
      ...record,
      status: normalizeStatus(record),
      readerCode: record.readerCode || readers.value.find((reader) => reader.id === record.readerId)?.code || "",
      readerName: record.readerName || readers.value.find((reader) => reader.id === record.readerId)?.name || "",
      bookCode: record.bookCode || books.value.find((book) => book.id === record.bookId)?.code || "",
      bookTitle: record.bookTitle || books.value.find((book) => book.id === record.bookId)?.title || ""
    }));
    debts.value = responseData(debtRes);
    overdue.value = responseData(overdueRes);
  } catch (error) {
    console.error("Request failed:", error);
    showNotice("danger", errorMessage(error, "Không thể tải dữ liệu. Vui lòng kiểm tra backend."));
  } finally {
    loading.value = false;
  }
}

async function checkGateway() {
  const startedAt = performance.now();
  gateway.status = "checking";

  try {
    const response = await checkGatewayConnection();
    if (!response.data || typeof response.data !== "object") {
      throw new Error("Gateway không trả JSON hợp lệ.");
    }
    gateway.status = "connected";
  } catch (error) {
    console.error("Gateway connection failed:", error);
    gateway.status = "error";
    useLocalData.value = true;
  } finally {
    gateway.responseTime = Math.round(performance.now() - startedAt);
  }
}

async function login() {
  console.log("login() clicked/run");
  loginLoading.value = true;
  try {
    const response = await gatewayLogin(loginForm.username, loginForm.password);
    const token = response.data?.token;
    if (!token) throw new Error("API đăng nhập không trả token.");

    localStorage.setItem("token", token);
    localStorage.setItem("username", response.data.username || loginForm.username);
    authenticated.value = true;
    authenticatedUsername.value = response.data.username || loginForm.username;
    useLocalData.value = false;
    showNotice("success", "Đăng nhập API Gateway thành công.");
    await loadAllData();
  } catch (error) {
    console.error("Request failed:", error);
    useLocalData.value = true;
    authenticated.value = true;
    authenticatedUsername.value = `${loginForm.username} (local)`;
    localStorage.setItem("username", authenticatedUsername.value);
    showNotice("warning", `${errorMessage(error, "Không kết nối được API Gateway.")} Đã chuyển sang backend local.`);
    await loadAllData();
  } finally {
    loginLoading.value = false;
  }
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  authenticated.value = false;
  authenticatedUsername.value = "";
  useLocalData.value = true;
  showNotice("warning", "Đã đăng xuất API Gateway. Frontend đang dùng backend local.");
  loadAllData();
}

async function createReader() {
  console.log("createReader() clicked/run", { ...readerForm });
  saving.value = true;
  try {
    const response = await writeLocal((client) => client.post("/readers", {
      code: readerForm.code,
      name: readerForm.name,
      email: readerForm.email,
      phone: readerForm.phone
    }));
    showNotice("success", response.data?.message || "Đã thêm độc giả.");
    Object.assign(readerForm, { code: "", name: "", email: "", phone: "" });
    closeModal();
    await loadAllData();
  } catch (error) {
    console.error("createReader() failed:", error);
    showNotice("danger", errorMessage(error, "Không thể thêm độc giả."));
  } finally {
    saving.value = false;
  }
}

async function createBook() {
  console.log("createBook() clicked/run", { ...bookForm });
  saving.value = true;
  try {
    const response = await writeLocal((client) => client.post("/books", {
      code: bookForm.code,
      title: bookForm.title,
      author: bookForm.author,
      category: bookForm.category
    }));
    showNotice("success", response.data?.message || "Đã thêm sách.");
    Object.assign(bookForm, { code: "", title: "", author: "", category: "" });
    closeModal();
    await loadAllData();
  } catch (error) {
    console.error("createBook() failed:", error);
    showNotice("danger", errorMessage(error, "Không thể thêm sách."));
  } finally {
    saving.value = false;
  }
}

function openModal(name, record = null) {
  modal.value = name;
  selectedRecord.value = record;
}

function openCreateBorrowModal() {
  console.log("openCreateBorrowModal() clicked/run");
  openModal("borrow");
}

function openReaderModal() {
  console.log("openReaderModal() clicked/run");
  openModal("reader");
}

function openBookModal() {
  console.log("openBookModal() clicked/run");
  openModal("book");
}

function navigate(section) {
  activeSection.value = section;
  if (section === "borrow") {
    openCreateBorrowModal();
    return;
  }
  document.getElementById(section)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function closeModal() {
  modal.value = "";
  selectedRecord.value = null;
}

function fillReaderName() {
  const reader = readers.value.find((item) => String(item.code).toLowerCase() === borrowForm.readerCode.toLowerCase());
  if (reader) borrowForm.readerName = reader.name;
}

function fillBookTitle() {
  const book = books.value.find((item) => String(item.code).toLowerCase() === borrowForm.bookCode.toLowerCase());
  if (book) borrowForm.bookTitle = book.title;
}

async function createBorrowRecord() {
  console.log("createBorrowRecord() clicked/run", { ...borrowForm });
  const existingReader = readers.value.find((item) =>
    String(item.code).toLowerCase() === borrowForm.readerCode.toLowerCase()
  );
  const activeBorrowCount = records.value.filter((record) =>
    existingReader && record.readerId === existingReader.id && normalizeStatus(record) === "BORROWED"
  ).length;
  if (activeBorrowCount >= 5) {
    showNotice("danger", "Độc giả không được mượn quá 5 sách.");
    return;
  }

  saving.value = true;
  try {
    const response = await writeLocal((client) => client.post("/borrow", {
      readerCode: borrowForm.readerCode,
      readerName: borrowForm.readerName,
      bookCode: borrowForm.bookCode,
      bookTitle: borrowForm.bookTitle,
      borrowDate: borrowForm.borrowDate,
      dueDate: borrowForm.dueDate
    }));
    showNotice("success", response.data?.message || "Đã tạo phiếu mượn.");
    Object.assign(borrowForm, {
      readerCode: "",
      readerName: "",
      bookCode: "",
      bookTitle: "",
      borrowDate: today(),
      dueDate: addDays(today(), 14)
    });
    closeModal();
    await loadAllData();
  } catch (error) {
    console.error("createBorrowRecord() failed:", error);
    showNotice("danger", errorMessage(error, "Không thể tạo phiếu mượn."));
  } finally {
    saving.value = false;
  }
  return;
}

async function returnBook(record) {
  console.log("returnBook() clicked/run", record);
  if (!record || normalizeStatus(record) !== "BORROWED") {
    showNotice("danger", "Phiếu mượn không hợp lệ hoặc sách đã được trả.");
    return;
  }

  saving.value = true;
  try {
    const response = await writeLocal((client) => client.put(`/return/${record.id}`, { returnDate: today() }));
    showNotice("success", response.data?.message || "Đã trả sách.");
    closeModal();
    await loadAllData();
  } catch (error) {
    console.error("Request failed:", error);
    showNotice("danger", errorMessage(error, "Không thể trả sách."));
  } finally {
    saving.value = false;
  }
}

async function deleteRecord(record) {
  console.log("deleteRecord() clicked/run", record);
  if (!record?.id) {
    showNotice("danger", "Phiếu mượn không hợp lệ.");
    return;
  }

  const confirmed = window.confirm("Bạn có chắc muốn xóa phiếu mượn này không?");
  if (!confirmed) return;

  saving.value = true;
  try {
    const response = await writeLocal((client) => client.delete(`/records/${record.id}`));
    showNotice("success", response.data?.message || "Đã xóa phiếu mượn.");
    await loadAllData();
  } catch (error) {
    console.error("deleteRecord() failed:", error);
    showNotice("danger", errorMessage(error, "Không thể xóa phiếu mượn."));
  } finally {
    saving.value = false;
  }
}

async function payDebt(readerId) {
  console.log("payDebt() clicked/run", readerId);
  saving.value = true;
  try {
    const response = await writeLocal((client) => client.put(`/debts/${readerId}/pay`));
    showNotice("success", response.data?.message || "Đã thanh toán công nợ.");
    await loadAllData();
  } catch (error) {
    console.error("Request failed:", error);
    showNotice("danger", errorMessage(error, "Không thể thanh toán công nợ."));
  } finally {
    saving.value = false;
  }
}

function clearFilters() {
  Object.assign(filters, {
    keyword: "",
    status: "all",
    readerId: "",
    bookId: "",
    borrowDate: "",
    dueDate: ""
  });
}

const dashboard = computed(() => {
  const borrowed = records.value.filter((record) => normalizeStatus(record) === "BORROWED").length;
  const returned = records.value.filter((record) => normalizeStatus(record) === "RETURNED").length;
  const overdueCount = records.value.filter(isOverdue).length;
  const totalFine = records.value.reduce((sum, record) => sum + Number(record.fine || 0), 0);
  const totalDebt = debts.value
    .filter((debt) => debt.status !== "PAID")
    .reduce((sum, debt) => sum + Number(debt.amount || 0), 0);

  return {
    totalRecords: records.value.length,
    borrowed,
    returned,
    overdue: overdueCount,
    totalFine,
    totalDebt
  };
});

const filteredRecords = computed(() => {
  const keyword = filters.keyword.trim().toLowerCase();

  return records.value.filter((record) => {
    const matchesKeyword = !keyword || [
      record.id,
      record.readerCode,
      record.readerName,
      record.bookCode,
      record.bookTitle
    ].some((value) => String(value || "").toLowerCase().includes(keyword));
    const matchesStatus = filters.status === "all"
      || (filters.status === "BORROWED" && normalizeStatus(record) === "BORROWED" && !isOverdue(record))
      || (filters.status === "RETURNED" && normalizeStatus(record) === "RETURNED")
      || (filters.status === "OVERDUE" && isOverdue(record));
    const selectedReader = readers.value.find((reader) => Number(reader.id) === Number(filters.readerId));
    const matchesReader = !filters.readerId
      || Number(filters.readerId) === Number(record.readerId)
      || (selectedReader?.code && selectedReader.code === record.readerCode);
    const matchesBook = !filters.bookId || Number(filters.bookId) === Number(record.bookId);
    const matchesBorrowDate = !filters.borrowDate || record.borrowDate === filters.borrowDate;
    const matchesDueDate = !filters.dueDate || record.dueDate === filters.dueDate;

    return matchesKeyword && matchesStatus && matchesReader && matchesBook && matchesBorrowDate && matchesDueDate;
  });
});

const debtRows = computed(() => debts.value.filter((debt) => Number(debt.amount || 0) > 0 || debt.status === "UNPAID"));

const selectedDetails = computed(() => {
  if (!selectedRecord.value) return null;
  const lateDays = daysLate(selectedRecord.value.dueDate, selectedRecord.value.returnDate || today());
  const unpaidDebt = debts.value.find((debt) =>
    Number(debt.readerId) === Number(selectedRecord.value.readerId) && debt.status !== "PAID"
  );

  return {
    ...selectedRecord.value,
    lateDays,
    calculatedFine: selectedRecord.value.returnDate ? selectedRecord.value.fine : lateDays * FINE_PER_DAY,
    debtAmount: unpaidDebt?.amount || 0
  };
});

onMounted(async () => {
  await checkGateway();
  await loadAllData();
});

const removeGatewayFallbackListener = onGatewayRouteFallback((active) => {
  gatewayRouteFallback.value = active;
  if (active) useLocalData.value = true;
});

const removeUnauthorizedListener = onUnauthorized(() => {
  localStorage.removeItem("username");
  authenticated.value = false;
  authenticatedUsername.value = "";
  useLocalData.value = true;
  loadAllData();
  showNotice("warning", "Phiên API Gateway không hợp lệ hoặc đã hết hạn. Frontend đã chuyển sang backend local.");
});

onUnmounted(() => {
  removeGatewayFallbackListener();
  removeUnauthorizedListener();
});
</script>

<template>
  <div class="app-shell" :class="{ 'dark-mode': darkMode }">
    <header class="topbar">
      <div class="brand-block">
        <div class="logo-mark">CS</div>
        <div>
          <h1>Circulation Service</h1>
          <p>Hệ thống quản lý mượn trả sách thư viện số</p>
        </div>
      </div>

      <nav class="main-nav" aria-label="Điều hướng chính">
        <button :class="{ active: activeSection === 'overview' }" @click="navigate('overview')">Tổng quan</button>
        <button :class="{ active: activeSection === 'borrow' }" @click="navigate('borrow')">Mượn sách</button>
        <button :class="{ active: activeSection === 'return' }" @click="navigate('return')">Trả sách</button>
        <button :class="{ active: activeSection === 'debt' }" @click="navigate('debt')">Công nợ</button>
      </nav>

      <div class="header-actions">
        <button class="secondary-action" :disabled="loading || saving" @click="openReaderModal">Thêm độc giả</button>
        <button class="secondary-action" :disabled="loading || saving" @click="openBookModal">Thêm sách</button>
        <button class="icon-button" :title="darkMode ? 'Chế độ sáng' : 'Chế độ tối'" @click="darkMode = !darkMode">
          {{ darkMode ? "Sáng" : "Tối" }}
        </button>
        <button class="primary-action" :disabled="loading || saving" @click="openCreateBorrowModal">+ Tạo phiếu mượn</button>
      </div>
    </header>

    <main>
      <div v-if="notice.message" class="toast-alert" :class="`alert-${notice.type}`">{{ notice.message }}</div>

      <section class="hero">
        <div class="hero-copy">
          <span class="eyebrow">Quản lý mượn trả</span>
          <h2>Hệ thống quản lý mượn trả thư viện</h2>
          <p>Theo dõi phiếu mượn, hạn trả, phí phạt quá hạn và công nợ độc giả</p>
          <div class="hero-actions">
            <button class="hero-button" @click="openCreateBorrowModal">Tạo phiếu mượn</button>
            <button class="ghost-button" @click="loadAllData" :disabled="loading">Làm mới dữ liệu</button>
          </div>
        </div>

        <div class="hero-stats" aria-label="Chỉ số nhanh">
          <article>
            <span>Tổng phiếu mượn</span>
            <strong>{{ dashboard.totalRecords }}</strong>
          </article>
          <article>
            <span>Đang mượn</span>
            <strong>{{ dashboard.borrowed }}</strong>
          </article>
          <article>
            <span>Quá hạn</span>
            <strong>{{ dashboard.overdue }}</strong>
          </article>
        </div>
      </section>

      <section class="system-strip">
        <div>
          <strong>API Gateway</strong>
          <span>{{ gateway.status === "connected" ? "Đã kết nối" : gateway.status === "error" ? "Đang dùng backend local" : "Đang kiểm tra" }}</span>
        </div>
        <div>
          <strong>Phản hồi</strong>
          <span>{{ gateway.responseTime === null ? "Chưa xác định" : `${gateway.responseTime} ms` }}</span>
        </div>
        <form class="login-inline" @submit.prevent="login">
          <template v-if="authenticated">
            <span>Đã đăng nhập: {{ authenticatedUsername }}</span>
            <button type="button" @click="logout">Đăng xuất</button>
          </template>
          <template v-else>
            <input v-model="loginForm.username" autocomplete="username" aria-label="Tài khoản" />
            <input v-model="loginForm.password" type="password" autocomplete="current-password" aria-label="Mật khẩu" />
            <button :disabled="loginLoading">{{ loginLoading ? "Đang đăng nhập" : "Đăng nhập" }}</button>
          </template>
        </form>
      </section>

      <div v-if="gatewayRouteFallback" class="soft-warning">
        Gateway chưa cấu hình route Circulation Service hoặc đang lỗi. Frontend đã chuyển sang backend local.
      </div>

      <section class="dashboard-grid" id="overview">
        <article class="metric-card">
          <div class="metric-icon blue">PM</div>
          <span>Tổng phiếu mượn</span>
          <strong>{{ dashboard.totalRecords }}</strong>
        </article>
        <article class="metric-card">
          <div class="metric-icon cyan">MS</div>
          <span>Đang mượn</span>
          <strong>{{ dashboard.borrowed }}</strong>
        </article>
        <article class="metric-card">
          <div class="metric-icon green">TR</div>
          <span>Đã trả</span>
          <strong>{{ dashboard.returned }}</strong>
        </article>
        <article class="metric-card">
          <div class="metric-icon red">QH</div>
          <span>Quá hạn</span>
          <strong>{{ dashboard.overdue }}</strong>
        </article>
        <article class="metric-card">
          <div class="metric-icon amber">PP</div>
          <span>Tổng tiền phạt</span>
          <strong>{{ money(dashboard.totalFine) }}</strong>
        </article>
        <article class="metric-card">
          <div class="metric-icon violet">CN</div>
          <span>Tổng công nợ</span>
          <strong>{{ money(dashboard.totalDebt) }}</strong>
        </article>
      </section>

      <section class="filter-panel">
        <div class="section-heading">
          <div>
            <span>Bộ lọc</span>
            <h2>Tìm phiếu mượn</h2>
          </div>
          <button class="link-button" @click="clearFilters">Xóa bộ lọc</button>
        </div>

        <div class="filter-grid">
          <label>
            <span>Tìm nhanh</span>
            <input v-model="filters.keyword" placeholder="Mã phiếu, tên độc giả, mã sách" />
          </label>
          <label>
            <span>Trạng thái</span>
            <select v-model="filters.status">
              <option value="all">Tất cả</option>
              <option value="BORROWED">Đang mượn</option>
              <option value="RETURNED">Đã trả</option>
              <option value="OVERDUE">Quá hạn</option>
            </select>
          </label>
          <label>
            <span>Độc giả</span>
            <select v-model="filters.readerId">
              <option value="">Tất cả độc giả</option>
              <option v-for="reader in readers" :key="reader.id" :value="reader.id">{{ reader.code }} - {{ reader.name }}</option>
            </select>
          </label>
          <label>
            <span>Sách</span>
            <select v-model="filters.bookId">
              <option value="">Tất cả sách</option>
              <option v-for="book in books" :key="book.id" :value="book.id">{{ book.code }} - {{ book.title }}</option>
            </select>
          </label>
          <label>
            <span>Ngày mượn</span>
            <input v-model="filters.borrowDate" type="date" />
          </label>
          <label>
            <span>Hạn trả</span>
            <input v-model="filters.dueDate" type="date" />
          </label>
        </div>
      </section>

      <section class="records-section" id="return">
        <div class="section-heading">
          <div>
            <span>Danh sách</span>
            <h2>Phiếu mượn</h2>
          </div>
          <p>{{ filteredRecords.length }} phiếu phù hợp</p>
        </div>

        <div v-if="loading" class="loading-line">Đang cập nhật dữ liệu...</div>

        <div class="record-grid">
          <article v-for="record in filteredRecords" :key="record.id" class="record-card">
            <div class="record-card-head">
              <div>
                <span class="record-code">#{{ record.id }}</span>
                <h3>{{ record.readerName }}</h3>
              </div>
              <span class="status-badge" :class="statusClass(record)">{{ statusLabel(record) }}</span>
            </div>

            <div class="book-line">
              <strong>{{ record.bookCode }}</strong>
              <span>{{ record.bookTitle }}</span>
            </div>

            <dl class="record-meta">
              <div>
                <dt>Ngày mượn</dt>
                <dd>{{ formatDate(record.borrowDate) }}</dd>
              </div>
              <div>
                <dt>Hạn trả</dt>
                <dd>{{ formatDate(record.dueDate) }}</dd>
              </div>
              <div>
                <dt>Ngày trả</dt>
                <dd>{{ formatDate(record.returnDate) }}</dd>
              </div>
              <div>
                <dt>Phí phạt</dt>
                <dd>{{ money(record.fine) }}</dd>
              </div>
            </dl>

            <div class="card-actions">
              <button class="secondary-action" @click="openModal('detail', record)">Xem chi tiết</button>
              <button class="secondary-action" :disabled="saving" @click="deleteRecord(record)">Xóa phiếu</button>
              <button
                v-if="normalizeStatus(record) === 'BORROWED'"
                class="success-action"
                :disabled="saving"
                @click="returnBook(record)"
              >
                Trả sách
              </button>
            </div>
          </article>

          <div v-if="filteredRecords.length === 0 && !loading" class="empty-state">
            Chưa có phiếu mượn phù hợp với bộ lọc.
          </div>
        </div>
      </section>

      <section class="debt-section" id="debt">
        <div class="section-heading">
          <div>
            <span>Công nợ</span>
            <h2>Độc giả còn nợ</h2>
          </div>
          <strong>{{ money(dashboard.totalDebt) }}</strong>
        </div>

        <div class="debt-table">
          <div class="debt-row debt-head">
            <span>Độc giả</span>
            <span>Tổng tiền nợ</span>
            <span>Trạng thái thanh toán</span>
            <span>Thao tác</span>
          </div>
          <div v-for="debt in debtRows" :key="debt.id" class="debt-row">
            <span>
              <strong>{{ debt.readerName }}</strong>
              <small>{{ debt.readerCode }}</small>
            </span>
            <span>{{ money(debt.amount) }}</span>
            <span>
              <span class="status-badge" :class="debt.status === 'PAID' ? 'badge-success' : 'badge-warning'">
                {{ debt.status === "PAID" ? "Đã thanh toán" : "Chưa thanh toán" }}
              </span>
            </span>
            <span>
              <button
                v-if="debt.status !== 'PAID'"
                class="success-action compact"
                :disabled="saving"
                @click="payDebt(debt.readerId)"
              >
                Thanh toán công nợ
              </button>
            </span>
          </div>
          <div v-if="debtRows.length === 0" class="empty-state">Không có công nợ cần thanh toán.</div>
        </div>
      </section>
    </main>

    <div v-if="modal === 'reader'" class="modal-backdrop" @click.self="closeModal">
      <section class="app-modal">
        <div class="modal-head">
          <div>
            <span>Quản lý mượn trả</span>
            <h2>Thêm độc giả</h2>
          </div>
          <button class="close-button" @click="closeModal">×</button>
        </div>
        <form class="borrow-form" @submit.prevent="createReader">
          <label>
            <span>Mã độc giả</span>
            <input v-model.trim="readerForm.code" required />
          </label>
          <label>
            <span>Tên độc giả</span>
            <input v-model.trim="readerForm.name" required />
          </label>
          <label>
            <span>Email</span>
            <input v-model.trim="readerForm.email" type="email" required />
          </label>
          <label>
            <span>Số điện thoại</span>
            <input v-model.trim="readerForm.phone" required />
          </label>
          <div class="modal-actions">
            <button type="button" class="secondary-action" @click="closeModal">Đóng</button>
            <button class="primary-action" :disabled="saving">{{ saving ? "Đang thêm..." : "Thêm độc giả" }}</button>
          </div>
        </form>
      </section>
    </div>

    <div v-if="modal === 'book'" class="modal-backdrop" @click.self="closeModal">
      <section class="app-modal">
        <div class="modal-head">
          <div>
            <span>Quản lý mượn trả</span>
            <h2>Thêm sách</h2>
          </div>
          <button class="close-button" @click="closeModal">×</button>
        </div>
        <form class="borrow-form" @submit.prevent="createBook">
          <label>
            <span>Mã sách</span>
            <input v-model.trim="bookForm.code" required />
          </label>
          <label>
            <span>Tên sách</span>
            <input v-model.trim="bookForm.title" required />
          </label>
          <label>
            <span>Tác giả</span>
            <input v-model.trim="bookForm.author" required />
          </label>
          <label>
            <span>Thể loại</span>
            <input v-model.trim="bookForm.category" required />
          </label>
          <div class="modal-actions">
            <button type="button" class="secondary-action" @click="closeModal">Đóng</button>
            <button class="primary-action" :disabled="saving">{{ saving ? "Đang thêm..." : "Thêm sách" }}</button>
          </div>
        </form>
      </section>
    </div>

    <div v-if="modal === 'borrow'" class="modal-backdrop" @click.self="closeModal">
      <section class="app-modal">
        <div class="modal-head">
          <div>
            <span>Tạo mới</span>
            <h2>Tạo phiếu mượn</h2>
          </div>
          <button class="close-button" @click="closeModal">×</button>
        </div>
        <form class="borrow-form" @submit.prevent="createBorrowRecord">
          <label>
            <span>Mã độc giả</span>
            <input v-model.trim="borrowForm.readerCode" list="reader-codes" required @change="fillReaderName" />
          </label>
          <label>
            <span>Tên độc giả</span>
            <input v-model.trim="borrowForm.readerName" list="reader-names" required />
          </label>
          <label>
            <span>Mã sách</span>
            <input v-model.trim="borrowForm.bookCode" list="book-codes" required @change="fillBookTitle" />
          </label>
          <label>
            <span>Tên sách</span>
            <input v-model.trim="borrowForm.bookTitle" list="book-titles" required />
          </label>
          <label>
            <span>Ngày mượn</span>
            <input v-model="borrowForm.borrowDate" type="date" required />
          </label>
          <label>
            <span>Hạn trả</span>
            <input v-model="borrowForm.dueDate" type="date" required />
          </label>

          <datalist id="reader-codes">
            <option v-for="reader in readers" :key="reader.id" :value="reader.code" />
          </datalist>
          <datalist id="reader-names">
            <option v-for="reader in readers" :key="reader.id" :value="reader.name" />
          </datalist>
          <datalist id="book-codes">
            <option v-for="book in books" :key="book.id" :value="book.code" />
          </datalist>
          <datalist id="book-titles">
            <option v-for="book in books" :key="book.id" :value="book.title" />
          </datalist>

          <div class="modal-actions">
            <button type="button" class="secondary-action" @click="closeModal">Đóng</button>
            <button class="primary-action" :disabled="saving">{{ saving ? "Đang tạo..." : "Tạo phiếu" }}</button>
          </div>
        </form>
      </section>
    </div>

    <div v-if="modal === 'detail' && selectedDetails" class="modal-backdrop" @click.self="closeModal">
      <section class="app-modal detail-modal">
        <div class="modal-head">
          <div>
            <span>Chi tiết phiếu mượn</span>
            <h2>#{{ selectedDetails.id }}</h2>
          </div>
          <button class="close-button" @click="closeModal">×</button>
        </div>

        <div class="detail-grid">
          <article>
            <h3>Thông tin độc giả</h3>
            <p>{{ selectedDetails.readerName }}</p>
            <span>{{ selectedDetails.readerCode }}</span>
          </article>
          <article>
            <h3>Thông tin sách</h3>
            <p>{{ selectedDetails.bookTitle }}</p>
            <span>{{ selectedDetails.bookCode }}</span>
          </article>
          <article>
            <h3>Thông tin mượn/trả</h3>
            <p>{{ formatDate(selectedDetails.borrowDate) }} - {{ formatDate(selectedDetails.dueDate) }}</p>
            <span>Ngày trả: {{ formatDate(selectedDetails.returnDate) }}</span>
          </article>
          <article>
            <h3>Số ngày quá hạn</h3>
            <p>{{ selectedDetails.lateDays }} ngày</p>
            <span>{{ statusLabel(selectedDetails) }}</span>
          </article>
          <article>
            <h3>Tiền phạt</h3>
            <p>{{ money(selectedDetails.calculatedFine) }}</p>
            <span>{{ money(FINE_PER_DAY) }} mỗi ngày</span>
          </article>
          <article>
            <h3>Công nợ</h3>
            <p>{{ money(selectedDetails.debtAmount) }}</p>
            <span>Ghi nhận theo độc giả</span>
          </article>
        </div>

        <div class="modal-actions">
          <button class="secondary-action" @click="closeModal">Đóng</button>
          <button
            v-if="normalizeStatus(selectedDetails) === 'BORROWED'"
            class="success-action"
            :disabled="saving"
            @click="returnBook(selectedDetails)"
          >
            Trả sách
          </button>
        </div>
      </section>
    </div>
  </div>
</template>
