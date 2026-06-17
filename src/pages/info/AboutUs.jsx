import React from 'react';
import InfoLayout from '../../components/InfoLayout/InfoLayout';
import { usePageData } from '../../hooks/usePageData';
import { Shield, Eye, Zap, Home, Building2 } from 'lucide-react';
import {
  InfoPageBody,
  InfoLead,
  InfoText,
  InfoSectionTitle,
  InfoCardGrid,
  InfoCard,
  InfoQuote,
} from '../../components/InfoLayout/InfoPageUi';

const values = [
  {
    icon: Shield,
    title: 'Verified listings',
    desc: 'Listings go through checks so buyers see clearer ownership and project details before they enquire.',
  },
  {
    icon: Eye,
    title: 'Transparent information',
    desc: 'Prices, specifications, and amenities are presented plainly — no hidden charges from our platform.',
  },
  {
    icon: Zap,
    title: 'Simple discovery',
    desc: 'Search, filters, and direct contact tools help you move from browsing to site visits faster.',
  },
];

const offerings = [
  {
    icon: Home,
    title: 'For buyers',
    desc: 'Browse residential, commercial, and plot listings across Hyderabad and other cities. Save favourites, compare options, and connect with sellers through the platform.',
  },
  {
    icon: Building2,
    title: 'For sellers & agents',
    desc: 'Post properties with subscription plans, manage listings from your dashboard, and reach serious buyers looking for verified inventory.',
  },
];

export default function AboutUs() {
  const { pageData, loading } = usePageData('about-us');

  return (
    <InfoLayout
      title={pageData?.title || 'About Us'}
      subtitle="A property platform built around trust, clarity, and ease of use."
    >
      <InfoPageBody loading={loading} cmsHtml={pageData?.content}>
        <InfoLead>
          Yukthi Properties helps buyers discover verified real estate and gives owners and agents a
          straightforward way to list and manage properties online.
        </InfoLead>

        <InfoText>
          We started with a simple goal: make property search in India feel more reliable. That means
          clearer listing information, honest presentation of details, and tools that connect the
          right buyer with the right seller — without unnecessary friction.
        </InfoText>

        <InfoSectionTitle label="Platform">What we offer</InfoSectionTitle>
        <InfoCardGrid cols="sm:grid-cols-2">
          {offerings.map((item) => (
            <InfoCard key={item.title} icon={item.icon} title={item.title}>
              <p className="text-sm leading-relaxed text-slate-600">{item.desc}</p>
            </InfoCard>
          ))}
        </InfoCardGrid>

        <InfoSectionTitle label="Principles">What we stand for</InfoSectionTitle>
        <InfoCardGrid cols="sm:grid-cols-2 lg:grid-cols-3">
          {values.map((val) => (
            <InfoCard key={val.title} icon={val.icon} title={val.title}>
              <p className="text-sm leading-relaxed text-slate-600">{val.desc}</p>
            </InfoCard>
          ))}
        </InfoCardGrid>

        <InfoQuote attribution="— Team Yukthi Properties">
          We are building a marketplace where every interaction starts with trust — one verified
          listing and one informed buyer at a time.
        </InfoQuote>
      </InfoPageBody>
    </InfoLayout>
  );
}
