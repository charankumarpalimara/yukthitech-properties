import React from 'react';
import InfoLayout from '../../components/InfoLayout/InfoLayout';
import { usePageData } from '../../hooks/usePageData';
import { Link, MessageSquare, ShieldAlert, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  InfoPageBody,
  InfoSectionTitle,
  InfoText,
  InfoForm,
  InfoField,
  InfoInput,
  InfoTextarea,
  InfoSubmit,
  InfoSelect,
} from '../../components/InfoLayout/InfoPageUi';

const toastStyle = { background: '#0f172a', color: '#ffffff', borderRadius: '12px' };

export default function ReportProblem() {
  const { pageData, loading } = usePageData('report-problem');

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Thank you for reporting this issue. Our technical team has been notified.', {
      style: toastStyle,
    });
    e.target.reset();
  };

  return (
    <InfoLayout
      title={pageData?.title || 'Report a problem'}
      subtitle="Help us fix bugs, incorrect listings, or suspicious activity."
    >
      <InfoPageBody loading={loading} cmsHtml={pageData?.content}>
        <InfoSectionTitle>Found a Glitch?</InfoSectionTitle>
        <InfoText>
          If you&apos;ve encountered a technical issue, a bug, or incorrect information on our
          platform, please let us know so we can fix it immediately. Your help keeps our community
          safe.
        </InfoText>

        <InfoForm onSubmit={handleSubmit}>
          <InfoField label="Issue Type" icon={ShieldAlert}>
            <InfoSelect icon name="issueType" required defaultValue="">
              <option value="" disabled>
                Select issue type…
              </option>
              <option value="bug">Technical Bug / Glitch</option>
              <option value="listing">Incorrect Listing Information</option>
              <option value="fraud">Suspected Fraud / Scam</option>
              <option value="account">Account / Login Issue</option>
              <option value="other">Other</option>
            </InfoSelect>
          </InfoField>

          <InfoField label="Page or Listing URL (if applicable)" icon={Link}>
            <InfoInput icon type="url" name="url" placeholder="https://yukthiproperties.com/..." />
          </InfoField>

          <InfoField label="Describe the Problem" icon={MessageSquare} multiline>
            <InfoTextarea
              icon
              name="description"
              rows={6}
              placeholder="Please provide as much detail as possible…"
              required
            />
          </InfoField>

          <InfoSubmit>
            <Send className="h-4 w-4" />
            Submit Report
          </InfoSubmit>
        </InfoForm>
      </InfoPageBody>
    </InfoLayout>
  );
}
