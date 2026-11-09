import React, { useState, useMemo } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Pagination } from '../../components/common/Pagination';
import { CATEGORIES } from '../../data/mockBooks';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  BookOpen,
  Filter,
  CheckCircle,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

export const ManageBooks = () => {
  const { books, demandPredictions, addBook, updateBook, deleteBook, checkDuplicates } = useLibrary();
  const demandByBookId = Object.fromEntries(demandPredictions.map((item) => [item.bookId, item]));

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [deletingBookId, setDeletingBookId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [duplicateMatches, setDuplicateMatches] = useState([]);
  const [allowDuplicate, setAllowDuplicate] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: 'Information Technology',
    isbn: '',
    publicationYear: 2024,
    totalCopies: 5,
    availableCopies: 5,
    rating: 4.8,
    reviewsCount: 120,
    coverImage: '',
    description: '',
    tags: 'Reference, Library'
  });
  const [formErrors, setFormErrors] = useState({});

  // Filtered books
  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      const matchQuery =
        !searchTerm.trim() ||
        b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.isbn || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategory = categoryFilter === 'All' || b.category === categoryFilter;

      return matchQuery && matchCategory;
    });
  }, [books, searchTerm, categoryFilter]);

  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBooks.slice(start, start + itemsPerPage);
  }, [filteredBooks, currentPage]);

  const openAddModal = () => {
    setEditingBook(null);
    setFormData({
      title: '',
      author: '',
      category: 'Information Technology',
      isbn: `978-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      publicationYear: new Date().getFullYear(),
      totalCopies: 5,
      availableCopies: 5,
      rating: 4.7,
      reviewsCount: 50,
      coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600',
      description: '',
      tags: 'General, Education'
    });
    setFormErrors({});
    setDuplicateMatches([]);
    setAllowDuplicate(false);
    setIsFormModalOpen(true);
  };

  const openEditModal = (book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      category: book.category,
      isbn: book.isbn,
      publicationYear: book.publicationYear,
      totalCopies: book.totalCopies,
      availableCopies: book.availableCopies,
      rating: book.rating,
      reviewsCount: book.reviewsCount,
      coverImage: book.coverImage,
      description: book.description,
      tags: Array.isArray(book.tags) ? book.tags.join(', ') : book.tags
    });
    setFormErrors({});
    setDuplicateMatches([]);
    setAllowDuplicate(false);
    setIsFormModalOpen(true);
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Title is required.';
    if (!formData.author.trim()) errs.author = 'Author name is required.';
    if (!formData.isbn.trim()) errs.isbn = 'ISBN is required.';
    if (parseInt(formData.totalCopies, 10) < 1) errs.totalCopies = 'Minimum 1 total copy.';
    if (parseInt(formData.availableCopies, 10) > parseInt(formData.totalCopies, 10)) {
      errs.availableCopies = 'Available copies cannot exceed total copies.';
    }
    if (!formData.description.trim()) errs.description = 'Description is required.';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      ...formData,
      publicationYear: Number(formData.publicationYear),
      totalCopies: Number(formData.totalCopies),
      availableCopies: Number(formData.availableCopies),
      rating: Number(formData.rating),
      reviewsCount: Number(formData.reviewsCount),
      tags: String(formData.tags || '').split(',').map((tag) => tag.trim()).filter(Boolean),
    };
    setIsSaving(true);
    if (!editingBook && !allowDuplicate) {
      try {
        const matches = await checkDuplicates(payload);
        if (matches.length) {
          setDuplicateMatches(matches);
          setIsSaving(false);
          return;
        }
      } catch {
        // The server will still validate the eventual create request.
      }
    }
    const result = editingBook
      ? await updateBook(editingBook.id, payload)
      : await addBook(payload);
    setIsSaving(false);
    if (result.success) {
      setIsFormModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-navy-950 tracking-tight">
            Book Inventory Management
          </h2>
          <p className="text-xs text-slate-500">
            Catalog inventory repository: {books.length} registered titles
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add New Book Volume
        </button>
      </div>

      {/* Search and Filters toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by title, author, or ISBN..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-navy-900 focus:outline-none w-full md:w-auto"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Book Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 uppercase tracking-wider font-bold">
                <th className="py-3.5 px-6">Book</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">ISBN</th>
                <th className="py-3.5 px-4">Rating</th>
                <th className="py-3.5 px-4">Copies (Avail/Total)</th>
                <th className="py-3.5 px-4">AI Demand</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedBooks.map((book) => (
                <tr key={book.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-10 h-14 object-cover rounded shadow-2xs shrink-0"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600';
                        }}
                      />
                      <div className="min-w-0 max-w-xs">
                        <p className="font-bold text-navy-900 truncate">{book.title}</p>
                        <p className="text-[11px] text-slate-400 truncate">By {book.author}</p>
                        <span className="text-[10px] text-slate-400">Year {book.publicationYear}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-medium">{book.category}</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{book.isbn}</td>
                  <td className="py-3 px-4 font-bold text-amber-600">★ {book.rating}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        book.availableCopies > 0
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {book.availableCopies} / {book.totalCopies} Available
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {demandByBookId[book.id] ? (
                      <div>
                        <span className={`inline-block px-2 py-1 rounded-full text-[10px] font-bold ${demandByBookId[book.id].demandLevel === 'High' ? 'bg-rose-50 text-rose-700' : demandByBookId[book.id].demandLevel === 'Medium' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                          {demandByBookId[book.id].demandLevel} demand
                        </span>
                        <p className="text-[10px] text-slate-400 mt-1">{demandByBookId[book.id].predictedMonthlyBorrowings}/month</p>
                      </div>
                    ) : <span className="text-slate-400">—</span>}
                  </td>
                  <td className="py-3 px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(book)}
                        className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Edit Book"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingBookId(book.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Book"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredBooks.length}
          itemsPerPage={itemsPerPage}
        />
      </div>

      {/* Add / Edit Book Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingBook ? 'Edit Book Details' : 'Add New Book to Catalog'}
        subtitle="Manage library catalog metadata and stock counts."
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-navy-900 block mb-1">Book Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Madol Doova or The Colombo Tech Playbook"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              {formErrors.title && <p className="text-[11px] text-rose-500 mt-1">{formErrors.title}</p>}
            </div>

            {duplicateMatches.length > 0 && (
              <div className="sm:col-span-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                <p className="font-bold">Potential duplicate detected</p>
                <p className="mt-1">Similar catalogue title: {duplicateMatches[0].title} by {duplicateMatches[0].author} ({duplicateMatches[0].similarity}% similar).</p>
                <button type="button" onClick={() => setAllowDuplicate(true)} className="mt-2 font-bold underline">Keep this as a separate edition and create it anyway</button>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-navy-900 block mb-1">Author Name *</label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="e.g. Martin Wickramasinghe or Dr. Sanjiva Weerawarana"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              {formErrors.author && <p className="text-[11px] text-rose-500 mt-1">{formErrors.author}</p>}
            </div>

            <div>
              <label className="text-xs font-bold text-navy-900 block mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-navy-900 block mb-1">ISBN Code *</label>
              <input
                type="text"
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                placeholder="978-0134494166"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              {formErrors.isbn && <p className="text-[11px] text-rose-500 mt-1">{formErrors.isbn}</p>}
            </div>

            <div>
              <label className="text-xs font-bold text-navy-900 block mb-1">Publication Year</label>
              <input
                type="number"
                value={formData.publicationYear}
                onChange={(e) => setFormData({ ...formData, publicationYear: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-navy-900 block mb-1">Total Copies *</label>
              <input
                type="number"
                min="1"
                value={formData.totalCopies}
                onChange={(e) => setFormData({ ...formData, totalCopies: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              {formErrors.totalCopies && <p className="text-[11px] text-rose-500 mt-1">{formErrors.totalCopies}</p>}
            </div>

            <div>
              <label className="text-xs font-bold text-navy-900 block mb-1">Available Copies *</label>
              <input
                type="number"
                min="0"
                value={formData.availableCopies}
                onChange={(e) => setFormData({ ...formData, availableCopies: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              {formErrors.availableCopies && <p className="text-[11px] text-rose-500 mt-1">{formErrors.availableCopies}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-navy-900 block mb-1">Cover Image URL</label>
              <input
                type="url"
                value={formData.coverImage}
                onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-navy-900 block mb-1">Description / Summary *</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed book summary and learning objectives..."
                className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-none"
              />
              {formErrors.description && <p className="text-[11px] text-rose-500 mt-1">{formErrors.description}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-navy-900 block mb-1">Tags (Comma Separated)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="Architecture, Software, Microservices"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsFormModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/20 transition-all cursor-pointer"
            >
              {isSaving ? 'Saving…' : (editingBook ? 'Save Changes' : 'Create Book Entry')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingBookId}
        onClose={() => setDeletingBookId(null)}
        onConfirm={() => deleteBook(deletingBookId)}
        title="Delete Book from Catalog?"
        message="Are you sure you want to permanently delete this book from the library repository? Active loans will block deletion."
        confirmText="Delete Book"
        type="danger"
      />
    </div>
  );
};
