"use server";

import { cookies, headers } from "next/headers";

export async function getIPs() {
  const cookieStore = await cookies();
  const headersList = await headers();

  let ip = null;
  try {
    ip = await fetch(
      `http://ip-api.com/json/${cookieStore.get("user_ip")?.value || headersList.get("x-forwarded-for")}`
    ).then((res) => res.json());
    console.log("ip-api", ip);
  } catch (e) {
    console.log("ip-api issue::", e);
  }
  const data = {
    "webrtc-ip": cookieStore.get("user_ip")?.value,
    "x-forwarded-for": headersList.get("x-forwarded-for"),
    "x-real-ip": headersList.get("x-real-ip"),
    "cf-connecting-ip": headersList.get("cf-connecting-ip"),
    "ip-api": ip
  };

  return data;
}
