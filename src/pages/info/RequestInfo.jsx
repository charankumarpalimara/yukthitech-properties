import React from 'react';
import InfoLayout from '../../components/InfoLayout/InfoLayout';
import { usePageData } from '../../hooks/usePageData';
import { MapPin, Info, User, Phone, Send, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  InfoPageBody,
  InfoSectionTitle,
  InfoText,
  InfoForm,
  InfoFormRow,
  InfoField,
  InfoInput,
  InfoTextarea,
  InfoSubmit,
  InfoSelect,
} from '../../components/InfoLayout/InfoPageUi';

const toastStyle = { background: '#0f172a', color: '#ffffff', borderRadius: '12px' };

export default function RequestInfo() {
  const { pageData, loading } = usePageData('request-info');

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success(
      'Request submitted! One of our property consultants will reach out to you within 24 hours.',
      {
        style: toastStyle,
      }
    );
    e.target.reset();
  };

  return (
    <InfoLayout
      title={pageData?.title || 'Request Info'}
      subtitle="Request brochures, pricing, floor plans, or site visits from our consultants."
    >
      <InfoPageBody loading={loading} cmsHtml={pageData?.content}>
        <InfoSectionTitle>Need Specific Details?</InfoSectionTitle>
        <InfoText>
          If you&apos;re looking for detailed brochures, floor plans, or pricing for a specific
          project or locality that you haven&apos;t found on our platform yet, use this form to send
          a request to our consultants.
        </InfoText>

        <InfoForm onSubmit={handleSubmit}>
          <InfoFormRow>
            <InfoField label="Project / Locality Name" icon={MapPin}>
              <InfoInput
                icon
                type="text"
                name="project"
                placeholder="e.g. Prestige Highfield or Jubilee Hills"
                required
              />
            </InfoField>
            <InfoField label="Information Needed" icon={Info}>
              <InfoSelect icon name="infoType" required defaultValue="">
                <option value="" disabled>
                  Select an option…
                </option>
                <option value="brochure">Project Brochure</option>
                <option value="pricing">Full Price List</option>
                <option value="plans">Floor Plans</option>
                <option value="visit">Schedule a Site Visit</option>
                <option value="other">Other Details</option>
              </InfoSelect>
            </InfoField>
          </InfoFormRow>

          <InfoFormRow>
            <InfoField label="Your Name" icon={User}>
              <InfoInput icon type="text" name="name" placeholder="Full Name" required />
            </InfoField>
            <InfoField label="Phone Number" icon={Phone}>
              <InfoInput icon type="tel" name="phone" placeholder="+91 00000 00000" required />
            </InfoField>
          </InfoFormRow>

          <InfoField label="Additional Notes (optional)" icon={FileText} multiline>
            <InfoTextarea
              icon
              name="notes"
              rows={4}
              placeholder="Any specific requirements or times to contact you…"
            />
          </InfoField>

          <InfoSubmit>
            <Send className="h-4 w-4" />
            Request Information
          </InfoSubmit>
        </InfoForm>
      </InfoPageBody>
    </InfoLayout>
  );
}
