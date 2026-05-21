import { createContext, useContext, useState, useCallback } from "react";

const ID = () => Math.random().toString(36).substr(2,9) + Date.now().toString(36);
const load = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

export const ROLES = {
  superadmin: { label:"Super Admin", color:"#7C3AED", bg:"#7C3AED18" },
  editor:     { label:"Editor",      color:"#1B3F8B", bg:"#1B3F8B15" },
  crm:        { label:"CRM Agent",   color:"#F0876A", bg:"#F0876A15" },
  viewer:     { label:"Viewer",      color:"#6B6B8A", bg:"#6B6B8A12" },
};

export const ROLE_ACCESS = {
  superadmin: ["overview","students","attendance","progress","lessons","behaviour","nutrition","parents","finance","staff","analytics","ai","leads","icp","campaigns","content","blog","pages","media","social","seo","designer","users","cloud","settings"],
  editor:     ["overview","content","blog","pages","media","social","seo","designer","settings"],
  crm:        ["overview","leads","icp","campaigns"],
  teacher:    ["overview","students","attendance","progress","lessons","behaviour","nutrition"],
  viewer:     ["overview"],
};

export const LEAD_STAGES = [
  { id:"new",       label:"New Lead",     icon:"🆕", color:"#6C63FF" },
  { id:"contacted", label:"Contacted",    icon:"📞", color:"#1B3F8B" },
  { id:"visit",     label:"Visit Booked", icon:"🗓️", color:"#4BAE95" },
  { id:"meeting",   label:"Meeting Done", icon:"🤝", color:"#F5C518" },
  { id:"enrolled",  label:"Enrolled",     icon:"✅", color:"#22C55E" },
  { id:"cold",      label:"Cold / Lost",  icon:"❄️", color:"#6B6B8A" },
];

const DEFAULT_USERS = [{
  id:"u1", name:"Site Owner", email:"admin@mmn.com", password:"mmnadmin2024",
  role:"superadmin", avatar:"👑", active:true,
  createdAt: new Date().toISOString(), lastLogin: null,
}];

const DEFAULT_PAGES = [
  { id:"p1", title:"Home",        slug:"/",            visible:true, navOrder:1, custom:false },
  { id:"p2", title:"About",       slug:"/about",       visible:true, navOrder:2, custom:false },
  { id:"p3", title:"Programs",    slug:"/programs",    visible:true, navOrder:3, custom:false },
  { id:"p4", title:"For Mothers", slug:"/for-mothers", visible:true, navOrder:4, custom:false },
  { id:"p5", title:"Admissions",  slug:"/admissions",  visible:true, navOrder:5, custom:false },
  { id:"p6", title:"Contact",     slug:"/contact",     visible:true, navOrder:6, custom:false },
];

export const DEFAULT_SOCIAL = {
  facebook:"", instagram:"", twitter:"", youtube:"",
  tiktok:"", linkedin:"", whatsapp:"https://wa.me/923390002106",
  pinterest:"", snapchat:"",
};

const Ctx = createContext(null);

