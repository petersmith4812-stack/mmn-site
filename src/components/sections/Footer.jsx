import { C } from "../../constants/theme";
import Logo from "../ui/Logo";

const Footer = () => (
  <footer style={{ background:C.navyDark, padding:"40px 6vw 32px" }}>
    <div style={{ maxWidth:1100, margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:20 }}>
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <Logo size={36} />
        <div>
          <div style={{ fontFamily:"Fredoka One", fontSize:14, color:C.white }}>MINI MUSLIMS NEST</div>
          <div style={{ fontFamily:"Nunito", fontSize:11, color:"rgba(255,255,255,0.4)", letterSpacing:"0.07em" }}>PRESCHOOL & AFTERSCHOOL CLUB · SINCE 2024</div>
        </div>
      </div>
      <div style={{ display:"flex", height:3, width:120, borderRadius:4, overflow:"hidden" }}>
        {C.rainbow.map((c,i)=><div key={i} style={{flex:1,background:c}}/>)}
      </div>
      <div style={{ fontFamily:"Nunito", fontSize:12, color:"rgba(255,255,255,0.35)", textAlign:"right" }}>
        Nurturing Future Khalifahs<br/>
        <span style={{ color:"rgba(255,255,255,0.2)" }}>minimuslimsnest@gmail.com</span>
      </div>
    </div>
  </footer>
);

export default Footer;
