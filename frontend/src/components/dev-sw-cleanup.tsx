"use client";

import { useEffect } from "react";

export default function DevServiceWorkerCleanup() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const cleanup = async () => {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));
      } catch (error) {
        console.warn("Failed to unregister service workers:", error);
      }

      try {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map((key) => caches.delete(key)));
      } catch (error) {
        console.warn("Failed to clear caches:", error);
      }
    };

    cleanup();
  }, []);

  return null;
}