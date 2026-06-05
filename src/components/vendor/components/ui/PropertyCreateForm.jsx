import { useVendorCategoriesStore } from '../../../../store/vendorCategoriesStore';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  CheckCircle,
  ImageIcon,
  Trash2,
  CheckCircle as CheckCircleIcon,
  Building,
  IndianRupee,
  ShieldCheck,
  Activity,
  Camera,
  FileText,
  Send,
  ChevronRight,
} from 'lucide-react';
// Subcomponents
import Step1Profile from './property-form/Step1Profile';
import Step2FinancialsMedia from './property-form/Step2FinancialsMedia';
import Modal from './Modal';
import usePropertyForm from './property-form/usePropertyForm';
import { PROJECT_TYPES } from '../../constants/formOptions';
import { BTN_PRIMARY, BTN_SECONDARY } from './property-form/formFieldClasses';

const NAV_SECTIONS = [
  { id: 'section-basic', label: 'Basic Info', icon: Building, required: true },
  { id: 'section-specs', label: 'Specifications', icon: FileText, required: false },
  { id: 'section-pricing', label: 'Pricing', icon: IndianRupee, required: true },
  { id: 'section-rera', label: 'RERA & Approvals', icon: ShieldCheck, required: false },
  { id: 'section-amenities', label: 'Amenities', icon: Activity, required: false },
  { id: 'section-media', label: 'Photos & Media', icon: Camera, required: true },
];

function SectionDot({ filled }) {
  return (
    <span
      className={`w-2 h-2 rounded-full shrink-0 transition-all duration-300 ${
        filled ? 'bg-emerald-500 shadow-sm shadow-emerald-200' : 'bg-slate-200'
      }`}
    />
  );
}

