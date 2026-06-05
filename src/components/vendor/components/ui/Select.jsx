import React from 'react';

const Select = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = '',
  className = '',
  labelClassName = '',
  containerClassName = '',
}) => {
  return (
    <div className={`flex flex-col gap-2.5 ${containerClassName}`}>
      {label && (
        <label className={`text-md font-semibold text-slate-600 mb-1 block ${labelClassName}`}>
          {label}
        </label>
      )}
      <div className="relative group">
        <select
          value={value}
          onChange={onChange}
          className={`vendor-form-select text-md font-medium text-slate-800 shadow-sm ${className}`}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => {
            const isObject = typeof option === 'object';
            const val = isObject ? option.value : option;
            const labelText = isObject ? option.label : option;
            return (
              <option key={val} value={val} className="py-2 text-slate-900 bg-white">
                {labelText}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );
};

export default Select;
