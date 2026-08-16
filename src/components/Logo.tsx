import Image from 'next/image';

type LogoProps = {
  size?: number;
  showText?: boolean;
  className?: string;
};

export function Logo({ size = 72, showText = false, className = '' }: LogoProps) {
  return (
    <div className={`brand-logo ${className}`.trim()}>
      <Image
        src="/racunai-logo.png"
        alt="racunAI"
        width={size}
        height={size}
        priority
        className="brand-logo-img"
      />
      {showText && <span className="brand-logo-text">racunAI</span>}
    </div>
  );
}
