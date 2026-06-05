import React from 'react';
import InfoLayout from '../../components/InfoLayout/InfoLayout';
import { usePageData } from '../../hooks/usePageData';
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
      subtitle="Important information about listings, advice, and platform liability."
    >
      <InfoPageBody loading={loading} cmsHtml={pageData?.content}>
        <InfoMetaBadge>Last updated: May 2026</InfoMetaBadge>

        <InfoLead>
          The information provided on the Yukthi Properties platform is for general informational
          purposes only. All property listings, prices, availability, and details are submitted by
          third-party sellers, agents, and builders. Yukthi Properties does not independently verify
          every listing and makes no representations or warranties of any kind, express or implied,
          about the completeness, accuracy, or reliability of any information displayed on this
          platform.
        </InfoLead>

        <div className="space-y-4">
          <InfoListCard icon={FileText} title="Third-Party Listings">
            <p className="text-sm text-slate-600 leading-relaxed">
              All property listings on Yukthi Properties are provided by individual sellers,
              developers, and real estate agents. Yukthi Properties acts as an intermediary platform
              and is not a party to any transaction between buyers and sellers. We are not
              responsible for the accuracy of listing prices, property specifications, or any claims
              made by sellers or their representatives.
            </p>
          </InfoListCard>

          <InfoListCard icon={Scale} title="No Professional Advice">
            <p className="text-sm text-slate-600 leading-relaxed">
              Nothing on this platform constitutes legal, financial, tax, or investment advice.
              Before making any real estate decision, you should consult with a qualified legal or
              financial professional. Property investment carries inherent risks and past
              performance is not indicative of future results.
            </p>
          </InfoListCard>

          <InfoListCard icon={ShieldAlert} title="Verify Before Transacting">
            <p className="text-sm text-slate-600 leading-relaxed">
              Users are strongly encouraged to independently verify all property details including
              ownership documents, approvals, encumbrances, and legal clearances before making any
              payment or entering into any agreement. Yukthi Properties shall not be held liable for
              any financial loss arising from transactions made based on information available on
              this platform.
            </p>
          </InfoListCard>
        </div>

        <InfoText className="mt-2">
          <strong className="text-slate-900">Limitation of Liability:</strong> To the fullest extent
          permitted by applicable law, Yukthi Properties and its officers, directors, employees, and
          agents shall not be liable for any indirect, incidental, special, or consequential
          damages, or any loss of profits or revenues arising out of or in connection with use of
          this platform.
        </InfoText>

        <InfoText>
          <strong className="text-slate-900">Governing Law:</strong> This disclaimer is governed by
          the laws of India. Any disputes arising in connection with this disclaimer shall be
          subject to the exclusive jurisdiction of the courts located in Hyderabad, Telangana.
        </InfoText>

        <InfoAlert variant="warning" icon={AlertCircle}>
          <strong>Attention:</strong> If you believe a listing contains fraudulent or misleading
          information, please contact us immediately at{' '}
          <InfoMailLink email="support@yukthiproperties.com" /> or visit our{' '}
          <InfoLink to="/contact-us">Contact Us</InfoLink> page.
        </InfoAlert>
      </InfoPageBody>
    </InfoLayout>
  );
}
