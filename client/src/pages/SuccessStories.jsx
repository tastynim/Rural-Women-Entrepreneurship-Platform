import { useState, useEffect } from "react";
import axios from "axios";
import { useLang } from "../context/LanguageContext";
import { Link } from "react-router-dom";

export default function SuccessStories() {
  const { lang } = useLang();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");

  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Form state
  const [selectedStory, setSelectedStory] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const fetchStories = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/success-stories");
      setStories(data);
    } catch {
      setError(lang === "en" ? "Failed to load stories." : "গল্প লোড করতে ব্যর্থ।");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      await axios.post(
        "/api/success-stories",
        { title, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMsg(
        lang === "en"
          ? "Your story has been submitted for admin approval! 🎉"
          : "আপনার গল্প অ্যাডমিন অনুমোদনের জন্য জমা দেওয়া হয়েছে! 🎉"
      );
      setTitle("");
      setContent("");
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit story.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30">
      
      {/* ── Hero ── */}
      <div className="relative bg-gradient-to-br from-emerald-900 via-teal-800 to-green-900 text-white overflow-hidden">
        <div className="absolute inset-0 hero-pattern" />
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-teal-400/15 rounded-full blur-2xl" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 py-16">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1 animate-slide-right">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-full border border-emerald-500/30">
                  🌸 Inspiration
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
                {lang === "en" ? "Success " : "সাফল্যের "}
                <span className="animate-text-shimmer">{lang === "en" ? "Stories" : "গল্প"}</span>
              </h1>
              <p className="text-slate-300 text-lg leading-relaxed max-w-lg">
                {lang === "en"
                  ? "Real stories from real rural women entrepreneurs who changed their lives."
                  : "বাস্তব গ্রামীণ নারী উদ্যোক্তাদের জীবন পরিবর্তনের গল্প।"}
              </p>
              {user?.role === "entrepreneur" && (
                <button
                  id="share-story-btn"
                  onClick={() => setShowForm((v) => !v)}
                  className="mt-6 px-6 py-3 bg-white text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 transition-all shadow-lg flex items-center gap-2 btn-glow"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  {showForm
                    ? (lang === "en" ? "Cancel" : "বাতিল")
                    : (lang === "en" ? "Share Your Story" : "আপনার গল্প শেয়ার করুন")}
                </button>
              )}
            </div>

            <div className="animate-float hidden md:block">
              <div className="w-40 h-40 glass-dark rounded-3xl flex items-center justify-center relative">
                <span className="text-7xl">🌟</span>
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-emerald-400 rounded-full flex items-center justify-center text-sm animate-bounce-in delay-300">🌱</div>
                <div className="absolute -bottom-3 -left-3 w-8 h-8 bg-teal-400 rounded-full flex items-center justify-center text-sm animate-bounce-in delay-500">✨</div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex gap-6 flex-wrap animate-fade-in-up delay-400">
            {[
              { n: stories.length || '–', l: lang === "en" ? 'Total Stories' : 'মোট গল্প' },
            ].map(({ n, l }) => (
              <div key={l} className="glass-dark rounded-2xl px-5 py-3 text-center">
                <p className="text-xl font-bold text-white">{n}</p>
                <p className="text-slate-300 text-xs">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Success / error alerts */}
        {successMsg && (
          <div className="mb-6 bg-green-100 border border-green-300 text-green-800 rounded-xl px-5 py-4 flex justify-between items-center">
            <span>{successMsg}</span>
            <button onClick={() => setSuccessMsg("")} className="font-bold text-lg">✕</button>
          </div>
        )}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-300 text-red-700 rounded-xl px-5 py-4 flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError("")} className="font-bold text-lg">✕</button>
          </div>
        )}

        {/* Story Submission Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl border border-emerald-100 p-7 mb-8 animate-scale-in">
            <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
              <span className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-bold">✏️</span>
              {lang === "en" ? "Share Your Success Story" : "আপনার সাফল্যের গল্প শেয়ার করুন"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {lang === "en" ? "Story Title" : "গল্পের শিরোনাম"} <span className="text-red-500">*</span>
                </label>
                <input
                  id="story-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder={lang === "en" ? "e.g. How I built my handicraft business from scratch" : "যেমন: কিভাবে আমি আমার হস্তশিল্প ব্যবসা গড়েছি"}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {lang === "en" ? "Your Story" : "আপনার গল্প"} <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="story-content"
                  rows={7}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  placeholder={lang === "en" ? "Tell us your journey, challenges, and achievements..." : "আপনার যাত্রা, চ্যালেঞ্জ এবং অর্জনের কথা বলুন..."}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {submitting
                    ? (lang === "en" ? "Submitting…" : "জমা দেওয়া হচ্ছে…")
                    : (lang === "en" ? "Submit Story" : "গল্প জমা দিন")}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {lang === "en" ? "Cancel" : "বাতিল"}
                </button>
              </div>
              <p className="text-xs text-gray-400">
                {lang === "en"
                  ? "Your story will be reviewed by an admin before being published."
                  : "আপনার গল্পটি প্রকাশের আগে অ্যাডমিন কর্তৃক পর্যালোচনা করা হবে।"}
              </p>
            </form>
          </div>
        )}

        {/* Stories Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <svg className="animate-spin h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow border border-gray-100">
            <div className="text-6xl mb-4">🌱</div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">
              {lang === "en" ? "No stories yet" : "এখনো কোনো গল্প নেই"}
            </h2>
            <p className="text-gray-400 text-sm">
              {lang === "en"
                ? "Be the first to share your success story!"
                : "প্রথম হয়ে আপনার সাফল্যের গল্প শেয়ার করুন!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {stories.map((story, idx) => (
              <article
                key={story._id}
                className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden card-tilt flex flex-col group animate-fade-in-up"
                style={{ animationDelay: `${idx * 0.07}s` }}
              >
                {/* Decorative header bar */}
                <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
                <div className="p-6 flex flex-col flex-1">
                  {/* Author info */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-lg overflow-hidden flex-shrink-0">
                      {story.entrepreneur?.photo ? (
                        <img
                          src={`/uploads/${story.entrepreneur.photo}`}
                          alt={story.entrepreneur.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        story.entrepreneur?.name?.charAt(0)?.toUpperCase() || "U"
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">
                        {story.entrepreneur?.name || (lang === "en" ? "Anonymous" : "অজ্ঞাত")}
                      </p>
                      {story.entrepreneur?.location && (
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          📍 {story.entrepreneur.location}
                        </p>
                      )}
                    </div>
                    <span className="ml-auto text-xs text-gray-400">
                      {new Date(story.createdAt).toLocaleDateString(
                        lang === "en" ? "en-US" : "bn-BD",
                        { year: "numeric", month: "short", day: "numeric" }
                      )}
                    </span>
                  </div>

                  {/* Story content */}
                  <h2 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-green-700 transition-colors">
                    {story.title}
                  </h2>
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-4">
                    {story.content}
                  </p>

                  {/* Images row */}
                  {story.images?.length > 0 && (
                    <div className="flex gap-2 mt-4 overflow-x-auto">
                      {story.images.slice(0, 3).map((img, i) => (
                        <img
                          key={i}
                          src={`/uploads/${img}`}
                          alt="Story"
                          className="w-20 h-20 object-cover rounded-lg flex-shrink-0 border border-gray-200"
                        />
                      ))}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                      <span className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center text-xs font-bold text-emerald-700">✓</span> 
                      {lang === "en" ? "Verified" : "যাচাইকৃত"}
                    </span>
                    <button
                      onClick={() => setSelectedStory(story)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm btn-glow bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                    >
                      {lang === "en" ? "Read Story" : "গল্প পড়ুন"}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* ── Full Story Modal ── */}
      {selectedStory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fade-in"
          onClick={() => setSelectedStory(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header bar */}
            <div className="h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-t-2xl" />
            <div className="p-6">
              {/* Close */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xl overflow-hidden flex-shrink-0">
                    {selectedStory.entrepreneur?.photo ? (
                      <img src={`/uploads/${selectedStory.entrepreneur.photo}`} alt="" className="w-full h-full object-cover" />
                    ) : (
                      selectedStory.entrepreneur?.name?.charAt(0)?.toUpperCase() || "U"
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{selectedStory.entrepreneur?.name}</p>
                    {selectedStory.entrepreneur?.location && (
                      <p className="text-xs text-gray-400">📍 {selectedStory.entrepreneur.location}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStory(null)}
                  className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedStory.title}</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{selectedStory.content}</p>

              {selectedStory.images?.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-5">
                  {selectedStory.images.map((img, i) => (
                    <img
                      key={i}
                      src={`/uploads/${img}`}
                      alt="Story"
                      className="w-28 h-28 object-cover rounded-xl border border-gray-200"
                    />
                  ))}
                </div>
              )}

              <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {new Date(selectedStory.createdAt).toLocaleDateString(lang === "en" ? "en-US" : "bn-BD", { year: "numeric", month: "long", day: "numeric" })}
                </span>
                <button
                  onClick={() => setSelectedStory(null)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  {lang === "en" ? "Close" : "বন্ধ করুন"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
