import { site } from "@actnow/common";
import { Button, Heading, Link, Section, Text } from "react-email";
import { BaseLayout } from "./base-layout";

interface MagicLinkEmailProps {
  name: string;
  verifyUrl: string;
  baseUrl: string;
}

export const MagicLinkEmail = ({
  name,
  verifyUrl,
  baseUrl,
}: MagicLinkEmailProps) => (
  <BaseLayout
    baseUrl={baseUrl}
    footerText="If you did not try to log in but received this email, please ignore this email. If you are concerned about the security of your account, please visit our"
    previewText={`Sign in to ${site.siteName}`}
  >
    <Heading className="mx-0 my-7.5 p-0 text-center font-medium text-[24px]">
      Sign in to {site.siteName}
    </Heading>
    <Text className="mt-12 leading-5">
      Hello <strong>{name}</strong>,
    </Text>
    <Text className="leading-5">
      Click the button below to sign in to your account. This link will expire
      in 10 minutes.
    </Text>
    <Section className="mt-8 mb-8 text-center">
      <Button
        className="rounded-lg bg-[#000000] px-10 py-3.5 text-center font-medium text-[15px] text-white tracking-widest no-underline"
        href={verifyUrl}
      >
        SIGN IN
      </Button>
    </Section>
    <Text className="leading-6">
      Or copy and paste this URL into a new tab of your browser:
    </Text>
    <Link className="text-blue-600 no-underline" href={verifyUrl}>
      {verifyUrl}
    </Link>
  </BaseLayout>
);

MagicLinkEmail.PreviewProps = {
  name: "actnow",
  verifyUrl: "http://localhost:3002/api/auth/magic-link/verify?token=xxx",
  baseUrl: "http://localhost:3002",
} as MagicLinkEmailProps;

export default MagicLinkEmail;
