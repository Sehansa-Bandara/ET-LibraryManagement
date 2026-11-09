import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiRequest, getApiError } from '../lib/api';
import { useToast } from '../context/ToastContext';

export const Recommendations = () => {
  const { isAuthenticated, getToken } = useAuth();
  const { showToast } = useToast();
  const [interests, setInterests] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const findRecommendations = async () => {
    if (!isAuthenticated) { showToast('Please sign in to receive personalised recommendations.', 'warning'); return; }
    setLoading(true);
    try {
      const results = await apiRequest('/recommendations', { method: 'POST', token: await getToken(), body: { interests: interests.split(',').map((item) => item.trim()).filter(Boolean) } });
      setBooks(results);
    } catch (error) { showToast(getApiError(error), 'error'); }
    finally { setLoading(false); }
  };
  return <div className="max-w-6xl mx-auto px-4 py-10 space-y-7">
    <div><div className="flex items-center gap-2 text-brand-600 font-bold text-sm"><Sparkles className="w-5 h-5" /> Hybrid AI Book Recommendations</div><h1 className="text-3xl font-black text-navy-950 mt-2">Find your next great read</h1><p className="text-slate-500 text-sm mt-2">Our hybrid model combines content matching with collaborative filtering from readers with similar borrowing patterns.</p></div>
    <div className="bg-white border border-slate-200 rounded-2xl p-5 flex gap-3"><input value={interests} onChange={(event) => setInterests(event.target.value)} placeholder="e.g. Python, cloud computing, Sri Lankan history" className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm" /><button onClick={findRecommendations} disabled={loading} className="px-5 py-2.5 bg-brand-600 text-white text-sm font-bold rounded-xl disabled:opacity-50">{loading ? 'Finding…' : 'Recommend'}</button></div>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{books.map((book) => <Link key={book.id} to={`/books/${book.id}`} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md"><img src={book.coverImage} alt="" className="h-44 w-full object-cover" /><div className="p-4"><span className="text-xs text-brand-600 font-bold">{book.matchScore}% hybrid match</span><h2 className="font-bold text-navy-950 mt-1">{book.title}</h2><p className="text-xs text-slate-500 mt-1">{book.author}</p><p className="text-xs text-slate-500 mt-3">{book.reason}</p><div className="mt-3 flex gap-2 text-[10px]"><span className="px-2 py-1 bg-slate-100 rounded-full">Content: {book.contentScore}%</span><span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full">Similar readers: {book.collaborativeScore}%</span></div></div></Link>)}</div>
  </div>;
};
