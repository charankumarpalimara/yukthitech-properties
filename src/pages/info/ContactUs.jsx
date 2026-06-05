import React from 'react';
import InfoLayout from '../../components/InfoLayout/InfoLayout';
import { usePageData } from '../../hooks/usePageData';
import { MapPin, Phone, Mail, Clock, User, MessageSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  InfoPageBody,
  InfoSectionTitle,
  InfoText,
  InfoCardGrid,
  InfoCard,
  InfoContactLines,
  InfoForm,
  InfoFormRow,
  InfoField,
  InfoInput,
  InfoTextarea,
  InfoSubmit,
} from '../../components/InfoLayout/InfoPageUi';

const contactMethods = [
  {
    icon: MapPin,
    title: 'Our Office',
    details: [
      'Yukthi Properties,',
      '#801, Manjeera Majestic Commercial, KPHB-JNTU road, Hyderabad 500085, Telangana ,India .',
    ],
  },
  {
    icon: Phone,
    title: 'Call Us',
    details: ['+91 98042 93293'],
  },
  {
    icon: Mail,
    title: 'Email Us',
    details: ['Email: info@yukthiproperties.com'],
  },
  {
    icon: Clock,
    title: 'Working Hours',
    details: ['Monday - Saturday: 9:00 AM - 6:00 PM', 'Sunday: Closed (Online support 24/7)'],
  },
];

const toastStyle = { background: '#0f172a', color: '#ffffff', borderRadius: '12px' };

export default function ContactUs() {
  const { pageData, loading } = usePageData('contact-us');

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Message sent! Our support team will contact you shortly.', {
      style: toastStyle,
    });
    e.target.reset();
  };

  return (
    <InfoLayout
      title={pageData?.title || 'Contact Us'}
      subtitle="Reach our team for listings, support, or partnership inquiries."
    >
      <InfoPageBody loading={loading} cmsHtml={pageData?.content}>
        <InfoSectionTitle>Get in Touch</InfoSectionTitle>
        <InfoText>
          Have questions about a listing, or need assistance with your property search? Our team of
          real estate experts is ready to help you.
        </InfoText>

        <InfoCardGrid cols="sm:grid-cols-2">
          {contactMethods.map((method) => (
            <InfoCard key={method.title} icon={method.icon} title={method.title}>
              <InfoContactLines lines={method.details} />
            </InfoCard>
          ))}
        </InfoCardGrid>

        {/* <InfoSectionTitle>Send us a Message</InfoSectionTitle>
        <InfoForm onSubmit={handleSubmit}>
          <InfoFormRow>
            <InfoField label="Full Name" icon={User}>
              <InfoInput icon type="text" name="name" placeholder="Enter your full name" required />
            </InfoField>
            <InfoField label="Email Address" icon={Mail}>
              <InfoInput icon type="email" name="email" placeholder="example@gmail.com" required />
            </InfoField>
          </InfoFormRow>
          <InfoField label="Phone Number" icon={Phone}>
            <InfoInput icon type="tel" name="phone" placeholder="+91 00000 00000" required />
          </InfoField>
          <InfoField label="Message" icon={MessageSquare} multiline>
            <InfoTextarea icon name="message" placeholder="How can we help you?" required />
          </InfoField>
          <InfoSubmit>Submit Message</InfoSubmit>
        </InfoForm> */}
      </InfoPageBody>
    </InfoLayout>
  );
}
