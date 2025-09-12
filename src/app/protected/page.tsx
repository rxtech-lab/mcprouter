import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PasskeyButton } from "../components/auth/PasskeyButton";

export default async function ProtectedPage() {
  const session = await auth();

  if (!session?.user) {
    return null; // This will be handled by the layout
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
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
            <div className="space-y-2">
              <h4 className="font-medium">Add Passkey</h4>
              <p className="text-sm text-muted-foreground">
                Add a passkey to enable secure, passwordless authentication for
                future logins.
              </p>
              <PasskeyButton mode="register" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
            <CardDescription>
              Manage your session and account settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <Button type="submit" variant="outline">
                Sign Out
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
