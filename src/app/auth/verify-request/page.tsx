import { AuthCard } from "../../components/auth/AuthCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function VerifyRequestPage() {
  return (
    <AuthCard
      title="Check your email"
      description="We've sent you a verification link"
    >
      <Alert>
        <AlertDescription>
          We've sent a verification link to your email address. Please check
          your inbox and click the link to complete your sign in.
        </AlertDescription>
      </Alert>

      <div className="space-y-4 pt-4">
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Didn't receive the email? Check your spam folder or try again.
          </p>

          <div className="flex gap-2 justify-center">
            <Button variant="outline" asChild>
              <Link href="/auth/signin">Try again</Link>
            </Button>

            <Button variant="outline" asChild>
              <Link href="/">Back to home</Link>
            </Button>
          </div>
        </div>

        <div className="border-t pt-4">
          <p className="text-xs text-muted-foreground text-center">
            For security reasons, this verification link will expire in 24
            hours. If you need a new link, please return to the sign in page.
          </p>
        </div>
      </div>
    </AuthCard>
  );
}
