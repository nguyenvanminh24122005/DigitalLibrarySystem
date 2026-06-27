import { addDaysISO, getStorage, setStorage, todayISO } from './storage';

const FAVORITES_KEY = 'digilib:favorites';
const LOANS_KEY = 'digilib:loans';
const HISTORY_KEY = 'digilib:history';
const READ_PROGRESS_KEY = 'digilib:readProgress';

export function getFavorites() {
  return getStorage(FAVORITES_KEY, []);
}

export function setFavorites(ids) { setStorage(FAVORITES_KEY, ids); }

export function getLoans() {
  return getStorage(LOANS_KEY, []);
}

export function setLoans(loans) { setStorage(LOANS_KEY, loans); }

export function getHistory() {
  return getStorage(HISTORY_KEY, []);
}

export function setHistory(history) { setStorage(HISTORY_KEY, history); }

export function createLoan(book, copy) {
  return {
    loanId: `L${Date.now()}`,
    bookId: book.id,
    copyId: copy.copyId || copy.id,
    barcode: copy.barcode,
    borrowedAt: todayISO(),
    dueDate: addDaysISO(14),
    location: copy.location || book.location,
    status: 'Borrowed',
    renewed: false
  };
}

export function getReadProgress() {
  return getStorage(READ_PROGRESS_KEY, { 1: 68, 2: 35, 4: 12 });
}
export function setReadProgress(value) { setStorage(READ_PROGRESS_KEY, value); }
