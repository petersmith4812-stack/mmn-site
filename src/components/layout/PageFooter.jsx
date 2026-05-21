import { Link } from "react-router-dom";
import { C } from "../../constants/theme";
import Logo from "../ui/Logo";
import { useSiteContent } from "../../context/SiteContentContext";

const PageFooter = () => {
  const { content } = useSiteContent();
  const ct = content.contact;

  return (
    <footer style={{ background: C.navyDark, padding: "60px 6vw 32px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Top row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 40, marginBottom: 48 }}>
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <Logo size={36} />
              <div>
                <div style={{ fontFamily: "Fredoka One", fontSize: 14, color: C.white }}>MINI MUSLIMS NEST</div>
                <div style={{ fontFamily: "Nunito", fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "0.07em" }}>SINCE 2024</div>
              </div>
            </div>
            <p style={{ fontFamily: "Nunito", fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, margin: 0 }}>
              Pakistan's first mommy-inclusive preschool. Where roots grow deeper than grades.
            </p>
          </div>

          {/* Pages */}
          <div>
            <div style={{ fontFamily: "Fredoka One", fontSize: 15, color: C.yellow, marginBottom: 16 }}>Pages</div>
            {[["Home","/"],["About","/about"],["Programs","/programs"],["For Mothers","/for-mothers"],["Admissions","/admissions"],["Contact","/contact"]].map(([l,p]) => (
              <div key={p} style={{ marginBottom: 8 }}>
                <Link to={p} style={{ fontFamily: "Nunito", fontSize: 13, color: "rgba(255,255,255,0.6)", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseOver={e => e.currentTarget.style.color = C.yellow}
                  onMouseOut={e => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}
                >{l}</Link>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div>
            <div style={{ fontFamily: "Fredoka One", fontSize: 15, color: C.yellow, marginBottom: 16 }}>Contact</div>
            {[
              { icon: "📧", val: ct.email },
              { icon: "💬", val: ct.whatsapp },
              { icon: "📍", val: ct.location },
              { icon: "🕐", val: ct.hours },
            ].map(({ icon, val }) => (
              <div key={val} style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "flex-start" }}>
                <span style={{ fontSize: 13 }}>{icon}</span>
                <span style={{ fontFamily: "Nunito", fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>{val}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div>
            <div style={{ fontFamily: "Fredoka One", fontSize: 15, color: C.yellow, marginBottom: 16 }}>Join Us</div>
            <p style={{ fontFamily: "Nunito", fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: 20 }}>
              Spots are limited. Reach out to start the conversation.
            </p>
            <a href={ct.whatsappLink} style={{
              display: "inline-block", background: "#25D366", color: C.white,
              fontFamily: "Nunito", fontWeight: 700, fontSize: 13,
              padding: "10px 22px", borderRadius: 100, textDecoration: "none",
            }}>💬 WhatsApp Us</a>
          </div>
        </div>

        {/* Divider */}
        <div style={{ display: "flex", height: 3, borderRadius: 4, overflow: "hidden", marginBottom: 24 }}>
          {C.rainbow.map((c, i) => <div key={i} style={{ flex: 1, background: c }} />)}
        </div>

        {/* Bottom row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ fontFamily: "Nunito", fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
            © {new Date().getFullYear()} Mini Muslims Nest · Lahore, Pakistan
          </div>
          <div style={{ fontFamily: "Nunito", fontSize: 12, color: "rgba(255,255,255,0.2)" }}>
            Nurturing Future Khalifahs
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PageFooter;
