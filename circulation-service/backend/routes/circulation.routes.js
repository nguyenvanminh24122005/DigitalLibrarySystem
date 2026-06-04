import { Router } from "express";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const router = Router();
const FINE_PER_DAY = 5000;
const dataFile = (name) => fileURLToPath(new URL(`../data/${name}.json`, import.meta.url));

function readData(name) {
  return JSON.parse(readFileSync(dataFile(name), "utf8"));
}

function writeData(name, value) {
  writeFileSync(dataFile(name), `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function nextId(rows) {
  return rows.reduce((max, row) => Math.max(max, Number(row.id) || 0), 0) + 1;
}

function requiredFields(body, fields) {
  return fields.filter((field) => !String(body[field] || "").trim());
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function daysLate(dueDate, returnDate) {
  const due = new Date(`${dueDate}T00:00:00`);
  const returned = new Date(`${returnDate}T00:00:00`);
  return Math.max(Math.ceil((returned - due) / 86400000), 0);
}

function createRecordView(record, readers, books) {
  const reader = readers.find((item) => item.id === record.readerId);
  const book = books.find((item) => item.id === record.bookId);

  return {
    ...record,
    readerCode: reader?.code || "",
    readerName: reader?.name || "",
    bookCode: book?.code || "",
    bookTitle: book?.title || ""
  };
}

function getRecordViews() {
  const readers = readData("readers");
  const books = readData("books");
  return readData("borrowRecords").map((record) => createRecordView(record, readers, books));
}

function normalizeCode(value) {
  return String(value || "").trim().toUpperCase();
}

router.get("/readers", (req, res) => {
  res.json({ status: "success", data: readData("readers") });
});

router.post("/readers", (req, res) => {
  const missing = requiredFields(req.body, ["code", "name", "email", "phone"]);
  if (missing.length > 0) {
    return res.status(400).json({ status: "error", message: `Thieu thong tin: ${missing.join(", ")}` });
  }

  const readers = readData("readers");
  const code = normalizeCode(req.body.code);
  if (readers.some((reader) => reader.code === code)) {
    return res.status(409).json({ status: "error", message: "Ma doc gia da ton tai." });
  }

  const reader = {
    id: nextId(readers),
    code,
    name: String(req.body.name).trim(),
    email: String(req.body.email).trim(),
    phone: String(req.body.phone).trim()
  };

  readers.push(reader);
  writeData("readers", readers);
  res.status(201).json({ status: "success", message: "Da them doc gia.", data: reader });
});

router.get("/books", (req, res) => {
  res.json({ status: "success", data: readData("books") });
});

router.post("/books", (req, res) => {
  const missing = requiredFields(req.body, ["code", "title", "author", "category"]);
  if (missing.length > 0) {
    return res.status(400).json({ status: "error", message: `Thieu thong tin: ${missing.join(", ")}` });
  }

  const books = readData("books");
  const code = normalizeCode(req.body.code);
  if (books.some((book) => book.code === code)) {
    return res.status(409).json({ status: "error", message: "Ma sach da ton tai." });
  }

  const book = {
    id: nextId(books),
    code,
    title: String(req.body.title).trim(),
    author: String(req.body.author).trim(),
    category: String(req.body.category).trim(),
    status: "AVAILABLE"
  };

  books.push(book);
  writeData("books", books);
  res.status(201).json({ status: "success", message: "Da them sach.", data: book });
});

router.post("/borrow", (req, res) => {
  const inlinePayload = req.body.readerCode || req.body.readerName || req.body.bookCode || req.body.bookTitle;
  const missing = inlinePayload
    ? requiredFields(req.body, ["readerCode", "readerName", "bookCode", "bookTitle", "borrowDate", "dueDate"])
    : requiredFields(req.body, ["readerId", "bookId", "borrowDate", "dueDate"]);

  if (missing.length > 0) {
    return res.status(400).json({ status: "error", message: `Thieu thong tin: ${missing.join(", ")}` });
  }

  const readers = readData("readers");
  const books = readData("books");
  const records = readData("borrowRecords");
  let reader = readers.find((item) => item.id === Number(req.body.readerId));
  let book = books.find((item) => item.id === Number(req.body.bookId));

  if (inlinePayload) {
    const readerCode = normalizeCode(req.body.readerCode);
    const bookCode = normalizeCode(req.body.bookCode);

    reader = readers.find((item) => item.code === readerCode);
    if (!reader) {
      reader = {
        id: nextId(readers),
        code: readerCode,
        name: String(req.body.readerName).trim(),
        email: String(req.body.readerEmail || `${readerCode.toLowerCase()}@local.library`).trim(),
        phone: String(req.body.readerPhone || "Chua cap nhat").trim()
      };
      readers.push(reader);
    }

    book = books.find((item) => item.code === bookCode);
    if (!book) {
      book = {
        id: nextId(books),
        code: bookCode,
        title: String(req.body.bookTitle).trim(),
        author: String(req.body.bookAuthor || "Chua cap nhat").trim(),
        category: String(req.body.bookCategory || "Chua phan loai").trim(),
        status: "AVAILABLE"
      };
      books.push(book);
    }
  }

  if (!reader) {
    return res.status(404).json({ status: "error", message: "Khong tim thay doc gia." });
  }

  if (!book) {
    return res.status(404).json({ status: "error", message: "Khong tim thay sach." });
  }

  if (book.status !== "AVAILABLE") {
    return res.status(409).json({ status: "error", message: "Sach dang duoc muon." });
  }

  const activeBorrowCount = records.filter((record) =>
    record.readerId === reader.id && record.status === "BORROWED"
  ).length;
  if (activeBorrowCount >= 5) {
    return res.status(409).json({ status: "error", message: "Doc gia khong duoc muon qua 5 sach." });
  }

  const record = {
    id: nextId(records),
    readerId: reader.id,
    bookId: book.id,
    borrowDate: String(req.body.borrowDate),
    dueDate: String(req.body.dueDate),
    returnDate: null,
    status: "BORROWED",
    fine: 0
  };

  book.status = "BORROWED";
  records.push(record);
  writeData("readers", readers);
  writeData("books", books);
  writeData("borrowRecords", records);
  res.status(201).json({
    status: "success",
    message: "Da tao phieu muon.",
    data: createRecordView(record, readers, books)
  });
});

router.put("/return/:id", (req, res) => {
  const records = readData("borrowRecords");
  const books = readData("books");
  const readers = readData("readers");
  const debts = readData("debts");
  const record = records.find((item) => item.id === Number(req.params.id));

  if (!record) {
    return res.status(404).json({ status: "error", message: "Khong tim thay phieu muon." });
  }

  if (record.status === "RETURNED") {
    return res.status(409).json({ status: "error", message: "Sach trong phieu nay da duoc tra." });
  }

  const returnDate = String(req.body.returnDate || today());
  const lateDays = daysLate(record.dueDate, returnDate);
  const fine = lateDays * FINE_PER_DAY;
  const book = books.find((item) => item.id === record.bookId);

  record.returnDate = returnDate;
  record.status = "RETURNED";
  record.fine = fine;

  if (book) {
    book.status = "AVAILABLE";
  }

  if (fine > 0) {
    const debt = debts.find((item) => item.readerId === record.readerId && item.status === "UNPAID");
    if (debt) {
      debt.amount += fine;
      debt.updatedAt = today();
    } else {
      debts.push({
        id: nextId(debts),
        readerId: record.readerId,
        amount: fine,
        status: "UNPAID",
        updatedAt: today()
      });
    }
  }

  writeData("borrowRecords", records);
  writeData("books", books);
  writeData("debts", debts);
  res.json({
    status: "success",
    message: lateDays > 0
      ? `Da tra sach. Qua han ${lateDays} ngay, phi phat ${fine.toLocaleString("vi-VN")} dong.`
      : "Da tra sach dung han.",
    data: createRecordView(record, readers, books)
  });
});

router.get("/records", (req, res) => {
  res.json({ status: "success", data: getRecordViews() });
});

router.delete("/records/:id", (req, res) => {
  const records = readData("borrowRecords");
  const books = readData("books");
  const readers = readData("readers");
  const recordIndex = records.findIndex((item) => item.id === Number(req.params.id));

  if (recordIndex === -1) {
    return res.status(404).json({ status: "error", message: "Khong tim thay phieu muon." });
  }

  const [record] = records.splice(recordIndex, 1);
  const book = books.find((item) => item.id === record.bookId);
  if (book && record.status === "BORROWED") {
    book.status = "AVAILABLE";
  }

  writeData("borrowRecords", records);
  writeData("books", books);
  res.json({
    status: "success",
    message: "Da xoa phieu muon.",
    data: createRecordView(record, readers, books)
  });
});

router.get("/overdue", (req, res) => {
  const currentDate = today();
  const records = getRecordViews()
    .filter((record) => record.status === "BORROWED" && record.dueDate < currentDate)
    .map((record) => ({ ...record, lateDays: daysLate(record.dueDate, currentDate) }));

  res.json({ status: "success", data: records });
});

router.get("/debts", (req, res) => {
  const readers = readData("readers");
  const debts = readData("debts").map((debt) => {
    const reader = readers.find((item) => item.id === debt.readerId);
    return { ...debt, readerCode: reader?.code || "", readerName: reader?.name || "" };
  });

  res.json({ status: "success", data: debts });
});

router.put("/debts/:readerId/pay", (req, res) => {
  const debts = readData("debts");
  const debt = debts.find((item) => item.readerId === Number(req.params.readerId) && item.status === "UNPAID");

  if (!debt) {
    return res.status(404).json({ status: "error", message: "Doc gia khong co cong no can thanh toan." });
  }

  debt.amount = 0;
  debt.status = "PAID";
  debt.updatedAt = today();
  writeData("debts", debts);
  res.json({ status: "success", message: "Da thanh toan cong no.", data: debt });
});

router.get("/stats", (req, res) => {
  const records = readData("borrowRecords");
  const debts = readData("debts");
  const overdueCount = getRecordViews()
    .filter((record) => record.status === "BORROWED" && record.dueDate < today())
    .length;

  res.json({
    status: "success",
    data: {
      totalRecords: records.length,
      borrowedBooks: records.filter((record) => record.status === "BORROWED").length,
      overdueBooks: overdueCount,
      totalFine: records.reduce((sum, record) => sum + record.fine, 0),
      totalDebt: debts
        .filter((debt) => debt.status === "UNPAID")
        .reduce((sum, debt) => sum + debt.amount, 0)
    }
  });
});

export default router;
