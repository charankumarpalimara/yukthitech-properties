import {
  createProperty,
  updateProperty,
  fetchPropertyById,
} from '../../../../../store/vendorProductsStore';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { API_URL } from '../../../../../service/api';
import toast from 'react-hot-toast';
import {
  buildPriceDetailsForUnit,
  getPriceFieldForUnit,
  normalizePriceUnit,
  sanitizePriceDetailsForSubmit,
  sanitizeSpecificationsForSubmit,
} from './unitSanitize';

export default function usePropertyForm(initialData, onCancel, onSubmit, categories = []) {
  const [propertyId, setPropertyId] = useState(() => {
    if (initialData?._id) return initialData._id;
    // Check URL for ID to prevent loss on refresh
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
  });

  const [openStep, setOpenStep] = useState(initialData?.currentStep || 1);
  const [hasSalesDept, setHasSalesDept] = useState(
    !!initialData?.salesDept?.fullName ||
      (initialData?.salesDept && Object.keys(initialData.salesDept).length > 0)
  );
  const [hasLoanDept, setHasLoanDept] = useState(
    !!initialData?.loanDept?.fullName ||
      (initialData?.loanDept && Object.keys(initialData.loanDept).length > 0)
  );
  const [hasLegalAdvisor, setHasLegalAdvisor] = useState(
    !!initialData?.propertyDocument?.legalAdvisor?.fullName
  );
  const [hasAmenities, setHasAmenities] = useState(initialData?.amenities?.length > 0);
  const [isStep1Completed, setIsStep1Completed] = useState((initialData?.currentStep || 1) > 1);
  const [validationErrors, setValidationErrors] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const REQUIRED_SUBMIT_FIELD_IDS = {
    projectName: 'property-field-projectName',
    propertyType: 'property-field-propertyType',
    projectApprovedBy: 'property-field-projectApprovedBy',
    totalArea: 'property-field-totalArea',
    'priceDetails.totalPrice': 'property-field-totalPrice',
    'media.poster': 'property-field-poster',
  };
  const [autoSaveStatus, setAutoSaveStatus] = useState('idle');
  const [propertyStatus, setPropertyStatus] = useState(initialData?.status || '');
  const [rejectionReason, setRejectionReason] = useState(initialData?.rejectionReason || '');
  const isInitialMount = useRef(true);
  const dirtyFields = useRef(new Set()); // tracks exactly which fields changed
  const pendingChangedSections = useRef(new Set()); // survives autosave — form sections changed for admin review

  const SPEC_FIELD_KEYS = new Set([
    'bhkConfig',
    'numberOfFloors',
    'facing',
    'totalArea',
    'totalAreaUnit',
    'plotArea',
    'plotAreaUnit',
    'superBuiltUpArea',
    'builtUpArea',
    'dimensions',
    'roadWidth',
    'boundaryWall',
    'builderRatio',
    'ownerRatio',
    'commercialType',
    'washrooms',
    'vastuCompliant',
  ]);

  // Maps dirty field keys to form section titles (matches Step1Profile / Step2FinancialsMedia)
  const FIELD_SECTION_MAP = {
    projectName: 'Basic Information',
    propertyType: 'Basic Information',
    projectApprovedBy: 'Basic Information',
    address: 'Basic Information',
    salesDept: 'Sales Department',
    loanDept: 'Loan Department',
    priceDetails: 'Specifications & Pricing',
    propertyStatus: 'Specifications & Pricing',
    gstStatus: 'Specifications & Pricing',
    stampDuty: 'Specifications & Pricing',
    agentFee: 'Specifications & Pricing',
    amenities: 'Property Amenities',
    legalAdvisor: 'Legally Verified',
    media: 'Photos & Videos',
    layoutPermissionDoc: 'RERA & Approvals',
    buildingPermissionDoc: 'RERA & Approvals',
    hmdaApprovalDoc: 'RERA & Approvals',
    layoutPermissionNumber: 'RERA & Approvals',
    buildingPermissionNumber: 'RERA & Approvals',
    hmdaApprovalNumber: 'RERA & Approvals',
    reraNumber: 'RERA & Approvals',
    reraExpiry: 'RERA & Approvals',
    reraCertificate: 'RERA & Approvals',
    additionalApprovals: 'RERA & Approvals',
  };

  const markFieldDirty = (fieldKey) => {
    dirtyFields.current.add(fieldKey);
    const section = SPEC_FIELD_KEYS.has(fieldKey)
      ? 'Specifications & Pricing'
      : FIELD_SECTION_MAP[fieldKey] || 'Profile Details';
    pendingChangedSections.current.add(section);
  };
  const [userType, setUserType] = useState(initialData?.user?.type || '');
  const [cities, setCities] = useState([]);

  // Fetch cities for dropdown
  useEffect(() => {
    const fetchCities = async () => {
      try {
        console.log('Fetching cities from:', `${API_URL}/cities`);
        const response = await fetch(`${API_URL}/cities`);
        const data = await response.json();
        console.log('Cities API response:', data);
        if (data.success) {
          setCities(data.data.cities || []);
        }
      } catch (error) {
        console.error('Failed to fetch cities:', error);
      }
    };
    fetchCities();
  }, []);

  const defaultFormData = {
    legalAdvisor: {
      fullName: '',
      rollNumber: '',
      contactNumber: '',
      memberOf: '',
      idCardFront: null,
      idCardBack: null,
    },
    salesDept: {
      fullName: '',
      contactNumber: '',
      email: '',
    },
    loanDept: {
      fullName: '',
      contactNumber: '',
      email: '',
    },
    specifications: {},
    address: {
      addressLine1: '',
      state: '',
      city: '',
      googleMapUrl: '',
      location: {
        type: 'Point',
        coordinates: ['', ''], // [lng, lat]
      },
    },
    dimensions: { length: '', width: '' },
    media: {
      poster: null,
      video: null,
      brochure: null,
      videoConsent: true,
      photos: [],
    },
    priceDetails: {
      totalPrice: '',
      priceUnit: 'Sft',
      pricePerSft: '',
      pricePerAcre: '',
      pricePerGunta: '',
      pricePerSqYard: '',
    },
    amenities: [],
    additionalApprovals: [],
    projectName: '',
    propertyType: '',
    projectApprovedBy: '',
    reraNumber: '',
    reraExpiry: '',
    reraCertificate: [],
    layoutPermissionNumber: '',
    layoutPermissionDoc: null,
    buildingPermissionNumber: '',
    buildingPermissionDoc: null,
    hmdaApprovalNumber: '',
    hmdaApprovalDoc: null,
    propertyStatus: 'Under Construction',
    gstStatus: 'Applicable',
    stampDuty: 'Exclusive',
    agentFee: 'Not Applicable',
    // Spec fields — always initialized so inputs are controlled
    bhkConfig: '',
    superBuiltUpArea: '',
    builtUpArea: '',
    numberOfFloors: '',
    facing: 'East',
    totalArea: '',
    totalAreaUnit: 'Acres',
    roadWidth: '',
    boundaryWall: 'No',
    builderRatio: '',
    ownerRatio: '',
    commercialType: 'Office',
    washrooms: 'Private',
    vastuCompliant: 'No',
    plotArea: '',
    plotAreaUnit: 'Sft',
  };

  const mapBackendToState = (data) => {
    if (!data) return defaultFormData;

    const sanitize = (obj) => {
      if (!obj || typeof obj !== 'object') return obj;
      const sanitized = { ...obj };
      Object.keys(sanitized).forEach((key) => {
        if (sanitized[key] === null || sanitized[key] === undefined) {
          sanitized[key] = '';
        } else if (
          typeof sanitized[key] === 'object' &&
          !Array.isArray(sanitized[key]) &&
          !(sanitized[key] instanceof File)
        ) {
          sanitized[key] = sanitize(sanitized[key]);
        }
      });
      return sanitized;
    };

    const formatDateForInput = (dateStr) => {
      if (!dateStr) return '';
      try {
        const date = new Date(dateStr);
        return date.toISOString().split('T')[0];
      } catch (e) {
        return '';
      }
    };

    const mapped = sanitize({ ...defaultFormData, ...data });
    if (data.specifications) {
      Object.keys(data.specifications).forEach((key) => {
        mapped[key] = data.specifications[key];
      });
      if (!mapped.totalArea) {
        mapped.totalArea = mapped.superBuiltUpArea || mapped.plotArea || mapped.builtUpArea || '';
      }
      if (!mapped.totalAreaUnit && mapped.plotAreaUnit) {
        mapped.totalAreaUnit = mapped.plotAreaUnit;
      }
    }

    // Map documents from propertyDocument
    if (data.propertyDocument) {
      const doc = data.propertyDocument;
      if (doc.legalAdvisor) mapped.legalAdvisor = { ...mapped.legalAdvisor, ...doc.legalAdvisor };
      if (doc.rera) {
        mapped.reraNumber = doc.rera.number || '';
        mapped.reraExpiry = formatDateForInput(doc.rera.expiry);
        mapped.reraCertificate = doc.rera.certificate || null;
      }
      if (doc.layoutPermission) {
        mapped.layoutPermissionNumber = doc.layoutPermission.number || '';
        mapped.layoutPermissionDoc = doc.layoutPermission.doc || null;
      }
      if (doc.buildingPermission) {
        mapped.buildingPermissionNumber = doc.buildingPermission.number || '';
        mapped.buildingPermissionDoc = doc.buildingPermission.doc || null;
      }
      if (doc.hmdaApproval) {
        mapped.hmdaApprovalNumber = doc.hmdaApproval.number || '';
        mapped.hmdaApprovalDoc = doc.hmdaApproval.doc || null;
      }
      if (doc.additionalApprovals) {
        mapped.additionalApprovals = doc.additionalApprovals || [];
      }
    }

    // Map pricing
    if (data.financials) {
      mapped.priceDetails = { ...mapped.priceDetails, ...data.financials };
      if (mapped.priceDetails.priceUnit) {
        mapped.totalAreaUnit = mapped.priceDetails.priceUnit;
        mapped.plotAreaUnit = mapped.priceDetails.priceUnit;
      }
      if (data.financials.gstStatus) mapped.gstStatus = data.financials.gstStatus;
      if (data.financials.stampDuty) mapped.stampDuty = data.financials.stampDuty;
      if (data.financials.agentFee) mapped.agentFee = data.financials.agentFee;
      if (data.financials.propertyStatus) mapped.propertyStatus = data.financials.propertyStatus;
    }

    // Merge media from API (sanitize can turn nulls into '' — restore URLs from source)
    const sourceMedia = data.media || {};
    mapped.media = {
      ...defaultFormData.media,
      poster: sourceMedia.poster || mapped.media?.poster || null,
      video: sourceMedia.video || mapped.media?.video || null,
      brochure: sourceMedia.brochure || mapped.media?.brochure || null,
      videoConsent: sourceMedia.videoConsent ?? mapped.media?.videoConsent ?? true,
      photos: Array.isArray(sourceMedia.photos)
        ? sourceMedia.photos
        : Array.isArray(mapped.media?.photos)
          ? mapped.media.photos
          : [],
    };
    if (mapped.media.brochure === '') mapped.media.brochure = null;
    if (mapped.media.poster === '') mapped.media.poster = null;
    if (mapped.media.video === '') mapped.media.video = null;

    // If propertyType is populated as an object, extract its _id
    if (mapped.propertyType && typeof mapped.propertyType === 'object' && mapped.propertyType._id) {
      mapped.propertyType = mapped.propertyType._id;
    }

    return mapped;
  };

  const [formData, setFormData] = useState(() => {
    const initial = mapBackendToState(initialData);
    console.log('usePropertyForm: Initialized formData', initial);
    return initial;
  });

  const applyServerPropertyToForm = useCallback((data) => {
    if (!data) return;
    const mapped = mapBackendToState(data);
    setFormData(mapped);
    setOpenStep(data.currentStep || 1);
    setIsStep1Completed((data.currentStep || 1) > 1);
    setHasSalesDept(
      !!data.salesDept?.fullName || (data.salesDept && Object.keys(data.salesDept).length > 0)
    );
    setHasLoanDept(
      !!data.loanDept?.fullName || (data.loanDept && Object.keys(data.loanDept).length > 0)
    );
    setHasLegalAdvisor(!!data.propertyDocument?.legalAdvisor?.fullName);
    setHasAmenities(data.amenities?.length > 0);
    if (data.user?.type) setUserType(data.user.type);
    if (data.status) setPropertyStatus(data.status);
    if (data.rejectionReason) setRejectionReason(data.rejectionReason);
  }, []);

  const mergeSavedMediaIntoForm = useCallback((serverProperty) => {
    if (!serverProperty?.media) return;
    setFormData((prev) => ({
      ...prev,
      media: {
        ...prev.media,
        poster: serverProperty.media.poster ?? prev.media.poster,
        video: serverProperty.media.video ?? prev.media.video,
        brochure:
          serverProperty.media.brochure != null && serverProperty.media.brochure !== ''
            ? serverProperty.media.brochure
            : prev.media.brochure,
        photos: Array.isArray(serverProperty.media.photos)
          ? serverProperty.media.photos
          : prev.media.photos,
        videoConsent: serverProperty.media.videoConsent ?? prev.media.videoConsent,
      },
    }));
  }, []);

  const lastFetchedPropertyIdRef = useRef(null);

  // Load full property once per id (list API omits brochure; stale list must not win over GET by id)
  useEffect(() => {
    if (!propertyId || lastFetchedPropertyIdRef.current === propertyId) return undefined;
    lastFetchedPropertyIdRef.current = propertyId;
    let cancelled = false;
    const loadProperty = async () => {
      try {
        const data = await fetchPropertyById(propertyId);
        if (!cancelled && data) {
          applyServerPropertyToForm(data);
        }
      } catch (error) {
        console.error('Property load failed:', error);
        lastFetchedPropertyIdRef.current = null;
      }
    };
    loadProperty();
    return () => {
      cancelled = true;
    };
  }, [propertyId, applyServerPropertyToForm]);

  const [lightboxMedia, setLightboxMedia] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProjectIndex, setEditingProjectIndex] = useState(null);
  const [currentProject, setCurrentProject] = useState({
    name: '',
    location: '',
    type: 'Residential',
    image: null,
  });

  const idCardFrontRef = useRef(null);
  const idCardBackRef = useRef(null);
  const reraCertRef = useRef(null);
  const layoutPermissionRef = useRef(null);
  const buildingPermissionRef = useRef(null);
  const hmdaApprovalRef = useRef(null);
  const posterRef = useRef(null);
  const videoRef = useRef(null);
  const brochureRef = useRef(null);
  const photosRef = useRef(null);

  // Dynamic Type Logic based on category name
  const typeId = formData.propertyType || '';
  const selectedCategory = categories.find((c) => c._id === typeId);
  const type = selectedCategory ? selectedCategory.name : typeId;

  const isApartment = [
    'Apartments',
    'Apartment',
    'Builder Floor Apartment',
    'Pent House',
    'Studio Flat',
  ].includes(type);
  const isStandalone = [
    'Individual House',
    'Individual House',
    'Villas',
    'Villa',
    'Farm House',
  ].includes(type);

  const isResidential = isApartment || isStandalone;
  const isProject = isApartment;
  const isSingleUnit = isStandalone;

  const isLand = [
    'Residential Plots',
    'Residential Plot',
    'Agriculture Lands',
    'Agriculture Land',
    'Land for Development',
  ].includes(type);
  const isLandForDevelopment = type === 'Land for Development';
  const isCommercial = ['Commercial Space'].includes(type);

  useEffect(() => {
    if (isLandForDevelopment) return;
    setFormData((prev) => {
      if (prev.builderRatio === '' && prev.ownerRatio === '') return prev;
      return { ...prev, builderRatio: '', ownerRatio: '' };
    });
  }, [isLandForDevelopment]);

  useEffect(() => {
    // Auto-calculate total price based on selected area and price per unit
    const priceUnit = normalizePriceUnit(formData.priceDetails?.priceUnit);
    const priceField = getPriceFieldForUnit(priceUnit);

    const pricePerUnitStr = formData.priceDetails?.[priceField];
    const pricePerUnit = parseFloat(pricePerUnitStr);

    if (pricePerUnit > 0) {
      const primaryArea = formData.totalArea;
      const primaryAreaUnit = normalizePriceUnit(
        formData.totalAreaUnit || (isLand ? 'Acres' : 'Sft')
      );

      const areaVal = parseFloat(primaryArea);
      if (areaVal > 0) {
        let areaInSft = areaVal;
        switch (primaryAreaUnit) {
          case 'Acres':
            areaInSft = areaVal * 43560;
            break;
          case 'Guntas':
            areaInSft = areaVal * 1089;
            break;
          case 'Sq. Yards':
            areaInSft = areaVal * 9;
            break;
          default:
            break;
        }

        let areaInTargetUnit = areaInSft;
        switch (priceUnit) {
          case 'Acres':
            areaInTargetUnit = areaInSft / 43560;
            break;
          case 'Guntas':
            areaInTargetUnit = areaInSft / 1089;
            break;
          case 'Sq. Yards':
            areaInTargetUnit = areaInSft / 9;
            break;
          default:
            break;
        }

        const calculatedTotal = Math.round(areaInTargetUnit * pricePerUnit);
        if (String(calculatedTotal) !== String(formData.priceDetails?.totalPrice)) {
          markFieldDirty('priceDetails');
          setFormData((prev) => ({
            ...prev,
            priceDetails: {
              ...prev.priceDetails,
              totalPrice: String(calculatedTotal),
            },
          }));
        }
      }
    }
  }, [
    formData.priceDetails?.priceUnit,
    formData.priceDetails?.pricePerSft,
    formData.priceDetails?.pricePerAcre,
    formData.priceDetails?.pricePerGunta,
    formData.priceDetails?.pricePerSqYard,
    formData.totalArea,
    formData.totalAreaUnit,
    isLand,
  ]);

  // Handlers
  const handleChange = (field, value, type = 'text') => {
    markFieldDirty(field);
    let finalValue = value;
    if (type === 'number') {
      finalValue = value.replace(/[^0-9.]/g, '');
    }
    setFormData((prev) => ({ ...prev, [field]: finalValue }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const clampDevelopmentPercent = (n) => Math.min(100, Math.max(0, Math.round(Number(n) || 0)));

  /** Land for Development only — builder % + owner % always sum to 100 */
  const handleDevelopmentRatioChange = (field, rawValue) => {
    const digits = String(rawValue ?? '').replace(/\D/g, '');
    markFieldDirty('builderRatio');
    markFieldDirty('ownerRatio');

    if (digits === '') {
      setFormData((prev) => ({ ...prev, builderRatio: '', ownerRatio: '' }));
      return;
    }

    const primary = clampDevelopmentPercent(digits);
    const secondary = 100 - primary;
    const next =
      field === 'builderRatio'
        ? { builderRatio: String(primary), ownerRatio: String(secondary) }
        : { builderRatio: String(secondary), ownerRatio: String(primary) };

    setFormData((prev) => ({ ...prev, ...next }));

    setValidationErrors((prev) => {
      const nextErrors = { ...prev };
      delete nextErrors.builderRatio;
      delete nextErrors.ownerRatio;
      return nextErrors;
    });
  };

  const handleNestedChange = (parent, field, value, type = 'text') => {
    markFieldDirty(parent);
    let finalValue = value;
    if (type === 'number') finalValue = value.replace(/[^0-9.]/g, '');
    setFormData((prev) => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: finalValue },
    }));
    const errorKey = `${parent}.${field}`;
    if (validationErrors[errorKey]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  /** One unit for area + price: only that unit's price field is kept; others cleared in form + API payload */
  const handleUnifiedUnitChange = useCallback((unit) => {
    markFieldDirty('priceDetails');
    markFieldDirty('totalAreaUnit');
    markFieldDirty('plotAreaUnit');
    setFormData((prev) => ({
      ...prev,
      totalAreaUnit: unit,
      plotAreaUnit: unit,
      priceDetails: buildPriceDetailsForUnit(prev.priceDetails, unit),
    }));
  }, []);

  const handleCoordinateChange = (field, value) => {
    markFieldDirty('address');
    const finalValue = value.replace(/[^0-9.-]/g, ''); // Allow digits, dots, and minus
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        coordinates: {
          ...prev.address.coordinates,
          [field]: finalValue,
        },
      },
    }));
  };

  const handleFileChange = (e, field, parent = null, multiple = false) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    markFieldDirty(parent || field);

    if (multiple) {
      const newFiles = files; // keep as File objects
      if (parent) {
        setFormData((prev) => ({
          ...prev,
          [parent]: { ...prev[parent], [field]: [...(prev[parent][field] || []), ...newFiles] },
        }));
      } else {
        setFormData((prev) => ({ ...prev, [field]: [...(prev[field] || []), ...newFiles] }));
      }
    } else {
      const file = files[0];
      if (field === 'video' && file.size > 20 * 1024 * 1024) {
        toast.error('Video must be less than 20MB');
        return;
      }
      if (field === 'brochure') {
        if (file.type !== 'application/pdf') {
          toast.error('Brochure must be a PDF file');
          return;
        }
        if (file.size > 10 * 1024 * 1024) {
          toast.error('Brochure must be less than 10MB');
          return;
        }
      }
      if (parent) {
        setFormData((prev) => ({ ...prev, [parent]: { ...prev[parent], [field]: file } }));
      } else {
        setFormData((prev) => ({ ...prev, [field]: file }));
      }
    }

    const errorKey = parent ? `${parent}.${field}` : field;
    if (validationErrors[errorKey]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const handleAddAdditionalApproval = () => {
    markFieldDirty('additionalApprovals');
    setFormData((prev) => ({
      ...prev,
      additionalApprovals: [...prev.additionalApprovals, { title: '', number: '', doc: null }],
    }));
  };

  const handleUpdateAdditionalApproval = (index, field, value) => {
    markFieldDirty('additionalApprovals');
    setFormData((prev) => {
      const updated = [...prev.additionalApprovals];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, additionalApprovals: updated };
    });
  };

  const handleDeleteAdditionalApproval = (index) => {
    markFieldDirty('additionalApprovals');
    setFormData((prev) => ({
      ...prev,
      additionalApprovals: prev.additionalApprovals.filter((_, i) => i !== index),
    }));
  };

  const handleAdditionalApprovalFileChange = (e, index) => {
    markFieldDirty('additionalApprovals');
    const file = e.target.files[0];
    if (file) handleUpdateAdditionalApproval(index, 'doc', file);
  };

  const completionStats = useMemo(() => {
    const sections = {
      profile: {
        label: 'Project Details',
        fields: ['projectName', 'propertyType', 'projectApprovedBy'],
        weight: 20,
      },
      address: {
        label: 'Location Details',
        fields: ['address.addressLine1', 'address.state', 'address.city', 'address.googleMapUrl'],
        weight: 20,
      },
      legal: {
        label: 'Legal Verification',
        fields: [
          'legalAdvisor.fullName',
          'legalAdvisor.contactNumber',
          'legalAdvisor.memberOf',
          'legalAdvisor.idCardFront',
          'legalAdvisor.idCardBack',
        ],
        weight: 15,
      },
      rera: {
        label: 'RERA Compliance',
        fields: ['reraNumber', 'reraExpiry'],
        weight: 25,
      },
      media: {
        label: 'Media & Pricing',
        fields: ['priceDetails.totalPrice', 'media.poster'],
        weight: 20,
      },
    };

    const getVal = (path) => {
      const parts = path.split('.');
      let current = formData;
      for (const part of parts) {
        if (current == null) return null;
        current = current[part];
      }
      return current;
    };

    let totalScore = 0;
    const sectionStatus = Object.entries(sections).map(([key, section]) => {
      const filledFields = section.fields.filter((f) => {
        const val = getVal(f);
        if (val === null || val === undefined) return false;
        if (typeof val === 'string') return val.trim().length > 0;
        if (Array.isArray(val)) return val.length > 0;
        return true;
      });
      const ratio = filledFields.length / section.fields.length;
      totalScore += ratio * section.weight;
      return {
        id: key,
        label: section.label,
        percentage: Math.round(ratio * 100),
        isCompleted: ratio === 1,
      };
    });

    return {
      total: Math.round(totalScore),
      sections: sectionStatus,
    };
  }, [formData]);

  const buildFormData = useCallback(
    (stepNumber, status, { submitForReview = false } = {}) => {
      const data = new FormData();
      const dirty = dirtyFields.current;

      const specFields = [...SPEC_FIELD_KEYS];
      const specFieldsSet = new Set(specFields);
      const objectFields = new Set([
        'legalAdvisor',
        'address',
        'priceDetails',
        'salesDept',
        'loanDept',
      ]);
      const fileFields = new Set([
        'reraCertificate',
        'layoutPermissionDoc',
        'buildingPermissionDoc',
        'hmdaApprovalDoc',
      ]);

      const rootFinancialMeta = {
        propertyStatus: formData.propertyStatus,
        gstStatus: formData.gstStatus,
        stampDuty: formData.stampDuty,
        agentFee: formData.agentFee,
      };

      // Always include these
      data.append('currentStep', stepNumber);
      data.append('status', status);
      data.append('completionPercentage', completionStats.total);
      if (submitForReview) {
        data.append('submitForReview', 'true');
        if (pendingChangedSections.current.size > 0) {
          data.append('changedFields', JSON.stringify([...pendingChangedSections.current]));
        }
        data.append(
          'priceDetails',
          JSON.stringify(sanitizePriceDetailsForSubmit(formData.priceDetails, rootFinancialMeta))
        );
        data.append(
          'specifications',
          JSON.stringify(sanitizeSpecificationsForSubmit(formData, specFields))
        );
      }

      const dirtySpecFields = specFields.filter((k) => dirty.has(k));
      if (!submitForReview && dirtySpecFields.length > 0) {
        data.append(
          'specifications',
          JSON.stringify(sanitizeSpecificationsForSubmit(formData, specFields))
        );
      }

      // Send only dirty object/primitive fields
      dirty.forEach((key) => {
        if (specFieldsSet.has(key)) return;

        if (key === 'salesDept') {
          if (hasSalesDept) data.append('salesDept', JSON.stringify(formData.salesDept));
          return;
        }
        if (key === 'loanDept') {
          if (hasLoanDept) data.append('loanDept', JSON.stringify(formData.loanDept));
          return;
        }
        if (key === 'legalAdvisor') {
          const clone = { ...formData.legalAdvisor };
          if (clone.idCardFront instanceof File) delete clone.idCardFront;
          if (clone.idCardBack instanceof File) delete clone.idCardBack;
          data.append('legalAdvisor', JSON.stringify(clone));
          // files handled separately
          if (formData.legalAdvisor?.idCardFront instanceof File)
            data.append('idCardFront', formData.legalAdvisor.idCardFront);
          if (formData.legalAdvisor?.idCardBack instanceof File)
            data.append('idCardBack', formData.legalAdvisor.idCardBack);
          return;
        }
        if (key === 'address') {
          data.append('address', JSON.stringify(formData.address));
          return;
        }
        if (key === 'priceDetails') {
          if (!submitForReview) {
            data.append(
              'priceDetails',
              JSON.stringify(
                sanitizePriceDetailsForSubmit(formData.priceDetails, rootFinancialMeta)
              )
            );
          }
          return;
        }
        if (key === 'additionalApprovals') {
          const appData = formData.additionalApprovals.map((app) => ({
            title: app.title,
            number: app.number,
          }));
          data.append('additionalApprovals', JSON.stringify(appData));
          formData.additionalApprovals.forEach((app, index) => {
            if (app.doc instanceof File) data.append(`additionalApprovalDoc_${index}`, app.doc);
          });
          return;
        }
        if (key === 'media') {
          // Send metadata for deletions/existing items (exclude File objects)
          const mediaMeta = {
            poster: formData.media.poster instanceof File ? undefined : formData.media.poster,
            video: formData.media.video instanceof File ? undefined : formData.media.video,
            brochure: formData.media.brochure instanceof File ? undefined : formData.media.brochure,
            photos: formData.media.photos
              ? formData.media.photos.filter((p) => !(p instanceof File))
              : [],
            videoConsent: formData.media.videoConsent,
          };
          data.append('media', JSON.stringify(mediaMeta));

          if (formData.media?.poster instanceof File) data.append('poster', formData.media.poster);
          if (formData.media?.video instanceof File) data.append('video', formData.media.video);
          if (formData.media?.brochure instanceof File)
            data.append('brochure', formData.media.brochure);
          if (formData.media?.photos?.length > 0) {
            formData.media.photos.forEach((photo, i) => {
              if (photo instanceof File) data.append(`photo_${i}`, photo);
            });
          }
          return;
        }
        if (key === 'amenities') {
          data.append('amenities', JSON.stringify(formData.amenities));
          return;
        }
        if (key === 'reraCertificate' && Array.isArray(formData[key])) {
          // Send existing certificates (URLs) for sync/deletion
          const existingCerts = formData[key].filter((item) => typeof item === 'string');
          data.append('reraCertificateMetadata', JSON.stringify(existingCerts));

          formData[key].forEach((file, index) => {
            if (file instanceof File) data.append(`reraCertificate_${index}`, file);
          });
          return;
        }
        if (fileFields.has(key)) {
          if (formData[key] instanceof File) {
            data.append(key, formData[key]);
          }
          return;
        }

        // plain scalar field
        if (
          formData[key] !== undefined &&
          formData[key] !== null &&
          typeof formData[key] !== 'object'
        ) {
          data.append(key, formData[key]);
        }
      });

      return data;
    },
    [formData, hasSalesDept, hasLoanDept, completionStats]
  );

  const isSavingDraft = useRef(false);

  const resolveAutosaveStatus = useCallback(() => {
    const keepStatus = ['verified', 'rejected', 'pending'];
    if (keepStatus.includes(propertyStatus)) return propertyStatus;
    return 'draft';
  }, [propertyStatus]);

  const handleSaveDraft = useCallback(async () => {
    if (dirtyFields.current.size === 0 || isSavingDraft.current) return;

    isSavingDraft.current = true;
    setAutoSaveStatus('saving');

    try {
      const dataToSubmit = buildFormData(openStep, resolveAutosaveStatus());
      let saved;
      if (propertyId) {
        saved = await updateProperty({ id: propertyId, formData: dataToSubmit });
      } else {
        saved = await createProperty(dataToSubmit);
        if (saved?._id) {
          setPropertyId(saved._id);
          const url = new URL(window.location);
          url.searchParams.set('id', saved._id);
          window.history.replaceState({}, '', url);
        }
      }
      if (saved) {
        mergeSavedMediaIntoForm(saved);
      }
      setAutoSaveStatus('saved');
      dirtyFields.current.clear(); // reset after successful save
    } catch (error) {
      console.error('Draft save failed:', error);
      setAutoSaveStatus('idle');
    } finally {
      isSavingDraft.current = false;
    }
  }, [buildFormData, openStep, propertyId, resolveAutosaveStatus, mergeSavedMediaIntoForm]);

  // Auto-save effect
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (dirtyFields.current.size === 0) return;

    const timer = setTimeout(() => {
      handleSaveDraft();
    }, 1500);

    return () => clearTimeout(timer);
  }, [formData, handleSaveDraft]);

  const scrollToFirstValidationError = (errors) => {
    const firstKey = Object.keys(errors)[0];
    const id = REQUIRED_SUBMIT_FIELD_IDS[firstKey];
    if (!id) return;
    requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (typeof el.focus === 'function') el.focus({ preventScroll: true });
      }
    });
  };

  const validateAll = () => {
    const errors = {};

    const hasValue = (val) => {
      if (val === null || val === undefined) return false;
      if (typeof val === 'string') return val.trim().length > 0;
      if (Array.isArray(val)) return val.length > 0;
      if (val instanceof File) return true;
      return true;
    };

    const hasPositiveNumber = (val) => {
      const n = parseFloat(val);
      return !Number.isNaN(n) && n > 0;
    };

    const hasPoster = () => {
      const poster = formData.media?.poster;
      if (!poster) return false;
      if (poster instanceof File) return true;
      if (typeof poster === 'string') return poster.trim().length > 0;
      return false;
    };

    // Required for final submit
    if (!hasValue(formData.projectName)) {
      errors.projectName = 'Property name is required';
    }
    if (!hasValue(formData.propertyType)) {
      errors.propertyType = 'Property type is required';
    }
    if (!hasValue(formData.projectApprovedBy)) {
      errors.projectApprovedBy = 'Approved by is required';
    }
    if (!hasPositiveNumber(formData.totalArea)) {
      errors.totalArea = 'Total area is required';
    }
    if (!hasPositiveNumber(formData.priceDetails?.totalPrice)) {
      errors['priceDetails.totalPrice'] =
        'Total price is required — enter total area and price per unit';
    }
    if (!hasPoster()) {
      errors['media.poster'] = 'Display poster image is required';
    }

    // Format validations (only if value exists)
    if (hasValue(formData.legalAdvisor?.contactNumber)) {
      if (!/^\d{10}$/.test(formData.legalAdvisor.contactNumber)) {
        errors['legalAdvisor.contactNumber'] = 'Valid 10-digit number required for Legal Advisor';
      }
    }

    if (hasValue(formData.salesDept?.contactNumber)) {
      if (!/^\d{10}$/.test(formData.salesDept.contactNumber)) {
        errors['salesDept.contactNumber'] = 'Valid 10-digit phone required for Sales department';
      }
    }

    if (hasValue(formData.salesDept?.email)) {
      if (!/^\S+@\S+\.\S+$/.test(formData.salesDept.email)) {
        errors['salesDept.email'] = 'Valid email format required for Sales department';
      }
    }

    if (hasValue(formData.loanDept?.contactNumber)) {
      if (!/^\d{10}$/.test(formData.loanDept.contactNumber)) {
        errors['loanDept.contactNumber'] = 'Valid 10-digit phone required for Loan department';
      }
    }

    // Additional Approvals: If an approval entry exists, it should at least have a title
    formData.additionalApprovals.forEach((app, idx) => {
      if (!hasValue(app.title)) {
        errors[`additionalApproval_${idx}_title`] =
          `Title is required for additional approval #${idx + 1}`;
      }
    });

    setValidationErrors(errors);
    const isValid = Object.keys(errors).length === 0;
    return { isValid, errors };
  };

  const handleFinalSubmit = async () => {
    const { isValid, errors } = validateAll();
    if (isValid) {
      setSubmitAttempted(false);
      try {
        const dataToSubmit = buildFormData(1, 'pending', { submitForReview: true });
        if (propertyId) {
          await updateProperty({ id: propertyId, formData: dataToSubmit });
        } else {
          await createProperty(dataToSubmit);
        }
        toast.success('Property submitted for review successfully!');
        dirtyFields.current.clear();
        pendingChangedSections.current.clear();
        if (onSubmit) onSubmit();
      } catch (error) {
        toast.error('Failed to submit property.');
        console.error('Submit error:', error);
      }
    } else {
      setSubmitAttempted(true);
      const messages = Object.values(errors);
      toast.error(
        messages.length === 1 ? messages[0] : `Complete required fields: ${messages.join(' · ')}`,
        { duration: 6000 }
      );
      scrollToFirstValidationError(errors);
    }
  };

  const handleProjectImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCurrentProject((prev) => ({ ...prev, image: url }));
    }
  };

  const handleSaveProject = () => {
    // Project mock saving logic...
    setShowProjectModal(false);
  };

  return {
    formData,
    propertyId,
    openStep,
    setOpenStep,
    hasSalesDept,
    setHasSalesDept,
    cities,
    propertyStatus,
    rejectionReason,
    hasLoanDept,
    setHasLoanDept,
    hasLegalAdvisor,
    setHasLegalAdvisor,
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
    handleCoordinateChange,
    handleFileChange,
    handleAddAdditionalApproval,
    handleUpdateAdditionalApproval,
    handleDeleteAdditionalApproval,
    handleAdditionalApprovalFileChange,
    handleFinalSubmit,
    handleProjectImageChange,
    handleSaveProject,
    completionStats,
  };
}
