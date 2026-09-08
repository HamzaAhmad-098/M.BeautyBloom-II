import { useEffect, useState } from 'react';

const BRAND = 'M.BeautyBloom';

const SplashScreen = ({ onFinish }) => {
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    const hideTimer = setTimeout(() => setHiding(true), 2100);
    const doneTimer = setTimeout(() => onFinish?.(), 2650);
    return () => {
      clearTimeout(hideTimer);
      clearTimeout(doneTimer);
    };
  }, [onFinish]);

  return (
    <div className={`splash-screen ${hiding ? 'splash-hide' : ''}`} role="status" aria-label="Loading M.BeautyBloom">
      <div className="splash-glow" />
      <div className="splash-content">
        <img src="/logo.png" alt="M.BeautyBloom" className="splash-logo" />
        <h1 className="splash-title">
          {BRAND.split('').map((ch, i) => (
            <span key={i} style={{ animationDelay: `${0.5 + i * 0.045}s` }}>
              {ch === ' ' ? '\u00A0' : ch}
            </span>
          ))}
        </h1>
        <div className="splash-underline" />
        <p className="splash-powered">Powered by <span>HamzaxDevelopers</span></p>
      </div>
    </div>
  );
};

export default SplashScreen;
