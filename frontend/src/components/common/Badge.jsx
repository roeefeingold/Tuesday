import './Badge.css';

export default function Badge({ label, color, size = 'md' }) {
  return (
    <span
      className={`badge badge--${size}`}
      style={{
        '--badge-color': color,
      }}
    >
      {label}
    </span>
  );
}
