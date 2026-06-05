import React from 'react';
import {
  getBhkFilterValue,
  getUniqueBhkOptions,
  isBhkOptionSelected,
  toggleBhkSelection,
} from '../../utils/bhkFilter';

// ── Brand tokens ─────────────────────────────────────────────────────────────
const PRIMARY = '#023526';
const PRIMARY_MID = '#034432';
const GOLD = '#c5a880';

const formatPrice = (p) => {
  if (p >= 10000000) return `₹${(p / 10000000).toFixed(1)} Cr`;
  if (p >= 100000) return `₹${(p / 100000).toFixed(1)} L`;
  return `₹${p}`;
};

// ── FilterSection ─────────────────────────────────────────────────────────────
const FilterSection = ({ title, children, isLast = false }) => (
  <div className={isLast ? 'pb-0' : 'pb-5 mb-5 border-b border-slate-100/80'}>
    <div className="flex items-center gap-2 mb-3.5">
      <span
        className="block h-3.5 w-[3px] rounded-full shrink-0"
        style={{ background: GOLD }}
        aria-hidden
      />
      <h4
        className="text-[10.5px] font-bold uppercase tracking-[0.18em] m-0"
        style={{ color: PRIMARY }}
      >
        {title}
      </h4>
    </div>
    <div className="space-y-1">{children}</div>
  </div>
);

// ── FilterInput ───────────────────────────────────────────────────────────────
const FilterInput = ({ label, ...props }) => (
  <div>
    {label && (
      <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
        {label}
      </span>
    )}
    <input
      {...props}
      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all shadow-sm"
      style={{ '--tw-ring-color': PRIMARY }}
      onFocus={(e) => {
        e.target.style.borderColor = PRIMARY;
        e.target.style.boxShadow = `0 0 0 3px ${PRIMARY}14`;
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        e.target.style.borderColor = '';
        e.target.style.boxShadow = '';
        props.onBlur?.(e);
      }}
    />
  </div>
);

