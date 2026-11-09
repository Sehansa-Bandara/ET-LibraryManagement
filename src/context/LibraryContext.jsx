import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiRequest, getApiError } from '../lib/api';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';

const LibraryContext = createContext(null);
const DEFAULT_SETTINGS = { libraryName: 'AuraLib National Smart Library - Colombo', loanDurationDays: 14, maxBorrowLimit: 5, finePerDay: 20, contactEmail: 'support@auralib.lk', operatingHours: 'Mon-Sat: 08:00 - 20:00' };

export const LibraryProvider = ({ children }) => {
  const { user, getToken, isAdmin, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [books, setBooks] = useState([]); const [borrowings, setBorrowings] = useState([]); const [members, setMembers] = useState([]); const [demandPredictions, setDemandPredictions] = useState([]); const [acquisitionAdvice, setAcquisitionAdvice] = useState([]); const [settings, setSettings] = useState(DEFAULT_SETTINGS); const [loading, setLoading] = useState(true);
  const tokenRequest = useCallback(async (path, options = {}) => apiRequest(path, { ...options, token: await getToken() }), [getToken]);
  const refresh = useCallback(async () => {
    try {
      setBooks(await apiRequest('/books'));
      if (user) {
        const [loans, savedSettings] = await Promise.all([tokenRequest('/borrowings'), tokenRequest('/settings')]);
        setBorrowings(loans); setSettings(savedSettings);
        if (isAdmin) {
          const [allMembers, demand, advice] = await Promise.all([tokenRequest('/members'), tokenRequest('/admin/demand-predictions'), tokenRequest('/admin/acquisition-advice')]);
          setMembers(allMembers); setDemandPredictions(demand); setAcquisitionAdvice(advice);
        } else { setMembers([]); setDemandPredictions([]); setAcquisitionAdvice([]); }
      } else { setBorrowings([]); setMembers([]); setDemandPredictions([]); setAcquisitionAdvice([]); }
    } catch (error) { showToast(getApiError(error), 'error'); }
    finally { setLoading(false); }
  }, [isAdmin, showToast, tokenRequest, user]);
  useEffect(() => { if (!authLoading) refresh(); }, [authLoading, refresh]);
  const run = async (action, message) => { try { const result = await action(); await refresh(); if (message) showToast(message, 'success'); return { success: true, result }; } catch (error) { const reason = getApiError(error); showToast(reason, 'error'); return { success: false, reason }; } };
  const addBook = (data) => run(() => tokenRequest('/books', { method: 'POST', body: data }), 'Book added successfully.');
  const updateBook = (id, data) => run(() => tokenRequest(`/books/${id}`, { method: 'PATCH', body: data }), 'Book details updated.');
  const deleteBook = (id) => run(() => tokenRequest(`/books/${id}`, { method: 'DELETE' }), 'Book removed from the catalogue.');
  const requestBorrow = (bookId, notes = '') => run(() => tokenRequest('/borrowings', { method: 'POST', body: { bookId, notes } }), 'Borrow request submitted.');
  const approveBorrow = (id) => run(() => tokenRequest(`/borrowings/${id}/approve`, { method: 'POST' }), 'Borrow request approved.');
  const rejectBorrow = (id, reason) => run(() => tokenRequest(`/borrowings/${id}/reject`, { method: 'POST', body: { reason } }), 'Borrow request rejected.');
  const returnBook = (id) => run(() => tokenRequest(`/borrowings/${id}/return`, { method: 'POST' }), 'Book marked as returned.');
  const cancelRequest = (id) => run(() => tokenRequest(`/borrowings/${id}`, { method: 'DELETE' }), 'Borrow request cancelled.');
  const renewBook = (id) => run(() => tokenRequest(`/borrowings/${id}/renew`, { method: 'POST' }), 'Loan renewed for 7 days.');
  const updateMember = (id, data) => run(() => tokenRequest(`/members/${id}`, { method: 'PATCH', body: data }), 'Member updated.');
  const deleteMember = (id) => run(() => tokenRequest(`/members/${id}`, { method: 'DELETE' }), 'Member removed.');
  const toggleMemberStatus = (id) => updateMember(id, { status: members.find((item) => item.id === id)?.status === 'Active' ? 'Suspended' : 'Active' });
  const updateSettings = (data) => run(() => tokenRequest('/settings', { method: 'PATCH', body: data }), 'Settings updated.');
  const checkDuplicates = (data) => tokenRequest('/admin/books/duplicate-check', { method: 'POST', body: { title: data.title, author: data.author, description: data.description } });
  const resetToDefaults = () => updateSettings(DEFAULT_SETTINGS);
  return <LibraryContext.Provider value={{ books, borrowings, members, demandPredictions, acquisitionAdvice, settings, loading, refresh, getBookById: (id) => books.find((book) => book.id === id), addBook, updateBook, deleteBook, requestBorrow, approveBorrow, rejectBorrow, returnBook, cancelRequest, renewBook, updateMember, deleteMember, toggleMemberStatus, updateSettings, checkDuplicates, resetToDefaults }}>{children}</LibraryContext.Provider>;
};
export const useLibrary = () => { const context = useContext(LibraryContext); if (!context) throw new Error('useLibrary must be used within a LibraryProvider'); return context; };
