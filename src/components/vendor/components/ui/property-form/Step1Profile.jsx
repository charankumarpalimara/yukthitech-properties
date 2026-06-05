import { useVendorCategoriesStore, fetchCategories } from '../../../../../store/vendorCategoriesStore';
import { useEffect, useMemo } from 'react';
import {
  Building,
  Layout,
  ShieldCheck,
  FileText,
  CheckCircle,
  Eye,
  UploadCloud,
  Trash2,
  Plus,
  Calendar,
  IndianRupee,
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  APPROVAL_AUTHORITIES,
  FACING_OPTIONS,
  LAND_AREA_UNITS,
  COMMERCIAL_TYPES,
  BAR_COUNCILS,
  PROPERTY_STATUSES,
  GST_OPTIONS,
  STAMP_DUTY_OPTIONS,
} from '../../../constants/formOptions';
import { getPriceFieldForUnit } from './unitSanitize';
import { State, City } from 'country-state-city';
import { PF_INPUT, PF_SELECT, PF_LABEL, PF_LABEL_BLOCK, PF_LABEL_MB1 } from './formFieldClasses';

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

export default function Step1Profile({
  formData,
  cities = [],
  handleChange,
  handleNestedChange,
  handleUnifiedUnitChange,
  validationErrors,
  isProject,
  isSingleUnit,
  isApartment,
  isStandalone,
  isLand,
  isLandForDevelopment,
  isCommercial,
  handleDevelopmentRatioChange,
  idCardFrontRef,
  idCardBackRef,
  handleFileChange,
  setLightboxMedia,
  reraCertRef,
  layoutPermissionRef,
  buildingPermissionRef,
  hmdaApprovalRef,
  handleAddAdditionalApproval,
  handleUpdateAdditionalApproval,
  handleDeleteAdditionalApproval,
  handleAdditionalApprovalFileChange,
}) {
  const categories = useVendorCategoriesStore((s) => s.categories);

  const safeCategories = useMemo(() => (Array.isArray(categories) ? categories : []), [categories]);
  const selectedCategory = useMemo(
    () => safeCategories.find((c) => c._id === formData.propertyType),
    [safeCategories, formData.propertyType]
  );
  const propertyTypeName = selectedCategory
    ? selectedCategory.name
    : formData.propertyType || 'Property';

  const statesList = useMemo(() => State.getStatesOfCountry('IN'), []);

  const cityList = useMemo(() => {
    if (!formData.address?.state) return [];
    const stateObj = statesList.find((s) => s.name === formData.address.state);
    return stateObj ? City.getCitiesOfState('IN', stateObj.isoCode) : [];
  }, [formData.address?.state, statesList]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const activeUnit = formData.priceDetails?.priceUnit || 'Sft';

  const setUnifiedUnit = (unit) => {
    if (handleUnifiedUnitChange) {
      handleUnifiedUnitChange(unit);
      return;
    }
    handleNestedChange('priceDetails', 'priceUnit', unit);
    handleChange('totalAreaUnit', unit);
  };

  const getPricePerValue = () => {
    const pd = formData.priceDetails || {};
    const field = getPriceFieldForUnit(pd.priceUnit);
    return pd[field] ?? '';
  };

  const setPricePerValue = (value) => {
    const field = getPriceFieldForUnit(formData.priceDetails?.priceUnit);
    handleNestedChange('priceDetails', field, value, 'number');
  };

  // Auto-calculate Total Price from total area × price-per-unit
  useEffect(() => {
    const pd = formData.priceDetails || {};
    const area = parseFloat(formData.totalArea);
    const pricePerUnit = parseFloat(pd[getPriceFieldForUnit(pd.priceUnit)] ?? '');
    if (area > 0 && pricePerUnit > 0) {
      const computed = (area * pricePerUnit).toFixed(0);
      handleNestedChange('priceDetails', 'totalPrice', computed);
    } else {
      handleNestedChange('priceDetails', 'totalPrice', '');
    }
  }, [
    formData.totalArea,
    formData.priceDetails?.priceUnit,
    formData.priceDetails?.pricePerSft,
    formData.priceDetails?.pricePerAcre,
    formData.priceDetails?.pricePerGunta,
    formData.priceDetails?.pricePerSqYard,
  ]);

  return (
    <div className="bg-white space-y-6 p-6">
      {/* ── BASIC INFO ── */}
      <SectionBlock
        id="section-basic"
        title="Basic Information"
        description="Configure primary property names, type and authority approvals"
        icon={<Building size={16} />}
        required
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <p className={PF_LABEL_BLOCK}>
              Name of the Project / Society <span className="text-rose-500">*</span>
            </p>
            <input
              id="property-field-projectName"
              type="text"
              value={formData.projectName}
              onChange={(e) => handleChange('projectName', e.target.value)}
              className={`${PF_INPUT} ${validationErrors.projectName ? 'border-rose-400' : ''}`}
              placeholder="Enter project/society name"
            />
            {validationErrors.projectName && (
              <p className="text-xs text-rose-500 font-semibold mt-1">
                {validationErrors.projectName}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <p className={PF_LABEL_BLOCK}>
              Property Type <span className="text-rose-500">*</span>
            </p>
            <select
              id="property-field-propertyType"
              value={formData.propertyType || ''}
              onChange={(e) => handleChange('propertyType', e.target.value)}
              className={`${PF_SELECT} ${validationErrors.propertyType ? 'border-rose-400' : ''}`}
            >
              <option value="">Select Property Type</option>
              {safeCategories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
            {validationErrors.propertyType && (
              <p className="text-xs text-rose-500 font-semibold mt-1">
                {validationErrors.propertyType}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <p className={PF_LABEL_BLOCK}>
              Project Approved by <span className="text-rose-500">*</span>
            </p>
            <select
              id="property-field-projectApprovedBy"
              value={formData.projectApprovedBy}
              onChange={(e) => handleChange('projectApprovedBy', e.target.value)}
              className={`${PF_SELECT} ${validationErrors.projectApprovedBy ? 'border-rose-400' : ''}`}
            >
              <option value="">Select Approval Authority</option>
              {APPROVAL_AUTHORITIES.map((auth) => (
                <option key={auth} value={auth}>
                  {auth}
                </option>
              ))}
            </select>
            {validationErrors.projectApprovedBy && (
              <p className="text-xs text-rose-500 font-semibold mt-1">
                {validationErrors.projectApprovedBy}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <p className={PF_LABEL_BLOCK}>State</p>
            <select
              value={formData.address?.state || ''}
              onChange={(e) => {
                handleNestedChange('address', 'state', e.target.value);
                handleNestedChange('address', 'city', ''); // Reset city when state changes
              }}
              className={`${PF_SELECT} ${validationErrors['address.state'] ? 'border-rose-400' : ''}`}
            >
              <option value="">Select State</option>
              {statesList.map((state) => (
                <option key={state.isoCode} value={state.name}>
                  {state.name}
                </option>
              ))}
            </select>
            {validationErrors['address.state'] && (
              <p className="text-xs text-rose-500 font-semibold mt-1">
                {validationErrors['address.state']}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <p className={PF_LABEL_BLOCK}>City</p>
            <select
              value={formData.address?.city || ''}
              onChange={(e) => handleNestedChange('address', 'city', e.target.value)}
              className={`${PF_SELECT} ${validationErrors['address.city'] ? 'border-rose-400' : ''}`}
              disabled={!formData.address?.state}
            >
              <option value="">Select City</option>
              {cityList.map((city) => (
                <option key={city.name} value={city.name}>
                  {city.name}
                </option>
              ))}
            </select>
            {validationErrors['address.city'] && (
              <p className="text-xs text-rose-500 font-semibold mt-1">
                {validationErrors['address.city']}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <p className={PF_LABEL_BLOCK}>Address Line 1</p>
            <input
              type="text"
              value={formData.address.addressLine1}
              onChange={(e) => handleNestedChange('address', 'addressLine1', e.target.value)}
              className={`${PF_INPUT} ${validationErrors['address.addressLine1'] ? 'border-rose-400' : ''}`}
              placeholder="Flat/House No., Building, Street"
            />
            {validationErrors['address.addressLine1'] && (
              <p className="text-xs text-rose-500 font-semibold mt-1">
                {validationErrors['address.addressLine1']}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <p className={PF_LABEL_BLOCK}>Google Maps URL</p>
            <input
              type="text"
              value={formData.address.googleMapUrl}
              onChange={(e) => handleNestedChange('address', 'googleMapUrl', e.target.value)}
              className={`${PF_INPUT} ${validationErrors['address.googleMapUrl'] ? 'border-rose-400' : ''}`}
              placeholder="Paste location URL from Google Maps"
            />
            {validationErrors['address.googleMapUrl'] && (
              <p className="text-xs text-rose-500 font-semibold mt-1">
                {validationErrors['address.googleMapUrl']}
              </p>
            )}
          </div>
        </div>
      </SectionBlock>

      {/* ── SPECIFICATIONS ── */}
      <SectionBlock
        id="section-specs"
        title={formData.propertyType && formData.projectName ? `${propertyTypeName} Specifications` : 'Specifications'}
        description="Area, BHK, floors, facing and property configuration"
        icon={<IndianRupee size={18} />}
      >
        {/* ── SPECIFICATIONS (shown only when property identity is set) ── */}
        {formData.propertyType && formData.projectName && formData.projectApprovedBy && (
          <>
            {/* <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
                            {propertyTypeName} Specifications
                        </p> */}
            {/* RESIDENTIAL & STANDALONE */}
            {(isProject || isSingleUnit) && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
                  <div className="space-y-2">
                    <p className={PF_LABEL_BLOCK}>
                      {isProject ? 'BHK Configurations ' : 'Number of Bedrooms'}
                    </p>
                    <input
                      type="text"
                      value={formData.bhkConfig}
                      onChange={(e) => handleChange('bhkConfig', e.target.value)}
                      className={PF_INPUT}
                      placeholder={isProject ? 'e.g. 1, 2, 3 BHK' : 'e.g. 3 BHK'}
                    />
                  </div>
                  <div className="space-y-2">
                    <p className={PF_LABEL_BLOCK}>
                      Total Area ({activeUnit}) <span className="text-rose-500">*</span>
                    </p>
                    <input
                      id="property-field-totalArea"
                      type="text"
                      value={formData.totalArea ?? ''}
                      onChange={(e) => handleChange('totalArea', e.target.value, 'number')}
                      className={`${PF_INPUT} ${validationErrors.totalArea ? 'border-rose-400' : ''}`}
                      placeholder="Enter total area"
                    />
                    {validationErrors.totalArea && (
                      <p className="text-xs text-rose-500 font-semibold mt-1">
                        {validationErrors.totalArea}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className={PF_LABEL_BLOCK}>
                      {isProject ? 'Total Floors' : 'Number of Floors'}
                    </p>
                    <input
                      type="text"
                      value={formData.numberOfFloors}
                      onChange={(e) => handleChange('numberOfFloors', e.target.value, 'number')}
                      className={PF_INPUT}
                      placeholder="0"
                    />
                  </div>
                  {propertyTypeName?.toLowerCase() !== 'farm house' && (
                    <div className="space-y-2">
                      <p className={PF_LABEL_BLOCK}>Facing</p>
                      <select
                        value={formData.facing}
                        onChange={(e) => handleChange('facing', e.target.value)}
                        className={PF_SELECT}
                      >
                        {FACING_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="space-y-2">
                    <p className={PF_LABEL_BLOCK}>Vastu Compliant</p>
                    <div className="flex gap-2 h-10">
                      {['Yes', 'No'].map((choice) => {
                        const isSelected = formData.vastuCompliant === choice;
                        return (
                          <label
                            key={choice}
                            className={`flex flex-1 items-center justify-center gap-1.5 h-full px-1 rounded-full border bg-white transition-all cursor-pointer ${isSelected ? 'border-primary text-primary shadow-sm' : 'border-slate-200 hover:border-slate-300 text-slate-500'}`}
                          >
                            <input
                              type="radio"
                              name="vastuCompliant"
                              className="hidden"
                              checked={isSelected}
                              onChange={() => handleChange('vastuCompliant', choice)}
                            />
                            <div
                              className={`w-3 h-3 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${isSelected ? 'border-primary' : 'border-slate-300'}`}
                            >
                              {isSelected && (
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                              )}
                            </div>
                            <span className=" font-semibold text-md">{choice}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* LAND / PLOTS */}
            {isLand && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
                <div className="space-y-2">
                  <p className={PF_LABEL_BLOCK}>
                    Total Area ({activeUnit}) <span className="text-rose-500">*</span>
                  </p>
                  <input
                    id="property-field-totalArea"
                    type="text"
                    value={formData.totalArea ?? ''}
                    onChange={(e) => handleChange('totalArea', e.target.value, 'number')}
                    className={`${PF_INPUT} ${validationErrors.totalArea ? 'border-rose-400' : ''}`}
                    placeholder="Enter total area"
                  />
                  {validationErrors.totalArea && (
                    <p className="text-xs text-rose-500 font-semibold mt-1">
                      {validationErrors.totalArea}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <p className={PF_LABEL_BLOCK}>Dimensions (L x W) in Feet</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={formData.dimensions.length}
                      onChange={(e) =>
                        handleNestedChange('dimensions', 'length', e.target.value, 'number')
                      }
                      className={PF_INPUT}
                      placeholder="Length"
                    />
                    <span className="text-slate-400 font-bold">×</span>
                    <input
                      type="text"
                      value={formData.dimensions.width}
                      onChange={(e) =>
                        handleNestedChange('dimensions', 'width', e.target.value, 'number')
                      }
                      className={PF_INPUT}
                      placeholder="Width"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className={PF_LABEL_BLOCK}>Road Width (FT)</p>
                  <input
                    type="text"
                    value={formData.roadWidth}
                    onChange={(e) => handleChange('roadWidth', e.target.value, 'number')}
                    className={PF_INPUT}
                    placeholder="00"
                  />
                </div>
                <div className="space-y-2">
                  <p className={PF_LABEL_BLOCK}>Facing</p>
                  <select
                    value={formData.facing}
                    onChange={(e) => handleChange('facing', e.target.value)}
                    className={PF_SELECT}
                  >
                    {FACING_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <p className={PF_LABEL_BLOCK}>Boundary Wall</p>
                  <div className="flex gap-2 h-10">
                    {['Yes', 'No'].map((choice) => {
                      const isSelected = formData.boundaryWall === choice;
                      return (
                        <label
                          key={choice}
                          className={`flex flex-1 items-center justify-center gap-1.5 h-full px-4 rounded-full border bg-white transition-all cursor-pointer ${isSelected ? 'border-primary text-primary shadow-sm' : 'border-slate-200 hover:border-slate-300 text-slate-500'}`}
                        >
                          <input
                            type="radio"
                            name="boundaryWall"
                            className="hidden"
                            checked={isSelected}
                            onChange={() => handleChange('boundaryWall', choice)}
                          />
                          <div
                            className={`w-3 h-3 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${isSelected ? 'border-primary' : 'border-slate-300'}`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                          </div>
                          <span className="text-md font-semibold">{choice}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* COMMERCIAL */}
            {isCommercial && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <p className={PF_LABEL_BLOCK}>
                    Total Area ({activeUnit}) <span className="text-rose-500">*</span>
                  </p>
                  <input
                    id="property-field-totalArea"
                    type="text"
                    value={formData.totalArea ?? ''}
                    onChange={(e) => handleChange('totalArea', e.target.value, 'number')}
                    className={`${PF_INPUT} ${validationErrors.totalArea ? 'border-rose-400' : ''}`}
                    placeholder="Enter total area"
                  />
                  {validationErrors.totalArea && (
                    <p className="text-xs text-rose-500 font-semibold mt-1">
                      {validationErrors.totalArea}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <p className={PF_LABEL_BLOCK}>Total Number of Floors</p>
                  <input
                    type="text"
                    value={formData.numberOfFloors}
                    onChange={(e) => handleChange('numberOfFloors', e.target.value, 'number')}
                    className={PF_INPUT}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <p className={PF_LABEL_BLOCK}>Commercial Type</p>
                  <select
                    value={formData.commercialType}
                    onChange={(e) => handleChange('commercialType', e.target.value)}
                    className={PF_SELECT}
                  >
                    {COMMERCIAL_TYPES.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <p className={PF_LABEL_BLOCK}>Facing</p>
                  <select
                    value={formData.facing}
                    onChange={(e) => handleChange('facing', e.target.value)}
                    className={PF_SELECT}
                  >
                    {FACING_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <p className={PF_LABEL_BLOCK}>Washrooms</p>
                  <select
                    value={formData.washrooms}
                    onChange={(e) => handleChange('washrooms', e.target.value)}
                    className={PF_SELECT}
                  >
                    <option value="Private">Private</option>
                    <option value="Shared">Shared</option>
                    <option value="None">None</option>
                  </select>
                </div>
              </div>
            )}
          </>
        )}
      </SectionBlock>

      {/* ── PRICING ── */}
      <SectionBlock
        id="section-pricing"
        title="Status & Pricing"
        description="Transaction type, price, GST and stamp duty details"
        icon={<IndianRupee size={18} />}
        required
      >

        {/* Unit — full width */}
        <div className="space-y-2 mb-5">
          <p className={`${PF_LABEL} block`}>Unit</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
            {LAND_AREA_UNITS.map((unit) => {
              const isSelected = activeUnit === unit;
              return (
                <label
                  key={unit}
                  className={`flex w-full items-center justify-center gap-1.5 px-2 h-10 rounded-full border bg-white transition-all cursor-pointer text-xs font-semibold ${isSelected ? 'border-primary text-primary shadow-sm' : 'border-slate-200 hover:border-slate-300 text-slate-500'}`}
                >
                  <input
                    type="radio"
                    name="unifiedUnit"
                    className="hidden"
                    checked={isSelected}
                    onChange={() => setUnifiedUnit(unit)}
                  />
                  <div
                    className={`w-3 h-3 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${isSelected ? 'border-primary' : 'border-slate-300'}`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                  </div>
                  <span className="truncate font-semibold text-md">{unit}</span>
                </label>
              );
            })}
          </div>
        </div>
        {isLandForDevelopment && (
          <div className="mt-6 pt-6 border-t border-slate-100 mb-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
              Development share
            </p>
            <p className="text-sm text-slate-500 font-medium mb-4">
              Builder and owner percentages must total <strong>100%</strong>. Changing one field
              updates the other automatically.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl">
              <div className="space-y-2">
                <p className={PF_LABEL_BLOCK}>Builder ratio (%)</p>
                <input
                  id="property-field-builderRatio"
                  type="text"
                  inputMode="numeric"
                  maxLength={3}
                  value={formData.builderRatio ?? ''}
                  onChange={(e) => handleDevelopmentRatioChange('builderRatio', e.target.value)}
                  className={`${PF_INPUT} ${validationErrors.builderRatio ? 'border-rose-400' : ''}`}
                  placeholder="e.g. 30"
                />
                {validationErrors.builderRatio && (
                  <p className="text-xs text-rose-500 font-semibold mt-1">
                    {validationErrors.builderRatio}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <p className={PF_LABEL_BLOCK}>Owner ratio (%)</p>
                <input
                  id="property-field-ownerRatio"
                  type="text"
                  inputMode="numeric"
                  maxLength={3}
                  value={formData.ownerRatio ?? ''}
                  onChange={(e) => handleDevelopmentRatioChange('ownerRatio', e.target.value)}
                  className={`${PF_INPUT} ${validationErrors.ownerRatio ? 'border-rose-400' : ''}`}
                  placeholder="e.g. 70"
                />
                {validationErrors.ownerRatio && (
                  <p className="text-xs text-rose-500 font-semibold mt-1">
                    {validationErrors.ownerRatio}
                  </p>
                )}
              </div>
            </div>
            {/* {(formData.builderRatio !== '' || formData.ownerRatio !== '') && (
                                    <p className="mt-3 text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 inline-flex px-3 py-1 rounded-full">
                                        Total: {(Number(formData.builderRatio) || 0) + (Number(formData.ownerRatio) || 0)}%
                                    </p>
                                )} */}
          </div>
        )}
        {/* Price per unit + total price (area fields live in specifications above) */}
        <div className="mb-6">
          <div className="grid grid-cols-1 gap-6 items-end md:grid-cols-2">
            <div className="space-y-2">
              <p className={`${PF_LABEL} block`}>Price per {activeUnit}</p>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-md">
                  ₹
                </span>
                <input
                  type="text"
                  value={getPricePerValue()}
                  onChange={(e) => setPricePerValue(e.target.value)}
                  className={`${PF_INPUT} pl-8`}
                  placeholder={`Rate per ${activeUnit}`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className={`${PF_LABEL} block`}>
                  Total Price <span className="text-rose-500">*</span>
                </p>
                {formData.totalArea ? (
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                    Auto-calculated
                  </span>
                ) : null}
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-black text-md">
                  ₹
                </span>
                <input
                  id="property-field-totalPrice"
                  type="text"
                  value={formData.priceDetails?.totalPrice ?? ''}
                  disabled={true}
                  onChange={(e) =>
                    handleNestedChange('priceDetails', 'totalPrice', e.target.value, 'number')
                  }
                  className={`${PF_INPUT} pl-9 border-2 text-slate-900 ${validationErrors['priceDetails.totalPrice'] ? 'border-rose-400' : 'border-primary/20 hover:border-primary/40'}`}
                  placeholder="Total price"
                />
              </div>
              {validationErrors['priceDetails.totalPrice'] && (
                <p className="text-xs text-rose-500 font-semibold mt-1">
                  {validationErrors['priceDetails.totalPrice']}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Status / GST / Stamp Duty — below total price */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6 mb-6">
          <div className="space-y-2">
            <p className={`${PF_LABEL} block`}>Property Status</p>
            <select
              value={formData.propertyStatus}
              onChange={(e) => handleChange('propertyStatus', e.target.value)}
              className={PF_SELECT}
            >
              {PROPERTY_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <p className={`${PF_LABEL} block`}>GST Status</p>
            <select
              value={formData.gstStatus}
              onChange={(e) => handleChange('gstStatus', e.target.value)}
              className={PF_SELECT}
            >
              {GST_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <p className={`${PF_LABEL} block`}>Stamp Duty &amp; Registration</p>
            <select
              value={formData.stampDuty}
              onChange={(e) => handleChange('stampDuty', e.target.value)}
              className={PF_SELECT}
            >
              {STAMP_DUTY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>
      </SectionBlock>

      {/* ── RERA & APPROVALS ── */}
      <SectionBlock
        id="section-rera"
        title="RERA & Approvals"
        description="RERA registration numbers, dates and government approvals"
        icon={<ShieldCheck size={18} />}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2.5">
              <label className={PF_LABEL_MB1}>RERA Number</label>
              <div className="relative group">
                <input
                  type="text"
                  value={formData.reraNumber}
                  onChange={(e) => handleChange('reraNumber', e.target.value)}
                  className={`${PF_INPUT} ${validationErrors.reraNumber ? 'border-rose-400' : ''}`}
                  placeholder="e.g. P0220000..."
                />
              </div>
              {validationErrors.reraNumber && (
                <p className="text-xs text-rose-500 font-semibold mt-1">
                  {validationErrors.reraNumber}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2.5">
              <label className={PF_LABEL_MB1}>RERA Expiry Date</label>

              <div className="relative w-full">
                <DatePicker
                  selected={formData.reraExpiry ? new Date(formData.reraExpiry) : null}
                  onChange={(date) =>
                    handleChange('reraExpiry', date ? date.toISOString().split('T')[0] : '')
                  }
                  placeholderText="Select expiry date"
                  dateFormat="dd/MM/yyyy"
                  minDate={new Date()}
                  showYearDropdown
                  scrollableYearDropdown
                  yearDropdownItemNumber={15}
                  wrapperClassName="w-full"
                  popperClassName="z-50"
                  className={`${PF_INPUT} ${validationErrors.reraExpiry ? 'border-rose-400' : ''}`}
                />

                <Calendar
                  size={16}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>

              {validationErrors.reraExpiry && (
                <p className="text-[13px] text-rose-500 font-semibold mt-1">
                  {validationErrors.reraExpiry}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-3">
              <label className={PF_LABEL_MB1}>
                RERA Certificates{' '}
                <span className="text-slate-400 font-normal lowercase">(Multiple allowed)</span>
              </label>

              {/* Upload Area */}
              <div
                onClick={() => reraCertRef.current?.click()}
                className=" py-1 border-2 border-dashed border-slate-200 gap-2 rounded-xl bg-slate-50 flex flex-row items-center justify-center cursor-pointer hover:bg-white hover:border-primary/50 transition-all group/rera"
              >
                <input
                  type="file"
                  ref={reraCertRef}
                  className="hidden"
                  multiple
                  onChange={(e) => handleFileChange(e, 'reraCertificate', null, true)}
                />
                <div className="p-1 bg-white rounded-full shadow-sm text-slate-400 group-hover/rera:text-primary transition-colors mb-2">
                  <UploadCloud size={16} />
                </div>
                <span className="text-xs font-semibold text-slate-500">Click to upload files</span>
              </div>

              {/* File List */}
              {Array.isArray(formData.reraCertificate) && formData.reraCertificate.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  {formData.reraCertificate.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl group/doc animate-in fade-in slide-in-from-top-1 duration-300"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                          <CheckCircle size={14} />
                        </div>
                        <span className="text-xs font-semibold text-slate-700 truncate">
                          Doc {index + 1}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 opacity-0 group-hover/doc:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => {
                            const url = typeof doc === 'string' ? doc : URL.createObjectURL(doc);
                            setLightboxMedia({ url, type: 'image' });
                          }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="View"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const newList = formData.reraCertificate.filter((_, i) => i !== index);
                            handleChange('reraCertificate', newList);
                          }}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
                          title="Remove"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="text-slate-400" size={16} />
              <h3 className="text-sm font-semibold text-slate-600">
                Permissions & Approval Numbers
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Layout */}
              <div className="space-y-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                <div className="space-y-2">
                  <p className={PF_LABEL_BLOCK}>Layout Permission No.</p>
                  <input
                    type="text"
                    value={formData.layoutPermissionNumber}
                    onChange={(e) => handleChange('layoutPermissionNumber', e.target.value)}
                    className={PF_INPUT}
                    placeholder="No."
                  />
                </div>
                <div className="space-y-2">
                  <p className={PF_LABEL_BLOCK}>Upload Document</p>
                  <div
                    onClick={() => layoutPermissionRef.current?.click()}
                    className={`h-11 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer transition-all relative group/layout ${formData.layoutPermissionDoc ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white hover:border-primary/30'}`}
                  >
                    <input
                      type="file"
                      ref={layoutPermissionRef}
                      className="hidden"
                      onChange={(e) => handleFileChange(e, 'layoutPermissionDoc')}
                    />
                    {formData.layoutPermissionDoc ? (
                      <div className="flex items-center justify-center w-full h-full">
                        <CheckCircle size={18} />
                        <div className="absolute inset-0 bg-emerald-600/10 opacity-0 group-hover/layout:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const doc = formData.layoutPermissionDoc;
                              const url = typeof doc === 'string' ? doc : URL.createObjectURL(doc);
                              setLightboxMedia({ url, type: 'image' });
                            }}
                            className="p-1 bg-white shadow-sm rounded text-blue-600 hover:text-blue-700 transition-colors"
                            title="View"
                          >
                            <Eye size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              layoutPermissionRef.current?.click();
                            }}
                            className="p-1 bg-white shadow-sm rounded text-emerald-600 hover:text-emerald-700 transition-colors"
                            title="Change"
                          >
                            <UploadCloud size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleChange('layoutPermissionDoc', null);
                            }}
                            className="p-1 bg-rose-500 shadow-sm rounded text-white hover:bg-rose-600 transition-colors"
                            title="Remove"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <UploadCloud size={16} />
                    )}
                  </div>
                </div>
              </div>

              {/* Building */}
              <div className="space-y-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                <div className="space-y-2">
                  <p className={PF_LABEL_BLOCK}>Building Permission No.</p>
                  <input
                    type="text"
                    value={formData.buildingPermissionNumber}
                    onChange={(e) => handleChange('buildingPermissionNumber', e.target.value)}
                    className={PF_INPUT}
                    placeholder="No."
                  />
                </div>
                <div className="space-y-2">
                  <p className={PF_LABEL_BLOCK}>Upload Document</p>
                  <div
                    onClick={() => buildingPermissionRef.current?.click()}
                    className={`h-11 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer transition-all relative group/building ${formData.buildingPermissionDoc ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white hover:border-primary/30'}`}
                  >
                    <input
                      type="file"
                      ref={buildingPermissionRef}
                      className="hidden"
                      onChange={(e) => handleFileChange(e, 'buildingPermissionDoc')}
                    />
                    {formData.buildingPermissionDoc ? (
                      <div className="flex items-center justify-center w-full h-full">
                        <CheckCircle size={18} />
                        <div className="absolute inset-0 bg-emerald-600/10 opacity-0 group-hover/building:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const doc = formData.buildingPermissionDoc;
                              const url = typeof doc === 'string' ? doc : URL.createObjectURL(doc);
                              setLightboxMedia({ url, type: 'image' });
                            }}
                            className="p-1 bg-white shadow-sm rounded text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            <Eye size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              buildingPermissionRef.current?.click();
                            }}
                            className="p-1 bg-white shadow-sm rounded text-emerald-600 hover:text-emerald-700 transition-colors"
                          >
                            <UploadCloud size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleChange('buildingPermissionDoc', null);
                            }}
                            className="p-1 bg-rose-500 shadow-sm rounded text-white hover:bg-rose-600 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <UploadCloud size={16} />
                    )}
                  </div>
                </div>
              </div>

              {/* HMDA */}
              <div className="space-y-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                <div className="space-y-2">
                  <p className={PF_LABEL_BLOCK}>HMDA Approval No.</p>
                  <input
                    type="text"
                    value={formData.hmdaApprovalNumber}
                    onChange={(e) => handleChange('hmdaApprovalNumber', e.target.value)}
                    className={PF_INPUT}
                    placeholder="No."
                  />
                </div>
                <div className="space-y-2">
                  <p className={PF_LABEL_BLOCK}>Upload Document</p>
                  <div
                    onClick={() => hmdaApprovalRef.current?.click()}
                    className={`h-11 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer transition-all relative group/hmda ${formData.hmdaApprovalDoc ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white hover:border-primary/30'}`}
                  >
                    <input
                      type="file"
                      ref={hmdaApprovalRef}
                      className="hidden"
                      onChange={(e) => handleFileChange(e, 'hmdaApprovalDoc')}
                    />
                    {formData.hmdaApprovalDoc ? (
                      <div className="flex items-center justify-center w-full h-full">
                        <CheckCircle size={18} />
                        <div className="absolute inset-0 bg-emerald-600/10 opacity-0 group-hover/hmda:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const doc = formData.hmdaApprovalDoc;
                              const url = typeof doc === 'string' ? doc : URL.createObjectURL(doc);
                              setLightboxMedia({ url, type: 'image' });
                            }}
                            className="p-1 bg-white shadow-sm rounded text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            <Eye size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              hmdaApprovalRef.current?.click();
                            }}
                            className="p-1 bg-white shadow-sm rounded text-emerald-600 hover:text-emerald-700 transition-colors"
                          >
                            <UploadCloud size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleChange('hmdaApprovalDoc', null);
                            }}
                            className="p-1 bg-rose-500 shadow-sm rounded text-white hover:bg-rose-600 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <UploadCloud size={16} />
                    )}
                  </div>
                </div>
              </div>

              {formData.additionalApprovals.map((approval, index) => (
                <div
                  key={index}
                  className="space-y-4 p-4 border-2 border-dashed border-slate-200 rounded-xl relative group col-span-1 bg-white"
                >
                  <button
                    onClick={() => handleDeleteAdditionalApproval(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg shadow-rose-200 z-10"
                  >
                    <Trash2 size={12} />
                  </button>
                  <div className="space-y-2">
                    <p className={PF_LABEL_BLOCK}>Approval Title</p>
                    <input
                      type="text"
                      value={approval.title}
                      onChange={(e) =>
                        handleUpdateAdditionalApproval(index, 'title', e.target.value)
                      }
                      className={`${PF_INPUT} ${validationErrors[`additionalApproval_${index}_title`] ? 'border-rose-400' : ''}`}
                      placeholder="e.g. Fire Safety"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <p className={PF_LABEL_BLOCK}>Number</p>
                      <input
                        type="text"
                        value={approval.number}
                        onChange={(e) =>
                          handleUpdateAdditionalApproval(index, 'number', e.target.value)
                        }
                        className={PF_INPUT}
                        placeholder="No."
                      />
                    </div>
                    <div className="space-y-2">
                      <p className={PF_LABEL_BLOCK}>Upload</p>
                      <div
                        onClick={() => document.getElementById(`additional-doc-${index}`)?.click()}
                        className={`h-[38px] border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer transition-all relative group/add-doc ${approval.doc ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white hover:border-primary/30'}`}
                      >
                        <input
                          type="file"
                          id={`additional-doc-${index}`}
                          className="hidden"
                          onChange={(e) => handleAdditionalApprovalFileChange(e, index)}
                        />
                        {approval.doc ? <CheckCircle size={16} /> : <UploadCloud size={16} />}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-center h-full min-h-[140px] p-4">
                <button
                  onClick={handleAddAdditionalApproval}
                  className="w-full h-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 border-slate-200 bg-slate-50/50 text-slate-400 hover:bg-white hover:border-primary/50 hover:text-primary transition-all group"
                >
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:bg-primary group-hover:text-white transition-all">
                    <Plus size={16} />
                  </div>
                  <span className="text-xs font-semibold">Add More</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </SectionBlock>
    </div>
  );
}
