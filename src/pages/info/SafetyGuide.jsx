import React from 'react';
import InfoLayout from '../../components/InfoLayout/InfoLayout';
import { usePageData } from '../../hooks/usePageData';
import { AlertTriangle, Users, FileText, PhoneCall, ShieldAlert, ShieldCheck } from 'lucide-react';
import {
  InfoPageBody,
  InfoSectionTitle,
  InfoText,
  InfoCardGrid,
  InfoCard,
  InfoAlert,
  InfoLink,
} from '../../components/InfoLayout/InfoPageUi';

const safetyTips = [
  {
    icon: AlertTriangle,
    title: 'Verify Before Paying Any Token',
    desc: 'Never pay token money, advance deposits, or visiting fees to an owner or agent before physically visiting the property and verifying ownership documents. Yukthi Properties never asks for upfront visit charges.',
  },
  {
    icon: Users,
    title: 'Meet in Safe Public Spaces',
    desc: 'When scheduling physical site visits or meeting a property owner/agent for the first time, meet during daylight hours and try to bring a trusted friend or family member along with you.',
  },
  {
    icon: FileText,
    title: 'Scrutinize Legal Ownership Documents',
    desc: 'Always verify RERA registration numbers for projects under construction. For resale properties, request and examine the original Sale Deed, Encumbrance Certificate (EC), and recent property tax receipts.',
  },
  {
    icon: PhoneCall,
    title: 'Keep Communication on Official Channels',
    desc: 'Interact and communicate via the Yukthi Properties platform whenever possible. This helps maintain official records of communications and listings in case any dispute or misunderstanding arises.',
  },
];

export default function SafetyGuide() {
  const { pageData, loading } = usePageData('safety-guide');

  return (
    <InfoLayout
      title={pageData?.title || 'Safety Guide'}
      subtitle="Practical tips to stay safe during your property search and transactions."
    >
      <InfoPageBody loading={loading} cmsHtml={pageData?.content}>
        <InfoSectionTitle>Your Safety is Our Priority</InfoSectionTitle>
        <InfoText>
          At Yukthi Properties, we go to great lengths to verify every single listing. However,
          property transaction safety is a shared responsibility. We strongly urge you to stay
          vigilant and follow these guidelines.
        </InfoText>

        <InfoCardGrid cols="sm:grid-cols-2">
          {safetyTips.map((tip) => (
            <InfoCard key={tip.title} icon={tip.icon} title={tip.title}>
              <p className="text-sm text-slate-600 leading-relaxed">{tip.desc}</p>
            </InfoCard>
          ))}
        </InfoCardGrid>

        <InfoAlert variant="danger" icon={ShieldAlert} title="Common Scam Alert">
          Beware of listing representatives claiming they are currently abroad and cannot show the
          property in person, asking for token money to &quot;lock&quot; the property. Insist on
          inspecting the property and meeting a local authorized representative first.
        </InfoAlert>

        <InfoAlert variant="success" icon={ShieldCheck}>
          Notice anything suspicious? Help keep our community safe. Please report listings instantly
          via the <InfoLink to="/report-problem">Report a Problem</InfoLink> page.
        </InfoAlert>
      </InfoPageBody>
    </InfoLayout>
  );
}
