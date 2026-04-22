"use client";

import { useEffect } from "react";

async function getIPAPI() {
  console.log("calling ip api");
  try {
    const data = await fetch("http://ip-api.com/json?fields=66846719").then(
      (res) => res.json()
    );
    console.log("ip api data::", data);
    return data.query || null;
  } catch (e: any) {
    console.log("IP discovery error::", e.message);
    return null;
  }
}

const IPDiscovery = () => {
  useEffect(() => {
    const saveIPToCookie = (ip: string) => {
      document.cookie = `user_ip=${ip}; path=/; max-age=86400`; // 1 day
    };

    const getUserIP = async () => {
      let ipFound = false;

      // 1. Set a fallback timer (e.g., 2 seconds)
      const fallbackTimer = setTimeout(async () => {
        if (!ipFound) {
          const apiIP = await getIPAPI();
          if (apiIP) saveIPToCookie(apiIP);
        }
      }, 2000);

      // 2. Fetch IP using WebRTC
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
      });

      pc.createDataChannel(""); // Needed to trigger ICE gathering

      pc.onicecandidate = (event) => {
        if (!event.candidate || !event.candidate.candidate) return;

        const candidate = event.candidate.candidate;
        const ipMatch = candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3})/);

        console.log("ipMatch::", ipMatch);
        if (ipMatch) {
          ipFound = true;
          clearTimeout(fallbackTimer); // Cancel the API call if WebRTC wins
          const ip = ipMatch[1];
          saveIPToCookie(ip);
          pc.onicecandidate = null; // Stop after first IP
          pc.close();
        }
      };

      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
      } catch (err) {
        // Handle error
        const apiIP = await getIPAPI();
        if (apiIP) saveIPToCookie(apiIP);
        console.error("WebRTC IP fetch error:", err);
      }
    };

    getUserIP();
  }, []);

  return null; // No UI
};

export default IPDiscovery;
