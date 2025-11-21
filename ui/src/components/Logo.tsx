const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width="36"
        height="36"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform hover:scale-110"
      >
        {/* Diary book cover */}
        <rect
          x="6"
          y="8"
          width="24"
          height="20"
          rx="2"
          fill="currentColor"
          className="text-primary"
          opacity="0.8"
        />

        {/* Book spine */}
        <rect
          x="4"
          y="8"
          width="4"
          height="20"
          rx="1"
          fill="currentColor"
          className="text-primary"
          opacity="0.6"
        />

        {/* Diary lines (representing pages) */}
        <line
          x1="10"
          y1="14"
          x2="26"
          y2="14"
          stroke="currentColor"
          strokeWidth="1"
          className="text-background"
        />
        <line
          x1="10"
          y1="18"
          x2="24"
          y2="18"
          stroke="currentColor"
          strokeWidth="1"
          className="text-background"
        />
        <line
          x1="10"
          y1="22"
          x2="26"
          y2="22"
          stroke="currentColor"
          strokeWidth="1"
          className="text-background"
        />

        {/* Lock icon (privacy) */}
        <rect
          x="14"
          y="24"
          width="8"
          height="6"
          rx="1"
          fill="currentColor"
          className="text-accent"
        />
        <path
          d="M16 24V22C16 20.9 16.9 20 18 20C19.1 20 20 20.9 20 22V24"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          className="text-accent"
        />

        {/* Encryption symbols */}
        <circle
          cx="30"
          cy="12"
          r="1.5"
          fill="currentColor"
          className="text-accent"
        />
        <circle
          cx="32"
          cy="16"
          r="1"
          fill="currentColor"
          className="text-primary"
        />
        <circle
          cx="28"
          cy="20"
          r="1"
          fill="currentColor"
          className="text-primary"
        />
      </svg>
      <span className="font-semibold text-xl tracking-tight">EncryptedDiary</span>
    </div>
  );
};

export default Logo;
