import { LegalPageLayout } from "@/components/marketing/legal-page-layout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Ashram Management collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      lastUpdated="April 3, 2026"
      sections={[
        {
          id: "introduction",
          title: "Introduction",
          content: (
            <>
              <p>
                Ashram Management (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) is operated by Virtual Xcellence. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
              </p>
              <p>
                By using the Ashram Management platform, you agree to the collection and use of information in accordance with this policy.
              </p>
            </>
          ),
        },
        {
          id: "data-collected",
          title: "Information We Collect",
          content: (
            <>
              <p>We collect information you provide directly, including:</p>
              <ul>
                <li><strong>Account information:</strong> Name, email address, organisation name, and password when you register.</li>
                <li><strong>Ashram data:</strong> Information you enter about devotees, donations, events, staff, and other operations — this data belongs to you.</li>
                <li><strong>Payment information:</strong> Processed securely through our payment provider; we do not store card numbers.</li>
                <li><strong>Usage data:</strong> How you interact with the platform (pages visited, features used) to improve the product.</li>
              </ul>
            </>
          ),
        },
        {
          id: "data-use",
          title: "How We Use Your Information",
          content: (
            <>
              <p>We use the information we collect to:</p>
              <ul>
                <li>Provide, operate, and maintain the Ashram Management platform</li>
                <li>Process transactions and send related information</li>
                <li>Send administrative emails (account confirmation, invoices, updates)</li>
                <li>Respond to your comments and questions</li>
                <li>Improve and personalise the platform</li>
                <li>Comply with legal obligations</li>
              </ul>
              <p>We do not sell your data to third parties. We do not use your ashram&apos;s operational data (devotees, donations, etc.) for any purpose other than providing the service to you.</p>
            </>
          ),
        },
        {
          id: "data-storage",
          title: "Data Storage & Security",
          content: (
            <>
              <p>
                Your data is stored on secure servers hosted by Supabase, with data centres located in Singapore/Asia. We use industry-standard encryption (TLS/SSL) for all data in transit and at rest.
              </p>
              <p>
                We perform regular backups and maintain disaster recovery procedures. Access to production data is restricted to authorised personnel only.
              </p>
            </>
          ),
        },
        {
          id: "data-ownership",
          title: "Data Ownership",
          content: (
            <>
              <p>
                <strong>You own your data.</strong> All information entered into the platform by you or your staff belongs to you. We act as a data processor on your behalf.
              </p>
              <p>
                You can request a full export of your data at any time by contacting us. Upon account termination, you may request deletion of all your data within 30 days.
              </p>
            </>
          ),
        },
        {
          id: "cookies",
          title: "Cookies",
          content: (
            <p>
              We use session cookies for authentication and minimal analytics cookies to understand platform usage. We do not use advertising or tracking cookies. You can disable cookies in your browser, but this may affect platform functionality.
            </p>
          ),
        },
        {
          id: "third-parties",
          title: "Third-Party Services",
          content: (
            <>
              <p>We use the following trusted third-party services:</p>
              <ul>
                <li><strong>Supabase</strong> — database and authentication</li>
                <li><strong>Vercel</strong> — hosting and deployment</li>
                <li><strong>Payment gateways</strong> — for subscription billing (we do not store payment details)</li>
              </ul>
              <p>Each of these services has their own Privacy Policy. We only share data with them as necessary to provide the service.</p>
            </>
          ),
        },
        {
          id: "contact",
          title: "Contact Us",
          content: (
            <p>
              For any privacy-related questions or requests, contact us at:{" "}
              <a href="mailto:hello@virtualxcellence.com" className="text-[#DC2626] hover:underline">
                hello@virtualxcellence.com
              </a>
            </p>
          ),
        },
      ]}
    />
  );
}
