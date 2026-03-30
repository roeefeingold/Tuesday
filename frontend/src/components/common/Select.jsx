import './Select.css';

export default function Select({ value, onChange, options, placeholder, label, className = '' }) {
  return (
    <div className={`select-wrapper ${className}`}>
      {label && <label className="select-label">{label}</label>}
      <select
        className="select-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