export default function PropertyCreateForm({ initialData, onCancel, onSubmit }) {
  const categories = useVendorCategoriesStore((s) => s.categories);

  const {
    formData,
    propertyId,
    openStep,
    setOpenStep,
    cities,
    propertyStatus,
    rejectionReason,
    hasAmenities,
    setHasAmenities,
    isStep1Completed,
    validationErrors,
    submitAttempted,
    autoSaveStatus,
    userType,
    lightboxMedia,
    setLightboxMedia,
    showProjectModal,
    setShowProjectModal,
    editingProjectIndex,
    currentProject,
    setCurrentProject,
    isResidential,
    isStandalone,
    isProject,
    isSingleUnit,
    isLand,
    isLandForDevelopment,
    isCommercial,
    isApartment,
    idCardFrontRef,
    idCardBackRef,
    reraCertRef,
    layoutPermissionRef,
    buildingPermissionRef,
    hmdaApprovalRef,
    posterRef,
    videoRef,
    brochureRef,
    photosRef,
    handleChange,
    handleDevelopmentRatioChange,
    handleNestedChange,
    handleUnifiedUnitChange,
    handleFileChange,
    handleAddAdditionalApproval,
    handleUpdateAdditionalApproval,
    handleDeleteAdditionalApproval,
    handleAdditionalApprovalFileChange,
    handleFinalSubmit,
    handleProjectImageChange,
    handleSaveProject,
    completionStats,
  } = usePropertyForm(initialData, onCancel, onSubmit, categories);

  const [activeSection, setActiveSection] = useState('section-basic');
  const scrollRef = useRef(null);
  const observerRef = useRef(null);

  // Completion map for sidebar dots
  const sectionFilled = {
    'section-basic': !!(formData.projectName && formData.propertyType && formData.projectApprovedBy),
    'section-specs': !!(formData.totalArea),
    'section-pricing': !!(formData.priceDetails?.totalPrice),
    'section-rera': true,
    'section-amenities': true,
    'section-media': !!(formData.media?.poster),
  };

  // IntersectionObserver to highlight active section
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Find the entry with highest intersection ratio that is intersecting
        let best = null;
        entries.forEach((e) => {
          if (e.isIntersecting) {
            if (!best || e.intersectionRatio > best.intersectionRatio) {
              best = e;
            }
          }
        });
        if (best) setActiveSection(best.target.id);
      },
      {
        root: container,
        rootMargin: '-10% 0px -60% 0px',
        threshold: [0, 0.1, 0.5, 1],
      }
    );

    NAV_SECTIONS.forEach(({ id }) => {
      const el = container.querySelector(`#${id}`);
      if (el) observerRef.current.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  const scrollToSection = useCallback((id) => {
    const container = scrollRef.current;
    if (!container) return;
    const el = container.querySelector(`#${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
    }
  }, []);

  return (
    <>
      {/* ── STICKY PROGRESS HEADER ── */}
      <div className="sticky top-0 z-[99] flex justify-center pointer-events-none px-4 pt-2">
        <div className="w-full max-w-2xl bg-white/95 backdrop-blur-md border border-slate-200/60 rounded-2xl p-2 px-6 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] flex items-center justify-between pointer-events-auto animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg viewBox="0 0 40 40" className="w-full h-full transform -rotate-90">
                <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-slate-100" />
                <circle
                  cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="3" fill="transparent"
                  strokeDasharray={113.1}
                  strokeDashoffset={113.1 - (113.1 * completionStats.total) / 100}
                  strokeLinecap="round"
                  className="text-primary transition-all duration-1000 ease-out"
                />
              </svg>
              <span className="absolute text-md font-bold text-slate-800">{completionStats.total}%</span>
            </div>
            <div className="flex flex-col min-w-0">
              <h3 className="text-md font-semibold text-slate-500 leading-none mb-1">Property Progress</h3>
              <p className="text-md font-medium text-slate-800 leading-snug">
                {completionStats.total === 100 ? 'All details added successfully' : `You have filled ${completionStats.total}% of details`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="h-8 w-px bg-slate-100" />
            <div className="text-right">
              <p className="text-md font-semibold text-slate-500 mb-1">Auto Save</p>
              <div className="flex items-center gap-1.5 justify-end">
                <div className={`w-2 h-2 rounded-full ${autoSaveStatus === 'saving' ? 'bg-amber-400 animate-pulse' : autoSaveStatus === 'saved' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                <span className="text-md font-semibold text-slate-800">
                  {autoSaveStatus === 'saving' ? 'Saving...' : autoSaveStatus === 'saved' ? 'Saved' : 'Draft'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN BODY: sidebar + content ── */}
      <div className="flex gap-0 h-full min-h-0 relative">

        {/* ── LEFT SIDEBAR ── */}
        <aside className="hidden lg:flex flex-col w-[220px] shrink-0 sticky top-[72px] h-[calc(100vh-160px)] border-r border-slate-100 bg-slate-50/40 pt-6 pb-4 overflow-y-auto">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-5 mb-3">Sections</p>
          <nav className="flex flex-col gap-0.5 px-3 flex-1">
            {NAV_SECTIONS.map(({ id, label, icon: Icon }) => {
              const isActive = activeSection === id;
              const filled = sectionFilled[id];
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => scrollToSection(id)}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 w-full ${
                    isActive
                      ? 'bg-primary text-white shadow-sm shadow-primary/20'
                      : 'text-slate-500 hover:bg-white hover:text-slate-800 hover:shadow-sm'
                  }`}
                >
                  <Icon size={15} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
                  <span className="text-[13px] font-semibold flex-1 truncate">{label}</span>
                  <SectionDot filled={filled} />
                  {!isActive && <ChevronRight size={12} className="opacity-0 group-hover:opacity-40 transition-opacity" />}
                </button>
              );
            })}
          </nav>

          {/* Submit button in sidebar */}
          <div className="px-3 pt-4 border-t border-slate-100 mt-3">
            {submitAttempted && Object.keys(validationErrors).length > 0 && (
              <div className="mb-3 p-3 rounded-xl bg-rose-50 border border-rose-100">
                <p className="text-[11px] font-bold text-rose-700 mb-1">Missing required fields</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {Object.values(validationErrors).slice(0, 4).map((msg) => (
                    <li key={msg} className="text-[10px] text-rose-600 font-medium">{msg}</li>
                  ))}
                  {Object.values(validationErrors).length > 4 && (
                    <li className="text-[10px] text-rose-500 font-medium">+{Object.values(validationErrors).length - 4} more…</li>
                  )}
                </ul>
              </div>
            )}
            <button
              type="button"
              onClick={handleFinalSubmit}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white text-[13px] font-bold shadow-md shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all"
            >
              <Send size={14} />
              Post Property
            </button>
          </div>
        </aside>

        {/* ── SCROLLABLE FORM CONTENT ── */}
        <div ref={scrollRef} className="flex-1 min-w-0 overflow-y-auto scroll-smooth pb-24">
          <Step1Profile
            formData={formData}
            cities={cities}
            handleChange={handleChange}
            handleNestedChange={handleNestedChange}
            handleUnifiedUnitChange={handleUnifiedUnitChange}
            validationErrors={validationErrors}
            isProject={isProject}
            isSingleUnit={isSingleUnit}
            isApartment={isApartment}
            isStandalone={isStandalone}
            isLand={isLand}
            isLandForDevelopment={isLandForDevelopment}
            isCommercial={isCommercial}
            handleDevelopmentRatioChange={handleDevelopmentRatioChange}
            idCardFrontRef={idCardFrontRef}
            idCardBackRef={idCardBackRef}
            handleFileChange={handleFileChange}
            setLightboxMedia={setLightboxMedia}
            reraCertRef={reraCertRef}
            layoutPermissionRef={layoutPermissionRef}
            buildingPermissionRef={buildingPermissionRef}
            hmdaApprovalRef={hmdaApprovalRef}
            handleAddAdditionalApproval={handleAddAdditionalApproval}
            handleUpdateAdditionalApproval={handleUpdateAdditionalApproval}
            handleDeleteAdditionalApproval={handleDeleteAdditionalApproval}
            handleAdditionalApprovalFileChange={handleAdditionalApprovalFileChange}
          />

          <Step2FinancialsMedia
            formData={formData}
            handleChange={handleChange}
            handleNestedChange={handleNestedChange}
            handleFileChange={handleFileChange}
            validationErrors={validationErrors}
            hasAmenities={hasAmenities}
            setHasAmenities={setHasAmenities}
            userType={userType}
            isResidential={isResidential}
            isStandalone={isStandalone}
            posterRef={posterRef}
            videoRef={videoRef}
            brochureRef={brochureRef}
            photosRef={photosRef}
            setLightboxMedia={setLightboxMedia}
          />

          {/* Mobile Submit Button */}
          <div className="lg:hidden sticky bottom-0 p-4 bg-white/95 backdrop-blur border-t border-slate-100 shadow-[0_-8px_24px_-8px_rgba(0,0,0,0.08)]">
            {submitAttempted && Object.keys(validationErrors).length > 0 && (
              <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
                <p className="text-md font-semibold text-rose-800 mb-1">Complete these required fields before posting:</p>
                <ul className="list-disc list-inside space-y-0.5 text-md text-rose-700 font-medium">
                  {Object.values(validationErrors).map((msg) => <li key={msg}>{msg}</li>)}
                </ul>
              </div>
            )}
            <button
              type="button"
              onClick={handleFinalSubmit}
              className={`${BTN_PRIMARY} w-full py-4 rounded-xl shadow-lg shadow-primary/20 active:scale-95`}
            >
              <Send size={16} />
              Complete & Post Property
            </button>
          </div>
        </div>
      </div>

      {/* Previous Project Entry Modal */}
      <Modal
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        title={editingProjectIndex !== null ? 'Edit Previous Project' : 'Add Previous Project'}
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-2 block">Project Name</p>
              <input
                type="text"
                value={currentProject.name}
                onChange={(e) => setCurrentProject((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 text-slate-800 focus:border-primary focus:bg-slate-50 rounded-md text-sm font-medium focus:ring-1 focus:ring-primary/20 outline-none transition-all"
                placeholder="e.g. Skyline Residency"
              />
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-2 block">Location (City, State)</p>
              <input
                type="text"
                value={currentProject.location}
                onChange={(e) => setCurrentProject((prev) => ({ ...prev, location: e.target.value }))}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 text-slate-800 focus:border-primary focus:bg-slate-50 rounded-md text-sm font-medium focus:ring-1 focus:ring-primary/20 outline-none transition-all"
                placeholder="e.g. Banjara Hills, Hyderabad"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-2 block">Type of Project</p>
              <select
                value={currentProject.type}
                onChange={(e) => setCurrentProject((prev) => ({ ...prev, type: e.target.value }))}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 text-slate-800 focus:border-primary focus:bg-slate-50 rounded-md text-sm font-medium focus:ring-1 focus:ring-primary/20 outline-none transition-all"
              >
                {PROJECT_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Project Image</p>
              <div
                onClick={() => document.getElementById('projectImageInput').click()}
                className="h-11 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 flex items-center justify-center cursor-pointer hover:bg-white hover:border-primary/50 transition-all relative overflow-hidden"
              >
                <input id="projectImageInput" type="file" className="hidden" accept="image/*" onChange={handleProjectImageChange} />
                {currentProject.image ? (
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-[10px] uppercase tracking-widest">
                    <CheckCircleIcon size={14} /> Image Selected
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-slate-400">
                    <ImageIcon size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Upload Project Image</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {currentProject.image && (
            <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-slate-100 bg-slate-50">
              <img src={currentProject.image} alt="Preview" className="w-full h-full object-cover" />
              <button
                onClick={() => setCurrentProject((prev) => ({ ...prev, image: null }))}
                className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm text-rose-500 rounded-full hover:bg-rose-500 hover:text-white transition-all shadow-lg"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
            <button onClick={() => setShowProjectModal(false)} className={`${BTN_SECONDARY} px-6 py-3 rounded-xl`}>Cancel</button>
            <button
              onClick={handleSaveProject}
              disabled={!currentProject.name || !currentProject.location}
              className={`${BTN_PRIMARY} px-8 py-3 rounded-xl shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50 disabled:pointer-events-none`}
            >
              {editingProjectIndex !== null ? 'Update Project' : 'Add Project'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Lightbox */}
      <Modal isOpen={!!lightboxMedia} onClose={() => setLightboxMedia(null)} title="Asset Preview" size="xl">
        <div className="p-4 flex items-center justify-center min-h-[300px]">
          {lightboxMedia?.type === 'video' ? (
            <video src={lightboxMedia.url} controls className="w-full rounded-xl max-h-[70vh] shadow-2xl" autoPlay />
          ) : (
            <img src={lightboxMedia?.url} className="w-full rounded-xl max-h-[70vh] object-contain shadow-2xl" alt="" />
          )}
        </div>
      </Modal>
    </>
  );
}
