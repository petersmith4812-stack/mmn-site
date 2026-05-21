import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { C } from "./constants/theme";
import { SiteContentProvider } from "./context/SiteContentContext";
import { AdminProvider } from "./context/AdminContext";
import { StyleProvider } from "./context/StyleContext";
import ScrollProgress from "./components/ui/ScrollProgress";
import ScrollToTop from "./components/ui/ScrollToTop";
import Navbar from "./components/layout/Navbar";
import PageFooter from "./components/layout/PageFooter";
import ExitIntentPopup from "./components/ExitIntentPopup";
import SEOInjector from "./components/SEOInjector";
import Home        from "./pages/Home";
import About       from "./pages/About";
import Programs    from "./pages/Programs";
import ForMothers  from "./pages/ForMothers";
import Admissions  from "./pages/Admissions";
import Contact     from "./pages/Contact";
import Blog        from "./pages/Blog";
import BlogPost    from "./pages/BlogPost";
import AdminLogin      from "./pages/admin/AdminLogin";
import AdminDashboard  from "./pages/admin/AdminDashboard";
import ParentLogin     from "./pages/parent/ParentLogin";
import ParentDashboard from "./pages/parent/ParentDashboard";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000, refetchOnWindowFocus: false } },
});

const FontLoader = () => {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;500;600;700;800&family=Lora:ital,wght@0,400;0,600;1,400&display=swap";
    document.head.appendChild(link);
  }, []);
  return null;
};

const SiteLayout = () => (
  <>
    <SEOInjector />
    <Navbar />
    <Routes>
      <Route path="/"            element={<Home />} />
      <Route path="/about"       element={<About />} />
      <Route path="/programs"    element={<Programs />} />
      <Route path="/for-mothers" element={<ForMothers />} />
      <Route path="/admissions"  element={<Admissions />} />
      <Route path="/contact"     element={<Contact />} />
      <Route path="/blog"        element={<Blog />} />
      <Route path="/blog/:slug"  element={<BlogPost />} />
    </Routes>
    <PageFooter />
    <ExitIntentPopup />
  </>
);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
    <AdminProvider>
    <StyleProvider>
    <SiteContentProvider>
      <BrowserRouter>
        <div style={{ fontFamily:"Nunito, sans-serif", background:C.cream, overflowX:"hidden" }}>
          <FontLoader />
          <style>{`
            * { box-sizing: border-box; margin: 0; padding: 0; }
            html { scroll-behavior: smooth; }
            ::-webkit-scrollbar { width: 6px; }
            ::-webkit-scrollbar-track { background: ${C.warmGray}; }
            ::-webkit-scrollbar-thumb { background: ${C.navy}; border-radius: 10px; }
            button { outline: none; }
            @keyframes pulseHeart {
              0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(240,135,106,0.5); }
              50% { transform: scale(1.04); box-shadow: 0 0 0 14px rgba(240,135,106,0); }
            }
            @keyframes shimmer {
              0% { background-position: -200% center; }
              100% { background-position: 200% center; }
            }
            @keyframes bobble {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-6px); }
            }
            @keyframes popIn {
              0%   { opacity:0; transform:scale(0.85) translateY(20px); }
              60%  { opacity:1; transform:scale(1.03) translateY(-4px); }
              100% { transform:scale(1) translateY(0); }
            }
            @media(max-width:600px){
              section { padding-left: 5vw !important; padding-right: 5vw !important; }
            }
            @media (prefers-reduced-motion: reduce) {
              *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
              }
            }
          `}</style>
          <ScrollProgress />
          <Routes>
            <Route path="/admin"              element={<AdminLogin />} />
            <Route path="/admin/dashboard"  element={<AdminDashboard />} />
            <Route path="/parent"           element={<ParentLogin />} />
            <Route path="/parent/dashboard" element={<ParentDashboard />} />
            <Route path="/*"               element={<SiteLayout />} />
          </Routes>
          <ScrollToTop />
        </div>
      </BrowserRouter>
    </SiteContentProvider>
    </StyleProvider>
    </AdminProvider>
    </QueryClientProvider>
  );
}
