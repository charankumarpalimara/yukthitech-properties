import { GST_OPTIONS, LAND_AREA_UNITS, STAMP_DUTY_OPTIONS } from '../../../constants/formOptions';

/** Maps selected unit → financials price field on Property model */
export const getPriceFieldForUnit = (unit) => {
  const u = (unit || '').trim();
  if (u === 'Sft') return 'pricePerSft';
  if (u === 'Acres') return 'pricePerAcre';
  if (u === 'Guntas') return 'pricePerGunta';
  if (u === 'Sq. Yards') return 'pricePerSqYard';
  return 'pricePerSft';
};

export const normalizePriceUnit = (unit) => {
  const u = (unit || 'Sft').trim();
  return LAND_AREA_UNITS.includes(u) ? u : 'Sft';
};

const toNumberOrNull = (val) => {
  if (val === '' || val === null || val === undefined) return null;
  const n = Number(val);
  return Number.isFinite(n) ? n : null;
};

const pickFromList = (val, list, fallback) => {
  if (!val) return fallback;
  return list.includes(val) ? val : fallback;
};

/**
 * Only the active unit's price field is set; all other per-unit prices are null.
 * GST / stamp duty must be frontend dropdown values only.
 */
export const sanitizePriceDetailsForSubmit = (priceDetails = {}, rootFields = {}) => {
  const unit = normalizePriceUnit(priceDetails.priceUnit || rootFields.priceUnit || 'Sft');
  const activeField = getPriceFieldForUnit(unit);

  const financials = {
    totalPrice: toNumberOrNull(priceDetails.totalPrice),
    priceUnit: unit,
    pricePerSft: null,
    pricePerAcre: null,
    pricePerGunta: null,
    pricePerSqYard: null,
    propertyStatus: priceDetails.propertyStatus ?? rootFields.propertyStatus ?? undefined,
    gstStatus: pickFromList(
      priceDetails.gstStatus ?? rootFields.gstStatus,
      GST_OPTIONS,
      GST_OPTIONS[0]
    ),
    stampDuty: pickFromList(
      priceDetails.stampDuty ?? rootFields.stampDuty,
      STAMP_DUTY_OPTIONS,
      STAMP_DUTY_OPTIONS[0]
    ),
    agentFee: priceDetails.agentFee ?? rootFields.agentFee ?? undefined,
  };

  const activeValue = toNumberOrNull(priceDetails[activeField]);
  if (activeValue !== null) {
    financials[activeField] = activeValue;
  }

  return financials;
};

/**
 * Sync area unit fields to the selected unit (plot + total).
 */
export const sanitizeSpecificationsForSubmit = (formData, specKeys) => {
  const unit = normalizePriceUnit(
    formData.priceDetails?.priceUnit || formData.totalAreaUnit || formData.plotAreaUnit || 'Sft'
  );

  const specifications = {};
  specKeys.forEach((key) => {
    if (key === 'totalAreaUnit' || key === 'plotAreaUnit') return;
    const val = formData[key];
    if (val === '' || val === undefined || val === null) return;
    if (key === 'dimensions' && typeof val === 'object') {
      specifications.dimensions = val;
      return;
    }
    if (key === 'builderRatio' || key === 'ownerRatio') {
      const n = toNumberOrNull(val);
      if (n !== null && n >= 0 && n <= 100) specifications[key] = n;
      return;
    }
    specifications[key] = val;
  });

  specifications.totalAreaUnit = unit;
  specifications.plotAreaUnit = unit;

  return specifications;
};

/** Clear inactive price fields in form state when user switches unit */
export const buildPriceDetailsForUnit = (prevPriceDetails, unit) => {
  const normalized = normalizePriceUnit(unit);
  const activeField = getPriceFieldForUnit(normalized);
  const activeValue = prevPriceDetails?.[activeField] ?? '';

  return {
    ...prevPriceDetails,
    priceUnit: normalized,
    pricePerSft: activeField === 'pricePerSft' ? activeValue : '',
    pricePerAcre: activeField === 'pricePerAcre' ? activeValue : '',
    pricePerGunta: activeField === 'pricePerGunta' ? activeValue : '',
    pricePerSqYard: activeField === 'pricePerSqYard' ? activeValue : '',
  };
};
