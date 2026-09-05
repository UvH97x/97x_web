'use client';

import { useEffect, useState } from 'react';

/** Canvas charts must redraw when CSS theme tokens change. */
export function useThemeColors() {
  const [colors, setColors] = useState({
    bg: 'rgb(255 255 255)', fg: 'rgb(15 23 42)',
    muted: 'rgb(71 85 105)', border: 'rgb(226 232 240)',
    hist: 'rgb(58 122 174)', ih: 'rgb(148 98 0)', gauss: 'rgb(186 51 80)',
  });

  useEffect(() => {
    function update() {
      const style = getComputedStyle(document.documentElement);
      const read = (name: string) => `rgb(${style.getPropertyValue(`--${name}`).trim()})`;
      setColors({ bg: read('bg'), fg: read('fg'), muted: read('muted'), border: read('border'),
        hist: read('plot-hist'), ih: read('plot-ih'), gauss: read('plot-gauss') });
    }
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return colors;
}
