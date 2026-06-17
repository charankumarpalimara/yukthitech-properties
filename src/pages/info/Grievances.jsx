import React from 'react';
import InfoLayout from '../../components/InfoLayout/InfoLayout';
import { usePageData } from '../../hooks/usePageData';
import {
  FOOTER_CONTACT,
  COMPANY_OFFICE,
  COMPANY_HOURS,
  COMPANY_EMAILS,
} from '../../data/constants';
import { Scale, Mail, Phone, Clock, ShieldCheck } from 'lucide-react';
import {
  InfoPageBody,
  InfoLead,
  InfoSectionTitle,
  InfoText,
  InfoSubheading,
  InfoHighlightPanel,
  InfoSteps,
  InfoAlert,
  InfoLink,
} from '../../components/InfoLayout/InfoPageUi';

const steps = [
  {
    level: 'Level 1',
    title: 'Customer support',
    desc: `Raise your concern via Contact Us or email ${COMPANY_EMAILS.support} with your account details and a clear description of the issue.`,
    resolution: '24–48 hours',
  },
  {
    level: 'Level 2',
    title: 'Grievance Officer',
    desc: 'If you are not satisfied with the Level 1 response, escalate in writing to our designated Grievance Officer.',
    resolution: '7 working days',
  },
  {
    level: 'Level 3',
    title: 'Senior management',
    desc: 'Unresolved matters after 15 days from the original complaint may be reviewed by senior management.',
    resolution: '15 working days',
  },
];

export default function Grievances() {
  const { pageData, loading } = usePageData('grievances');

  return (
    <InfoLayout
      title={pageData?.title || 'Grievances'}
      subtitle="How we handle complaints and escalations."
    >
      <InfoPageBody loading={loading} cmsHtml={pageData?.content}>
        <InfoLead>
          If something on our platform or service has not met your expectations, use the process
          below. We document every complaint and work toward a fair resolution.
        </InfoLead>

        <InfoSubheading icon={Scale}>Grievance Officer</InfoSubheading>
        <InfoText>
          As required under applicable Indian IT rules, you may contact our Grievance Officer for
          escalations:
        </InfoText>

        <InfoHighlightPanel>
          <div>
            <h4 className="font-semibold text-white">Grievance Officer</h4>
            <p className="mt-1 text-sm text-slate-400">Yukthi Properties Private Limited</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              {COMPANY_OFFICE.name}
              <br />
              {COMPANY_OFFICE.lines.join(', ')}
            </p>
          </div>
          <div className="flex flex-col justify-center gap-3 text-sm">
            <a
              href={`mailto:${COMPANY_EMAILS.grievance}`}
              className="inline-flex items-center gap-2 font-semibold text-gold transition-colors hover:text-gold-light"
            >
              <Mail className="h-4 w-4" />
              {COMPANY_EMAILS.grievance}
            </a>
            <a
              href={FOOTER_CONTACT.phoneHref}
              className="inline-flex items-center gap-2 text-slate-300 no-underline hover:text-white"
            >
              <Phone className="h-4 w-4 text-gold" />
              {FOOTER_CONTACT.phone}
            </a>
            <span className="inline-flex items-center gap-2 text-slate-300">
              <Clock className="h-4 w-4 text-gold" />
              {COMPANY_HOURS.grievance}
            </span>
          </div>
        </InfoHighlightPanel>

        <InfoSectionTitle label="Process">Escalation steps</InfoSectionTitle>
        <InfoSteps steps={steps} />

        <InfoAlert variant="success" icon={ShieldCheck}>
          Valid complaints are addressed within 15 business days of receipt. For general enquiries,
          visit <InfoLink to="/contact-us">Contact Us</InfoLink>.
        </InfoAlert>
      </InfoPageBody>
    </InfoLayout>
  );
}
