import { ScentFinderExperience } from "@/components/scent-finder/ScentFinderExperience";
import { getCommerceProvider } from "@/lib/commerce";

export default async function ScentFinderPage() {
  const provider = getCommerceProvider();
  const products = await provider.getProducts({ first: 100 });
  return <ScentFinderExperience products={products.products} />;
}
