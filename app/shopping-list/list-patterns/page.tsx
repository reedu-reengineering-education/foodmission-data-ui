import { ShoppingListListPatternsContent } from "@/components/shopping-list-list-patterns-content";
import { PageShell } from "@/components/page-shell";
import { PAGE_TITLES } from "@/lib/page-titles";

export default function ShoppingListListPatternsPage() {
  return (
    <PageShell title={PAGE_TITLES.shoppingList.listPatterns}>
      <ShoppingListListPatternsContent />
    </PageShell>
  );
}
