import React, { useState } from 'react';
import InfoLayout from '../../components/InfoLayout/InfoLayout';
import { usePageData } from '../../hooks/usePageData';
import { Star, MessageSquare, Heart, Sparkles, User, Mail } from 'lucide-react';
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
} from '../../components/InfoLayout/InfoPageUi';

const satisfactionLabels = {
  1: 'Very Unsatisfied',
  2: 'Unsatisfied',
  3: 'Neutral',
  4: 'Satisfied',
  5: 'Very Satisfied',
};

const toastStyle = { background: '#0f172a', color: '#ffffff', borderRadius: '12px' };

export default function Feedback() {
  const { pageData, loading } = usePageData('feedback');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select an overall satisfaction rating.', { style: toastStyle });
      return;
    }
    toast.success('Thank you for your valuable feedback!', { style: toastStyle });
    setRating(0);
    e.target.reset();
  };

  const displayRating = hoverRating || rating;

  return (
    <InfoLayout
      title={pageData?.title || 'Feedback'}
      subtitle="Share your experience and help us improve Yukthi Properties."
    >
      <InfoPageBody loading={loading} cmsHtml={pageData?.content}>
        <InfoSectionTitle>Help Us Improve</InfoSectionTitle>
        <InfoText>
          Your feedback is crucial to making Yukthi Properties the best real estate platform in
          India. Whether it&apos;s a suggestion, a compliment, or a critique, we want to hear it.
        </InfoText>

        <InfoForm onSubmit={handleSubmit}>
          <div>
            <label className="mb-3 block text-sm font-semibold text-slate-700">
              Overall Satisfaction
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
            <InfoField label="Your Name (Optional)" icon={User}>
              <InfoInput icon type="text" name="name" placeholder="Enter your name" />
            </InfoField>
            <InfoField label="Your Email (Optional)" icon={Mail}>
              <InfoInput icon type="email" name="email" placeholder="example@gmail.com" />
            </InfoField>
          </InfoFormRow>

          <InfoField label="What do you like most about our platform?" icon={Sparkles}>
            <InfoInput
              icon
              type="text"
              name="likes"
              placeholder="e.g. Verified listings, ease of navigation, customer support"
            />
          </InfoField>

          <InfoField label="Your Feedback" icon={MessageSquare} multiline>
            <InfoTextarea
              icon
              name="feedback"
              rows={6}
              placeholder="Tell us more about your experience..."
              required
            />
          </InfoField>

          <InfoSubmit>
            <Heart className="h-4 w-4 fill-current" />
            Submit Feedback
          </InfoSubmit>
        </InfoForm>
      </InfoPageBody>
    </InfoLayout>
  );
}
