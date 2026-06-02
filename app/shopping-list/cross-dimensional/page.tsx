import { ShoppingListCrossDimContent } from "@/components/shopping-list-cross-dim-content";
import { PageShell } from "@/components/page-shell";
import { PAGE_TITLES } from "@/lib/page-titles";

export default function ShoppingListCrossDimPage() {
  return (
    <PageShell title={PAGE_TITLES.shoppingList.crossDimensionalAnalysis}>
      <ShoppingListCrossDimContent />
    </PageShell>
  );
}
