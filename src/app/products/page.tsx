import { ProductListingClient } from '@/components/shared/product-listing-client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default function ProductsPage() {
  return <ProductListingClient />;
}
