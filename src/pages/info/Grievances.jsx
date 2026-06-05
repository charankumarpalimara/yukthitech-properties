import React from 'react';
import InfoLayout from '../../components/InfoLayout/InfoLayout';
import { usePageData } from '../../hooks/usePageData';
import { Scale, User, Mail, Phone, Clock, ShieldCheck } from 'lucide-react';
import {
  InfoPageBody,
  InfoSectionTitle,
  InfoText,
  InfoSubheading,
  InfoHighlightPanel,
  InfoSteps,
  InfoAlert,
} from '../../components/InfoLayout/InfoPageUi';

const steps = [
  {
    level: 'Level 1',
    title: 'Customer Support',
    desc: 'Contact our customer support team via the Help Center or Raise a Ticket. Most issues are resolved at this stage.',
    resolution: 'Target: 24-48 Hours',
  },
  {
    level: 'Level 2',
    title: 'Grievance Officer Escalation',
    desc: 'If you are not satisfied with the support response, you can escalate the matter directly to our Grievance Officer.',
    resolution: 'Target: 7 Working Days',
  },
  {
    level: 'Level 3',
    title: 'Senior Management Review',
    desc: 'If the issue remains unresolved or unresolved to your satisfaction after 15 days, it will be escalated to senior management.',
    resolution: 'Target: 15 Working Days',
  },
];

export default function Grievances() {
  const { pageData, loading } = usePageData('grievances');

  return (
    <InfoLayout
      title={pageData?.title || 'Grievances'}
      subtitle="Our transparent process for resolving complaints and concerns."
    >
      <InfoPageBody loading={loading} cmsHtml={pageData?.content}>
        <InfoSectionTitle>Grievance Redressal Mechanism</InfoSectionTitle>
        <InfoText>
          Yukthi Properties is committed to resolving any complaints or grievances you may have
          regarding our services or platform in a timely, transparent, and fair manner.
        </InfoText>

        <InfoSubheading icon={Scale}>Designated Grievance Officer</InfoSubheading>
        <InfoText>
          In accordance with the Information Technology Act and rules made thereunder, the contact
          details of the Grievance Officer for Yukthi Properties are:
        </InfoText>

        <InfoHighlightPanel>
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/20 text-gold">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white">Mr. Rajesh Varma</h4>
              <p className="text-xs text-slate-400">Grievance Officer</p>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                Yukthi Properties Private Limited
                <br />
                Jubilee Hills, Hyderabad, India
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-center gap-3 text-sm">
            <a
              href="mailto:grievance@yukthiproperties.com"
              className="inline-flex items-center gap-2 font-semibold text-gold transition-colors hover:text-gold-light"
            >
              <Mail className="h-4 w-4" />
              grievance@yukthiproperties.com
            </a>
            <span className="inline-flex items-center gap-2 text-slate-300">
              <Phone className="h-4 w-4 text-gold" />
              +91 93815 59642 (Ext: 404)
            </span>
            <span className="inline-flex items-center gap-2 text-slate-300">
              <Clock className="h-4 w-4 text-gold" />
              Mon - Fri, 10:00 AM - 5:00 PM
            </span>
          </div>
        </InfoHighlightPanel>

        <InfoSectionTitle label="Process">Escalation Matrix</InfoSectionTitle>
        <InfoSteps steps={steps} />

        <InfoAlert variant="success" icon={ShieldCheck}>
          We resolve all valid complaints and grievances within a maximum of 15 business days from
          the receipt of the ticket.
        </InfoAlert>
      </InfoPageBody>
    </InfoLayout>
  );
}
