import { site } from "@actnow/common";
import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";

interface BaseLayoutProps {
  previewText: string;
  baseUrl: string;
  footerText: string;
  children: React.ReactNode;
}

export const BaseLayout = ({
  previewText,
  baseUrl,
  footerText,
  children,
}: BaseLayoutProps) => (
  <Html>
    <Head />
    <Preview>{previewText}</Preview>
    <Tailwind>
      <Body className="mx-auto my-auto px-2 font-sans">
        <Container className="mx-auto my-10 max-w-125 py-8 text-[#1C1C1C] text-[14px]">
          <Section className="mt-8">
            <Img
              alt={site.siteName}
              className="mx-auto my-0"
              height="70"
              src={`${baseUrl}/images/logo.png`}
              width="70"
            />
          </Section>
          {children}
          <Hr className="mx-0 mt-12 mb-5 w-full border border-zinc-100 border-solid" />
          <Text className="text-[#666666] text-[12px] leading-6">
            {footerText}{" "}
            <Link
              className="text-blue-600 no-underline"
              href={`${baseUrl}/about`}
            >
              help page
            </Link>
            .
          </Text>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);
