import React from 'react';
import InfoLayout from '../../components/InfoLayout/InfoLayout';
import { usePageData } from '../../hooks/usePageData';
import { MapPin, Info, User, Phone, Send, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  InfoPageBody,
  InfoLead,
  InfoText,
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

export default function RequestInfo() {
  const { pageData, loading } = usePageData('request-info');

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Request submitted. A consultant will reach out within 24 hours.', {
      style: toastStyle,
    });
    e.target.reset();
  };

  return (
    <InfoLayout
      title={pageData?.title || 'Request Info'}
      subtitle="Ask for brochures, pricing, or site visit details."
    >
      <InfoPageBody loading={loading} cmsHtml={pageData?.content}>
        <InfoLead>
          Need details about a project or locality that is not fully listed yet? Send a request and
          our team will follow up.
        </InfoLead>

        <InfoText>
          If the property is already on Yukthi Properties, use the enquiry option on its detail page
          for a faster response.
        </InfoText>

        <InfoForm onSubmit={handleSubmit}>
          <InfoFormRow>
            <InfoField label="Project / locality" icon={MapPin}>
              <InfoInput
                icon
                type="text"
                name="project"
                placeholder="e.g. Gachibowli or project name"
                required
              />
            </InfoField>
            <InfoField label="Information needed" icon={Info}>
              <InfoSelect icon name="infoType" required defaultValue="">
                <option value="" disabled>
                  Select…
                </option>
                <option value="brochure">Brochure</option>
                <option value="pricing">Price list</option>
                <option value="plans">Floor plans</option>
                <option value="visit">Site visit</option>
                <option value="other">Other</option>
              </InfoSelect>
            </InfoField>
          </InfoFormRow>

          <InfoFormRow>
            <InfoField label="Your name" icon={User}>
              <InfoInput icon type="text" name="name" placeholder="Full name" required />
            </InfoField>
            <InfoField label="Phone number" icon={Phone}>
              <InfoInput icon type="tel" name="phone" placeholder="+91 00000 00000" required />
            </InfoField>
          </InfoFormRow>

          <InfoField label="Notes (optional)" icon={FileText} multiline>
            <InfoTextarea
              icon
              name="notes"
              rows={4}
              placeholder="Budget, BHK preference, or preferred callback time…"
            />
          </InfoField>

          <InfoSubmit>
            <Send className="h-4 w-4" />
            Request information
          </InfoSubmit>
        </InfoForm>

        <InfoAlert variant="slate">
          General questions? Visit <InfoLink to="/contact-us">Contact Us</InfoLink>.
        </InfoAlert>
      </InfoPageBody>
    </InfoLayout>
  );
}
