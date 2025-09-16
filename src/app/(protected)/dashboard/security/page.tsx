import { getAuthenticators } from "@/app/auth";
import { AddPasskeySection } from "@/app/components/dashboard/AddPasskeySection";
import { DeleteAuthenticatorButton } from "@/app/components/dashboard/DeleteAuthenticatorButton";
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
    <div className="flex-1 max-w-5xl mx-auto">
      <div className="space-y-6">
        <Card>
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
                  <span className="font-medium">Registered Passkeys:</span>
                  <Badge variant="secondary" className="text-xs">
                    {authenticators.length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {authenticators.map((authenticator) => (
                    <div
                      key={authenticator.credentialID}
                      className="flex items-center justify-between p-3 border rounded-lg bg-muted/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 bg-green-500 rounded-full" />
                        <div>
                          <div className="font-medium capitalize">
                            {authenticator.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {authenticator.credentialDeviceType}
                          </div>
                        </div>
                      </div>
                      <DeleteAuthenticatorButton
                        credentialId={authenticator.credentialID}
                        authenticatorName={authenticator.name}
                      />
                    </div>
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
