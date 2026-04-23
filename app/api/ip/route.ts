// app/api/ip/route.ts
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  let ip = null;
  try {
    ip = await fetch("http://ip-api.com/json?fields=66846719").then((res) =>
      res.json()
    );
    console.log("ip-api", ip);
  } catch (e) {
    console.log("ip-api issue::", e);
  }
  return Response.json({
    "cf-connecting-ip": req.headers?.get("cf-connecting-ip"),
    "x-forwarded-for": req.headers?.get("x-forwarded-for"),
    "x-real-ip": req.headers?.get("x-real-ip"),
    "ip-api": ip
  });
}
