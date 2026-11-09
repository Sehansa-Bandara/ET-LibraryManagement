import React from 'react';
import { Link } from 'react-router-dom';
import { useLibrary } from '../../context/LibraryContext';
import { StatCard } from '../../components/dashboard/StatCard';
import { StatusBadge } from '../../components/common/Badge';
import {
  BookOpen,
  Users,
  BookmarkCheck,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingUp,
  PieChart as PieIcon,
  CheckCircle,
  XCircle,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';

export const AdminDashboard = () => {
  const { books, borrowings, members, demandPredictions, acquisitionAdvice, approveBorrow, rejectBorrow } = useLibrary();

  // Metrics
  const totalBooks = books.length;
  const totalMembers = members.length;
  const borrowedBooks = borrowings.filter((br) => br.status === 'approved').length;
  const overdueBooks = borrowings.filter((br) => br.status === 'overdue').length;
  const pendingRequests = borrowings.filter((br) => br.status === 'pending');

  // Chart 1: Borrowing Activity (Weekly Trends)
  const activityData = [
    { day: 'Mon', borrowed: 4, returned: 2 },
    { day: 'Tue', borrowed: 7, returned: 5 },
    { day: 'Wed', borrowed: 5, returned: 3 },
    { day: 'Thu', borrowed: 9, returned: 6 },
    { day: 'Fri', borrowed: 11, returned: 8 },
    { day: 'Sat', borrowed: 14, returned: 10 },
    { day: 'Sun', borrowed: 6, returned: 4 }
  ];

  // Chart 2: Category Distribution
  const categoryCounts = books.reduce((acc, book) => {
    acc[book.category] = (acc[book.category] || 0) + 1;
    return acc;
  }, {});

  const categoryChartData = Object.keys(categoryCounts).map((cat) => ({
    name: cat.length > 12 ? cat.substring(0, 10) + '...' : cat,
    fullName: cat,
    value: categoryCounts[cat]
  }));

  const COLORS = ['#2563eb', '#0284c7', '#0d9488', '#16a34a', '#eab308', '#ea580c', '#8b5cf6'];

  // Recent transactions
  const recentBorrowings = borrowings.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-brand-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold border border-brand-400/30">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Librarian Intelligence Command
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Library Operations & Diagnostics
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Real-time catalog monitoring, automated circulation tracking, and member reservation workflows.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/borrowings"
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center gap-1.5"
          >
            Review Pending ({pendingRequests.length})
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Catalog Books"
          value={totalBooks}
          icon={BookOpen}
          change="+4 this month"
          color="brand"
        />
        <StatCard
          title="Active Members"
          value={totalMembers}
          icon={Users}
          change="+12% growth"
          color="emerald"
        />
        <StatCard
          title="Currently Borrowed"
          value={borrowedBooks}
          icon={BookmarkCheck}
          color="purple"
        />
        <StatCard
          title="Overdue Notices"
          value={overdueBooks}
          icon={AlertTriangle}
          trend={overdueBooks > 0 ? 'down' : 'up'}
          change={overdueBooks > 0 ? 'Action required' : 'Clear'}
          color="rose"
        />
        <StatCard
          title="Pending Requests"
          value={pendingRequests.length}
          icon={Clock}
          color="amber"
        />
      </div>

      <section className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4"><TrendingUp className="w-5 h-5 text-brand-600" /><div><h3 className="font-black text-navy-950">ML Demand Forecast</h3><p className="text-xs text-slate-500">Random Forest prediction from historical borrowing records.</p></div></div>
        {demandPredictions.length ? <div className="grid sm:grid-cols-3 gap-3">{demandPredictions.slice(0, 3).map((item) => <div key={item.bookId} className="rounded-xl bg-slate-50 border border-slate-100 p-3"><p className="text-xs font-bold text-navy-900 truncate">{item.title}</p><p className="text-brand-600 font-black text-lg mt-1">{item.predictedMonthlyBorrowings}<span className="text-xs font-medium text-slate-500"> loans/month</span></p><p className="text-[11px] text-slate-500">{item.demandLevel} demand · {item.model}</p></div>)}</div> : <p className="text-sm text-slate-500">Add books and borrowing records to generate demand predictions.</p>}
      </section>

      <section className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4"><Sparkles className="w-5 h-5 text-brand-600" /><div><h3 className="font-black text-navy-950">Smart Book Acquisition Advisor</h3><p className="text-xs text-slate-500">Clusters member searches and combines failed searches, stock, and loan demand.</p></div></div>
        {acquisitionAdvice.length ? <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{acquisitionAdvice.slice(0, 6).map((item) => <div key={item.topic} className="rounded-xl border border-slate-100 bg-slate-50 p-3"><div className="flex justify-between gap-2"><p className="font-bold text-sm text-navy-900 truncate">{item.topic}</p><span className={`text-[10px] px-2 py-1 rounded-full font-bold ${item.priority === 'High' ? 'bg-rose-100 text-rose-700' : item.priority === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-700'}`}>{item.priority}</span></div><p className="mt-2 text-xs text-slate-600">{item.recommendation}</p><p className="mt-2 text-[11px] text-slate-500">{item.searches} searches · {item.failedSearches} no-result searches · {item.availableCopies} copies available</p></div>)}</div> : <p className="text-sm text-slate-500">Searches from the public catalogue will appear here as purchase suggestions.</p>}
      </section>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Circulation Activity Chart */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-navy-900 text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-600" />
                Borrowing & Return Trends
              </h3>
              <p className="text-xs text-slate-400">Weekly activity summary across all departments</p>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
              Last 7 Days
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="borrowed" name="Borrowed Books" fill="#2563eb" radius={[6, 6, 0, 0]} />
                <Bar dataKey="returned" name="Returned Books" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 pt-3 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-brand-600" />
              <span className="text-slate-600 font-medium">Loans Issued</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-slate-600 font-medium">Returned Copies</span>
            </div>
          </div>
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-bold text-navy-900 text-base flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-brand-600" />
                Category Distribution
              </h3>
              <p className="text-xs text-slate-400">Inventory balance across disciplines</p>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
              {books.length} Books
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name, item) => [`${val} Books`, item.payload.fullName]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 pt-2 border-t border-slate-100 text-[11px]">
            {categoryChartData.slice(0, 5).map((item, i) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-slate-600 truncate max-w-[90px]">{item.fullName}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Requests Queue Card */}
      {pendingRequests.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-navy-950 text-base">
                Pending Borrowing Requests Requiring Review ({pendingRequests.length})
              </h3>
            </div>
            <Link
              to="/admin/borrowings"
              className="text-xs font-bold text-amber-800 hover:underline flex items-center gap-1"
            >
              Open Full Manager <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingRequests.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="bg-white p-4 rounded-2xl border border-amber-200/60 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {item.category}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">{item.requestDate}</span>
                  </div>
                  <h4 className="font-bold text-navy-900 text-xs line-clamp-1 mt-1">
                    {item.bookTitle}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate">
                    Borrower: <span className="font-semibold text-navy-900">{item.memberName}</span>
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => approveBorrow(item.id)}
                    className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Approve
                  </button>
                  <button
                    onClick={() => rejectBorrow(item.id)}
                    className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 font-bold text-[11px] rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Transactions Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-navy-900 text-base">Recent Library Transactions</h3>
            <p className="text-xs text-slate-400">Latest loan and return activities recorded</p>
          </div>
          <Link
            to="/admin/history"
            className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1"
          >
            <span>View All History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 uppercase tracking-wider font-bold">
                <th className="py-3.5 px-6">Book Title</th>
                <th className="py-3.5 px-4">Member</th>
                <th className="py-3.5 px-4">Borrow Date</th>
                <th className="py-3.5 px-4">Due Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-6 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentBorrowings.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-6 font-semibold text-navy-900">
                    <p className="font-bold truncate max-w-xs">{tx.bookTitle}</p>
                    <p className="text-[10px] text-slate-400">{tx.category}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-navy-900">{tx.memberName}</p>
                    <p className="text-[10px] text-slate-400">{tx.memberEmail}</p>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{tx.borrowDate || tx.requestDate}</td>
                  <td className="py-3.5 px-4 text-slate-600">{tx.dueDate || 'N/A'}</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={tx.status} />
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <Link
                      to="/admin/borrowings"
                      className="text-brand-600 hover:text-brand-800 font-bold"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
