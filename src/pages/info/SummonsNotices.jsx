import React from 'react';
import InfoLayout from '../../components/InfoLayout/InfoLayout';
import { usePageData } from '../../hooks/usePageData';
import { Scale, MapPin, Mail, FileText, Clock } from 'lucide-react';
import {
  InfoPageBody,
  InfoSectionTitle,
  InfoText,
  InfoSubheading,
  InfoHighlightPanel,
  InfoListCard,
  InfoAlert,
  InfoMailLink,
} from '../../components/InfoLayout/InfoPageUi';

const requiredInfo = [
  'Official Case Number or reference identifier issued by the court or authority.',
  'Complete contact coordinates of the serving party or their designated legal counsel.',
  'Clear and descriptive subject title outlining the specific nature of the summons or notice.',
  'Certified copy of the petition, complaint, or order in standard digital PDF format.',
];

export default function SummonsNotices() {
  const { pageData, loading } = usePageData('summons-notices');

  return (
    <InfoLayout
      title={pageData?.title || 'Summons/Notices'}
      subtitle="How to serve official legal correspondence to Yukthi Properties."
    >
      <InfoPageBody loading={loading} cmsHtml={pageData?.content}>
        <InfoSectionTitle>Legal Correspondence</InfoSectionTitle>
        <InfoText>
          This section outlines the process for serving official legal summons, judicial notices,
          and administrative government correspondence to Yukthi Properties Private Limited.
        </InfoText>

        <InfoSubheading icon={Scale}>Service of Legal Notices</InfoSubheading>
        <InfoText>
          To ensure immediate processing and avoid administrative delays, legal documents should be
          served directly through our registered office address or designated legal inbox:
        </InfoText>

        <InfoHighlightPanel>
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold/20 text-gold">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white">Corporate Registered Office</h4>
              <p className="mt-1 text-sm text-slate-300 leading-relaxed">
                Yukthi Properties Pvt. Ltd.
                <br />
                Attn: Legal Department
                <br />
                12th Floor, Elite Towers, Jubilee Hills
                <br />
                Hyderabad, Telangana - 500033
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-center gap-2">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold/20 text-gold">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Legal Inbox</h4>
                <InfoMailLink
                  email="legal@yukthiproperties.com"
                  className="text-gold hover:text-gold-light"
                />
              </div>
            </div>
          </div>
        </InfoHighlightPanel>

        <InfoListCard icon={FileText} title="Information Required for Processing">
          <p className="mb-3 text-sm text-slate-600 leading-relaxed">
            All incoming summons and legal notices must contain complete, accurate metadata to avoid
            delays in identification:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            {requiredInfo.map((item) => (
              <li key={item} className="text-sm text-slate-600 leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        </InfoListCard>

        <InfoAlert variant="warning" icon={Clock}>
          <strong>Processing Timeline:</strong> Our legal department acknowledges receipt of all
          validly served documents within 48 business hours. For highly time-sensitive issues,
          please include &quot;URGENT&quot; in the email subject or postal marking.
        </InfoAlert>
      </InfoPageBody>
    </InfoLayout>
  );
}
