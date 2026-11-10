import logoImg from '../assets/logo.jpg';
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bot,
  X,
  Send,
  BookOpen,
  Sparkles,
  Compass,
  BookmarkCheck,
  TrendingUp,
  RotateCcw,
  BookMarked,
  Library,
  ChevronDown,
  Info
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { useAuth } from '../context/AuthContext';

const INITIAL_MESSAGES = [
  {
    id: 'msg-1',
    sender: 'bot',
    text: "Hello! 👋 I'm your AuraLib LK AI Reading Assistant (Prototype). I can help you discover books from our catalog, map out reading pathways, or check your current borrowing progress. How can I assist you today?",
    timestamp: 'Just now'
  }
];

const SUGGESTIONS = [
  { label: 'Recommend a book', query: 'Recommend a book' },
  { label: 'Find similar books', query: 'Find similar books' },
  { label: 'Create my reading path', query: 'Create my reading path' },
  { label: 'Check my reading progress', query: 'Check my reading progress' }
];

export const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const { books, borrowings, settings } = useLibrary();
  const { user, isAuthenticated } = useAuth();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // focus input when opened on non-mobile
      if (window.innerWidth >= 640) {
        inputRef.current?.focus();
      }
    }
  }, [isOpen, messages, isTyping]);

  // Generate prototype rule-based response
  const generateResponse = (userQuery) => {
    const q = userQuery.toLowerCase().trim();

    // 1. Check Reading Progress
    if (q.includes('progress') || q.includes('my book') || q.includes('borrowed') || q.includes('loan')) {
      if (!isAuthenticated || !user) {
        return {
          text: `You are currently browsing as a guest. When you sign in to your library membership account, you can borrow up to ${settings?.maxBorrowLimit || 5} books for ${settings?.loanDurationDays || 14} days and monitor your active loans and due dates right here!`,
          actionLink: { label: 'Go to Sign In / Login', url: '/login' }
        };
      }

      const userLoans = borrowings.filter(
        (b) => b.memberId === user.id && (b.status === 'approved' || b.status === 'overdue')
      );
      const pendingLoans = borrowings.filter(
        (b) => b.memberId === user.id && b.status === 'pending'
      );
      const completedLoans = borrowings.filter(
        (b) => b.memberId === user.id && b.status === 'returned'
      );

      if (userLoans.length === 0 && pendingLoans.length === 0) {
        return {
          text: `Hi ${user.name}! 📚 You currently have no active borrowed books. You have read/returned ${completedLoans.length} books in total. You have ${settings?.maxBorrowLimit || 5} borrow slots available today. Would you like a book recommendation to get started?`,
          actionLink: { label: 'Explore Book Catalog', url: '/catalog' }
        };
      }

      const bookList = userLoans
        .map((loan) => `• "${loan.bookTitle}" (Due: ${loan.dueDate || '14 days'})`)
        .join('\n');

      return {
        text: `Here is your current reading progress, ${user.name}:\n\n📖 Active Loans (${userLoans.length}/${settings?.maxBorrowLimit || 5}):\n${bookList}\n\n⏳ Pending Requests: ${pendingLoans.length}\n✅ Books Returned: ${completedLoans.length}`,
        actionLink: { label: 'View My Books', url: '/my-books' }
      };
    }

    // 2. Recommend a Book
    if (q.includes('recommend') || q.includes('best book') || q.includes('suggest') || q.includes('what should i read')) {
      const featured = books.filter((b) => b.featured || b.rating >= 4.8).slice(0, 3);
      if (featured.length > 0) {
        const bookDetails = featured
          .map(
            (b, i) =>
              `${i + 1}. "${b.title}" by ${b.author} (${b.category}) - ★ ${b.rating} (${b.availableCopies} available)`
          )
          .join('\n\n');

        return {
          text: `Here are our top curated recommendations from the AuraLib LK catalog:\n\n${bookDetails}\n\nAll titles are in stock and ready to borrow!`,
          actionLink: { label: 'Browse Full Catalog', url: '/catalog' }
        };
      }
    }

    // 3. Create Reading Path
    if (q.includes('path') || q.includes('roadmap') || q.includes('learning path') || q.includes('plan')) {
      const itBooks = books.filter((b) => b.category === 'Information Technology').slice(0, 2);
      const histBooks = books.filter((b) => b.category === 'History' || b.category === 'Fiction').slice(0, 1);

      return {
        text: `🎯 Here is your suggested 3-Stage Reading Path:\n\n1️⃣ Foundation: Start with broad concepts & history:\n• "${histBooks[0]?.title || 'A Historical Overview'}" by ${histBooks[0]?.author || 'Curated Author'}\n\n2️⃣ Core Skill Building:\n• "${itBooks[0]?.title || 'Core Engineering Essentials'}" by ${itBooks[0]?.author || 'Senior Author'}\n\n3️⃣ Advanced Mastery:\n• "${itBooks[1]?.title || 'Architecture & Scaling'}" by ${itBooks[1]?.author || 'Distinguished Engineer'}\n\nConsistent reading of 20 pages/day completes this path in ~4 weeks!`,
        actionLink: { label: 'Inspect Reading Materials', url: '/catalog' }
      };
    }

    // 4. Find Similar Books
    if (q.includes('similar') || q.includes('like') || q.includes('related')) {
      const categories = ['Information Technology', 'Science', 'Fiction', 'Business'];
      const randomCat = categories[Math.floor(Math.random() * categories.length)];
      const related = books.filter((b) => b.category === randomCat).slice(0, 3);

      const items = related
        .map((b) => `• "${b.title}" by ${b.author} [${b.category}]`)
        .join('\n');

      return {
        text: `Looking for books in popular themes? Here is a cohesive cluster in ${randomCat}:\n\n${items}\n\nWould you like recommendations in another discipline?`,
        actionLink: { label: `View ${randomCat} Collection`, url: `/catalog?category=${encodeURIComponent(randomCat)}` }
      };
    }

    // 5. Category or Topic Search
    const foundCategory = [
      'Information Technology',
      'Science',
      'Fiction',
      'Business',
      'History',
      'Education',
      'Personal Development'
    ].find((cat) => q.includes(cat.toLowerCase()));

    if (foundCategory) {
      const matched = books.filter((b) => b.category === foundCategory).slice(0, 3);
      const items = matched.map((b) => `• "${b.title}" by ${b.author} (★ ${b.rating})`).join('\n');

      return {
        text: `We have ${matched.length}+ featured titles in ${foundCategory}:\n\n${items}`,
        actionLink: { label: `Explore ${foundCategory}`, url: `/catalog?category=${encodeURIComponent(foundCategory)}` }
      };
    }

    // 6. Direct Book Title or Author keyword matching
    const keywordMatches = books
      .filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.description?.toLowerCase().includes(q)
      )
      .slice(0, 2);

    if (keywordMatches.length > 0 && q.length > 3) {
      const details = keywordMatches
        .map(
          (b) =>
            `• "${b.title}" by ${b.author} (${b.category})\n  Copies Available: ${b.availableCopies} of ${b.totalCopies}`
        )
        .join('\n\n');

      return {
        text: `I found matching titles in our library collection:\n\n${details}`,
        actionLink: { label: 'Search in Catalog', url: `/catalog?q=${encodeURIComponent(userQuery)}` }
      };
    }

    // 7. Library Hours, Rules, or Contact
    if (q.includes('hour') || q.includes('time') || q.includes('open') || q.includes('contact') || q.includes('rule') || q.includes('fine')) {
      return {
        text: `🏢 AuraLib LK Library Information:\n\n• Operating Hours: ${settings?.operatingHours || 'Mon-Sat: 08:00 - 20:00'}\n• Standard Loan: ${settings?.loanDurationDays || 14} days per loan\n• Max Borrow Limit: ${settings?.maxBorrowLimit || 5} books\n• Overdue Rate: LKR ${settings?.finePerDay || '20.00'}/day\n• Support Contact: ${settings?.contactEmail || 'support@auralib.lk'}`
      };
    }

    // 8. General Greeting / Fallback
    if (q.includes('hi') || q.includes('hello') || q.includes('hey') || q.includes('ayubowan')) {
      return {
        text: `Ayubowan! 🙏 How can I help you today? You can ask me to recommend books, check your reading progress, or suggest learning paths for any topic!`
      };
    }

    // Default Fallback
    return {
      text: `I understand you're inquiring about "${userQuery}". As your Reading Assistant, I can help you search our catalog by category (IT, Science, Fiction, History), generate curated reading lists, or check your active book loans.\n\nTry clicking one of the quick suggestions below!`
    };
  };

  const handleSendMessage = (textToSend) => {
    const messageText = textToSend || input;
    if (!messageText.trim()) return;

    const userMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: messageText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate natural AI assistant response delay (450ms)
    setTimeout(() => {
      const botReply = generateResponse(messageText);
      const botMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'bot',
        text: botReply.text,
        actionLink: botReply.actionLink,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 450);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = () => {
    setMessages(INITIAL_MESSAGES);
  };

  return (
    <aside aria-label="AI Reading Assistant Chatbot" className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end">
      {/* Chat Panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="false"
          aria-label="Reading Assistant Chat"
          className="mb-3 w-[calc(100vw-2rem)] sm:w-[380px] md:w-[410px] h-[520px] max-h-[80vh] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 backdrop-blur-md"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0F172A] via-[#0F172A] to-[#6366F1] text-white px-4 py-3.5 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <img
                src={logoImg}
                alt="AuraLib LK Logo"
                className="w-9 h-9 rounded-2xl object-contain bg-white border border-indigo-200/50 p-0.5 shadow-md shadow-[#6366F1]/30 shrink-0"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold tracking-tight text-white">AI Reading Assistant</h3>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                </div>
                <p className="text-[10px] text-indigo-200 font-medium">Prototype Reading Guide • Online</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleResetChat}
                title="Reset conversation"
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                aria-label="Reset chat"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close reading assistant"
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Prototype Notice Banner */}
          <div className="bg-indigo-50/90 border-b border-indigo-100/90 px-3 py-1.5 flex items-center gap-1.5 text-[11px] text-[#0F172A] font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#6366F1] shrink-0" />
            <span>Rule-based prototype reading assistant using local library data.</span>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/60">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <img
                    src={logoImg}
                    alt="AuraLib AI"
                    className="w-7 h-7 rounded-xl object-contain bg-white border border-slate-200 p-0.5 shadow-xs shrink-0 mt-0.5"
                  />
                )}

                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed shadow-2xs ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-[#0F172A] to-[#6366F1] text-white rounded-tr-xs shadow-sm shadow-[#6366F1]/15'
                      : 'bg-white text-[#0F172A] border border-slate-200/90 rounded-tl-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Optional Action Link in response */}
                  {msg.actionLink && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100">
                      <Link
                        to={msg.actionLink.url}
                        onClick={() => {
                          if (window.innerWidth < 640) setIsOpen(false);
                        }}
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#6366F1] bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/90 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        <Library className="w-3 h-3 text-[#6366F1]" />
                        <span>{msg.actionLink.label}</span>
                      </Link>
                    </div>
                  )}

                  <span
                    className={`block text-[9px] mt-1 text-right ${
                      msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-2.5 justify-start">
                <img
                  src={logoImg}
                  alt="AuraLib AI Typing"
                  className="w-7 h-7 rounded-xl object-contain bg-white border border-slate-200 p-0.5 shadow-xs shrink-0"
                />
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs px-3.5 py-2.5 shadow-2xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-[#6366F1] rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-[#6366F1] rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-[#6366F1] rounded-full animate-bounce" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          <div className="bg-white px-3 py-2 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {SUGGESTIONS.map((sug) => (
              <button
                key={sug.label}
                type="button"
                onClick={() => handleSendMessage(sug.query)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-[#0F172A] border border-indigo-200/80 hover:bg-[#6366F1] hover:text-white hover:border-[#6366F1] transition-all cursor-pointer shadow-2xs shrink-0"
              >
                {sug.label}
              </button>
            ))}
          </div>

          {/* Input & Send Area */}
          <div className="p-3 bg-white border-t border-slate-200/90">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask for book recommendations, topics, status..."
                className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30 focus:border-[#6366F1] text-[#0F172A] placeholder-slate-400"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                title="Send message"
                className="p-2.5 rounded-xl bg-gradient-to-r from-[#0F172A] to-[#6366F1] hover:from-[#0F172A] hover:to-[#4F46E5] disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-md shadow-[#6366F1]/20 transition-all cursor-pointer shrink-0"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Circular Trigger Button */}
      <div className="relative flex items-center">
        {/* Tooltip on hover or when closed */}
        {!isOpen && showTooltip && (
          <div className="absolute right-full mr-3 whitespace-nowrap px-3 py-1.5 rounded-xl bg-[#0F172A] text-white text-xs font-semibold shadow-xl border border-slate-800 animate-in fade-in slide-in-from-right-2 pointer-events-none">
            Ask Reading Assistant
            <span className="absolute top-1/2 -right-1 -translate-y-1/2 border-4 border-transparent border-l-[#0F172A]" />
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          aria-label={isOpen ? 'Close AI Reading Assistant' : 'Ask Reading Assistant'}
          title="Ask Reading Assistant"
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#0F172A] via-[#1E293B] to-[#6366F1] hover:from-[#0F172A] hover:to-[#4F46E5] text-white shadow-xl shadow-[#6366F1]/35 hover:shadow-[#6366F1]/50 flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer border-2 border-white/20 relative group"
        >
          {isOpen ? (
            <X className="w-6 h-6 transition-transform duration-200 group-hover:rotate-90" />
          ) : (
            <>
              <img
                src={logoImg}
                alt="AuraLib Assistant"
                className="w-7 h-7 rounded-full object-contain bg-white p-0.5 transition-transform duration-200 group-hover:scale-110 shadow-xs"
              />
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#6366F1] border-2 border-white" />
              </span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

export default FloatingChatbot;
