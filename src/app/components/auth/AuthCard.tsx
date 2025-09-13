import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AuthCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}

export function AuthCard({
  title,
  description,
  children,
  className,
}: AuthCardProps) {
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      data-testid="auth-page"
    >
      <Card
        className={cn("w-full max-w-md", className)}
        data-testid="auth-card"
      >
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold" data-testid="auth-title">
            {title}
          </CardTitle>
          <CardDescription data-testid="auth-description">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">{children}</CardContent>
      </Card>
    </div>
  );
}