// ── CheckboxOption ────────────────────────────────────────────────────────────
const CheckboxOption = ({ id, checked, onChange, label }) => (
  <label
    htmlFor={id}
    className="flex items-center gap-3 py-1.5 px-2 rounded-xl cursor-pointer transition-colors hover:bg-slate-50 group"
  >
    {/* Custom checkbox */}
    <span
      className="w-[18px] h-[18px] rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200"
      style={
        checked
          ? { background: PRIMARY, borderColor: PRIMARY }
          : { background: 'white', borderColor: '#cbd5e1' }
      }
      aria-hidden
    >
      {checked && (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <polyline
            points="2,5 4.2,7.5 8.5,2.5"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
    {/* Visually hidden native checkbox for a11y */}
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="sr-only"
    />
    <span
      className={`text-sm capitalize leading-none transition-colors ${checked ? 'font-semibold text-slate-900' : 'text-slate-600 group-hover:text-slate-800'
        }`}
    >
      {label}
    </span>
  </label>
);

// ── RadioOption ───────────────────────────────────────────────────────────────
const RadioOption = ({ id, checked, onSelect, label }) => (
  <button
    type="button"
    id={id}
    role="radio"
    aria-checked={!!checked}
    onClick={() => onSelect?.()}
    className="flex w-full items-center gap-3 py-1.5 px-2 rounded-xl cursor-pointer border-none bg-transparent text-left transition-colors hover:bg-slate-50 group"
  >
    {/* Custom radio ring */}
    <span
      className="w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200"
      style={
        checked
          ? { borderColor: PRIMARY }
          : { borderColor: '#cbd5e1' }
      }
      aria-hidden
    >
      {checked && (
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{ background: PRIMARY }}
        />
      )}
    </span>
    <span
      className={`text-sm capitalize leading-none transition-colors ${checked ? 'font-semibold text-slate-900' : 'text-slate-600 group-hover:text-slate-800'
        }`}
    >
      {label}
    </span>
  </button>
);

// ── Helpers ───────────────────────────────────────────────────────────────────
const isPresetRangeActive = (filters, preset, minKey, maxKey) =>
  Number(filters[minKey]) === Number(preset.min) &&
  Number(filters[maxKey]) === Number(preset.max);

const OptionList = ({ children, columns = 1 }) => (
  <div className={columns === 2 ? 'grid grid-cols-2 gap-x-2 gap-y-0' : 'flex flex-col'}>
    {children}
  </div>
);

// ── PriceBlock ─────────────────────────────────────────────────────────────────
const PriceBlock = ({ filter, filters, setFilters, sectionId = 'price' }) => (
  <>
    <div className="grid grid-cols-2 gap-3">
      <FilterInput
        label="Min"
        type="number"
        placeholder="0"
        value={filters.minPrice || ''}
        onChange={(e) => setFilters((p) => ({ ...p, minPrice: Number(e.target.value) }))}
      />
      <FilterInput
        label="Max"
        type="number"
        placeholder="Any"
        value={filters.maxPrice || ''}
        onChange={(e) => setFilters((p) => ({ ...p, maxPrice: Number(e.target.value) }))}
      />
    </div>

    {filter.presets?.length > 0 && (
      <div className="pt-2">
        <span className="block text-[10.5px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
          Quick select
        </span>
        <OptionList>
          {filter.presets.map((p) => (
            <RadioOption
              key={p.label}
              id={`${sectionId}-preset-${p.label}`}
              checked={isPresetRangeActive(filters, p, 'minPrice', 'maxPrice')}
              onSelect={() =>
                setFilters((prev) => {
                  if (isPresetRangeActive(prev, p, 'minPrice', 'maxPrice')) {
                    return {
                      ...prev,
                      minPrice: filter.min ?? 0,
                      maxPrice: filter.max ?? 500000000,
                    };
                  }
                  return { ...prev, minPrice: p.min, maxPrice: p.max };
                })
              }
              label={p.label}
            />
          ))}
        </OptionList>
      </div>
    )}

    {/* Selected range display */}
    <div
      className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold"
      style={{ background: `${PRIMARY}0d`, color: PRIMARY, border: `1px solid ${PRIMARY}20` }}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
        <circle cx="6" cy="6" r="5" stroke={GOLD} strokeWidth="1.5" />
        <path d="M4 6h4M6 4v4" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      {formatPrice(filters.minPrice || filter.min)} – {formatPrice(filters.maxPrice || filter.max)}
    </div>
  </>
);

// ── Main GlobalFilters ────────────────────────────────────────────────────────
const GlobalFilters = ({ dynamicFilters, filters, setFilters }) => {
  if (!dynamicFilters || dynamicFilters.length === 0) {
    return (
      <FilterSection title="Price Range">
        <PriceBlock filter={{ min: 0, max: 0 }} filters={filters} setFilters={setFilters} />
      </FilterSection>
    );
  }

  const lastIndex = dynamicFilters.length - 1;

  return (
    <div>
      {dynamicFilters.map((filter, index) => {
        const section = { title: filter.label, isLast: index === lastIndex };

        if (filter.id === 'price') {
          return (
            <FilterSection key={filter.id} {...section}>
              <PriceBlock
                filter={filter}
                filters={filters}
                setFilters={setFilters}
                sectionId="price"
              />
            </FilterSection>
          );
        }

        if (filter.id === 'bhk') {
          const bhkOptions = getUniqueBhkOptions(filter.options);
          return (
            <FilterSection key={filter.id} {...section}>
              <OptionList columns={2}>
                {bhkOptions.map((opt) => {
                  const isSelected = isBhkOptionSelected(filters.beds, opt);
                  return (
                    <CheckboxOption
                      key={opt}
                      id={`bhk-${getBhkFilterValue(opt)}`}
                      checked={isSelected}
                      label={opt}
                      onChange={() =>
                        setFilters((prev) => ({
                          ...prev,
                          beds: toggleBhkSelection(prev.beds, opt, isSelected),
                        }))
                      }
                    />
                  );
                })}
              </OptionList>
            </FilterSection>
          );
        }

        if (filter.id === 'propertyStatus') {
          return (
            <FilterSection key={filter.id} {...section}>
              <OptionList>
                {filter.options.map((opt) => {
                  const isSelected = filters.status?.includes(opt);
                  return (
                    <CheckboxOption
                      key={opt}
                      id={`status-${opt}`}
                      checked={isSelected}
                      label={opt}
                      onChange={() =>
                        setFilters((prev) => ({
                          ...prev,
                          status: isSelected
                            ? (prev.status || []).filter((s) => s !== opt)
                            : [...(prev.status || []), opt],
                        }))
                      }
                    />
                  );
                })}
              </OptionList>
            </FilterSection>
          );
        }

        if (filter.id === 'facing') {
          const facingValue = (filters.facing || '').trim().toLowerCase();
          return (
            <FilterSection key={filter.id} {...section}>
              <OptionList>
                <RadioOption
                  id="facing-any"
                  checked={!facingValue}
                  label="Any direction"
                  onSelect={() => setFilters((prev) => ({ ...prev, facing: '' }))}
                />
                {filter.options.map((opt) => (
                  <RadioOption
                    key={opt}
                    id={`facing-${opt}`}
                    checked={facingValue === String(opt).trim().toLowerCase()}
                    label={opt}
                    onSelect={() =>
                      setFilters((prev) => {
                        const prevFacing = (prev.facing || '').trim().toLowerCase();
                        const nextFacing = String(opt).trim().toLowerCase();
                        return {
                          ...prev,
                          facing: prevFacing === nextFacing ? '' : opt,
                        };
                      })
                    }
                  />
                ))}
              </OptionList>
            </FilterSection>
          );
        }

        if (filter.id === 'plotArea') {
          return (
            <FilterSection key={filter.id} {...section}>
              <div className="grid grid-cols-2 gap-3">
                <FilterInput
                  label="Min"
                  type="number"
                  placeholder="SqYd"
                  value={filters.minArea || ''}
                  onChange={(e) => setFilters((p) => ({ ...p, minArea: Number(e.target.value) }))}
                />
                <FilterInput
                  label="Max"
                  type="number"
                  placeholder="SqYd"
                  value={filters.maxArea || ''}
                  onChange={(e) => setFilters((p) => ({ ...p, maxArea: Number(e.target.value) }))}
                />
              </div>
              {filter.presets?.length > 0 && (
                <div className="pt-2">
                  <span className="block text-[10.5px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Quick select
                  </span>
                  <OptionList>
                    {filter.presets.map((p) => (
                      <RadioOption
                        key={p.label}
                        id={`area-preset-${p.label}`}
                        checked={isPresetRangeActive(filters, p, 'minArea', 'maxArea')}
                        label={p.label}
                        onSelect={() =>
                          setFilters((prev) => {
                            if (isPresetRangeActive(prev, p, 'minArea', 'maxArea')) {
                              return {
                                ...prev,
                                minArea: filter.min ?? 0,
                                maxArea: filter.max ?? 10000,
                              };
                            }
                            return { ...prev, minArea: p.min, maxArea: p.max };
                          })
                        }
                      />
                    ))}
                  </OptionList>
                </div>
              )}
            </FilterSection>
          );
        }

        if (filter.id === 'propertyType') {
          return (
            <FilterSection key={filter.id} {...section}>
              <OptionList>
                {filter.options.map((opt) => {
                  const isSelected = filters.types?.includes(opt.id);
                  return (
                    <CheckboxOption
                      key={opt.id}
                      id={`type-${opt.id}`}
                      checked={isSelected}
                      label={opt.label}
                      onChange={() =>
                        setFilters((prev) => ({
                          ...prev,
                          types: isSelected
                            ? prev.types.filter((t) => t !== opt.id)
                            : [...(prev.types || []), opt.id],
                        }))
                      }
                    />
                  );
                })}
              </OptionList>
            </FilterSection>
          );
        }

        if (filter.id === 'vastuCompliant') {
          return (
            <FilterSection key={filter.id} {...section}>
              <OptionList>
                <RadioOption
                  id="vastu-any"
                  checked={!filters.vastu}
                  label="Show all"
                  onSelect={() => setFilters((prev) => ({ ...prev, vastu: false }))}
                />
                <RadioOption
                  id="vastu-only"
                  checked={!!filters.vastu}
                  label="Vastu compliant only"
                  onSelect={() => setFilters((prev) => ({ ...prev, vastu: !prev.vastu }))}
                />
              </OptionList>
            </FilterSection>
          );
        }

        return null;
      })}
    </div>
  );
};

export default GlobalFilters;
