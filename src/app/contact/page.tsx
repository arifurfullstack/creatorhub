"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Mail, Phone, MapPin, Send, MessageCircle, AlertCircle } from "lucide-react";
import { submitContactForm } from "@/app/actions/contact";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await submitContactForm(formData);
      if (res.success) {
        toast.success(res.message);
        setSuccess(true);
        setFormData({ name: "", email: "", subject: "", message: "" });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to submit contact request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-[#09090b] flex flex-col justify-center items-center relative overflow-hidden pt-32 pb-16 px-4 sm:px-6 lg:px-8">
      {/* Background Decorative Blurs */}
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl w-full grid md:grid-cols-12 gap-8 items-stretch relative z-10">
        {/* Left Side: Contact Information */}
        <div className="md:col-span-5 bg-card/40 backdrop-blur-xl border border-white/5 p-8 rounded-3xl flex flex-col justify-between shadow-2xl space-y-8">
          <div className="space-y-4">
            <span className="px-4 py-1.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-black uppercase tracking-wider">
              Get In Touch
            </span>
            <h1 className="text-3xl font-black tracking-tight text-white leading-none mt-2">
              Contact <span className="text-gradient">Support</span>
            </h1>
            <p className="text-xs text-text-muted leading-relaxed">
              Have questions about platform commission cuts, payout schedules, or custom themes? Drop us a line. Our support team responds within 24 hours.
            </p>
          </div>

          {/* Details list */}
          <div className="space-y-6">
            {[
              {
                icon: Mail,
                title: "Email Support",
                value: "support@creatorhub.com",
                desc: "Send general inquiries or ticket reviews",
              },
              {
                icon: Phone,
                title: "Call Us",
                value: "+1 (800) 555-CREATOR",
                desc: "Mon - Fri, 9am - 5pm PST",
              },
              {
                icon: MapPin,
                title: "Headquarters",
                value: "San Francisco, CA",
                desc: "100 Pine St, Suite 2500",
              },
            ].map((detail, idx) => {
              const Icon = detail.icon;
              return (
                <div key={idx} className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-secondary shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">{detail.title}</h4>
                    <p className="text-xs text-secondary font-semibold mt-0.5">{detail.value}</p>
                    <p className="text-[10px] text-text-muted mt-0.5">{detail.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-white/5 pt-6 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 animate-pulse">
              <MessageCircle className="w-4 h-4" />
            </div>
            <p className="text-[10px] text-text-muted">
              Live moderation is active &bull; <span className="text-emerald-400 font-bold">Systems Operational</span>
            </p>
          </div>
        </div>

        {/* Right Side: Form Submission */}
        <div className="md:col-span-7 bg-card border border-white/5 p-8 rounded-3xl shadow-2xl flex flex-col justify-between">
          {success ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-12">
              <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
                <Send className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-extrabold text-white">Message Sent Successfully!</h2>
              <p className="text-xs text-text-muted max-w-sm leading-relaxed">
                Thank you for reaching out to us. We have received your query and assigned it to a support representative. Check your email for further instructions.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="mt-4 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-full text-xs font-bold transition-all border border-white/5"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <h3 className="font-extrabold text-white text-lg">Send Message</h3>
                <p className="text-[10px] text-text-muted mt-0.5">
                  Fields marked with an asterisk (*) are required.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="floating-input-group">
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder=" "
                    className="floating-input floating-input-no-icon"
                  />
                  <label className="floating-label floating-label-no-icon">Your Name *</label>
                </div>
                <div className="floating-input-group">
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder=" "
                    className="floating-input floating-input-no-icon"
                  />
                  <label className="floating-label floating-label-no-icon">Email Address *</label>
                </div>
              </div>

              <div className="floating-input-group">
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder=" "
                  className="floating-input floating-input-no-icon"
                />
                <label className="floating-label floating-label-no-icon">Subject *</label>
              </div>

              <div className="floating-input-group">
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder=" "
                  className="floating-textarea"
                />
                <label className="floating-label floating-label-no-icon">Message Content *</label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-primary to-secondary hover:brightness-110 disabled:opacity-50 text-white font-black rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/10 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    Sending Inquiry...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Contact Form
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
