import React from 'react';
import InfoLayout from '../../components/InfoLayout/InfoLayout';
import { usePageData } from '../../hooks/usePageData';
import { COMPANY_EMAILS } from '../../data/constants';
import { Eye, Database, ShieldCheck, UserCheck, Calendar } from 'lucide-react';
import {
  InfoPageBody,
  InfoLead,
  InfoMetaBadge,
  InfoListCard,
  InfoAlert,
  InfoMailLink,
} from '../../components/InfoLayout/InfoPageUi';

const policySections = [
  {
    icon: Database,
    title: 'Information we collect',
    content: 'We collect only what is needed to run the platform and serve your requests:',
    items: [
      'Account details: name, email, and phone when you register or submit a form.',
      'Usage data: searches, saved listings, and pages viewed to improve recommendations.',
      'Device data: cookies and session identifiers for login, preferences, and security.',
    ],
  },
  {
    icon: Eye,
    title: 'How we use your data',
    content: 'Your information is used to operate and improve Yukthi Properties:',
    items: [
      'To authenticate your account and process enquiries you submit.',
      'To send alerts about saved searches, listing updates, or security notices you opt into.',
      'To analyse usage patterns and fix performance or usability issues.',
    ],
  },
  {
    icon: ShieldCheck,
    title: 'How we protect your data',
    content: 'We apply reasonable technical and organisational safeguards:',
    items: [
      'Encrypted connections for data in transit where supported.',
      'Access limited to staff who need it for support or operations.',
      'We do not sell your personal information to third-party advertisers.',
    ],
  },
  {
    icon: UserCheck,
    title: 'Your rights',
    content: 'You can manage how your data is used:',
    items: [
      'Update profile details from your account settings.',
      'Opt out of promotional emails using the unsubscribe link or settings.',
      'Request account deletion via the Delete Account page or by emailing our privacy team.',
    ],
  },
];

function PolicyItem({ text }) {
  const parts = text.split(': ');
  if (parts.length > 1) {
    return (
      <li className="text-sm leading-relaxed text-slate-600">
        <strong className="text-slate-800">{parts[0]}:</strong> {parts.slice(1).join(': ')}
      </li>
    );
  }
  return <li className="text-sm leading-relaxed text-slate-600">{text}</li>;
}

export default function PrivacyPolicy() {
  const { pageData, loading } = usePageData('privacy-policy');

  return (
    <InfoLayout
      title={pageData?.title || 'Privacy Policy'}
      subtitle="How we collect, use, and protect your personal information."
    >
      <InfoPageBody loading={loading} cmsHtml={pageData?.content}>
        <InfoMetaBadge icon={Calendar}>Last updated: April 2026</InfoMetaBadge>

        <InfoLead>
          This policy explains what data Yukthi Properties collects when you use our website, how we
          use it, and the choices available to you.
        </InfoLead>

        <div className="space-y-4">
          {policySections.map((sec) => (
            <InfoListCard key={sec.title} icon={sec.icon} title={sec.title}>
              <p className="mb-3 text-sm leading-relaxed text-slate-600">{sec.content}</p>
              <ul className="list-disc space-y-2 pl-5">
                {sec.items.map((item) => (
                  <PolicyItem key={item} text={item} />
                ))}
              </ul>
            </InfoListCard>
          ))}
        </div>

        <InfoAlert variant="slate">
          Questions about privacy? Email{' '}
          <InfoMailLink email={COMPANY_EMAILS.privacy} />.
        </InfoAlert>
      </InfoPageBody>
    </InfoLayout>
  );
}
