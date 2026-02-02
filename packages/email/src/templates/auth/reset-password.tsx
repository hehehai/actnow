import { site } from "@actnow/common";
import { Button, Heading, Link, Section, Text } from "@react-email/components";
import { BaseLayout } from "./base-layout";

interface ResetPasswordEmailProps {
  name: string;
  verifyCode: string;
  verifyUrl: string;
  baseUrl: string;
}

export const ResetPasswordEmail = ({
  name,
  verifyCode,
  verifyUrl,
  baseUrl,
}: ResetPasswordEmailProps) => (
  <BaseLayout
    baseUrl={baseUrl}
    footerText="If you did not request a password reset but received this email, please ignore this email. If you are concerned about the security of your account, please visit our"
    previewText={`Reset your password for ${site.siteName}`}
  >
    <Heading className="mx-0 my-7.5 p-0 text-center font-medium text-[24px]">
      Reset your password for {site.siteName}
    </Heading>
    <Text className="mt-12 leading-5">
      Hello <strong>{name}</strong>,
    </Text>
    <Text className="leading-5">
      We have received your password reset request. The reset code:
    </Text>
    <Section className="my-6 rounded-lg bg-[#F9F9F9] p-3.5 text-center">
      <Text className="m-0 text-3xl tracking-widest">{verifyCode}</Text>
    </Section>
    <Text className="leading-6">
      You can copy this code and return to the page to complete password reset.
    </Text>
    <Text className="leading-6">
      You can also click the button below to reset your password directly.
    </Text>
    <Section className="mt-8 mb-8 text-center">
      <Button
        className="rounded-lg bg-[#000000] px-10 py-3.5 text-center font-medium text-[15px] text-white tracking-widest no-underline"
        href={verifyUrl}
      >
        RESET PASSWORD
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

ResetPasswordEmail.PreviewProps = {
  name: "actnow",
  verifyCode: "123456",
  verifyUrl:
    "http://localhost:3001/reset-password?email=test@example.com&token=123456",
  baseUrl: "http://localhost:3001",
} as ResetPasswordEmailProps;

export default ResetPasswordEmail;
