import React from 'react';
import InfoLayout from '../../components/InfoLayout/InfoLayout';
import { usePageData } from '../../hooks/usePageData';
import { COMPANY_EMAILS } from '../../data/constants';
import { Cpu, Users, MapPin } from 'lucide-react';
import {
  InfoPageBody,
  InfoLead,
  InfoSectionTitle,
  InfoText,
  InfoCardGrid,
  InfoCard,
  InfoAlert,
  InfoMailLink,
} from '../../components/InfoLayout/InfoPageUi';

const focusAreas = [
  {
    icon: Cpu,
    title: 'Product & engineering',
    desc: 'Building search, listing tools, and a reliable experience for buyers and sellers.',
  },
  {
    icon: Users,
    title: 'Sales & customer success',
    desc: 'Helping users find the right property and supporting sellers on the platform.',
  },
  {
    icon: MapPin,
    title: 'Operations — Hyderabad',
    desc: 'On-ground coordination, listing quality, and local market knowledge.',
  },
];

export default function Careers() {
  const { pageData, loading } = usePageData('careers');

  return (
    <InfoLayout
      title={pageData?.title || 'Careers'}
      subtitle="Work with us on India's property discovery platform."
    >
      <InfoPageBody loading={loading} cmsHtml={pageData?.content}>
        <InfoLead>
          We are a growing team based in Hyderabad. When roles open up, we look for people who care
          about clear communication, honest listings, and building useful products.
        </InfoLead>

        <InfoText>
          We do not maintain a public job board at the moment. If you would like to be considered
          for future openings, send your resume and a short note about the kind of role you are
          interested in.
        </InfoText>

        <InfoSectionTitle label="Teams">Where we hire</InfoSectionTitle>
        <InfoCardGrid cols="sm:grid-cols-2 lg:grid-cols-3">
          {focusAreas.map((area) => (
            <InfoCard key={area.title} icon={area.icon} title={area.title}>
              <p className="text-sm leading-relaxed text-slate-600">{area.desc}</p>
            </InfoCard>
          ))}
        </InfoCardGrid>

        <InfoAlert variant="warning">
          Send your resume to <InfoMailLink email={COMPANY_EMAILS.careers} /> with the subject line
          &quot;Careers — [Your Role Interest]&quot;. We will reach out when a suitable opening is
          available.
        </InfoAlert>
      </InfoPageBody>
    </InfoLayout>
  );
}
