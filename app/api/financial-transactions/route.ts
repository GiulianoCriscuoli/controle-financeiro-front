import { NextRequest } from "next/server";
import { proxy } from "@/lib/api-server";

export function GET(req: NextRequest) {
  return proxy(req, "/financial-transactions");
}

export function POST(req: NextRequest) {
  return proxy(req, "/financial-transactions");
}
