import { useState, useEffect } from "react";
import { C } from "../../constants/theme";

const ScrollProgress = () => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const total = h.scrollHeight - h.clientHeight;
      setProgress(total > 0 ? (h.scrollTop / total) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div style={{
      position:"fixed", top:0, left:0, height:3, width:"100%",
      background:"transparent", zIndex:200, pointerEvents:"none",
    }}>
      <div style={{
        height:"100%", width:`${progress}%`,
        background:`linear-gradient(90deg, ${C.rainbow[0]}, ${C.rainbow[1]}, ${C.rainbow[2]}, ${C.rainbow[3]}, ${C.rainbow[4]}, ${C.rainbow[5]})`,
        transition:"width 0.1s linear",
      }}/>
    </div>
  );
};

export default ScrollProgress;
