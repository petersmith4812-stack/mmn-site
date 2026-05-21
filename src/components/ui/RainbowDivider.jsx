import { C } from "../../constants/theme";

const RainbowDivider = () => (
  <div style={{ display:"flex", height: 4, width: "100%", maxWidth: 120, margin: "0 auto 32px" }}>
    {C.rainbow.map((c, i) => <div key={i} style={{ flex:1, background: c }} />)}
  </div>
);

export default RainbowDivider;
