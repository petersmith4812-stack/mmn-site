import { useState, useEffect } from "react";
import { useInView } from "../../hooks/useInView";

const AnimatedCounter = ({ value, suffix = "", duration = 1400 }) => {
  const [ref, visible] = useInView();
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!visible) return;
    const numeric = parseFloat(String(value).replace(/[^0-9.]/g, ""));
    if (isNaN(numeric)) { setCount(value); return; }
    const start = performance.now();
    let raf;
    const tick = (t) => {
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(numeric * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible, value, duration]);
  const display = typeof count === "number"
    ? (Number.isInteger(parseFloat(value)) ? Math.round(count) : count.toFixed(1))
    : count;
  return <span ref={ref}>{display}{suffix}</span>;
};

export default AnimatedCounter;
