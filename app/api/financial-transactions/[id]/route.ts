import { NextRequest } from "next/server";
import { proxy } from "@/lib/api-server";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  return proxy(req, `/financial-transactions/${id}`);
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  return proxy(req, `/financial-transactions/${id}`);
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  return proxy(req, `/financial-transactions/${id}`);
}
