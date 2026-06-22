"use client";

import { useState, useEffect, useRef } from "react";
import { sendMessage, getMessages, unlockMessage, markMessagesAsRead } from "@/app/actions/message";
import { ArrowLeft, Send, Lock, Unlock, Image as ImageIcon, Sparkles, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { io } from "socket.io-client";
import ImageLightbox from "@/components/shared/image-lightbox";
import VideoPlayer from "@/components/shared/video-player";

interface Conversation {
  id: string;
  name: string;
  image: string | null;
  role: string;
  lastMessage: string;
  lastMessageAt: string;
  unread: boolean;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string | null;
  type: string;
  mediaUrl: string | null;
  lockPrice: number;
  isUnlocked: boolean;
  isRead: boolean;
  createdAt: string;
}

const playIncomingMessageSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    
    // Friendly high-fidelity synthesized double chime
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
    
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    
    osc1.start(now);
    osc1.stop(now + 0.4);

    const delay = 0.08;
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880, now + delay); // A5
    osc2.frequency.exponentialRampToValueAtTime(1174.66, now + delay + 0.12); // D6
    
    gain2.gain.setValueAtTime(0.10, now + delay);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.35);
    
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    
    osc2.start(now + delay);
    osc2.stop(now + delay + 0.4);
  } catch (e) {
    console.warn("Could not play notification sound:", e);
  }
};

