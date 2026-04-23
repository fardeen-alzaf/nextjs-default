"use client";

import { getIPs } from "@/lib/actions/ip";
import { useEffect, useState } from "react";

export default function IpTestingPage() {
  const [metaData, setMetaData] = useState<any>(null);

  const handleMetaData = async (retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        const data: any = {
          captured_at: new Date().toISOString(),
          userAgent: window.navigator.userAgent,
          language: window.navigator.language,
          vendor: window.navigator.vendor,
          platform: (window.navigator as any).platform,
          hardwareConcurrency: window.navigator.hardwareConcurrency,
          deviceMemory: (window.navigator as any).deviceMemory,
          screen: {
            width: window.screen.width,
            height: window.screen.height,
            colorDepth: window.screen.colorDepth,
            pixelDepth: window.screen.pixelDepth
          }
        };

        // Get Geolocation
        if ("geolocation" in navigator) {
          try {
            const position = await new Promise<GeolocationPosition>(
              (resolve, reject) => {
                window.navigator.geolocation.getCurrentPosition(
                  resolve,
                  reject,
                  {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                  }
                );
              }
            );

            data.location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              heading: position.coords.heading,
              speed: position.coords.speed
            };
          } catch (geoError: any) {
            console.warn("Geolocation capture failed:", geoError);
            data.location = {
              message: geoError.message || "Permission denied"
            };
          }
        }

        // Fetching via local proxy to bypass CORS/Mixed-Content forever
        const ipRouteHandler = await fetch("/api/ip")
          .then((res) => res.json())
          .catch((err) => {
            console.error("Geo fetch failed:", err);
            return { status: "fail", message: err.message };
          });

        const ipServerAction = await getIPs();

        setMetaData({
          browser: data,
          ipRouteHandler: ipRouteHandler,
          ips: ipServerAction
        });
        return; // Success, exit the loop
      } catch (error) {
        console.error(`Metadata attempt ${i + 1} failed:`, error);
        if (i === retries - 1) {
          // Last attempt failed
          setMetaData({ error: "Failed to load metadata after retries" });
        } else {
          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
        }
      }
    }
  };

  useEffect(() => {
    handleMetaData();
  }, []);
  return (
    <div>
      IpTestingPage
      <pre>{JSON.stringify(metaData || {}, null, 2)}</pre>
    </div>
  );
}
