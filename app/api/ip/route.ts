// app/api/ip/route.ts
import { NextRequest } from "next/server";

export function GET(req: NextRequest) {
  return Response.json({
    "cf-connecting-ip": req.headers?.get("cf-connecting-ip"),
    "x-forwarded-for": req.headers?.get("x-forwarded-for"),
    "x-real-ip": req.headers?.get("x-real-ip")
  });
}
