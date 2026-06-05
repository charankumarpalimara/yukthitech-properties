import React, { useMemo } from 'react';
import {
  IndianRupee,
  Award,
  Waves,
  Dumbbell,
  Zap,
  ShieldCheck,
  Car,
  ArrowUpCircle,
  Users,
  Trees,
  Activity,
  Droplets,
  CloudRain,
  Video as VideoIcon,
  ImageIcon,
  Camera,
  Eye,
  Trash2,
  Play,
  Check,
  CheckCircle,
  Plus,
  Smartphone,
  Info,
  FileText,
  UploadCloud,
} from 'lucide-react';
import {
  PROPERTY_STATUSES,
  GST_OPTIONS,
  STAMP_DUTY_OPTIONS,
  AMENITIES,
} from '../../../constants/formOptions';

import { PF_INPUT, PF_LABEL, PF_LABEL_BLOCK } from './formFieldClasses';

const SectionBlock = ({ id, title, description, icon, required, children }) => {
  return (
    <section
      id={id}
      className="p-6 rounded-2xl border border-primary/10 bg-white shadow-sm scroll-mt-24"
    >
      <div className="flex items-center gap-3 pb-5 mb-5 border-b border-slate-100">
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <h3 className="text-md font-semibold text-slate-900 leading-none">{title}</h3>
          {description && (
            <p className="text-md text-slate-500 mt-1.5 font-medium">{description}</p>
          )}
        </div>
        {required && (
          <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest ml-2 bg-rose-50 px-2 py-0.5 rounded border border-rose-100/50">
            Required
          </span>
        )}
      </div>
      <div>{children}</div>
    </section>
  );
};

const AMENITY_ICONS = {
  'Swimming Pool': <Waves size={16} />,
  Gymnasium: <Dumbbell size={16} />,
  'Power Backup': <Zap size={16} />,
  '24/7 Security': <ShieldCheck size={16} />,
  'Car Parking': <Car size={16} />,
  'Elevator / Lift': <ArrowUpCircle size={16} />,
  'Club House': <Users size={16} />,
  'Park / Play Area': <Trees size={16} />,
  'Jogging Track': <Activity size={16} />,
  'Water Supply (24/7)': <Droplets size={16} />,
  'Rain Water Harvesting': <CloudRain size={16} />,
  'CCTV Surveillance': <VideoIcon size={16} />,
};

