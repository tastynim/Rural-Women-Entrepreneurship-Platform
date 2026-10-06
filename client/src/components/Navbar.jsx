import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useLang } from "../context/LanguageContext";
import axios from "axios";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang, toggleLang } = useLang();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [showManageMenu, setShowManageMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bubbles, setBubbles] = useState([]);

  const notifRef = useRef(null);
  const manageRef = useRef(null);
  const lastBubbleTime = useRef(0);

  // Close dropdowns on route change
  useEffect(() => {
    setShowNotifPanel(false);
    setShowManageMenu(false);
    setMobileOpen(false);
  }, [location.pathname]);

  // Fetch unread count every 30s
  useEffect(() => {
    if (!token) return;
    const fetchCount = async () => {
      try {
        const { data } = await axios.get("/api/notifications/unread-count", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUnreadCount(data.count || 0);
      } catch { /* silent */ }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [token]);

  // Fetch notifications when panel opens
  useEffect(() => {
    if (!showNotifPanel || !token) return;
    axios.get("/api/notifications", { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => setNotifications(data))
      .catch(() => {});
  }, [showNotifPanel, token]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifPanel(false);
      if (manageRef.current && !manageRef.current.contains(e.target)) setShowManageMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = async () => {
    try {
      await axios.patch("/api/notifications/read-all", {}, { headers: { Authorization: `Bearer ${token}` } });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch { /* silent */ }
  };

  const markOneRead = async (id) => {
    try {
      await axios.patch(`/api/notifications/${id}/read`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(c => Math.max(0, c - 1));
    } catch { /* silent */ }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const t = (en, bn) => lang === "en" ? en : bn;

  // ── Manage links per role ────────────────────────────────────────────────
  const manageLinks = user?.role === "admin"
    ? [
        { to: "/products/add", label: t("Add Product", "পণ্য যোগ করুন"), icon: "➕" },
        { to: "/orders",       label: t("All Orders", "সব অর্ডার"),       icon: "📦" },
        { to: "/admin",        label: t("Admin Panel", "অ্যাডমিন"),        icon: "⚙️" },
        { to: "/analytics",    label: t("Analytics", "বিশ্লেষণ"),          icon: "📊" },
        { to: "/mentorship",   label: t("Mentorship", "মেন্টরশিপ"),        icon: "🤝" },
        { to: "/skill-certification", label: t("Certifications", "সার্টিফিকেট"), icon: "🎓" },
      ]
    : user?.role === "entrepreneur"
    ? [
        { to: "/products/add", label: t("Add Product", "পণ্য যোগ করুন"), icon: "➕" },
        { to: "/orders",       label: t("My Orders", "আমার অর্ডার"),      icon: "📦" },
        { to: "/mentorship",   label: t("Mentorship", "মেন্টরশিপ"),        icon: "🤝" },
        { to: "/skill-certification", label: t("Certifications", "সার্টিফিকেট"), icon: "🎓" },
      ]
    : user?.role === "customer"
    ? [
        { to: "/orders", label: t("My Orders", "আমার অর্ডার"), icon: "📦" },
      ]
    : [];

  const publicLinks = [
    { to: "/products",        label: t("Products", "পণ্য") },
    { to: "/success-stories", label: t("Stories", "সাফল্যের গল্প") },
    { to: "/resources",       label: t("Resources", "রিসোর্স") },
    { to: "/forum",           label: t("Forum", "ফোরাম") },
    { to: "/reviews",         label: t("Reviews", "রিভিউ") },
  ];

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const navLink = (to, label) => (
    <Link
      key={to}
      to={to}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
        isActive(to)
          ? "bg-white/20 text-white"
          : "text-green-100 hover:bg-white/10 hover:text-white"
      }`}
    >
      {label}
    </Link>
  );

  const handleMouseMove = (e) => {
    const now = Date.now();
    // Spawn a bubble every 50ms
    if (now - lastBubbleTime.current > 50) {
      lastBubbleTime.current = now;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const newBubble = {
        id: now,
        x: x + (Math.random() * 20 - 10), // slight scatter
        y: y + (Math.random() * 10 - 5),
        size: Math.random() * 6 + 4, // 4px to 10px
      };
      
      setBubbles(prev => [...prev.slice(-15), newBubble]); // keep max 15 bubbles at once
      
      // Auto-remove after animation
      setTimeout(() => {
        setBubbles(prev => prev.filter(b => b.id !== newBubble.id));
      }, 1000);
    }
  };

  return (
    <>
      <nav 
        onMouseMove={handleMouseMove}
        className="bg-gradient-to-r from-green-700 via-green-600 to-emerald-600 shadow-lg sticky top-0 z-40 relative group"
      >
        {/* Particle Bubbles Effect Container - this has overflow-hidden so bubbles don't bleed out, but doesn't clip dropdowns */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {bubbles.map(b => (
            <span
              key={b.id}
              className="absolute rounded-full bg-white/60 animate-bubble-float"
              style={{
                left: b.x,
                top: b.y,
                width: b.size,
                height: b.size,
                boxShadow: '0 0 10px rgba(255,255,255,0.8)'
              }}
            />
          ))}
        </div>

        {/* Content wrapper with relative z-index so it sits above the glowing background */}
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex items-center justify-between h-16 gap-2">

            {/* ── Brand ──────────────────────────────────────────── */}
            <Link
              to="/"
              className="flex items-center gap-2 font-extrabold text-white text-lg whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity"
            >
              <span className="text-2xl">🌿</span>
              <span className="hidden sm:block leading-tight">
                {t("Rural Women", "গ্রামীণ নারী")}
              </span>
            </Link>

            {/* ── Public Nav Links (desktop) ──────────────────────── */}
            <div className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
              {publicLinks.map(({ to, label }) => navLink(to, label))}
            </div>

            {/* ── Right section ───────────────────────────────────── */}
            <div className="flex items-center gap-1 shrink-0">

              {user ? (
                <>
                  {/* Chat */}
                  <Link
                    to="/chat"
                    title={t("Chat", "চ্যাট")}
                    className={`p-2 rounded-lg transition-all ${isActive("/chat") ? "bg-white/20" : "hover:bg-white/10"} text-white`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </Link>

                  {/* Cart */}
                  <Link
                    to="/cart"
                    title={t("Cart", "কার্ট")}
                    className={`p-2 rounded-lg transition-all ${isActive("/cart") ? "bg-white/20" : "hover:bg-white/10"} text-white`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </Link>

                  {/* Role-based dropdown */}
                  {manageLinks.length > 0 && (
                    <div className="relative" ref={manageRef}>
                      <button
                        onClick={() => setShowManageMenu(v => !v)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all text-white ${showManageMenu ? "bg-white/20" : "hover:bg-white/10"}`}
                      >
                        {user.role === "admin" ? t("Manage", "ম্যানেজ") : t("My", "আমার")}
                        <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${showManageMenu ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {showManageMenu && (
                        <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-2xl border border-gray-100 py-1.5 animate-slide-down z-50">
                          {manageLinks.map(({ to, label, icon }) => (
                            <Link
                              key={to}
                              to={to}
                              className={`flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-green-50 transition-colors ${isActive(to) ? "bg-green-50 text-green-700 font-medium" : "text-gray-700"}`}
                            >
                              <span className="text-base">{icon}</span>
                              {label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Notification Bell */}
                  <div className="relative" ref={notifRef}>
                    <button
                      onClick={() => setShowNotifPanel(v => !v)}
                      className={`relative p-2 rounded-lg transition-all text-white ${showNotifPanel ? "bg-white/20" : "hover:bg-white/10"}`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </button>

                    {showNotifPanel && (
                      <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-slide-down">
                        <div className="flex justify-between items-center px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100">
                          <h3 className="text-sm font-bold text-gray-800">
                            {t("Notifications", "বিজ্ঞপ্তি")}
                            {unreadCount > 0 && (
                              <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">{unreadCount} new</span>
                            )}
                          </h3>
                          {unreadCount > 0 && (
                            <button onClick={markAllRead} className="text-xs text-green-600 hover:text-green-800 font-medium">
                              {t("Mark all read", "সব পড়া হয়েছে")}
                            </button>
                          )}
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="py-8 text-center text-gray-400 text-sm">
                              <div className="text-3xl mb-2">🔔</div>
                              {t("No notifications yet", "কোনো বিজ্ঞপ্তি নেই")}
                            </div>
                          ) : (
                            notifications.map((n) => (
                              <div
                                key={n._id}
                                onClick={() => {
                                  if (!n.isRead) markOneRead(n._id);
                                  if (n.link) navigate(n.link);
                                  setShowNotifPanel(false);
                                }}
                                className={`px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${!n.isRead ? "bg-green-50/60" : ""}`}
                              >
                                <div className="flex items-start gap-3">
                                  <span className="text-xl mt-0.5">
                                    {n.type === "order" ? "📦" : n.type === "payment" ? "💳" : n.type === "admin" ? "⚙️" : "🔔"}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-semibold text-gray-800 ${!n.isRead ? "text-green-800" : ""}`}>{n.title}</p>
                                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                                    <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                                  </div>
                                  {!n.isRead && <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-1.5" />}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Profile */}
                  <Link
                    to="/profile"
                    className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all text-white ${isActive("/profile") ? "bg-white/20" : "hover:bg-white/10"}`}
                  >
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <span className="hidden xl:block max-w-[80px] truncate">{user.name?.split(" ")[0]}</span>
                  </Link>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    title={t("Logout", "লগআউট")}
                    className="p-2 rounded-lg text-red-200 hover:bg-red-500/20 hover:text-white transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="px-4 py-1.5 text-sm font-medium text-white hover:bg-white/10 rounded-lg transition-all">
                    {t("Login", "লগইন")}
                  </Link>
                  <Link to="/register" className="px-4 py-1.5 text-sm font-bold bg-white text-green-700 rounded-lg hover:bg-green-50 transition-all shadow-sm">
                    {t("Register", "নিবন্ধন")}
                  </Link>
                </>
              )}

              {/* Language toggle */}
              <button
                onClick={toggleLang}
                className="ml-1 px-2.5 py-1 rounded-lg bg-white/15 text-white text-xs font-bold hover:bg-white/25 transition-all border border-white/20"
              >
                {lang === "en" ? "বাং" : "EN"}
              </button>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(v => !v)}
                className="lg:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-all ml-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileOpen
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Nav Menu ──────────────────────────────────────────────── */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-white/10 bg-green-800 animate-slide-down">
            <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
              {publicLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-green-100 hover:bg-white/10 hover:text-white transition-all"
                >
                  {label}
                </Link>
              ))}
              {user && manageLinks.map(({ to, label, icon }) => (
                <Link
                  key={to}
                  to={to}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-green-100 hover:bg-white/10 hover:text-white transition-all flex items-center gap-2"
                >
                  <span>{icon}</span> {label}
                </Link>
              ))}
              {user && (
                <Link to="/profile" className="px-4 py-2 rounded-lg text-sm font-medium text-green-100 hover:bg-white/10 transition-all">
                  👤 {t("Profile", "প্রোফাইল")}
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
