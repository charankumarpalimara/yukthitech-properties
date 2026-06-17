import React, { useState } from 'react';
import InfoLayout from '../../components/InfoLayout/InfoLayout';
import { usePageData } from '../../hooks/usePageData';
import { Star, MessageSquare, User, Mail } from 'lucide-react';
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
  InfoAlert,
  InfoLink,
} from '../../components/InfoLayout/InfoPageUi';

const satisfactionLabels = {
  1: 'Very unsatisfied',
  2: 'Unsatisfied',
  3: 'Neutral',
  4: 'Satisfied',
  5: 'Very satisfied',
};

const toastStyle = { background: '#0f172a', color: '#ffffff', borderRadius: '12px' };

export default function Feedback() {
  const { pageData, loading } = usePageData('feedback');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a satisfaction rating.', { style: toastStyle });
      return;
    }
    toast.success('Thank you for your feedback!', { style: toastStyle });
    setRating(0);
    e.target.reset();
  };

  const displayRating = hoverRating || rating;

  return (
    <InfoLayout
      title={pageData?.title || 'Feedback'}
      subtitle="Tell us what is working and what we should improve."
    >
      <InfoPageBody loading={loading} cmsHtml={pageData?.content}>
        <InfoLead>
          Your feedback helps us improve search, listings, and support. It takes about a minute to
          complete.
        </InfoLead>

        <InfoForm onSubmit={handleSubmit}>
          <div>
            <label className="mb-3 block text-sm font-semibold text-slate-700">
              Overall satisfaction
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setRating(num)}
                  onMouseEnter={() => setHoverRating(num)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="rounded-lg p-1 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/25"
                  aria-label={`Rate ${num} out of 5`}
                >
                  <Star
                    className={`h-9 w-9 transition-colors ${
                      displayRating >= num ? 'fill-gold text-gold' : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
              {displayRating > 0 && (
                <span className="ml-2 text-sm font-semibold text-primary">
                  {satisfactionLabels[displayRating]}
                </span>
              )}
            </div>
          </div>

          <InfoFormRow>
            <InfoField label="Name (optional)" icon={User}>
              <InfoInput icon type="text" name="name" placeholder="Your name" />
            </InfoField>
            <InfoField label="Email (optional)" icon={Mail}>
              <InfoInput icon type="email" name="email" placeholder="you@example.com" />
            </InfoField>
          </InfoFormRow>

          <InfoField label="Your feedback" icon={MessageSquare} multiline>
            <InfoTextarea
              icon
              name="feedback"
              rows={5}
              placeholder="What did you like or what should we fix?"
              required
            />
          </InfoField>

          <InfoSubmit>Submit feedback</InfoSubmit>
        </InfoForm>

        <InfoAlert variant="slate">
          For formal complaints that need escalation, use our{' '}
          <InfoLink to="/grievances">Grievances</InfoLink> page instead.
        </InfoAlert>
      </InfoPageBody>
    </InfoLayout>
  );
}
