import React from 'react';
import InfoLayout from '../../components/InfoLayout/InfoLayout';
import { usePageData } from '../../hooks/usePageData';
import { Scale, ShieldCheck, UserX, FileText, Calendar, ShieldAlert } from 'lucide-react';
import {
  InfoPageBody,
  InfoSectionTitle,
  InfoText,
  InfoMetaBadge,
  InfoListCard,
  InfoAlert,
} from '../../components/InfoLayout/InfoPageUi';

const termsSections = [
  {
    icon: ShieldCheck,
    title: '1. Use of the Site',
    desc: 'You must be at least 18 years of age to register an account or interact with listings on Yukthi Properties. The site and its materials are provided exclusively for your personal, non-commercial use relating to legitimate real estate transactions and research.',
  },
  {
    icon: ShieldAlert,
    title: '2. Accuracy of Information',
    desc: 'While we strive to maintain verified property details, listing data is uploaded directly by builders, property owners, and independent agents. Yukthi Properties acts as an intermediary listing platform and is not liable for inadvertent pricing, amenity, or availability errors.',
  },
  {
    icon: UserX,
    title: '3. Prohibited User Conduct',
    desc: 'To maintain a professional marketplace, all users agree not to post misleading details, harassment, or fraudulent communications. The use of automated scrapers, web spiders, or indexers to harvest listings or data from our platform is strictly prohibited.',
  },
  {
    icon: FileText,
    title: '4. Intellectual Property Rights',
    desc: 'All proprietary software, layout designs, imagery, text structures, and trademarks are the exclusive intellectual property of Yukthi Properties Pvt. Ltd. and are protected by Indian and international copyright and trademark regulations.',
  },
  {
    icon: Scale,
    title: '5. Limitation of Liability',
    desc: 'To the maximum extent permitted by law, Yukthi Properties shall not be held liable for any indirect, special, incidental, or consequential damages, loss of business revenue, or transaction disputes arising directly or indirectly from using our services.',
  },
];

export default function TermsConditions() {
  const { pageData, loading } = usePageData('terms-conditions');

  return (
    <InfoLayout
      title={pageData?.title || 'Terms & Conditions'}
      subtitle="Terms governing your use of the Yukthi Properties platform."
    >
      <InfoPageBody loading={loading} cmsHtml={pageData?.content}>
        <InfoMetaBadge icon={Calendar}>Last updated: April 21, 2026</InfoMetaBadge>

        <InfoSectionTitle>Terms of Service</InfoSectionTitle>
        <InfoText>
          By accessing, browsing, or using the Yukthi Properties website or mobile applications, you
          agree to comply with and be bound by the following terms and conditions. Please read these
          terms carefully before utilizing our services.
        </InfoText>

        <div className="space-y-4">
          {termsSections.map((sec) => (
            <InfoListCard key={sec.title} icon={sec.icon} title={sec.title}>
              <p className="text-sm text-slate-600 leading-relaxed">{sec.desc}</p>
            </InfoListCard>
          ))}
        </div>

        <InfoAlert variant="slate" icon={Scale}>
          These terms are governed by the laws of India. Any legal dispute arising in connection
          with our platform services shall be subject to the exclusive jurisdiction of the courts
          located in Hyderabad, Telangana.
        </InfoAlert>
      </InfoPageBody>
    </InfoLayout>
  );
}
