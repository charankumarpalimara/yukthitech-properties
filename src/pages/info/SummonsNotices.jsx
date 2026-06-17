import React from 'react';
import InfoLayout from '../../components/InfoLayout/InfoLayout';
import { usePageData } from '../../hooks/usePageData';
import { COMPANY_OFFICE, COMPANY_EMAILS } from '../../data/constants';
import { Scale, MapPin, Mail, FileText, Clock } from 'lucide-react';
import {
  InfoPageBody,
  InfoLead,
  InfoSubheading,
  InfoHighlightPanel,
  InfoListCard,
  InfoAlert,
  InfoMailLink,
} from '../../components/InfoLayout/InfoPageUi';

const requiredInfo = [
  'Case or reference number from the court or authority.',
  'Contact details of the serving party or their legal counsel.',
  'Clear subject describing the nature of the summons or notice.',
  'Certified copy of the petition, complaint, or order (PDF preferred).',
];

export default function SummonsNotices() {
  const { pageData, loading } = usePageData('summons-notices');

  return (
    <InfoLayout
      title={pageData?.title || 'Summons & Notices'}
      subtitle="How to serve legal correspondence to Yukthi Properties."
    >
      <InfoPageBody loading={loading} cmsHtml={pageData?.content}>
        <InfoLead>
          Official summons, court notices, and government correspondence should be sent to our
          registered office or legal inbox so they can be processed without delay.
        </InfoLead>

        <InfoSubheading icon={Scale}>Where to send documents</InfoSubheading>

        <InfoHighlightPanel>
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold/20 text-gold">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white">Registered office</h4>
              <p className="mt-1 text-sm leading-relaxed text-slate-300">
                Yukthi Properties Pvt. Ltd.
                <br />
                Attn: Legal Department
                <br />
                {COMPANY_OFFICE.lines.map((line) => (
                  <React.Fragment key={line}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-center gap-2">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold/20 text-gold">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Legal inbox</h4>
                <InfoMailLink
                  email={COMPANY_EMAILS.legal}
                  className="text-gold hover:text-gold-light"
                />
              </div>
            </div>
          </div>
        </InfoHighlightPanel>

        <InfoListCard icon={FileText} title="Include with your notice">
          <ul className="list-disc space-y-2 pl-5">
            {requiredInfo.map((item) => (
              <li key={item} className="text-sm leading-relaxed text-slate-600">
                {item}
              </li>
            ))}
          </ul>
        </InfoListCard>

        <InfoAlert variant="warning" icon={Clock}>
          <strong>Processing:</strong> Valid documents are acknowledged within 48 business hours.
          Mark time-sensitive mail as &quot;URGENT&quot; in the subject line.
        </InfoAlert>
      </InfoPageBody>
    </InfoLayout>
  );
}
