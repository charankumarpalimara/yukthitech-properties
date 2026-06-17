import React from 'react';
import InfoLayout from '../../components/InfoLayout/InfoLayout';
import { usePageData } from '../../hooks/usePageData';
import { COMPANY_EMAILS } from '../../data/constants';
import { AlertCircle, FileText, Scale, ShieldAlert } from 'lucide-react';
import {
  InfoPageBody,
  InfoLead,
  InfoText,
  InfoMetaBadge,
  InfoListCard,
  InfoAlert,
  InfoMailLink,
  InfoLink,
} from '../../components/InfoLayout/InfoPageUi';

export default function Disclaimer() {
  const { pageData, loading } = usePageData('disclaimer');

  return (
    <InfoLayout
      title={pageData?.title || 'Disclaimer'}
      subtitle="Important information about listings and platform liability."
    >
      <InfoPageBody loading={loading} cmsHtml={pageData?.content}>
        <InfoMetaBadge>Last updated: April 2026</InfoMetaBadge>

        <InfoLead>
          Information on Yukthi Properties is provided for general reference. Listings, prices, and
          availability are supplied by third-party sellers and may change without notice.
        </InfoLead>

        <div className="space-y-4">
          <InfoListCard icon={FileText} title="Third-party listings">
            <p className="text-sm leading-relaxed text-slate-600">
              Yukthi Properties connects buyers with sellers, builders, and agents. We are not a
              party to transactions between users and are not responsible for claims made in
              individual listings.
            </p>
          </InfoListCard>

          <InfoListCard icon={Scale} title="Not professional advice">
            <p className="text-sm leading-relaxed text-slate-600">
              Nothing on this platform is legal, financial, tax, or investment advice. Consult
              qualified professionals before making purchase or investment decisions.
            </p>
          </InfoListCard>

          <InfoListCard icon={ShieldAlert} title="Verify before you pay">
            <p className="text-sm leading-relaxed text-slate-600">
              While we apply verification checks where possible, you should independently confirm
              ownership, approvals, encumbrances, and pricing before any payment or agreement.
            </p>
          </InfoListCard>
        </div>

        <InfoText className="mt-2">
          <strong className="text-slate-900">Limitation of liability:</strong> To the fullest extent
          permitted by law, Yukthi Properties and its team are not liable for indirect or
          consequential damages arising from use of this platform.
        </InfoText>

        <InfoText>
          <strong className="text-slate-900">Governing law:</strong> This disclaimer is governed by
          the laws of India. Disputes are subject to the courts in Hyderabad, Telangana.
        </InfoText>

        <InfoAlert variant="warning" icon={AlertCircle}>
          Fraudulent or misleading listing? Email{' '}
          <InfoMailLink email={COMPANY_EMAILS.support} /> or use{' '}
          <InfoLink to="/report-problem">Report a Problem</InfoLink>.
        </InfoAlert>
      </InfoPageBody>
    </InfoLayout>
  );
}
