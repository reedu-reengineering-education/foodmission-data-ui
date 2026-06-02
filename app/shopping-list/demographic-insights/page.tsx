import { ShoppingListDemographicContent } from "@/components/shopping-list-demographic-content";
import { PageShell } from "@/components/page-shell";
import { PAGE_TITLES } from "@/lib/page-titles";

export default function ShoppingListDemographicPage() {
  return (
    <PageShell title={PAGE_TITLES.shoppingList.demographicInsights}>
      <ShoppingListDemographicContent />
    </PageShell>
  );
}
