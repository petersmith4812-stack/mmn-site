import { createContext, useContext, useState, useCallback } from "react";
import defaultContent from "../data/defaultContent";

const Ctx = createContext(null);

function deepMerge(base, override) {
  const result = { ...base };
  for (const key of Object.keys(override)) {
    const bv = base[key];
    const ov = override[key];
    if (Array.isArray(ov)) {
      result[key] = ov;
    } else if (ov && typeof ov === "object" && bv && typeof bv === "object" && !Array.isArray(bv)) {
      result[key] = { ...bv, ...ov };
    } else {
      result[key] = ov;
    }
  }
  return result;
}

const load = () => {
  try {
    const saved = localStorage.getItem("mmn_content");
    if (saved) return deepMerge(defaultContent, JSON.parse(saved));
  } catch {}
  return defaultContent;
};

const persist = (next) => {
  try { localStorage.setItem("mmn_content", JSON.stringify(next)); } catch {}
};

export const SiteContentProvider = ({ children }) => {
  const [content, setContent] = useState(load);

  // Update scalar fields within a section object
  const updateSection = useCallback((section, patch) => {
    setContent(prev => {
      const next = { ...prev, [section]: { ...prev[section], ...patch } };
      persist(next);
      return next;
    });
  }, []);

  const updateField = useCallback((section, field, value) => {
    updateSection(section, { [field]: value });
  }, [updateSection]);

  // Replace an entire array section
  const updateArray = useCallback((key, newArray) => {
    setContent(prev => {
      const next = { ...prev, [key]: newArray };
      persist(next);
      return next;
    });
  }, []);

  // Update one item inside an array section
  const updateArrayItem = useCallback((key, index, patch) => {
    setContent(prev => {
      const arr = [...(prev[key] || [])];
      arr[index] = typeof patch === "string" ? patch : { ...arr[index], ...patch };
      const next = { ...prev, [key]: arr };
      persist(next);
      return next;
    });
  }, []);

  // Add item to end of array section
  const addArrayItem = useCallback((key, item) => {
    setContent(prev => {
      const next = { ...prev, [key]: [...(prev[key] || []), item] };
      persist(next);
      return next;
    });
  }, []);

  // Remove item from array section by index
  const removeArrayItem = useCallback((key, index) => {
    setContent(prev => {
      const arr = (prev[key] || []).filter((_, i) => i !== index);
      const next = { ...prev, [key]: arr };
      persist(next);
      return next;
    });
  }, []);

  // Move item within array section
  const moveArrayItem = useCallback((key, fromIndex, toIndex) => {
    setContent(prev => {
      const arr = [...(prev[key] || [])];
      const [item] = arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, item);
      const next = { ...prev, [key]: arr };
      persist(next);
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    localStorage.removeItem("mmn_content");
    localStorage.removeItem("mmn_theme");
    setContent(defaultContent);
  }, []);

  const exportData = useCallback(() => {
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "mmn-content-backup.json";
    a.click();
  }, [content]);

  const importData = useCallback((jsonStr) => {
    try {
      const parsed = JSON.parse(jsonStr);
      const merged = deepMerge(defaultContent, parsed);
      persist(merged);
      setContent(merged);
      return true;
    } catch {
      return false;
    }
  }, []);

  return (
    <Ctx.Provider value={{
      content,
      updateSection, updateField,
      updateArray, updateArrayItem, addArrayItem, removeArrayItem, moveArrayItem,
      resetAll, exportData, importData,
    }}>
      {children}
    </Ctx.Provider>
  );
};

export const useSiteContent = () => useContext(Ctx);
