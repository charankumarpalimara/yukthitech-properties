import React from 'react';
import InfoLayout from '../../components/InfoLayout/InfoLayout';
import { usePageData } from '../../hooks/usePageData';
import { Link, MessageSquare, ShieldAlert, Send, Mail } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  InfoPageBody,
  InfoLead,
  InfoForm,
  InfoFormRow,
  InfoField,
  InfoInput,
  InfoTextarea,
  InfoSubmit,
  InfoSelect,
  InfoAlert,
  InfoLink,
} from '../../components/InfoLayout/InfoPageUi';

const toastStyle = { background: '#0f172a', color: '#ffffff', borderRadius: '12px' };

export default function ReportProblem() {
  const { pageData, loading } = usePageData('report-problem');

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Report received. Our team will review it shortly.', { style: toastStyle });
    e.target.reset();
  };

  return (
    <InfoLayout
      title={pageData?.title || 'Report a Problem'}
      subtitle="Flag bugs, incorrect listings, or suspicious activity."
    >
      <InfoPageBody loading={loading} cmsHtml={pageData?.content}>
        <InfoLead>
          Use this form for technical issues, wrong listing details, or suspected fraud. Add a
          property URL when possible so we can act faster.
        </InfoLead>

        <InfoForm onSubmit={handleSubmit}>
          <InfoField label="Issue type" icon={ShieldAlert}>
            <InfoSelect icon name="issueType" required defaultValue="">
              <option value="" disabled>
                Select issue type…
              </option>
              <option value="bug">Technical bug</option>
              <option value="listing">Incorrect listing information</option>
              <option value="fraud">Suspected fraud or scam</option>
              <option value="account">Account / login issue</option>
              <option value="other">Other</option>
            </InfoSelect>
          </InfoField>

          <InfoFormRow>
            <InfoField label="Page or listing URL" icon={Link}>
              <InfoInput
                icon
                type="url"
                name="url"
                placeholder="https://yukthiproperties.com/property/…"
              />
            </InfoField>
            <InfoField label="Your email (optional)" icon={Mail}>
              <InfoInput icon type="email" name="email" placeholder="For follow-up if needed" />
            </InfoField>
          </InfoFormRow>

          <InfoField label="Description" icon={MessageSquare} multiline>
            <InfoTextarea
              icon
              name="description"
              rows={5}
              placeholder="What happened? Include dates, screenshots, or seller details if relevant."
              required
            />
          </InfoField>

          <InfoSubmit>
            <Send className="h-4 w-4" />
            Submit report
          </InfoSubmit>
        </InfoForm>

        <InfoAlert variant="danger" icon={ShieldAlert} title="Suspected scam?">
          Read our <InfoLink to="/safety-guide">Safety Guide</InfoLink> before sending money to any
          seller. For urgent help, <InfoLink to="/contact-us">contact us</InfoLink> directly.
        </InfoAlert>
      </InfoPageBody>
    </InfoLayout>
  );
}
