import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { SidebarInset } from "@/components/ui/sidebar";

export default function NotFound() {
  return (
    <SidebarInset>
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileQuestion />
            </EmptyMedia>
            <EmptyTitle>Page not found</EmptyTitle>
            <EmptyDescription>
              The page you're looking for doesn't exist or has been moved.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/">Return to Dashboard</Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    </SidebarInset>
  );
}
