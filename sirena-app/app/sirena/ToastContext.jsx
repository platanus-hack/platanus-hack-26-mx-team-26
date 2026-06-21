"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { Toast } from "../design-system/components";

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const notify = useCallback((message, opts = {}) => {
    setToast({ message, title: opts.title, tone: opts.tone || "info" });
  }, []);

  return (
    <ToastCtx.Provider value={notify}>
      {children}
      {toast && (
        <div style={{ position: "fixed", right: 24, bottom: 24, zIndex: 80 }}>
          <Toast tone={toast.tone} title={toast.title} onClose={() => setToast(null)}>
            {toast.message}
          </Toast>
        </div>
      )}
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
