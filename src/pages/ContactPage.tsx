import React, { useState } from 'react';
import { 
  Mail, 
  Building2, 
  CheckCircle2, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Globe2, 
  Send,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { SectionHeading } from '../components/ui/SectionHeading';

export const ContactPage: React.FC = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    inquiryType: 'submit-grant',
    message: '',
  });

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setFormSubmitted(true);
    }
  };

  const faqs = [
    {
      question: 'Is FundEcho free for grant seekers and applicants?',
      answer: 'Yes, FundEcho is 100% free for applicants, students, researchers, founders, and non-profits. We never charge subscription fees or fees to access direct application links to verified funding opportunities.'
    },
    {
      question: 'How does FundEcho verify opportunities?',
      answer: 'Every listing on FundEcho undergoes rigorous editorial vetting. Our research team verifies the authenticity of the granting organization, official registration numbers, funding solvency, and direct official application endpoints to ensure complete protection against scam listings.'
    },
    {
      question: 'How can our organization or foundation list a grant or fellowship?',
      answer: 'Grantmakers and institutional programs can submit calls for applications through our contact form. Our editorial team will review your RFP guidelines and publish your listing to the FundEcho network within 2 business days.'
    },
    {
      question: 'Do you offer direct grant writing services or take commissions?',
      answer: 'No. FundEcho is an open discovery network and neutral technology platform. We never take commissions on awarded grants, nor do we act as an intermediary for official disbursements.'
    },
    {
      question: 'How frequently is the opportunity directory updated?',
      answer: 'Our global database is refreshed on a daily basis with new calls for applications, deadline extensions, and newly announced prize competitions.'
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16 sm:space-y-20 overflow-x-clip">
      {/* Header */}
      <div className="max-w-3xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-200/80 dark:border-indigo-800/80 shadow-2xs">
          <Mail className="w-3.5 h-3.5" />
          <span>Contact & Partnerships</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
          Get in touch with the FundEcho Network.
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
          Have an opportunity to submit, need verification support, or looking to partner with our global platform? We'd love to connect.
        </p>
      </div>

      {/* Main Grid: Form + Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Contact Form (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-lg shadow-slate-200/60 dark:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.42)]">
          {formSubmitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="h-14 w-14 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Inquiry Received</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                Thank you for reaching out to FundEcho. Our editorial and partnerships team will review your message and reply to <strong>{formData.email}</strong> within 24 to 48 hours.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFormSubmitted(false);
                  setFormData({
                    name: '',
                    email: '',
                    organization: '',
                    inquiryType: 'submit-grant',
                    message: '',
                  });
                }}
              >
                Send another message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Send us a message</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Elena Rostova"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-850 transition-all shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Work or Personal Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. elena@foundation.org"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-850 transition-all shadow-2xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Organization / Entity (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Oxford Climate Institute"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-850 transition-all shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Inquiry Type *
                  </label>
                  <select
                    aria-label="Inquiry Type"
                    value={formData.inquiryType}
                    onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-850 transition-all cursor-pointer shadow-2xs"
                  >
                    <option value="submit-grant">Submit a Grant or Opportunity</option>
                    <option value="partnership">Institutional Partnership</option>
                    <option value="verification">Verification & Data Correction</option>
                    <option value="press">Press & Media Inquiries</option>
                    <option value="general">General Question</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Message / Opportunity Details *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide grant details, application link, deadline, or specify your questions..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl p-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-850 transition-all resize-y shadow-2xs"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  fullWidth
                  rightIcon={<Send className="w-4 h-4" />}
                >
                  Send Inquiry to Editorial Team
                </Button>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center mt-2">
                  FundEcho respects your privacy. We will never sell or share your contact data.
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Right: Direct Information Channels (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-lg shadow-slate-200/60 dark:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.42)] space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Direct Communication Channels
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">Grantmaker & Opportunity Submissions</span>
                <span className="text-slate-500 dark:text-slate-400 block mt-0.5">submissions@fundecho.org</span>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium mt-1 block">Avg response: &lt; 24h</span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">Trust, Safety & Verification Desk</span>
                <span className="text-slate-500 dark:text-slate-400 block mt-0.5">verification@fundecho.org</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 block">Direct line to editorial lead</span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">Global Partnerships</span>
                <span className="text-slate-500 dark:text-slate-400 block mt-0.5">partnerships@fundecho.org</span>
                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium mt-1 block">University & foundation alliances</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-xl dark:shadow-[0_15px_30px_rgba(0,0,0,0.48)] space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Scam Prevention Desk</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Encountered a suspicious grant asking for upfront "processing fees"? Report it immediately to <span className="text-white font-medium">safety@fundecho.org</span>.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Accordion Section */}
      <section className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
        <SectionHeading
          badge="Frequently Asked Questions"
          badgeVariant="indigo"
          title="Common Questions About FundEcho"
          subtitle="Everything you need to know about navigating, applying, and listing opportunities."
        />

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 overflow-hidden transition-all shadow-md shadow-slate-200/40 dark:shadow-[0_10px_20px_-5px_rgba(0,0,0,0.36)] hover:shadow-lg dark:hover:shadow-[0_15px_25px_-5px_rgba(0,0,0,0.42)] hover:border-slate-300 dark:hover:border-slate-700"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 focus:outline-none hover:bg-slate-50/80 dark:hover:bg-slate-800/80 transition-colors"
                >
                  <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                    {faq.question}
                  </span>
                  <span className="p-1 rounded-md text-slate-400 dark:text-slate-500">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-5 pb-4 pt-1 text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed border-t border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-850/50">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
