import React from 'react';
import InfoLayout from '../../components/InfoLayout/InfoLayout';
import { usePageData } from '../../hooks/usePageData';
import { FOOTER_CONTACT, COMPANY_OFFICE, COMPANY_HOURS } from '../../data/constants';
import { MapPin, Phone, Mail, Clock, User, MessageSquare, ShieldCheck, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  InfoPageBody,
  InfoLead,
  InfoSectionTitle,
  InfoText,
  InfoHighlightPanel,
  InfoMetaBadge,
  InfoAlert,
  InfoForm,
  InfoFormRow,
  InfoField,
  InfoInput,
  InfoSelect,
  InfoTextarea,
  InfoSubmit,
  InfoLink,
} from '../../components/InfoLayout/InfoPageUi';

const toastStyle = { background: '#0f172a', color: '#ffffff', borderRadius: '12px' };

export default function ContactUs() {
  const { pageData, loading } = usePageData('contact-us');

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Message sent! Our team will contact you shortly.', { style: toastStyle });
    e.target.reset();
  };

  return (
    <InfoLayout
      title={pageData?.title || 'Contact Us'}
      subtitle="Reach us for property enquiries, seller support, or account help."
    >
      <InfoPageBody loading={loading} cmsHtml={pageData?.content}>
        <InfoLead>
          Call, email, or send a message — our Hyderabad team handles buyer enquiries, listing
          support, and platform assistance during business hours.
        </InfoLead>

        <InfoHighlightPanel>
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-gold">
              Direct contact
            </p>
            <h3 className="mb-3 text-xl font-bold text-white sm:text-2xl">Phone &amp; email</h3>
            <p className="text-sm leading-relaxed text-slate-300">
              For faster help with listings or payments, include your registered phone number or
              property link in your message.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <InfoMetaBadge icon={Clock}>{COMPANY_HOURS.support}</InfoMetaBadge>
            </div>
          </div>
          <div className="flex flex-col justify-center gap-4">
            <a
              href={FOOTER_CONTACT.phoneHref}
              className="inline-flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-3.5 text-white no-underline transition-all hover:border-gold/40 hover:bg-white/15"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/20 text-gold">
                <Phone className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-xs font-medium text-slate-400">Phone</span>
                <span className="text-base font-bold">{FOOTER_CONTACT.phone}</span>
              </span>
            </a>
            <a
              href={FOOTER_CONTACT.emailHref}
              className="inline-flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-3.5 text-white no-underline transition-all hover:border-gold/40 hover:bg-white/15"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/20 text-gold">
                <Mail className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-medium text-slate-400">Email</span>
                <span className="break-all text-base font-bold">{FOOTER_CONTACT.email}</span>
              </span>
            </a>
          </div>
        </InfoHighlightPanel>

        <InfoSectionTitle label="Office">Registered address</InfoSectionTitle>
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 shadow-sm sm:p-6">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <MapPin className="h-5 w-5" />
          </div>
          <h4 className="mb-2 text-base font-semibold text-slate-900">{COMPANY_OFFICE.name}</h4>
          {COMPANY_OFFICE.lines.map((line) => (
            <p key={line} className="text-sm leading-relaxed text-slate-600">
              {line}
            </p>
          ))}
          <p className="mt-4 text-xs font-medium text-slate-500">
            Walk-in visits by prior appointment on working days.
          </p>
        </div>

        <InfoSectionTitle label="Message">Send us a message</InfoSectionTitle>
        <InfoText>
          Share your requirement or issue below. Include city, budget, or a property URL when
          relevant.
        </InfoText>
        <InfoForm onSubmit={handleSubmit}>
          <InfoFormRow>
            <InfoField label="Full Name" icon={User}>
              <InfoInput icon type="text" name="name" placeholder="Your full name" required />
            </InfoField>
            <InfoField label="Email Address" icon={Mail}>
              <InfoInput icon type="email" name="email" placeholder="you@example.com" required />
            </InfoField>
          </InfoFormRow>
          <InfoFormRow>
            <InfoField label="Phone Number" icon={Phone}>
              <InfoInput icon type="tel" name="phone" placeholder="+91 00000 00000" required />
            </InfoField>
            <InfoField label="Topic" icon={MessageSquare}>
              <InfoSelect icon name="topic" defaultValue="general" required>
                <option value="general">General enquiry</option>
                <option value="buying">Buying a property</option>
                <option value="listing">Listing / subscription</option>
                <option value="technical">Account or technical issue</option>
              </InfoSelect>
            </InfoField>
          </InfoFormRow>
          <InfoField label="Message" icon={MessageSquare} multiline>
            <InfoTextarea
              icon
              name="message"
              rows={5}
              placeholder="How can we help you?"
              required
            />
          </InfoField>
          <InfoSubmit>
            Submit message
            <ArrowRight className="h-4 w-4" />
          </InfoSubmit>
        </InfoForm>

        <InfoAlert variant="success" icon={ShieldCheck} title="Response time">
          We aim to reply within 1–2 business days. For formal complaints, use our{' '}
          <InfoLink to="/grievances" className="text-emerald-800">
            Grievances
          </InfoLink>{' '}
          page. To report fraud or suspicious listings, see{' '}
          <InfoLink to="/report-problem" className="text-emerald-800">
            Report a Problem
          </InfoLink>
          .
        </InfoAlert>
      </InfoPageBody>
    </InfoLayout>
  );
}
