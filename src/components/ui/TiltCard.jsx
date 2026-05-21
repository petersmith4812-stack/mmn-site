import { useRef } from "react";

const TiltCard = ({ children, maxTilt = 6, style = {}, ...rest }) => {
  const ref = useRef(null);
  const handleMove = (e) => {
    const card = ref.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(900px) rotateX(${-y * maxTilt}deg) rotateY(${x * maxTilt}deg) translateY(-4px)`;
  };
  const handleLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };
  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ transition: "transform 0.25s ease", willChange: "transform", ...style }}
      {...rest}
    >
      {children}
    </div>
  );
};

export default TiltCard;