export const AdminProvider = ({ children }) => {
  const [users,     setUsers]     = useState(() => load("mmn_users",     DEFAULT_USERS));
  const [leads,     setLeads]     = useState(() => load("mmn_leads",     []));
  const [pages,     setPages]     = useState(() => load("mmn_pages",     DEFAULT_PAGES));
  const [social,    setSocial]    = useState(() => load("mmn_social",    DEFAULT_SOCIAL));
  const [campaigns, setCampaigns] = useState(() => load("mmn_campaigns", []));
  const [blogs,     setBlogs]     = useState(() => load("mmn_blogs",     []));
  const [icps,      setIcps]      = useState(() => load("mmn_icps",      []));
  const [seoPages,  setSeoPages]  = useState(() => load("mmn_seo_pages", {}));

  // LEADS
  const addLead = useCallback((lead) => {
    const n = { id:ID(), ...lead, status:"new", priority:"medium", tags:[],
      assignedTo:null, contactHistory:[],
      createdAt:new Date().toISOString(), updatedAt:new Date().toISOString() };
    setLeads(p => { const q=[n,...p]; save("mmn_leads",q); return q; });
    return n;
  }, []);

  const updateLead = useCallback((id, patch) => {
    setLeads(p => {
      const q = p.map(l => l.id===id ? {...l,...patch,updatedAt:new Date().toISOString()} : l);
      save("mmn_leads",q); return q;
    });
  }, []);

  const deleteLead = useCallback((id) => {
    setLeads(p => { const q=p.filter(l=>l.id!==id); save("mmn_leads",q); return q; });
  }, []);

  const addActivity = useCallback((leadId, entry) => {
    const e = { id:ID(), ...entry, date:new Date().toISOString() };
    setLeads(p => {
      const q = p.map(l => l.id===leadId
        ? {...l, contactHistory:[...(l.contactHistory||[]),e], updatedAt:new Date().toISOString()} : l);
      save("mmn_leads",q); return q;
    });
  }, []);

  // USERS
  const addUser = useCallback((user) => {
    const n = { id:ID(), ...user, active:true, createdAt:new Date().toISOString(), lastLogin:null };
    setUsers(p => { const q=[...p,n]; save("mmn_users",q); return q; });
  }, []);

  const updateUser = useCallback((id, patch) => {
    setUsers(p => { const q=p.map(u=>u.id===id?{...u,...patch}:u); save("mmn_users",q); return q; });
  }, []);

  const deleteUser = useCallback((id) => {
    setUsers(p => { const q=p.filter(u=>u.id!==id); save("mmn_users",q); return q; });
  }, []);

  // PAGES
  const updatePage = useCallback((id, patch) => {
    setPages(p => { const q=p.map(pg=>pg.id===id?{...pg,...patch}:pg); save("mmn_pages",q); return q; });
  }, []);

  const addPage = useCallback((page) => {
    const n = { id:ID(), ...page, custom:true, navOrder:99 };
    setPages(p => { const q=[...p,n]; save("mmn_pages",q); return q; });
  }, []);

  const deletePage = useCallback((id) => {
    setPages(p => { const q=p.filter(pg=>pg.id!==id); save("mmn_pages",q); return q; });
  }, []);

  const reorderPages = useCallback((reordered) => {
    save("mmn_pages",reordered); setPages(reordered);
  }, []);

  // SOCIAL
  const updateSocial = useCallback((patch) => {
    setSocial(p => { const q={...p,...patch}; save("mmn_social",q); return q; });
  }, []);

  // CAMPAIGNS
  const addCampaign = useCallback((camp) => {
    const n = { id:ID(), ...camp, status:"draft", createdAt:new Date().toISOString() };
    setCampaigns(p => { const q=[n,...p]; save("mmn_campaigns",q); return q; });
    return n;
  }, []);

  const updateCampaign = useCallback((id, patch) => {
    setCampaigns(p => { const q=p.map(c=>c.id===id?{...c,...patch}:c); save("mmn_campaigns",q); return q; });
  }, []);

  const deleteCampaign = useCallback((id) => {
    setCampaigns(p => { const q=p.filter(c=>c.id!==id); save("mmn_campaigns",q); return q; });
  }, []);

  // BLOGS
  const addBlog = useCallback((blog) => {
    const n = { id:ID(), ...blog, views:0, status:"draft", createdAt:new Date().toISOString(), updatedAt:new Date().toISOString() };
    setBlogs(p => { const q=[n,...p]; save("mmn_blogs",q); return q; });
    return n;
  }, []);

  const updateBlog = useCallback((id, patch) => {
    setBlogs(p => { const q=p.map(b=>b.id===id?{...b,...patch,updatedAt:new Date().toISOString()}:b); save("mmn_blogs",q); return q; });
  }, []);

  const deleteBlog = useCallback((id) => {
    setBlogs(p => { const q=p.filter(b=>b.id!==id); save("mmn_blogs",q); return q; });
  }, []);

  // ICPs
  const addICP = useCallback((icp) => {
    const n = { id:ID(), ...icp, createdAt:new Date().toISOString() };
    setIcps(p => { const q=[...p,n]; save("mmn_icps",q); return q; });
    return n;
  }, []);

  const updateICP = useCallback((id, patch) => {
    setIcps(p => { const q=p.map(x=>x.id===id?{...x,...patch}:x); save("mmn_icps",q); return q; });
  }, []);

  const deleteICP = useCallback((id) => {
    setIcps(p => { const q=p.filter(x=>x.id!==id); save("mmn_icps",q); return q; });
  }, []);

  // SEO per page
  const updateSEOPage = useCallback((pageKey, patch) => {
    setSeoPages(p => { const q={...p,[pageKey]:{...(p[pageKey]||{}),...patch}}; save("mmn_seo_pages",q); return q; });
  }, []);

  return (
    <Ctx.Provider value={{
      users, leads, pages, social, campaigns, blogs, icps, seoPages,
      addLead, updateLead, deleteLead, addActivity,
      addUser, updateUser, deleteUser,
      updatePage, addPage, deletePage, reorderPages,
      updateSocial,
      addCampaign, updateCampaign, deleteCampaign,
      addBlog, updateBlog, deleteBlog,
      addICP, updateICP, deleteICP,
      updateSEOPage,
    }}>
      {children}
    </Ctx.Provider>
  );
};

export const useAdmin = () => useContext(Ctx);
