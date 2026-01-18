import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default async function SecurityPage() {
  const session = await auth();

  if (!session?.user) {
    return null; // This will be handled by the layout
  }

  return (
    <div className="flex-1 max-w-5xl mx-auto">
      <div className="space-y-6">
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="grid gap-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">Name:</span>
                <span>{session.user.name || "Not provided"}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-medium">Role:</span>
                <Badge variant="outline">{session.user.role || "user"}</Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-medium">User ID:</span>
                <span className="text-sm text-muted-foreground font-mono">
                  {session.user.id}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
