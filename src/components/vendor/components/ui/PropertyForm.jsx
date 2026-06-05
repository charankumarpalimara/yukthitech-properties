import React, { useState } from 'react';
import {
  User,
  Building,
  MapPin,
  IndianRupee,
  Image as ImageIcon,
  ShieldCheck,
  Play,
  XCircle,
  Briefcase,
  Smartphone,
  Plus,
} from 'lucide-react';
import Modal from './Modal';

export default function PropertyForm({ initialData }) {
  const [openStep, setOpenStep] = useState(1);
  const [lightboxMedia, setLightboxMedia] = useState(null);

  const formData = initialData || {};

  const getYouTubeID = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const getYouTubeThumbnail = (url) => {
    const id = getYouTubeID(url);
    return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : null;
  };

  const getEmbedUrl = (url) => {
    const id = getYouTubeID(url);
    return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : url;
  };

  const steps = [
    { id: 1, title: 'Basic Details', icon: <Building size={16} /> },
    { id: 2, title: 'Pricing & Specs', icon: <IndianRupee size={16} /> },
    { id: 3, title: 'Media Assets', icon: <ImageIcon size={16} /> },
    { id: 4, title: 'Verification', icon: <ShieldCheck size={16} /> },
  ];

  return (
    <div className="bg-white border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col">
      {/* Premium Horizontal Stepper */}
      <div className="flex items-center justify-between px-6 py-6 bg-white border-b border-slate-100 overflow-x-auto scrollbar-hide relative">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <button
              onClick={() => setOpenStep(step.id)}
              className={`flex items-center gap-3 relative z-10 transition-all ${openStep === step.id ? 'text-primary scale-105' : 'text-slate-400 hover:text-slate-600 hover:scale-105'}`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-sm shrink-0 border ${openStep === step.id ? 'bg-primary text-white border-primary shadow-primary/30' : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-white'}`}
              >
                {step.icon}
              </div>
              <div className="text-left hidden md:block">
                <p
                  className={`text-[9px] font-black uppercase tracking-widest ${openStep === step.id ? 'text-primary/70' : 'text-slate-400'}`}
                >
                  Step {step.id}
                </p>
                <p
                  className={`text-xs font-black tracking-tight whitespace-nowrap ${openStep === step.id ? 'text-primary' : 'text-slate-600'}`}
                >
                  {step.title}
                </p>
              </div>
            </button>
            {index < steps.length - 1 && (
              <div className="flex-1 min-w-[2rem] mx-4 h-0.5 rounded-full bg-slate-100 relative">
                <div
                  className={`absolute left-0 top-0 bottom-0 rounded-full transition-all duration-500 ${openStep > step.id ? 'bg-primary w-full' : 'w-0'}`}
                ></div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="bg-white">
        {/* STEP 1: BASIC DETAILS */}
        {openStep === 1 && (
          <div className="p-10 space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/60 mb-6 transition-all hover:bg-white hover:shadow-sm">
                <User size={12} className="text-primary" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-700">
                  Property Information
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    Listed By
                  </p>
                  <p className="text-sm font-bold text-slate-800 capitalize">
                    {formData.uploadertype || 'Not Provided'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    Property Type
                  </p>
                  <p className="text-sm font-bold text-slate-800 capitalize">
                    {formData.propertyType || 'Not Provided'}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    Property Title
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    {formData.title || 'Not Provided'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    Area / Length
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    {formData.propertyLength || 'Not Provided'}
                  </p>
                </div>
              </div>
            </div>

            {/* Location Details */}
            <div className="pt-8 border-t border-slate-100">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/60 mb-6 transition-all hover:bg-white hover:shadow-sm">
                <MapPin size={12} className="text-blue-500" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-700">
                  Location Highlights
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    City
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    {formData.location?.city || 'Not Provided'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    Locality
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    {formData.location?.locality || 'Not Provided'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    Project Name
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    {formData.location?.projectName || 'Not Provided'}
                  </p>
                </div>
                <div className="md:col-span-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    Full Address
                  </p>
                  <p className="text-sm font-bold text-slate-800 leading-relaxed max-w-3xl">
                    {formData.location?.fullAddress || 'Not Provided'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: PRICING & SPECS */}
        {openStep === 2 && (
          <div className="p-10 space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/60 mb-6 transition-all hover:bg-white hover:shadow-sm">
                <IndianRupee size={12} className="text-emerald-500" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-700">
                  Financial Structure
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    Expected Price
                  </p>
                  <p className="text-2xl font-black text-slate-800 tracking-tight">
                    {formData.pricing?.expectedPrice || 'Not Provided'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    Price per SqFt
                  </p>
                  <p className="text-lg font-black text-emerald-600">
                    {formData.pricing?.pricePerSqft || 'Not Provided'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    Maintenance
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    {formData.pricing?.maintenanceCharges || 'Included'}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/60 mb-6 transition-all hover:bg-white hover:shadow-sm">
                <ShieldCheck size={12} className="text-blue-500" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-700">
                  Property Specifications
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    Furnishing Status
                  </p>
                  <p className="text-sm font-bold text-slate-800 capitalize">
                    {formData.furnishingStatus || 'Not Provided'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    Direction Faced
                  </p>
                  <p className="text-sm font-bold text-slate-800 capitalize">
                    {formData.direction || 'Not Provided'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    Availability Status
                  </p>
                  <p className="text-sm font-bold text-slate-800 capitalize">
                    {formData.availabilityStatus || 'Not Provided'}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-8 border-t border-slate-100">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
                  Amenities Provided
                </p>
                <div className="flex flex-wrap gap-2">
                  {(formData.amenities || []).map((amenity) => (
                    <span
                      key={amenity}
                      className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 capitalize"
                    >
                      {amenity}
                    </span>
                  ))}
                  {!(formData.amenities?.length > 0) && (
                    <p className="text-xs font-bold text-slate-400 italic">
                      No amenities specified
                    </p>
                  )}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
                  Location Advantages
                </p>
                <div className="flex flex-wrap gap-2">
                  {(formData.locationAdvantages || []).map((adv) => (
                    <span
                      key={adv}
                      className="px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-lg text-[10px] font-bold text-emerald-700 capitalize"
                    >
                      {adv}
                    </span>
                  ))}
                  {!(formData.locationAdvantages?.length > 0) && (
                    <p className="text-xs font-bold text-slate-400 italic">
                      No advantages specified
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: MEDIA ASSETS */}
        {openStep === 3 && (
          <div className="p-10 space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
                  Cover Asset
                </p>
                {formData.coverPhoto ? (
                  <div
                    className="w-full h-[300px] rounded-[2.5rem] overflow-hidden border border-slate-200 cursor-pointer shadow-lg transition-transform hover:scale-[1.02]"
                    onClick={() => setLightboxMedia({ type: 'image', url: formData.coverPhoto })}
                  >
                    <img
                      src={formData.coverPhoto}
                      className="w-full h-full object-cover"
                      alt="Property Cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-[300px] rounded-[2.5rem] bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                    <ImageIcon size={40} className="mb-4 opacity-20" />
                    <p className="text-[10px] font-black uppercase tracking-widest">
                      No Cover Photo
                    </p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
                  Virtual Tour Video
                </p>
                {formData.video ? (
                  <div
                    className="w-full h-[300px] rounded-[2.5rem] overflow-hidden bg-slate-900 border border-slate-800 shadow-lg cursor-pointer relative group"
                    onClick={() => setLightboxMedia({ type: 'video', url: formData.video })}
                  >
                    <img
                      src={getYouTubeThumbnail(formData.video)}
                      className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                      alt=""
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform">
                        <Play size={24} fill="white" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-[300px] rounded-[2.5rem] bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                    <Play size={40} className="mb-4 opacity-20" />
                    <p className="text-[10px] font-black uppercase tracking-widest">
                      No Video Tour Provided
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-10 border-t border-slate-100">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">
                Gallery Inspection
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {Object.keys(formData.smartAlbum || {}).map((room) => (
                  <div key={room}>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-4">
                      {room} Assets
                    </p>
                    <div className="grid grid-cols-4 gap-3">
                      {(formData.smartAlbum[room] || []).map((img, i) => (
                        <div
                          key={i}
                          className="aspect-square rounded-xl overflow-hidden border border-slate-200 cursor-pointer hover:opacity-80 transition-opacity shadow-sm"
                          onClick={() => setLightboxMedia({ type: 'image', url: img })}
                        >
                          <img src={img} className="w-full h-full object-cover" alt="" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: VERIFICATION */}
        {openStep === 4 && (
          <div className="p-10 space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
                  Ownership Proof
                </p>
                {formData.ownerVerification?.photo ? (
                  <div
                    className="w-full h-40 rounded-2xl overflow-hidden border border-slate-200 cursor-pointer shadow-md hover:shadow-lg transition-all"
                    onClick={() =>
                      setLightboxMedia({ type: 'image', url: formData.ownerVerification.photo })
                    }
                  >
                    <img
                      src={formData.ownerVerification.photo}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  </div>
                ) : (
                  <div className="w-full h-40 rounded-2xl bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300">
                    <Smartphone size={32} />
                  </div>
                )}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
                  Lister Appearance
                </p>
                {formData.uploader?.photo ? (
                  <div
                    className="w-40 h-40 rounded-full overflow-hidden border-2 border-slate-200 cursor-pointer shadow-md hover:border-primary transition-all"
                    onClick={() =>
                      setLightboxMedia({ type: 'image', url: formData.uploader.photo })
                    }
                  >
                    <img
                      src={formData.uploader.photo}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  </div>
                ) : (
                  <div className="w-40 h-40 rounded-full bg-slate-50 border border-2 border-slate-200 flex items-center justify-center text-slate-300">
                    <User size={48} />
                  </div>
                )}
              </div>
              <div className="md:pt-0 pt-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/60 mb-6 w-full">
                  <Briefcase size={12} className="text-primary" />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-700">
                    Legal Reference
                  </h4>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                      Attorney Name
                    </p>
                    <p className="text-sm font-bold text-slate-800 px-1">
                      {formData.lawyerDetails?.name || 'Not Provided'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                      Contact Reference
                    </p>
                    <p className="text-sm font-black text-slate-900 tracking-widest px-1">
                      {formData.lawyerDetails?.mobile || 'Not Provided'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-10 border-t border-slate-100">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">
                Verified Certificates & Deeds
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { id: 'saleDeed', label: 'Sale Deed' },
                  { id: 'encumbranceCert', label: 'EC Certificate' },
                  { id: 'propertyTaxReceipt', label: 'Tax Receipt' },
                  { id: 'legalOpinion', label: 'Legal Opinion' },
                ].map((doc) => {
                  const proofImg = formData.ownershipProofs?.[doc.id];
                  return (
                    <div key={doc.id}>
                      {proofImg ? (
                        <div
                          className="w-full h-24 rounded-xl overflow-hidden border border-slate-200 cursor-pointer shadow-sm hover:shadow-md transition-all group relative"
                          onClick={() => setLightboxMedia({ type: 'image', url: proofImg })}
                        >
                          <img
                            src={proofImg}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            alt=""
                          />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Plus size={16} className="text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-24 bg-slate-50 border border-slate-200 border-dashed rounded-xl flex items-center justify-center text-slate-300">
                          <XCircle size={20} />
                        </div>
                      )}
                      <p className="text-[10px] font-black uppercase tracking-widest mt-3 text-center text-slate-600">
                        {doc.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <Modal
        isOpen={!!lightboxMedia}
        onClose={() => setLightboxMedia(null)}
        title={lightboxMedia?.type === 'video' ? 'Virtual Tour' : 'Asset Detail'}
        size="xl"
      >
        <div className="bg-slate-950 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center min-h-[400px]">
          {lightboxMedia?.type === 'video' ? (
            <iframe
              src={getEmbedUrl(lightboxMedia.url)}
              className="w-full aspect-video border-none shadow-2xl"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <img
              src={lightboxMedia?.url}
              className="max-w-full max-h-[85vh] object-contain shadow-2xl"
              alt=""
            />
          )}
        </div>
      </Modal>
    </div>
  );
}
