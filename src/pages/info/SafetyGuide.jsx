import React from 'react';
import InfoLayout from '../../components/InfoLayout/InfoLayout';
import { usePageData } from '../../hooks/usePageData';
import { AlertTriangle, Users, FileText, PhoneCall, ShieldAlert, ShieldCheck, Banknote } from 'lucide-react';
import {
  InfoPageBody,
  InfoLead,
  InfoSectionTitle,
  InfoCardGrid,
  InfoCard,
  InfoAlert,
  InfoLink,
} from '../../components/InfoLayout/InfoPageUi';

const safetyTips = [
  {
    icon: Banknote,
    title: 'Never pay before you visit',
    desc: 'Do not transfer token money, advance deposits, or "visit fees" before seeing the property and verifying documents. Yukthi Properties does not charge buyers to view listings.',
  },
  {
    icon: FileText,
    title: 'Check legal documents',
    desc: 'For under-construction projects, confirm RERA registration. For resale, review the sale deed, encumbrance certificate (EC), and recent tax receipts.',
  },
  {
    icon: Users,
    title: 'Meet safely in person',
    desc: 'Schedule site visits during daylight hours. Bring someone you trust when meeting a seller or agent for the first time.',
  },
  {
    icon: PhoneCall,
    title: 'Use platform channels',
    desc: 'Keep enquiries and follow-ups on Yukthi Properties where possible so there is a record if a dispute arises.',
  },
  {
    icon: AlertTriangle,
    title: 'Watch for red flags',
    desc: 'Be cautious if someone refuses a site visit, pressures you to pay quickly, or claims to be abroad and cannot meet locally.',
  },
];

export default function SafetyGuide() {
  const { pageData, loading } = usePageData('safety-guide');

  return (
    <InfoLayout
      title={pageData?.title || 'Safety Guide'}
      subtitle="Practical steps to stay safe while searching for property."
    >
      <InfoPageBody loading={loading} cmsHtml={pageData?.content}>
        <InfoLead>
          We work to keep listings trustworthy, but property deals still need your due diligence.
          Follow these guidelines before you pay or sign anything.
        </InfoLead>

        <InfoSectionTitle>Before you transact</InfoSectionTitle>
        <InfoCardGrid cols="sm:grid-cols-2">
          {safetyTips.map((tip) => (
            <InfoCard key={tip.title} icon={tip.icon} title={tip.title}>
              <p className="text-sm leading-relaxed text-slate-600">{tip.desc}</p>
            </InfoCard>
          ))}
        </InfoCardGrid>

        <InfoAlert variant="danger" icon={ShieldAlert} title="Common scam pattern">
          Fraudsters sometimes ask for token money to &quot;hold&quot; a property without a proper
          site visit. Always inspect the property and meet a local authorised representative first.
        </InfoAlert>

        <InfoAlert variant="success" icon={ShieldCheck}>
          See something wrong? Report it on{' '}
          <InfoLink to="/report-problem">Report a Problem</InfoLink> or contact us via{' '}
          <InfoLink to="/contact-us">Contact Us</InfoLink>.
        </InfoAlert>
      </InfoPageBody>
    </InfoLayout>
  );
}
