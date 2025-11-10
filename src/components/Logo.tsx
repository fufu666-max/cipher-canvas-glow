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
        {/* Paintbrush handle */}
        <path
          d="M8 28L4 32L8 28Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="text-muted-foreground"
        />
        <path
          d="M8 28L14 22"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="text-foreground"
        />
        
        {/* Brush bristles */}
        <path
          d="M14 22L18 18L22 22L18 26L14 22Z"
          fill="currentColor"
          className="text-primary"
          opacity="0.8"
        />
        
        {/* Cryptographic swirl */}
        <path
          d="M18 18C20 16 24 14 28 16C32 18 32 22 30 26C28 30 24 32 20 30C18 29 17 27 17 25"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="text-primary"
          fill="none"
        />
        <circle
          cx="26"
          cy="22"
          r="2"
          fill="currentColor"
          className="text-accent"
        />
        <circle
          cx="22"
          cy="26"
          r="1.5"
          fill="currentColor"
          className="text-primary"
        />
      </svg>
      <span className="font-semibold text-xl tracking-tight">CipherCanvas</span>
    </div>
  );
};

export default Logo;
