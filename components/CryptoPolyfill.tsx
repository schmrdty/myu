// Location: /components/CryptoPolyfill.tsx

"use client";

import { useEffect } from "react";

export function CryptoPolyfill() {
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.crypto?.randomUUID) {
      Object.defineProperty(window.crypto, 'randomUUID', {
        value: function(): string {
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
        }
      });
    }
  }, []);

  return null;
}