export default function Step2FinancialsMedia({
  formData,
  handleChange,
  handleNestedChange,
  handleFileChange,
  validationErrors,
  hasAmenities,
  setHasAmenities,
  userType,
  isResidential,
  isStandalone,
  posterRef,
  videoRef,
  brochureRef,
  photosRef,
  setLightboxMedia,
}) {
  const customAmenityRef = React.useRef(null);

  const customAmenities = useMemo(
    () => formData.amenities.filter((a) => !AMENITIES.includes(a)),
    [formData.amenities]
  );

  // Helper for rendering preview URLs for both existing URLs and newly selected File objects
  const renderPreview = (file) => {
    if (!file) return null;
    if (typeof file === 'string') return file;
    try {
      return URL.createObjectURL(file);
    } catch (e) {
      return null;
    }
  };

  const hasBrochure = (brochure) => {
    if (!brochure) return false;
    if (brochure instanceof File) return true;
    return typeof brochure === 'string' && brochure.trim().length > 0;
  };

  const getBrochureLabel = (brochure) => {
    if (!hasBrochure(brochure)) return '';
    if (brochure instanceof File) return brochure.name;
    if (typeof brochure === 'string') {
      const parts = brochure.split('/');
      return parts[parts.length - 1] || 'Project Brochure.pdf';
    }
    return 'Project Brochure.pdf';
  };

  const openBrochurePreview = (brochure) => {
    const url = renderPreview(brochure);
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-white space-y-6 px-6 pb-6">
      {/* ── AMENITIES ── */}
      <SectionBlock
        id="section-amenities"
      // title="Property Amenities"
      // description="Add modern amenities to attract more buyers"
      // icon={<Activity size={16} />}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-8 w-full">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl transition-colors duration-300 ${hasAmenities ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-500'}`}
            >
              <Activity size={16} />
            </div>
            <div>
              <h4 className="text-md font-semibold text-slate-900 leading-none">
                Property Amenities
              </h4>
              <p className="text-md text-slate-500 mt-1.5 font-medium">
                Add modern amenities to attract more buyers
              </p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            {['Yes', 'No'].map((choice) => {
              const isSelected =
                (choice === 'Yes' && hasAmenities) || (choice === 'No' && !hasAmenities);
              return (
                <label
                  key={choice}
                  className={`flex items-center justify-center gap-2 px-4 py-1.5 rounded-full border bg-white transition-all cursor-pointer ${isSelected ? 'border-primary text-primary shadow-sm' : 'border-slate-200 hover:border-slate-300 text-slate-500'}`}
                >
                  <input
                    type="radio"
                    name="hasAmenities"
                    className="hidden"
                    checked={isSelected}
                    onChange={() => setHasAmenities(choice === 'Yes')}
                  />
                  <div
                    className={`w-3.5 h-3.5 rounded-full border-2 transition-all flex items-center justify-center ${isSelected ? 'border-primary' : 'border-slate-300'}`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                  </div>
                  <span className="text-[14px] font-semibold">{choice}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          {hasAmenities && (
            <div className="mt-5 pt-5 border-t border-slate-100/85 animate-in fade-in slide-in-from-top-3 duration-500 space-y-6">
              {/* Simple & Elegant Custom Amenity Entry */}
              <div className="flex items-center gap-4 bg-slate-50/50 px-5 py-3 rounded-xl border border-slate-100 max-w-xl">
                <div className="flex items-center gap-2 shrink-0 border-r border-slate-200 pr-4">
                  <span className="text-sm font-semibold text-slate-400">Other</span>
                </div>
                <input
                  ref={customAmenityRef}
                  type="text"
                  placeholder="Add custom amenity and press Enter..."
                  className={`flex-1 pl-3 pr-3 ${PF_INPUT}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = e.target.value.trim();
                      if (val && !formData.amenities.includes(val)) {
                        handleChange('amenities', [...formData.amenities, val]);
                        e.target.value = '';
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const val = customAmenityRef.current?.value.trim();
                    if (val && !formData.amenities.includes(val)) {
                      handleChange('amenities', [...formData.amenities, val]);
                      customAmenityRef.current.value = '';
                    }
                  }}
                  className="w-6 h-6 flex items-center justify-center bg-primary/10 rounded-full text-primary hover:bg-primary hover:text-white transition-all group"
                >
                  <Plus
                    size={14}
                    strokeWidth={3}
                    className="group-hover:scale-110 transition-transform"
                  />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {/* Custom Amenities */}
                {customAmenities.map((amenity) => (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => {
                      const newAmenities = formData.amenities.filter((a) => a !== amenity);
                      handleChange('amenities', newAmenities);
                    }}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-primary bg-primary/5 text-primary transition-all text-left group"
                  >
                    <Plus
                      size={14}
                      className="shrink-0 rotate-45 text-rose-500 group-hover:scale-125 transition-transform"
                    />
                    <span className="text-sm font-semibold flex-1">{amenity}</span>
                  </button>
                ))}

                {AMENITIES.map((amenity) => {
                  const isSelected = formData.amenities.includes(amenity);
                  return (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => {
                        const newAmenities = isSelected
                          ? formData.amenities.filter((a) => a !== amenity)
                          : [...formData.amenities, amenity];
                        handleChange('amenities', newAmenities);
                      }}
                      className={`flex items-center gap-2.5 px-3 py-3 rounded-lg border transition-all text-left ${isSelected ? 'border-primary bg-primary/5 text-primary font-bold' : 'border-slate-100 hover:border-slate-200 text-slate-500'}`}
                    >
                      <div className={`${isSelected ? 'text-primary' : 'text-slate-400'} shrink-0`}>
                        {React.cloneElement(AMENITY_ICONS[amenity] || <Award size={16} />, {
                          size: 16,
                        })}
                      </div>
                      <span className="text-sm font-semibold line-clamp-2">{amenity}</span>
                      {isSelected && <CheckCircle size={12} className="ml-auto shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </SectionBlock>

      {/* ── MEDIA ── */}
      <SectionBlock
        id="section-media"
        title="Photos & Videos"
        description="Upload posters, virtual tours, and photo galleries"
        icon={<Camera size={18} />}
        required
      >
        <div className="space-y-6">
          {/* Professional Service Promotion - Full Width Layout */}
          {/* <div className="p-6 rounded-2xl border-2 border-slate-200 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group/promo">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/promo:opacity-10 transition-all duration-700 -rotate-12 group-hover/promo:scale-110">
              <VideoIcon size={120} className="text-slate-900" />
            </div>
            <div className="relative z-10 flex-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-semibold border border-primary/20">
                  Premium Service
                </div>
                <span className="text-xs font-semibold text-slate-400">Video Support</span>
              </div>
              <h4 className="text-sm md:text-base font-bold text-slate-800 leading-snug">
                Need Professional Video Editing?
              </h4>
              <p className="text-[11px] text-slate-500 mt-2 font-medium leading-relaxed max-w-2xl">
                If you need professional video editing or a high-quality virtual tour, please
                contact our media team. We help you create stunning videos for your property.
              </p>
            </div>
            <div className="relative z-10 flex items-center gap-4 bg-white border border-slate-100 p-3 rounded-2xl shadow-sm min-w-[240px]">
              <div className="flex items-center gap-3 flex-1 border-r border-slate-100 pr-4">
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                  <Smartphone size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[12px] font-black text-slate-800 tracking-tight">
                    +91 98042 93293
                  </span>
                  <span className="text-xs font-semibold text-slate-400">Media Support</span>
                </div>
              </div>
              <a
                href="tel:+91 98042 93293"
                className="flex items-center gap-2 h-10 px-5 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary/90 transition-all active:scale-95 shadow-md shadow-primary/20"
              >
                Contact
              </a>
            </div>
          </div> */}
          {/* Top Row: Poster & Video */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Poster Image */}
            <div className="space-y-4">
              <div className="flex items-baseline justify-between">
                <p className={`${PF_LABEL} flex items-center gap-2`}>
                  Display Poster Image{' '}
                  <span className="text-rose-500 font-semibold">* Required</span>
                </p>
                <span className="text-sm font-normal text-slate-400">
                  1200 × 800 px · JPG/PNG · Max 5MB
                </span>
              </div>
              <div
                id="property-field-poster"
                className={`relative h-44 rounded-2xl overflow-hidden border-2 group bg-slate-50 ${validationErrors['media.poster'] ? 'border-rose-400' : 'border-slate-100'}`}
              >
                {!formData.media.poster ? (
                  <div
                    onClick={() => posterRef.current.click()}
                    className="w-full h-full border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:border-primary/50 transition-all group/box"
                  >
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover/box:text-primary transition-colors mb-2">
                      <ImageIcon size={20} />
                    </div>
                    <span className="text-sm font-medium text-slate-500">Upload Poster</span>
                    <span className="text-sm font-normal text-slate-400 mt-1">
                      Recommended: 1200 × 800 px
                    </span>
                  </div>
                ) : (
                  <>
                    <img
                      src={renderPreview(formData.media.poster)}
                      alt="Poster"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                      <button
                        type="button"
                        onClick={() =>
                          setLightboxMedia({
                            url: renderPreview(formData.media.poster),
                            type: 'image',
                          })
                        }
                        className="p-2.5 bg-white rounded-full text-slate-700 hover:text-primary transition-all shadow-lg hover:scale-110"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNestedChange('media', 'poster', null)}
                        className="p-2.5 bg-white rounded-full text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-lg hover:scale-110"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </>
                )}
                <input
                  type="file"
                  ref={posterRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'poster', 'media')}
                />
              </div>
              {validationErrors['media.poster'] && (
                <p className="text-xs text-rose-500 font-semibold">
                  {validationErrors['media.poster']}
                </p>
              )}
            </div>

            {/* Property Video */}
            <div className="space-y-4">
              <div className="flex items-baseline justify-between">
                <p className={PF_LABEL}>
                  Virtual Tour Video <span className="text-slate-400 font-normal">(Optional)</span>
                </p>
                <span className="text-sm font-normal text-slate-400">
                  MP4/MOV · Max 20MB · 1080p
                </span>
              </div>
              <div className="relative h-44 rounded-2xl overflow-hidden border-2 border-slate-100 group bg-slate-900/5">
                {!formData.media.video ? (
                  <div
                    onClick={() => videoRef.current.click()}
                    className="w-full h-full border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:border-primary/50 transition-all group/box"
                  >
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover/box:text-primary transition-colors mb-2">
                      <Play size={20} className="ml-1" />
                    </div>
                    <span className="text-sm font-medium text-slate-500">Upload Video</span>
                    <span className="text-sm font-normal text-slate-400 mt-1">
                      MP4 or MOV · Max 20MB
                    </span>
                  </div>
                ) : (
                  <>
                    <video
                      src={renderPreview(formData.media.video)}
                      className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 flex items-center justify-center gap-3 backdrop-blur-[1px]">
                      <button
                        type="button"
                        onClick={() =>
                          setLightboxMedia({
                            url: renderPreview(formData.media.video),
                            type: 'video',
                          })
                        }
                        className="p-2.5 bg-white rounded-full text-slate-700 hover:text-primary transition-all shadow-lg hover:scale-110"
                      >
                        <Play size={18} className="ml-1" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNestedChange('media', 'video', null)}
                        className="p-2.5 bg-white rounded-full text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-lg hover:scale-110"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                      <Check size={10} strokeWidth={4} /> Video Ready
                    </div>
                  </>
                )}
                <input
                  type="file"
                  ref={videoRef}
                  className="hidden"
                  accept="video/*"
                  onChange={(e) => handleFileChange(e, 'video', 'media')}
                />
              </div>
              {/* <div
                role="note"
                className="flex gap-3 p-3.5 rounded-xl border border-amber-200 bg-amber-50 shadow-sm"
              >
                <div className="shrink-0 w-8 h-8 rounded-lg bg-amber-100 border border-amber-200/80 flex items-center justify-center text-amber-700">
                  <Info size={16} strokeWidth={2.5} />
                </div>
                <div className="min-w-0">
                  <p className="text-md font-semibold text-amber-900">Note</p>
                  <p className="text-md font-medium text-amber-800 mt-0.5 leading-snug">
                    If you upload a video, our admin team may publish it on Yukthi Properties
                    channels (e.g. YouTube) for promotion.
                  </p>
                </div>
              </div> */}

              {/* Video Consent Toggle */}
              {/* {formData.media.video && ( */}
              {/* <div className="flex items-center justify-between p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl animate-in fade-in slide-in-from-top-2 duration-500">
                                <div className="flex items-center gap-2.5">
                                    <div className={`p-1.5 rounded-lg text-white ${formData.media.videoConsent ? 'bg-emerald-500' : 'bg-slate-400'}`}>
                                        <CheckCircle size={14} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-800">I consent to YouTube upload</p>
                                        <p className="text-xs text-slate-500 font-medium italic">Promote property on official channel.</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleNestedChange('media', 'videoConsent', !formData.media.videoConsent)}
                                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-all ${formData.media.videoConsent ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                >
                                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${formData.media.videoConsent ? 'translate-x-5' : 'translate-x-1'}`} />
                                </button>
                            </div> */}
              {/* )} */}
            </div>
          </div>

          {/* Project Brochure */}
          {/* <div className="space-y-4 pt-4 border-t border-slate-50">
            <div className="flex items-baseline justify-between">
              <p className={PF_LABEL}>
                Project Brochure <span className="text-slate-400 font-normal">(Optional)</span>
              </p>
              <span className="text-sm font-normal text-slate-400">PDF only · Max 10MB</span>
            </div>
            <div
              onClick={() => !hasBrochure(formData.media.brochure) && brochureRef.current?.click()}
              className={`relative rounded-2xl border-2 transition-all group bg-slate-50 ${hasBrochure(formData.media.brochure) ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-100 border-dashed hover:border-primary/40 hover:bg-white cursor-pointer'}`}
            >
              {!hasBrochure(formData.media.brochure) ? (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 p-8">
                  <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                    <FileText size={22} />
                  </div>
                  <div className="text-center sm:text-left">
                    <span className="text-sm font-medium text-slate-600 block">
                      Upload project brochure
                    </span>
                    <span className="text-sm font-normal text-slate-400 mt-0.5 block">
                      Share floor plans, pricing, and project details with buyers
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 shadow-sm">
                    <UploadCloud size={14} />
                    Choose PDF
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-4 p-5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <FileText size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {getBrochureLabel(formData.media.brochure)}
                      </p>
                      <p className="text-xs font-medium text-emerald-600 mt-0.5 flex items-center gap-1">
                        <Check size={10} strokeWidth={4} /> Brochure uploaded
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => openBrochurePreview(formData.media.brochure)}
                      className="p-2.5 bg-white rounded-full text-slate-700 hover:text-primary transition-all shadow-sm border border-slate-100"
                      title="View brochure"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => brochureRef.current?.click()}
                      className="p-2.5 bg-white rounded-full text-slate-700 hover:text-primary transition-all shadow-sm border border-slate-100"
                      title="Replace brochure"
                    >
                      <UploadCloud size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNestedChange('media', 'brochure', null)}
                      className="p-2.5 bg-white rounded-full text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm border border-slate-100"
                      title="Remove brochure"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}
              <input
                type="file"
                ref={brochureRef}
                className="hidden"
                accept="application/pdf"
                onChange={(e) => {
                  handleFileChange(e, 'brochure', 'media');
                  e.target.value = '';
                }}
              />
            </div>
          </div> */}

          {/* Bottom Row: Gallery */}
          <div className="space-y-4 pt-4 border-t border-slate-50">
            <div className="flex items-baseline justify-between">
              <p className={PF_LABEL}>
                Property Gallery{' '}
                <span className="text-slate-400 font-normal">
                  (Max 10 photos, 1200 × 900 px · JPG/PNG · Max 5MB each)
                </span>
              </p>
              {/* <span className="text-[9px] text-slate-400 font-medium"></span> */}
            </div>
            <div className="flex flex-wrap gap-3">
              <div
                onClick={() => photosRef.current.click()}
                className="w-20 h-20 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:border-primary/50 transition-all group shrink-0"
              >
                <input
                  type="file"
                  ref={photosRef}
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileChange(e, 'photos', 'media', true)}
                />
                <div className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors mb-1">
                  <Plus size={14} />
                </div>
                <span className="text-sm font-medium text-slate-500 text-center">Add</span>
              </div>
              {formData?.media?.photos?.map((photo, idx) => (
                <div
                  key={idx}
                  className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 border-slate-100 group shadow-sm"
                >
                  <img
                    src={renderPreview(photo)}
                    alt={`Property ${idx}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 backdrop-blur-[1px]">
                    <button
                      type="button"
                      onClick={() => setLightboxMedia({ url: renderPreview(photo), type: 'image' })}
                      className="p-1 bg-white rounded-full text-slate-700 hover:text-primary transition-all shadow-md"
                    >
                      <Eye size={10} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const newPhotos = formData.media.photos.filter((_, i) => i !== idx);
                        handleNestedChange('media', 'photos', newPhotos);
                      }}
                      className="p-1 bg-white rounded-full text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-md"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                  <div className="absolute top-1 left-1 bg-white/90 backdrop-blur-sm text-slate-900 w-4 h-4 rounded-full flex items-center justify-center text-xs font-semibold shadow-sm border border-slate-100">
                    {idx + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionBlock>
    </div>
  );
}
