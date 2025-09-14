import { getAuthenticators } from "@/app/auth";
import { AddPasskeySection } from "@/app/components/dashboard/AddPasskeySection";
import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function ProtectedPage() {
  const session = await auth();
  const authenticators = await getAuthenticators();

  if (!session?.user) {
    return null; // This will be handled by the layout
  }

  return (
    <div className="flex-1 rounded-xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-6 shadow-lg border shadow-black/5">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Welcome to your Dashboard!</CardTitle>
            <CardDescription>
              You have successfully authenticated and verified your email.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">Name:</span>
                <span>{session.user.name || "Not provided"}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-medium">Email:</span>
                <span>{session.user.email}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-medium">Email Verified:</span>
                <Badge variant="secondary">✓ Verified</Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-medium">Role:</span>
                <Badge variant="outline">
                  {(session.user as any).role || "user"}
                </Badge>
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

        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>
              Enhance your account security with additional authentication
              methods.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {authenticators.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Authenticators:</span>
                  <Badge variant="secondary" className="text-xs">
                    {authenticators.length} registered
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {authenticators.map((authenticator) => (
                    <Badge
                      key={authenticator.credentialID}
                      variant="outline"
                      className="capitalize"
                    >
                      {authenticator.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <AddPasskeySection session={session} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
