"use client";

import { useState, useEffect, useRef } from "react";
import { sendMessage, getMessages, unlockMessage } from "@/app/actions/message";
import { Send, Lock, Unlock, Image as ImageIcon, FileText, Mic, AlertCircle, ShieldAlert, Sparkles, Star } from "lucide-react";

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

  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    }
  }, [activeConversation]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !attachUrl.trim() && !isLockedMessage) return;
    if (!activeConversation) return;

    setSending(true);
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
        
        // Update conversation last message locally
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConversation
              ? {
                  ...c,
                  lastMessage: inputText || `[Premium File]`,
                  lastMessageAt: new Date().toISOString(),
                }
              : c
          )
        );

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
          alert("Attachment unlocked!");
        }
      } catch (err: any) {
        alert(err?.message || "Failed to unlock message");
      }
    }
  };

  const activeThread = conversations.find((c) => c.id === activeConversation);

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-[#09090b] min-h-[calc(100vh-4rem)]">
      {/* Conversations Panel */}
      <aside className="w-full md:w-80 border-b md:border-b-0 md:border-r border-white/5 bg-card/40 flex flex-col shrink-0">
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
                onClick={() => setActiveConversation(convo.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                  activeConversation === convo.id
                    ? "bg-primary text-white shadow-lg shadow-primary/10"
                    : "text-text-muted hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center font-bold text-sm">
                    {convo.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={convo.image} alt={convo.name} className="w-full h-full object-cover" />
                    ) : (
                      convo.name.charAt(0).toUpperCase()
                    )}
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
                  <span className="w-2.5 h-2.5 bg-primary rounded-full ring-2 ring-background shrink-0 ml-2" />
                )}
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Chat Thread Panel */}
      <section className="flex-1 flex flex-col min-h-0 relative">
        {activeConversation ? (
          <>
            {/* Header info */}
            <div className="p-4 border-b border-white/5 bg-card/30 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center font-bold text-sm">
                {activeThread?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={activeThread.image} alt={activeThread.name} className="w-full h-full object-cover" />
                ) : (
                  activeThread?.name.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h3 className="font-bold text-white text-sm leading-none">{activeThread?.name}</h3>
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
                messages.map((msg) => {
                  const isOwn = msg.senderId === currentUserId;
                  const isPaid = msg.type === "paid";
                  const unlocked = msg.isUnlocked || isOwn;

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-md p-4 rounded-2xl relative ${
                          isOwn
                            ? "bg-gradient-to-tr from-primary to-secondary text-white rounded-tr-none shadow-lg shadow-primary/5"
                            : "bg-card border border-white/5 text-white rounded-tl-none"
                        }`}
                      >
                        {/* Text Content */}
                        {msg.content && (
                          <p className="text-sm leading-relaxed whitespace-pre-line">{msg.content}</p>
                        )}

                        {/* Attachment files or Media */}
                        {msg.mediaUrl && (
                          <div className="mt-3.5">
                            {unlocked ? (
                              <div className="relative rounded-xl overflow-hidden aspect-video border border-white/5 max-w-sm bg-[#121214]">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={msg.mediaUrl}
                                  alt="Attachment"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              /* Locked Message Box Overlay */
                              <div className="relative p-5 rounded-xl bg-black/40 border border-white/5 text-center flex flex-col items-center max-w-sm">
                                <Lock className="w-8 h-8 text-primary mb-2.5 animate-pulse" />
                                <h4 className="font-bold text-xs text-white">Locked Premium Attachment</h4>
                                <p className="text-[10px] text-text-muted mt-1 leading-normal">
                                  Pay ${msg.lockPrice} to view this exclusive file shared by the creator.
                                </p>
                                <button
                                  onClick={() => handleUnlockMsg(msg.id, msg.lockPrice)}
                                  className="mt-4 px-4.5 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-full text-[10px] font-bold transition-all shadow-md"
                                >
                                  Unlock for ${msg.lockPrice}
                                </button>
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
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input field actions */}
            <form onSubmit={handleSend} className="p-4 bg-card/20 border-t border-white/5 space-y-3 relative z-20">
              {/* Media URL attachment field */}
              {attachUrl !== "" && (
                <div className="p-2 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between text-xs">
                  <span className="truncate text-text-muted">{attachUrl}</span>
                  <button
                    type="button"
                    onClick={() => setAttachUrl("")}
                    className="text-red-400 font-bold px-2.5"
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
                  className="p-2.5 text-text-muted hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors shrink-0"
                  title="Simulate Media Upload"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>

                {/* Creator locking control */}
                {activeThread?.role === "creator" && (
                  <button
                    type="button"
                    onClick={() => setIsLockedMessage(!isLockedMessage)}
                    className={`p-2.5 rounded-full transition-all shrink-0 ${
                      isLockedMessage
                        ? "bg-primary text-white"
                        : "text-text-muted bg-white/5 hover:bg-white/10"
                    }`}
                    title="Lock/Unlock Attachment (Creator Only)"
                  >
                    {isLockedMessage ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                  </button>
                )}

                {isLockedMessage && (
                  <div className="flex items-center gap-1.5 shrink-0 bg-white/5 px-3 py-2 border border-white/10 rounded-full">
                    <span className="text-[10px] font-bold text-text-muted uppercase">Lock Price:</span>
                    <input
                      type="number"
                      min={1}
                      value={lockAmount}
                      onChange={(e) => setLockAmount(Number(e.target.value))}
                      className="w-12 bg-transparent text-xs font-bold focus:outline-none border-b border-primary text-white text-center py-px"
                    />
                  </div>
                )}

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    isLockedMessage
                      ? "Add description for locked attachment..."
                      : "Type message or details..."
                  }
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:border-primary focus:outline-none text-sm text-white"
                />

                <button
                  type="submit"
                  disabled={sending}
                  className="p-2.5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-xl shadow-lg shadow-primary/10 transition-all shrink-0"
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
    </div>
  );
}
