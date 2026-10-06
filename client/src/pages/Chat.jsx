import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import { useLang } from "../context/LanguageContext";

// Socket.io runs on the Express server (port 5000), not the Vite dev server (port 3000)
const SOCKET_URL = "http://localhost:5000";

let socket = null;

export default function Chat() {
  const navigate = useNavigate();
  const { lang } = useLang();
  const token = localStorage.getItem("token");
  const me = JSON.parse(localStorage.getItem("user") || "null");
  const myId = String(me?._id || "");

  const [users, setUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUserId, setTypingUserId] = useState(null);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [tab, setTab] = useState("conversations");

  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);
  // Keep a ref to the active conversation ID so socket callbacks can read it
  const activeConvIdRef = useRef(null);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }

    socket = io(SOCKET_URL, { auth: { token } });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    socket.on("online-users", (ids) => setOnlineUsers(ids));

    socket.on("new-message", (msg) => {
      // Only add message if it belongs to the currently open conversation
      if (!activeConvIdRef.current) return;
      if (String(msg.conversation) !== activeConvIdRef.current) return;
      setMessages((prev) => {
        if (prev.find((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    });

    socket.on("typing", ({ userId, isTyping }) => {
      setTypingUserId(isTyping ? userId : null);
    });

    fetchConversations();
    fetchUsers();

    return () => {
      socket?.disconnect();
      socket = null;
    };
  }, [token]);

  // Keep ref in sync with state
  useEffect(() => {
    activeConvIdRef.current = activeConv?._id || null;
  }, [activeConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUserId]);

  const fetchConversations = async () => {
    try {
      const { data } = await axios.get("/api/chat/conversations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConversations(data);
    } catch { /* silent */ }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get("/api/chat/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(data);
    } catch { /* silent */ }
  };

  const openConversation = useCallback(async (conv) => {
    setActiveConv(conv);
    activeConvIdRef.current = conv._id;
    setMessages([]);
    setLoadingMsgs(true);
    // Join the socket room before loading messages so we don't miss any
    socket?.emit("join-conversation", conv._id);
    try {
      const { data } = await axios.get(
        `/api/chat/conversations/${conv._id}/messages`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(data);
    } catch { /* silent */ }
    setLoadingMsgs(false);
  }, [token]);

  const startChatWith = async (userId) => {
    try {
      const { data } = await axios.post(
        "/api/chat/conversations",
        { recipientId: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setConversations((prev) => {
        if (prev.find((c) => c._id === data._id)) return prev;
        return [data, ...prev];
      });
      setTab("conversations");
      openConversation(data);
    } catch { /* silent */ }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || !activeConv) return;
    setText("");
    socket?.emit("send-message", { conversationId: activeConv._id, text: trimmed });
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    if (!activeConv) return;
    socket?.emit("typing", { conversationId: activeConv._id, isTyping: true });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket?.emit("typing", { conversationId: activeConv._id, isTyping: false });
    }, 1500);
  };

  // Return the OTHER participant (not the logged-in user)
  const getOtherParticipant = (conv) =>
    conv.participants?.find((p) => String(p._id) !== myId);

  const isOnline = (userId) => onlineUsers.includes(String(userId));

  if (!me) return null;

  return (
    <div className="relative min-h-[calc(100vh-64px)] bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30 overflow-hidden">
      
      <div className="relative z-10 py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pointer-events-none">
        
        {/* We add pointer-events-none to the wrapper to let mouse events pass through to the canvas, 
            and pointer-events-auto to the interactive elements */}
        <div className="flex items-center gap-3 mb-6 animate-fade-in-up pointer-events-auto">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {lang === "en" ? "Real-Time Chat" : "রিয়েল-টাইম চ্যাট"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {lang === "en" ? "Connect instantly with your peers" : "আপনার সহকর্মীদের সাথে অবিলম্বে সংযোগ করুন"}
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-0 h-[75vh] bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 overflow-hidden animate-scale-in pointer-events-auto">
          
          {/* ── Left sidebar ── */}
          <div className="w-full md:w-80 flex flex-col bg-gray-50/50 border-r border-gray-100 flex-shrink-0">
            {/* Tabs */}
            <div className="flex p-3 gap-2 border-b border-gray-100/50 bg-white/30 backdrop-blur-sm">
              <button
                onClick={() => setTab("conversations")}
                className={`flex-1 py-2.5 px-4 text-sm font-bold rounded-xl transition-all duration-200 ${
                  tab === "conversations"
                    ? "bg-white text-emerald-700 shadow-sm ring-1 ring-gray-100"
                    : "text-gray-500 hover:bg-white/50 hover:text-gray-700"
                }`}
              >
                {lang === "en" ? "Chats" : "চ্যাট"}
              </button>
              <button
                onClick={() => setTab("users")}
                className={`flex-1 py-2.5 px-4 text-sm font-bold rounded-xl transition-all duration-200 ${
                  tab === "users"
                    ? "bg-white text-emerald-700 shadow-sm ring-1 ring-gray-100"
                    : "text-gray-500 hover:bg-white/50 hover:text-gray-700"
                }`}
              >
                {lang === "en" ? "New Chat" : "নতুন চ্যাট"}
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
              {tab === "conversations" && (
                conversations.length === 0 ? (
                  <div className="py-16 flex flex-col items-center justify-center text-center px-6">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-500">
                      {lang === "en" ? "No conversations yet." : "কোনো চ্যাট নেই।"}
                    </p>
                    <button onClick={() => setTab("users")} className="mt-3 text-sm text-emerald-600 font-bold hover:text-emerald-700">
                      {lang === "en" ? "Start a new one" : "নতুন শুরু করুন"} →
                    </button>
                  </div>
                ) : (
                  conversations.map((conv, idx) => {
                    const other = getOtherParticipant(conv);
                    const isActive = activeConv?._id === conv._id;
                    return (
                      <button
                        key={conv._id}
                        onClick={() => openConversation(conv)}
                        style={{ animationDelay: `${idx * 0.05}s` }}
                        className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all duration-200 text-left animate-fade-in-up mb-1
                          ${isActive 
                            ? "bg-white shadow-sm ring-1 ring-gray-100 before:absolute before:left-2 before:w-1 before:h-8 before:bg-emerald-500 before:rounded-full relative" 
                            : "hover:bg-white/60 text-gray-600"}`}
                      >
                        <div className="relative flex-shrink-0 ml-1">
                          {other?.photo ? (
                            <img src={`/uploads/${other.photo}`} alt="" className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-emerald-700 font-bold text-lg ring-2 ring-white shadow-sm">
                              {other?.name?.[0]?.toUpperCase() || "?"}
                            </div>
                          )}
                          {isOnline(other?._id) && (
                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white shadow-sm" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="flex justify-between items-baseline mb-0.5">
                            <p className={`text-sm font-bold truncate ${isActive ? "text-gray-900" : "text-gray-700"}`}>
                              {other?.name || "Unknown"}
                            </p>
                          </div>
                          <p className={`text-xs truncate ${isActive ? "text-gray-600 font-medium" : "text-gray-400"}`}>
                            {conv.lastMessage || "Start chatting..."}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )
              )}

              {tab === "users" && (
                users.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 text-sm px-4 font-medium">
                    {lang === "en" ? "No users available to chat with." : "কোনো ব্যবহারকারী পাওয়া যায়নি।"}
                  </div>
                ) : (
                  users.map((u, idx) => (
                    <button
                      key={u._id}
                      onClick={() => startChatWith(u._id)}
                      style={{ animationDelay: `${idx * 0.05}s` }}
                      className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-white/60 transition-all duration-200 text-left animate-fade-in-up mb-1"
                    >
                      <div className="relative flex-shrink-0 ml-1">
                        {u.photo ? (
                          <img src={`/uploads/${u.photo}`} alt="" className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center text-indigo-700 font-bold text-lg ring-2 ring-white shadow-sm">
                            {u.name?.[0]?.toUpperCase() || "?"}
                          </div>
                        )}
                        {isOnline(u._id) && (
                          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white shadow-sm" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate">{u.name}</p>
                        <p className="text-xs text-gray-500 capitalize font-medium">{u.role}{u.location ? ` • ${u.location}` : ""}</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                    </button>
                  ))
                )
              )}
            </div>
          </div>

          {/* ── Chat area ── */}
          <div className="flex-1 flex flex-col bg-white relative">
            {!activeConv ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/30 backdrop-blur-sm z-10">
                <div className="w-24 h-24 bg-white rounded-full shadow-sm flex items-center justify-center mb-6 animate-bounce-in">
                  <svg className="w-12 h-12 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {lang === "en" ? "Your Messages" : "আপনার বার্তা"}
                </h3>
                <p className="text-sm font-medium text-gray-500">
                  {lang === "en" ? "Select a conversation to start chatting" : "চ্যাট শুরু করতে একটি কথোপকথন বেছে নিন"}
                </p>
              </div>
            ) : (
              <>
                {/* Chat header */}
                {(() => {
                  const other = getOtherParticipant(activeConv);
                  return (
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white/80 backdrop-blur-md z-10 shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          {other?.photo ? (
                            <img src={`/uploads/${other.photo}`} alt="" className="w-11 h-11 rounded-full object-cover ring-2 ring-gray-50" />
                          ) : (
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-emerald-700 font-bold text-lg ring-2 ring-gray-50">
                              {other?.name?.[0]?.toUpperCase() || "?"}
                            </div>
                          )}
                          {isOnline(other?._id) && (
                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
                          )}
                        </div>
                        <div>
                          <h2 className="font-extrabold text-gray-900">{other?.name || "Unknown"}</h2>
                          <p className="text-xs font-semibold mt-0.5 flex items-center gap-1.5">
                            {isOnline(other?._id) ? (
                              <><span className="w-2 h-2 rounded-full bg-green-500"></span><span className="text-green-600">{lang === "en" ? "Online" : "অনলাইন"}</span></>
                            ) : (
                              <><span className="w-2 h-2 rounded-full bg-gray-300"></span><span className="text-gray-500">{lang === "en" ? "Offline" : "অফলাইন"}</span></>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-gray-50/30 custom-scrollbar">
                  {loadingMsgs ? (
                    <div className="flex justify-center py-10">
                      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                      <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center">
                        <span className="text-3xl">👋</span>
                      </div>
                      <p className="text-gray-500 font-medium">
                        {lang === "en" ? "Say hello to start the conversation!" : "হ্যালো বলে চ্যাট শুরু করুন!"}
                      </p>
                    </div>
                  ) : (
                    messages.map((msg, index) => {
                      const senderId = String(msg.sender?._id || msg.sender || "");
                      const isMine = senderId === myId;
                      // Grouping messages from the same sender
                      const prevMsg = index > 0 ? messages[index - 1] : null;
                      const showAvatar = !isMine && (!prevMsg || String(prevMsg.sender?._id || prevMsg.sender) !== senderId);

                      return (
                        <div key={msg._id} className={`flex ${isMine ? "justify-end" : "justify-start"} ${showAvatar ? "mt-6" : "mt-1"}`}>
                          {!isMine && (
                            <div className="w-8 flex-shrink-0 mr-3 flex flex-col justify-end pb-1">
                              {showAvatar && (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center text-indigo-700 font-bold text-xs shadow-sm">
                                  {msg.sender?.name?.[0]?.toUpperCase() || "?"}
                                </div>
                              )}
                            </div>
                          )}
                          <div className={`max-w-[75%] lg:max-w-[65%] group relative ${
                            isMine
                              ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md rounded-2xl rounded-tr-sm"
                              : "bg-white text-gray-800 shadow-sm border border-gray-100/80 rounded-2xl rounded-tl-sm"
                          } px-4 py-2.5 hover:shadow-md transition-shadow`}>
                            <p className="leading-relaxed text-[15px]">{msg.text}</p>
                            <div className={`text-[10px] font-medium mt-1 flex justify-end ${isMine ? "text-emerald-100/80" : "text-gray-400"}`}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}

                  {/* Typing indicator */}
                  {typingUserId && typingUserId !== myId && (
                    <div className="flex justify-start mt-4">
                      <div className="w-8 flex-shrink-0 mr-3"></div>
                      <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} className="h-2" />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-gray-100 z-10">
                  <form onSubmit={sendMessage} className="flex items-end gap-3 bg-gray-50/80 p-1.5 rounded-3xl border border-gray-200/60 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-300 transition-all shadow-sm">
                    <div className="flex-1 min-h-[44px] flex items-center px-4">
                      <input
                        type="text"
                        value={text}
                        onChange={handleTyping}
                        placeholder={lang === "en" ? "Type a message…" : "বার্তা লিখুন…"}
                        className="w-full bg-transparent text-sm focus:outline-none text-gray-800 placeholder-gray-400"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!text.trim()}
                      className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-full flex items-center justify-center hover:shadow-lg disabled:opacity-40 disabled:hover:shadow-none disabled:cursor-not-allowed transition-all flex-shrink-0"
                    >
                      <svg className="w-5 h-5 translate-x-0.5 -translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
