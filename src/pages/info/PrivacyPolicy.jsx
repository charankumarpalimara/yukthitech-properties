import React from 'react';
import InfoLayout from '../../components/InfoLayout/InfoLayout';
import { usePageData } from '../../hooks/usePageData';
import { Eye, Database, ShieldCheck, HelpCircle, Calendar } from 'lucide-react';
import {
  InfoPageBody,
  InfoSectionTitle,
  InfoText,
  InfoMetaBadge,
  InfoListCard,
  InfoAlert,
  InfoMailLink,
} from '../../components/InfoLayout/InfoPageUi';

const policySections = [
  {
    icon: Database,
    title: 'Information We Collect',
    content:
      'We only collect essential details necessary to provide you with premium real estate search services:',
    items: [
      'Personal Details: Name, email address, and phone number when you register, contact agents, or request information.',
      'Usage Data: Property search preferences, saved listings, page views, and location information (if permitted).',
      'Cookies: Subtle device files that let us remember your session, preferences, and optimize loading performance.',
    ],
  },
  {
    icon: Eye,
    title: 'How We Use Your Data',
    content:
      'Your information is utilized solely to enhance and personalize your property transaction experience:',
    items: [
      'To connect you with authentic developers, property owners, and verified real estate agents upon your request.',
      'To send real-time alerts about new listings matching your criteria, price adjustments, and account security updates.',
      'To run analytics and improve the visual layout, filtering speed, and overall usability of our platform.',
    ],
  },
  {
    icon: ShieldCheck,
    title: 'Data Protection & Security',
    content:
      'We employ top-tier industrial measures to ensure your personal data remains completely safe with us:',
    items: [
      'End-to-end encryption for communication channels and user accounts.',
      'Strict restriction of data access: Only authorized personnel have access to sensitive transaction files.',
      'We enforce a zero-tolerance policy against sharing or selling your personal information with third-party advertising companies.',
    ],
  },
  {
    icon: ShieldCheck,
    title: 'Your Choices & Rights',
    content: 'You maintain complete control over the information you choose to share with us:',
    items: [
      'You can opt-out of promotional emails and newsletters at any time through your profile settings.',
      'You have the right to request access to, edit, or permanently delete your account data from our servers.',
      'You may disable cookies in your web browser settings, although some features of the site might have limited functionality.',
    ],
  },
];

function PolicyItem({ text }) {
  const parts = text.split(': ');
  if (parts.length > 1) {
    return (
      <li className="text-sm text-slate-600 leading-relaxed">
        <strong className="text-slate-800">{parts[0]}:</strong> {parts.slice(1).join(': ')}
      </li>
    );
  }
  return <li className="text-sm text-slate-600 leading-relaxed">{text}</li>;
}

export default function PrivacyPolicy() {
  const { pageData, loading } = usePageData('privacy-policy');

  return (
    <InfoLayout
      title={pageData?.title || 'Privacy Policy'}
      subtitle="How we collect, use, and protect your personal information."
    >
      <InfoPageBody loading={loading} cmsHtml={pageData?.content}>
        <InfoMetaBadge icon={Calendar}>Last updated: April 21, 2026</InfoMetaBadge>

        <InfoSectionTitle>Your Privacy Matters</InfoSectionTitle>
        <InfoText>
          At Yukthi Properties, we are committed to protecting your personal data. This policy
          explains how we collect, use, and safeguard your information when you interact with our
          luxury real estate portal.
        </InfoText>

        <div className="space-y-4">
          {policySections.map((sec) => (
            <InfoListCard key={sec.title} icon={sec.icon} title={sec.title}>
              <p className="mb-3 text-sm text-slate-600 leading-relaxed">{sec.content}</p>
              <ul className="list-disc space-y-2 pl-5">
                {sec.items.map((item) => (
                  <PolicyItem key={item} text={item} />
                ))}
              </ul>
            </InfoListCard>
          ))}
        </div>

        <InfoAlert variant="slate" icon={HelpCircle}>
          Have questions or concerns about your privacy settings? Contact our Privacy Team at{' '}
          <InfoMailLink email="privacy@yukthiproperties.com" />.
        </InfoAlert>
      </InfoPageBody>
    </InfoLayout>
  );
}
