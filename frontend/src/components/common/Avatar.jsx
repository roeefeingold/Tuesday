import { getInitials } from '../../utils/helpers';
import './Avatar.css';

const COLORS = [
  'linear-gradient(135deg, #0073ea, #579bfc)',
  'linear-gradient(135deg, #00c875, #00b461)',
  'linear-gradient(135deg, #fdab3d, #e99a2e)',
  'linear-gradient(135deg, #e44258, #cf3a4e)',
  'linear-gradient(135deg, #a25ddc, #7e3fb5)',
  'linear-gradient(135deg, #579bfc, #0073ea)',
  'linear-gradient(135deg, #ff642e, #e05522)',
  'linear-gradient(135deg, #66ccff, #4da3d9)',
];

function hashName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export default function Avatar({ name, size = 'md' }) {
  const initials = getInitials(name);
  const bg = COLORS[hashName(name || '') % COLORS.length];

  return (
    <div
      className={`avatar avatar--${size}`}
      style={{ background: bg }}
      title={name}
    >
      {initials}
    </div>
  );
}
