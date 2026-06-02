import { Card, CardContent } from "@/components/ui/card";

export function NoDataCard({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-center py-16">
        <p className="text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}