export default function MessagesClient({
  initialConversations,
  currentUserId,
  chattingWithUserId,
}: {
  initialConversations: Conversation[];
  currentUserId: string;
  chattingWithUserId: string | null;
}) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [activeConversation, setActiveConversation] = useState<string | null>(chattingWithUserId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLockedMessage, setIsLockedMessage] = useState(false);
  const [lockAmount, setLockAmount] = useState(5);
  const [attachUrl, setAttachUrl] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(!!chattingWithUserId);

  // Lightbox States
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxSlides, setLightboxSlides] = useState<{ src: string; title?: string; description?: string }[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);
  const activeConversationRef = useRef<string | null>(activeConversation);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    activeConversationRef.current = activeConversation;
  }, [activeConversation]);

  // Load chat history when active conversation changes
  useEffect(() => {
    if (activeConversation) {
      setLoadingMessages(true);
      getMessages(activeConversation)
        .then((data) => {
          setMessages(data);
          // Set unread count to false locally for the opened conversation
          setConversations((prev) =>
            prev.map((c) => (c.id === activeConversation ? { ...c, unread: false } : c))
          );
        })
        .catch(console.error)
        .finally(() => setLoadingMessages(false));

      // Reset typing status on channel change
      setIsTyping(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      socketRef.current?.emit("typing", {
        senderId: currentUserId,
        receiverId: activeConversation,
        isTyping: false,
      });
    }
  }, [activeConversation, currentUserId]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Setup Socket client connection and listeners
  useEffect(() => {
    if (socketRef.current) return;

    // Dynamically trigger the socket server initialization
    fetch("/api/socket").finally(() => {
      if (socketRef.current) return;

      const socket = io({
        path: "/api/socket",
        addTrailingSlash: false,
        transports: ["websocket"],
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("Socket client connected, joining user room:", currentUserId);
        socket.emit("join", currentUserId);
      });

      socket.on("new-message", (message: Message) => {
        console.log("Socket client received new-message:", message);
        
        // Play notification chime for incoming messages from other users
        if (message.senderId !== currentUserId) {
          playIncomingMessageSound();
        }
        
        // Append message in real-time if from the user we are chatting with
        if (message.senderId === activeConversationRef.current) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === message.id)) return prev;
            return [...prev, message];
          });

          // Mark it as read in the database immediately so notification badges clear
          markMessagesAsRead(message.senderId).catch(console.error);
        }

        // Update target conversation snippet and bump to top
        setConversations((prev) => {
          const partnerId = message.senderId === currentUserId ? message.receiverId : message.senderId;
          const exists = prev.some((c) => c.id === partnerId);
          if (exists) {
            return prev.map((c) => {
              if (c.id === partnerId) {
                const isFromOther = message.senderId !== currentUserId;
                const isCurrentlyChatting = activeConversationRef.current === partnerId;
                return {
                  ...c,
                  lastMessage: message.content || `[${message.type} file]`,
                  lastMessageAt: message.createdAt,
                  unread: isFromOther && !isCurrentlyChatting ? true : c.unread,
                };
              }
              return c;
            }).sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
          }
          return prev;
        });
      });

      socket.on("typing-status", (data: { senderId: string; receiverId: string; isTyping: boolean }) => {
        if (data.senderId === activeConversationRef.current) {
          setIsTyping(data.isTyping);
        }
      });

      socket.on("disconnect", () => {
        console.log("Socket client disconnected");
      });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [currentUserId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    
    if (!activeConversation || !socketRef.current) return;

    socketRef.current.emit("typing", {
      senderId: currentUserId,
      receiverId: activeConversation,
      isTyping: true,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit("typing", {
        senderId: currentUserId,
        receiverId: activeConversation,
        isTyping: false,
      });
    }, 2000);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !attachUrl.trim() && !isLockedMessage) return;
    if (!activeConversation) return;

    setSending(true);
    
    // Clear local user typing indicator immediately
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    socketRef.current?.emit("typing", {
      senderId: currentUserId,
      receiverId: activeConversation,
      isTyping: false,
    });

    try {
      const type = isLockedMessage ? "paid" : attachUrl.trim() ? "image" : "text";
      const response = await sendMessage({
        receiverId: activeConversation,
        content: inputText,
        type,
        mediaUrl: attachUrl.trim() || undefined,
        lockPrice: isLockedMessage ? lockAmount : 0,
      });

      if (response.success && response.message) {
        setMessages((prev) => [...prev, response.message as any]);
        
        // Update conversation last message locally and sort list
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConversation
              ? {
                  ...c,
                  lastMessage: inputText || `[Premium File]`,
                  lastMessageAt: new Date().toISOString(),
                }
              : c
          ).sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
        );

        // Emit new message via WebSockets to the recipient
        socketRef.current?.emit("send-message", response.message);

        // Reset inputs
        setInputText("");
        setIsLockedMessage(false);
        setLockAmount(5);
        setAttachUrl("");
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  const handleUnlockMsg = async (messageId: string, price: number) => {
    if (confirm(`Unlock this premium attachment for $${price}? (Simulated transaction)`)) {
      try {
        const response = await unlockMessage(messageId);
        if (response.success) {
          setMessages((prev) =>
            prev.map((msg) => (msg.id === messageId ? { ...msg, isUnlocked: true } : msg))
          );
          toast.success("Attachment unlocked successfully!");
        }
      } catch (err: any) {
        toast.error(err?.message || "Failed to unlock message");
      }
    }
  };

  const activeThread = conversations.find((c) => c.id === activeConversation);

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-transparent min-h-[calc(100vh-4rem)] pt-20 md:pt-24">
      {/* Conversations Panel */}
      <aside className={`w-full md:w-80 border-b md:border-b-0 md:border-r border-white/5 bg-card/20 backdrop-blur-md flex flex-col shrink-0 ${
        mobileShowChat ? "hidden md:flex" : "flex"
      }`}>
        <div className="p-4 border-b border-white/5">
          <h2 className="font-extrabold text-white text-base">Direct Messages</h2>
          <p className="text-xs text-text-muted mt-0.5">Engage with fans and creators</p>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.length === 0 ? (
            <p className="text-xs text-text-muted p-4 text-center">No active chats found.</p>
          ) : (
            conversations.map((convo) => (
              <button
                key={convo.id}
                onClick={() => {
                  setActiveConversation(convo.id);
                  setMobileShowChat(true);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                  activeConversation === convo.id
                    ? "bg-primary text-white shadow-lg shadow-primary/10"
                    : "text-text-muted hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center font-bold text-sm">
                      {convo.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={convo.image} alt={convo.name} className="w-full h-full object-cover" />
                      ) : (
                        convo.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    {/* Glowing Online Pulse Status Dot */}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[#09090b] shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" />
                  </div>
                  <div className="text-left truncate">
                    <div className="flex items-center gap-1">
                      <p className="font-bold text-sm leading-none">{convo.name}</p>
                      {convo.role === "creator" && (
                        <Star className="w-3.5 h-3.5 fill-primary text-primary shrink-0" />
                      )}
                    </div>
                    <p className={`text-xs mt-1 truncate ${activeConversation === convo.id ? "text-white/80" : "text-text-muted"}`}>
                      {convo.lastMessage}
                    </p>
                  </div>
                </div>

                {convo.unread && (
                  <span className="w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-background shadow-[0_0_8px_rgba(244,63,94,0.7)] shrink-0 ml-2 animate-pulse" />
                )}
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Chat Thread Panel */}
      <section className={`flex-1 flex flex-col min-h-0 relative ${
        mobileShowChat ? "flex" : "hidden md:flex"
      }`}>
        {activeConversation ? (
          <>
            {/* Header info */}
            <div className="p-4 border-b border-white/5 bg-card/30 flex items-center gap-3">
              {/* Mobile View Toggle Back Button */}
              <button
                type="button"
                onClick={() => setMobileShowChat(false)}
                className="md:hidden p-2 text-text-muted hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors mr-1 shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center font-bold text-sm">
                  {activeThread?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={activeThread.image} alt={activeThread.name} className="w-full h-full object-cover" />
                  ) : (
                    activeThread?.name.charAt(0).toUpperCase()
                  )}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[#09090b] shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-white text-sm leading-none">{activeThread?.name}</h3>
                  {activeThread?.role === "creator" && (
                    <Star className="w-3.5 h-3.5 fill-primary text-primary shrink-0" />
                  )}
                </div>
                <p className="text-[10px] text-text-muted mt-1 uppercase tracking-wider font-semibold capitalize">
                  {activeThread?.role} Account
                </p>
              </div>
            </div>

            {/* Chat history bubbles */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loadingMessages ? (
                <div className="flex justify-center items-center h-full">
                  <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-16 text-text-muted text-xs">
                  <Sparkles className="w-8 h-8 text-primary/30 mx-auto mb-3" />
                  Say hello! Start the conversation.
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence initial={false}>
                    {messages.map((msg) => {
                      const isOwn = msg.senderId === currentUserId;
                      const isPaid = msg.type === "paid";
                      const unlocked = msg.isUnlocked || isOwn;

                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 15, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 140, damping: 15 }}
                          className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-md p-4 rounded-2xl relative backdrop-blur-sm transition-all ${
                              isOwn
                                ? "bg-gradient-to-tr from-primary to-secondary text-white rounded-tr-none border border-white/10 shadow-lg shadow-primary/10"
                                : "bg-white/[0.04] border border-white/5 text-white rounded-tl-none shadow-md hover:bg-white/[0.06]"
                            }`}
                          >
                            {/* Text Content */}
                            {msg.content && (
                              <div className="flex items-start gap-1.5">
                                <p className="text-sm leading-relaxed whitespace-pre-line">{msg.content}</p>
                                {!isOwn && activeThread?.role === "creator" && (
                                  <Star className="w-3 h-3 fill-primary text-primary shrink-0 mt-1" />
                                )}
                              </div>
                            )}

                            {/* Attachment files or Media */}
                            {msg.mediaUrl && (
                              <div className="mt-3.5">
                                {unlocked ? (
                                  msg.mediaUrl.toLowerCase().match(/\.(mp4|webm|ogg|mov|m4v)$/) || msg.type === "video" ? (
                                    <div className="max-w-sm w-full">
                                      <VideoPlayer src={msg.mediaUrl} />
                                    </div>
                                  ) : (
                                    <div 
                                      className="relative rounded-xl overflow-hidden aspect-video border border-white/5 max-w-sm bg-[#121214] cursor-zoom-in"
                                      onClick={() => {
                                        const imageMsgs = messages.filter(
                                          (m) => m.mediaUrl && 
                                                 !(m.mediaUrl.toLowerCase().match(/\.(mp4|webm|ogg|mov|m4v)$/) || m.type === "video") &&
                                                 (m.senderId === currentUserId || m.isUnlocked)
                                        );
                                        const slides = imageMsgs.map((m) => ({
                                          src: m.mediaUrl as string,
                                          title: m.content || "Attachment",
                                          description: new Date(m.createdAt).toLocaleString(),
                                        }));
                                        const clickedIdx = imageMsgs.findIndex((m) => m.id === msg.id);
                                        
                                        if (slides.length > 0) {
                                          setLightboxSlides(slides);
                                          setLightboxIndex(clickedIdx >= 0 ? clickedIdx : 0);
                                          setLightboxOpen(true);
                                        }
                                      }}
                                    >
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img
                                        src={msg.mediaUrl}
                                        alt="Attachment"
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  )
                                ) : (
                                  /* Premium Locked Message Overlay (Bluer backdrop-blur-2xl styled) */
                                  <div className="relative overflow-hidden rounded-xl border border-white/5 max-w-sm bg-[#121214]">
                                    {/* Blurred backdrop image to simulate bluer/blurred content */}
                                    <div className="absolute inset-0 bg-[#0c102b]/60 backdrop-blur-2xl z-0" />
                                    
                                    {/* Glassmorphic card overlay */}
                                    <div className="relative p-6 text-center flex flex-col items-center z-10">
                                      <div className="w-12 h-12 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(236,72,153,0.15)]">
                                        <Lock className="w-5 h-5 text-primary animate-pulse" />
                                      </div>
                                      <h4 className="font-bold text-xs text-white">Locked Premium Attachment</h4>
                                      <p className="text-[10px] text-text-muted mt-1.5 leading-normal max-w-[200px]">
                                        Unlock this exclusive file shared by the creator for <span className="text-white font-semibold">${msg.lockPrice}</span>.
                                      </p>
                                      <button
                                        onClick={() => handleUnlockMsg(msg.id, msg.lockPrice)}
                                        className="mt-4 px-5 py-2 bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary-hover text-white rounded-full text-[10px] font-bold transition-all shadow-lg hover:shadow-primary/20 active:scale-95 cursor-pointer"
                                      >
                                        Unlock for ${msg.lockPrice}
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            <span className="block text-[9px] text-white/50 text-right mt-1.5">
                              {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.9 }}
                      className="flex justify-start"
                    >
                      <div className="bg-white/[0.04] border border-white/5 backdrop-blur-md text-white max-w-md p-3.5 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-md">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        <span className="text-[10px] text-text-muted ml-1.5 font-medium tracking-wide">
                          {activeThread?.name} is typing...
                        </span>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input field actions */}
            <form onSubmit={handleSend} className="p-4 bg-black/40 backdrop-blur-2xl border-t border-white/5 space-y-3 relative z-20 shadow-[0_-8px_32px_rgba(0,0,0,0.4)]">
              {/* Media URL attachment field */}
              {attachUrl !== "" && (
                <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between text-xs backdrop-blur-md">
                  <span className="truncate text-text-muted font-medium">{attachUrl}</span>
                  <button
                    type="button"
                    onClick={() => setAttachUrl("")}
                    className="text-red-400 font-semibold hover:text-red-300 transition-colors px-2.5 py-1 hover:bg-white/5 rounded-lg"
                  >
                    Remove
                  </button>
                </div>
              )}

              <div className="flex gap-3 items-center">
                {/* Simulated file attachments */}
                <button
                  type="button"
                  onClick={() => {
                    const url = prompt("Enter simulated image URL attachment:");
                    if (url) setAttachUrl(url);
                  }}
                  className="p-2.5 text-text-muted hover:text-white rounded-full bg-white/5 hover:bg-white/10 hover:scale-105 active:scale-95 transition-all shrink-0 border border-white/5"
                  title="Simulate Media Upload"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>

                {/* Creator locking control */}
                {activeThread?.role === "creator" && (
                  <button
                    type="button"
                    onClick={() => setIsLockedMessage(!isLockedMessage)}
                    className={`p-2.5 rounded-full hover:scale-105 active:scale-95 transition-all shrink-0 border ${
                      isLockedMessage
                        ? "bg-primary text-white border-primary/20 shadow-md shadow-primary/25"
                        : "text-text-muted bg-white/5 hover:bg-white/10 border-white/5"
                    }`}
                    title="Lock/Unlock Attachment (Creator Only)"
                  >
                    {isLockedMessage ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                  </button>
                )}

                {isLockedMessage && (
                  <div className="flex items-center gap-1.5 shrink-0 bg-white/5 px-3.5 py-2 border border-white/10 rounded-full backdrop-blur-md">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Price:</span>
                    <span className="text-white text-xs font-bold">$</span>
                    <input
                      type="number"
                      min={1}
                      value={lockAmount}
                      onChange={(e) => setLockAmount(Number(e.target.value))}
                      className="w-10 bg-transparent text-xs font-bold focus:outline-none border-b border-primary text-white text-center py-px"
                    />
                  </div>
                )}

                <div className="relative flex-1">
                  <input
                    type="text"
                    value={inputText}
                    onChange={handleInputChange}
                    placeholder={
                      isLockedMessage
                        ? "Add description for locked attachment..."
                        : "Type message or details..."
                    }
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:border-primary/50 focus:bg-white/[0.08] focus:ring-1 focus:ring-primary/20 focus:outline-none text-sm text-white transition-all placeholder:text-text-muted/65"
                  />
                  <div className="absolute inset-0 rounded-xl pointer-events-none border border-transparent focus-within:border-primary/30 transition-all" />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="p-2.5 btn-liquid disabled:opacity-50 text-white rounded-xl shadow-lg shadow-primary/10 hover:scale-105 active:scale-95 transition-all shrink-0"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center text-center p-6 text-text-muted">
            <Send className="w-12 h-12 text-primary/30 mb-4 animate-bounce" />
            <h4 className="font-bold text-white text-base mb-1">Select a Conversation</h4>
            <p className="text-xs max-w-xs leading-relaxed">
              Choose an active participant thread from the sidebar or visit creator profiles to start chatting.
            </p>
          </div>
        )}
      </section>

      <ImageLightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={lightboxSlides}
        index={lightboxIndex}
      />
    </div>
  );
}
