import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";

interface VerificationEmailProps {
  verificationUrl: string;
}

export default function VerificationEmail({
  verificationUrl,
}: VerificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Verify your email address</Preview>
      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto max-w-xl py-5 px-5">
            <Heading className="text-center text-2xl font-bold text-gray-800 mb-6">
              Verify your email address
            </Heading>

            <Text className="text-gray-600 text-base leading-6 mb-6">
              Thank you for signing up! Please click the button below to verify
              your email address and complete your account setup.
            </Text>

            <Section className="text-center my-8">
              <Button
                href={verificationUrl}
                className="bg-blue-600 text-white px-6 py-3 rounded-md font-semibold no-underline inline-block"
              >
                Verify Email Address
              </Button>
            </Section>

            <Text className="text-gray-600 text-sm mb-4">
              This verification link will expire in 15 minutes for security
              reasons.
            </Text>

            <Text className="text-gray-600 text-sm mb-8">
              If you didn't create an account, you can safely ignore this email.
            </Text>

            <hr className="border-gray-200 my-8" />

            <Text className="text-gray-400 text-xs text-center">
              If the button doesn't work, copy and paste this link into your
              browser:
              <br />
              <Link href={verificationUrl} className="text-blue-600 break-all">
                {verificationUrl}
              </Link>
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
