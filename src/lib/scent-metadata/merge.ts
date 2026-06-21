import type { Product } from "@/lib/commerce/types";
import {
  catalogData,
  scentMetadataByHandle,
} from "@/lib/commerce/snapshot/catalog-data";

export function getLocalCatalogRecord(handle: string) {
  return catalogData.products.find((product) => product.handle === handle);
}

export function mergeScentMetadataFromLocal(handle: string, product: Product): Product {
  const local = scentMetadataByHandle[handle];
  const catalogRecord = getLocalCatalogRecord(handle);

  if (!local) {
    return product;
  }

  const topNotes = product.topNotes.length ? product.topNotes : local.topNotes.normalized;
  const heartNotes = product.heartNotes.length ? product.heartNotes : local.heartNotes.normalized;
  const baseNotes = product.baseNotes.length ? product.baseNotes : local.baseNotes.normalized;

  const verifiedNoteCount = topNotes.length + heartNotes.length + baseNotes.length;

  return {
    ...product,
    sourceTitle: product.sourceTitle ?? local.sourceTitle,
    topNotes,
    heartNotes,
    baseNotes,
    scentFamily:
      product.scentFamily && product.scentFamily !== "Uncategorized"
        ? product.scentFamily
        : local.scentFamily.normalized ?? local.scentFamily.source ?? product.scentFamily,
    scentFamilyRaw: product.scentFamilyRaw ?? local.scentFamily.source ?? undefined,
    mood: product.mood || local.mood.normalized || local.mood.source || "",
    occasion: product.occasion || local.occasion.normalized || local.occasion.source || "",
    fragranceStrength:
      product.fragranceStrength ||
      local.fragranceStrength.normalized ||
      local.fragranceStrength.source ||
      "",
    referenceFragrance: product.referenceFragrance ?? local.referenceFragrance?.source ?? undefined,
    referenceBrand: product.referenceBrand ?? local.referenceBrand?.source ?? undefined,
    quizEligible: local.quizEligible,
    metadataCoverage: local.quizEligible
      ? "complete"
      : verifiedNoteCount >= 1
        ? "limited"
        : "missing",
    localImagePath: product.localImagePath ?? catalogRecord?.localImage ?? undefined,
  };
}
