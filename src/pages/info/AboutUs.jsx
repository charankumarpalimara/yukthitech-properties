import React from 'react';
import InfoLayout from '../../components/InfoLayout/InfoLayout';
import { usePageData } from '../../hooks/usePageData';
import { Shield, Eye, Zap } from 'lucide-react';
import {
  InfoPageBody,
  InfoLead,
  InfoText,
  InfoCardGrid,
  InfoCard,
  InfoQuote,
} from '../../components/InfoLayout/InfoPageUi';

const values = [
  {
    icon: Shield,
    title: 'Uncompromised Trust',
    desc: 'Every listing undergoes a rigorous verification process to ensure legal compliance and ownership legitimacy.',
  },
  {
    icon: Eye,
    title: 'Radical Transparency',
    desc: 'No hidden fees, no misleading details. We display exact prices, floor plans, and amenities with absolute honesty.',
  },
  {
    icon: Zap,
    title: 'Modern Innovation',
    desc: 'Powering your search with state-of-the-art filtering, local insights, and direct, secure connection to owners and agents.',
  },
];

export default function AboutUs() {
  const { pageData, loading } = usePageData('about-us');

  return (
    <InfoLayout
      title={pageData?.title || 'About Us'}
      subtitle="Building a trusted, transparent real estate experience across India."
    >
      <InfoPageBody loading={loading} cmsHtml={pageData?.content}>
        <InfoLead>
          Yukthi Properties is the result of a dream that took shape through persistence, passion,
          and a deep desire to transform the Indian real estate experience. What began as a simple
          idea — helping people find properties that are truly legit, hassle‑free, and trustworthy —
          has grown into a mission to bring clarity and confidence to every buyer in India.
        </InfoLead>

        <InfoText>
          The foundation of this platform was built after thoroughly studying global real estate
          markets and understanding what makes buyers abroad feel secure and empowered. It became
          clear that the Indian market lacked the same level of transparency, comfort, and
          buyer‑first experience. This insight inspired the creation of a platform where trust is
          not an afterthought but the starting point of every interaction.
        </InfoText>

        <InfoCardGrid cols="sm:grid-cols-2 lg:grid-cols-3">
          {values.map((val) => (
            <InfoCard key={val.title} icon={val.icon} title={val.title}>
              <p className="text-sm text-slate-600 leading-relaxed">{val.desc}</p>
            </InfoCard>
          ))}
        </InfoCardGrid>

        <InfoText>
          At Yukthi Properties, transparency, reliability, and ease are woven into the core of
          everything we do. Every listing is verified with care, every detail is presented with
          honesty, and every step is designed to make the buyer feel informed and protected.
        </InfoText>

        <InfoQuote attribution="— Team Yukthi Properties">
          Our logo represents this promise — a symbol of trust, clarity, and new beginnings. Yukthi
          Properties stands for a future where property buying is simple, secure, and stress‑free.
          We are here to build that future, one trusted property at a time.
        </InfoQuote>
      </InfoPageBody>
    </InfoLayout>
  );
}
