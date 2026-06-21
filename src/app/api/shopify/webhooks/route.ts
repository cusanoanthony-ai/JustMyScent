import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { getShopifyWebhookSecret, isShopifyWebhookEnabled } from "@/lib/env";
import { verifyShopifyWebhookHmac } from "@/lib/shopify/webhook";

export const dynamic = "force-dynamic";

const CATALOG_PATHS = ["/shop", "/collections", "/search", "/scent-finder", "/"];

function revalidateCatalog() {
  revalidateTag("catalog");
  for (const path of CATALOG_PATHS) {
    revalidatePath(path);
  }
}

export async function POST(request: Request) {
  if (!isShopifyWebhookEnabled()) {
    return NextResponse.json({ ok: false, message: "Webhook endpoint inactive." }, { status: 503 });
  }

  const secret = getShopifyWebhookSecret();
  if (!secret) {
    return NextResponse.json({ ok: false, message: "Webhook secret missing." }, { status: 503 });
  }

  const rawBody = await request.text();
  const hmac = request.headers.get("x-shopify-hmac-sha256");

  if (!verifyShopifyWebhookHmac(rawBody, hmac, secret)) {
    return NextResponse.json({ ok: false, message: "Invalid webhook signature." }, { status: 401 });
  }

  const topic = request.headers.get("x-shopify-topic") ?? "unknown";

  switch (topic) {
    case "products/create":
    case "products/update":
    case "products/delete":
    case "collections/create":
    case "collections/update":
    case "collections/delete":
    case "inventory_levels/update":
    case "inventory_items/update":
      revalidateCatalog();
      break;
    default:
      break;
  }

  return NextResponse.json({ ok: true, topic });
}
