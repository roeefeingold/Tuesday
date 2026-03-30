import './Spinner.css';

export default function Spinner({ size = 32 }) {
  return (
    <div className="spinner-container">
      <div className="spinner" style={{ width: size, height: size }} />
    </div>
  );
}
