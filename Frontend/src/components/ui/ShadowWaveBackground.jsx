// ShadowWaveBackground — animated drifting blobs, mimics Ethereal Shadows
export default function ShadowWaveBackground({ className = '' }) {
  return (
    <div className={`shadow-wave-bg ${className}`} aria-hidden="true">
      <div className="wave-blob wave-blob-1" />
      <div className="wave-blob wave-blob-2" />
      <div className="wave-blob wave-blob-3" />
    </div>
  );
}
