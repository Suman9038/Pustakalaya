// Badge — Role, Language, FileType, Verified status pills
const VARIANTS = {
  amber:   { bg: 'rgba(212,160,83,0.12)', color: '#d4a053', border: 'rgba(212,160,83,0.25)' },
  green:   { bg: 'rgba(74,222,128,0.10)', color: '#4ade80', border: 'rgba(74,222,128,0.25)' },
  red:     { bg: 'rgba(248,113,113,0.10)', color: '#f87171', border: 'rgba(248,113,113,0.25)' },
  blue:    { bg: 'rgba(96,165,250,0.10)', color: '#60a5fa', border: 'rgba(96,165,250,0.25)' },
  muted:   { bg: 'rgba(255,255,255,0.05)', color: '#8a8590', border: 'rgba(255,255,255,0.08)' },
  purple:  { bg: 'rgba(167,139,250,0.10)', color: '#a78bfa', border: 'rgba(167,139,250,0.25)' },
};

const FILE_TYPE_VARIANT = { pdf: 'red', docx: 'blue', epub: 'purple' };
const ROLE_VARIANT = { admin: 'amber', user: 'muted' };

export default function Badge({ children, variant = 'muted', className = '' }) {
  const style = VARIANTS[variant] || VARIANTS.muted;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-sans font-medium ${className}`}
      style={{
        background: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        letterSpacing: '0.02em',
      }}
    >
      {children}
    </span>
  );
}

export function FileTypeBadge({ mimeType, fileName }) {
  const ext = fileName?.split('.').pop()?.toLowerCase() || 
              mimeType?.split('/').pop()?.toLowerCase() || 'file';
  const label = ext.toUpperCase();
  const variant = FILE_TYPE_VARIANT[ext] || 'muted';
  return <Badge variant={variant}>{label}</Badge>;
}

export function RoleBadge({ role }) {
  const variant = ROLE_VARIANT[role?.toLowerCase()] || 'muted';
  return <Badge variant={variant}>{role?.toUpperCase()}</Badge>;
}

export function VerifiedBadge({ isVerified }) {
  return isVerified ? (
    <Badge variant="green">✓ Verified</Badge>
  ) : (
    <Badge variant="red">Unverified</Badge>
  );
}
