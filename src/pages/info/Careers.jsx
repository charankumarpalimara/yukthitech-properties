import React from 'react';
import InfoLayout from '../../components/InfoLayout/InfoLayout';
import { usePageData } from '../../hooks/usePageData';
import { Cpu, TrendingUp, Heart, Award } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  InfoPageBody,
  InfoSectionTitle,
  InfoText,
  InfoCardGrid,
  InfoCard,
  InfoJobCard,
  InfoAlert,
  InfoMailLink,
} from '../../components/InfoLayout/InfoPageUi';

const benefits = [
  {
    icon: Cpu,
    title: 'Innovation First',
    desc: 'Work on industry-leading search algorithms and digital property tools.',
  },
  {
    icon: TrendingUp,
    title: 'Growth & Learning',
    desc: 'Dedicated mentorship and training budgets for every employee.',
  },
  {
    icon: Heart,
    title: 'Competitive Benefits',
    desc: 'Comprehensive health insurance and performance-based bonuses.',
  },
  {
    icon: Award,
    title: 'Culture of Excellence',
    desc: 'Join a team that values integrity and premium service delivery.',
  },
];

const positions = [
  { title: 'Real Estate Consultant', location: 'Hyderabad', type: 'Full-time' },
  {
    title: 'Senior Software Engineer (Frontend)',
    location: 'Remote / Bangalore',
    type: 'Full-time',
  },
  { title: 'Customer Success Associate', location: 'Mumbai', type: 'Full-time' },
  { title: 'Market Research Analyst', location: 'Delhi NCR', type: 'Contract' },
];

const toastStyle = { background: '#0f172a', color: '#ffffff', borderRadius: '12px' };

export default function Careers() {
  const { pageData, loading } = usePageData('careers');

  const handleApply = (title) => {
    toast.success(
      `Application interest noted for ${title}. Email careers@yukthiproperties.com to apply.`,
      {
        style: toastStyle,
      }
    );
  };

  return (
    <InfoLayout
      title={pageData?.title || 'Careers with us'}
      subtitle="Join a team reshaping how India discovers and buys property."
    >
      <InfoPageBody loading={loading} cmsHtml={pageData?.content}>
        <InfoSectionTitle>Join the Elite Team</InfoSectionTitle>
        <InfoText>
          Building the future of real estate requires the brightest minds across technology, sales,
          and operations. At Yukthi Properties, we offer an environment of growth, innovation, and
          excellence.
        </InfoText>

        <InfoSectionTitle label="Culture">Why Work With Us?</InfoSectionTitle>
        <InfoCardGrid cols="sm:grid-cols-2">
          {benefits.map((b) => (
            <InfoCard key={b.title} icon={b.icon} title={b.title}>
              <p className="text-sm text-slate-600 leading-relaxed">{b.desc}</p>
            </InfoCard>
          ))}
        </InfoCardGrid>

        <InfoSectionTitle label="Hiring">Open Positions</InfoSectionTitle>
        <div className="space-y-3">
          {positions.map((job) => (
            <InfoJobCard
              key={job.title}
              title={job.title}
              location={job.location}
              type={job.type}
              onApply={() => handleApply(job.title)}
            />
          ))}
        </div>

        <InfoAlert variant="warning">
          Don&apos;t see a position that fits? Send your resume to{' '}
          <InfoMailLink email="careers@yukthiproperties.com" /> and we&apos;ll reach out when
          something matches.
        </InfoAlert>
      </InfoPageBody>
    </InfoLayout>
  );
}
