import { useEffect, useRef, useState } from 'react';

/**
 * Wrap any content to make it fade/slide/zoom into view on scroll.
 * Usage: <Reveal><div>...</div></Reveal>
 *        <Reveal type="left" delay={100} as="section">...</Reveal>
 *        <Reveal grid><div className="grid ...">...</div></Reveal>  // staggers direct children
 */
const Reveal = ({
  children,
  type = 'up', // up | left | right | zoom
  delay = 0,
  className = '',
  as: Tag = 'div',
  grid = false,
  once = true,
}) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.unobserve(node);
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [once]);

  const typeClass = type === 'left' ? 'reveal-left' : type === 'right' ? 'reveal-right' : type === 'zoom' ? 'reveal-zoom' : '';
  const base = grid ? 'animate-grid' : 'reveal-on-scroll';

  return (
    <Tag
      ref={ref}
      className={`${base} ${typeClass} ${visible ? 'is-visible' : ''} ${className}`}
      style={!grid ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
};

export default Reveal;
