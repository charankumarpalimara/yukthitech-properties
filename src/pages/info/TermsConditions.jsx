import React from 'react';
import InfoLayout from '../../components/InfoLayout/InfoLayout';
import { usePageData } from '../../hooks/usePageData';
import { Scale, ShieldCheck, UserX, FileText, Calendar, ShieldAlert, RefreshCw } from 'lucide-react';
import {
  InfoPageBody,
  InfoLead,
  InfoMetaBadge,
  InfoListCard,
  InfoAlert,
  InfoMailLink,
} from '../../components/InfoLayout/InfoPageUi';
import { COMPANY_EMAILS } from '../../data/constants';

const termsSections = [
  {
    icon: ShieldCheck,
    title: '1. Use of the platform',
    desc: 'You must be 18 or older to create an account or interact with listings. The site is for personal property research and legitimate transactions. Automated scraping or bulk data harvesting is not permitted.',
  },
  {
    icon: ShieldAlert,
    title: '2. Listing accuracy',
    desc: 'Property details are submitted by sellers, builders, and agents. Yukthi Properties is an intermediary platform and does not guarantee that every field on a listing is error-free. Buyers should verify details independently before paying or signing.',
  },
  {
    icon: UserX,
    title: '3. User conduct',
    desc: 'You may not post misleading listings, harass other users, or use the platform for fraud. We may suspend or remove accounts that violate these terms.',
  },
  {
    icon: FileText,
    title: '4. Intellectual property',
    desc: 'Software, branding, layout, and content created by Yukthi Properties remain our property. You may not copy or redistribute platform materials without permission.',
  },
  {
    icon: Scale,
    title: '5. Limitation of liability',
    desc: 'To the extent permitted by law, Yukthi Properties is not liable for indirect losses, transaction disputes between users, or decisions made based on listing information.',
  },
  {
    icon: RefreshCw,
    title: '6. Changes to these terms',
    desc: 'We may update these terms from time to time. Continued use of the platform after changes are posted constitutes acceptance of the revised terms.',
  },
];

export default function TermsConditions() {
  const { pageData, loading } = usePageData('terms-conditions');

  return (
    <InfoLayout
      title={pageData?.title || 'Terms & Conditions'}
      subtitle="Rules for using the Yukthi Properties website and services."
    >
      <InfoPageBody loading={loading} cmsHtml={pageData?.content}>
        <InfoMetaBadge icon={Calendar}>Last updated: April 2026</InfoMetaBadge>

        <InfoLead>
          By using Yukthi Properties, you agree to these terms. Please read them before creating an
          account or contacting sellers through the platform.
        </InfoLead>

        <div className="space-y-4">
          {termsSections.map((sec) => (
            <InfoListCard key={sec.title} icon={sec.icon} title={sec.title}>
              <p className="text-sm leading-relaxed text-slate-600">{sec.desc}</p>
            </InfoListCard>
          ))}
        </div>

        <InfoAlert variant="slate" icon={Scale}>
          These terms are governed by the laws of India. Disputes are subject to the courts in
          Hyderabad, Telangana. Questions: <InfoMailLink email={COMPANY_EMAILS.support} />.
        </InfoAlert>
      </InfoPageBody>
    </InfoLayout>
  );
}
