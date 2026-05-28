import { ShoppingListSustainabilityContent } from "@/components/shopping-list-sustainability-content";
import { PageShell } from "@/components/page-shell";
import { PAGE_TITLES } from "@/lib/page-titles";

export default function ShoppingListSustainabilityPage() {
  return (
    <PageShell title={PAGE_TITLES.shoppingList.sustainability}>
      <ShoppingListSustainabilityContent />
    </PageShell>
  );
}
