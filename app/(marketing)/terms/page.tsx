import { LegalPageLayout } from "@/components/marketing/legal-page-layout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms and conditions governing your use of the Ashram Management platform.",
};

export default function TermsPage() {
  return (
    <LegalPageLayout
      title="Terms of Service"
      lastUpdated="April 3, 2026"
      sections={[
        {
          id: "introduction",
          title: "Introduction",
          content: (
            <>
              <p>
                These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of the Ashram Management platform (&ldquo;the Service&rdquo;), operated by Virtual Xcellence (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;).
              </p>
              <p>
                By registering for or using the Service, you agree to be bound by these Terms. If you do not agree, please do not use the Service.
              </p>
            </>
          ),
        },
        {
          id: "account",
          title: "Account Registration",
          content: (
            <>
              <p>To use the Service, you must:</p>
              <ul>
                <li>Be at least 18 years of age or have the authority to represent your organisation.</li>
                <li>Provide accurate, current, and complete information during registration.</li>
                <li>Maintain the security of your account credentials and notify us immediately of any unauthorised access.</li>
                <li>Be responsible for all activity that occurs under your account.</li>
              </ul>
              <p>
                One account may manage one organisation (ashram, temple, institute, or trust). Multiple organisations require separate accounts unless otherwise agreed.
              </p>
            </>
          ),
        },
        {
          id: "acceptable-use",
          title: "Acceptable Use",
          content: (
            <>
              <p>You agree to use the Service only for lawful purposes and in accordance with these Terms. You must not:</p>
              <ul>
                <li>Use the Service in any way that violates applicable Indian or international law or regulation.</li>
                <li>Upload, store, or transmit any harmful, offensive, or infringing content.</li>
                <li>Attempt to gain unauthorised access to any part of the Service or its related systems.</li>
                <li>Reverse-engineer, decompile, or attempt to extract source code from the Service.</li>
                <li>Use the Service to send unsolicited communications (spam) to devotees or other parties.</li>
                <li>Sublicense, sell, or resell the Service to third parties without written permission.</li>
              </ul>
            </>
          ),
        },
        {
          id: "subscriptions",
          title: "Subscriptions & Billing",
          content: (
            <>
              <p>
                The Service is offered on a subscription basis. Subscription fees, billing cycles, and included features are described on the Pricing page. By subscribing, you authorise us to charge the applicable fees to your payment method on a recurring basis.
              </p>
              <ul>
                <li><strong>Free plan:</strong> Available with limited features at no charge.</li>
                <li><strong>Paid plans:</strong> Billed monthly or annually as chosen at signup. Annual plans are billed upfront.</li>
                <li><strong>Price changes:</strong> We will give 30 days&apos; notice before changing subscription prices.</li>
                <li><strong>Taxes:</strong> Prices are exclusive of applicable GST or other taxes, which will be added to your invoice.</li>
              </ul>
            </>
          ),
        },
        {
          id: "data",
          title: "Your Data",
          content: (
            <>
              <p>
                You retain full ownership of all data you enter into the platform. We process your data solely to provide the Service and do not sell or share it with third parties for their own purposes.
              </p>
              <p>
                You are responsible for ensuring that your use of the Service to collect and process personal data (e.g., devotee information) complies with applicable privacy laws, including India&apos;s Digital Personal Data Protection Act (DPDPA) 2023.
              </p>
              <p>
                On account termination, your data will be retained for 30 days during which you may request an export. After 30 days, data will be permanently deleted.
              </p>
            </>
          ),
        },
        {
          id: "ip",
          title: "Intellectual Property",
          content: (
            <>
              <p>
                The Service, including all software, design, logos, and documentation, is the property of Virtual Xcellence and is protected by copyright and other intellectual property laws. You are granted a limited, non-exclusive, non-transferable licence to use the Service for your internal purposes.
              </p>
              <p>
                You grant us a limited licence to use, process, and display your data solely to provide the Service.
              </p>
            </>
          ),
        },
        {
          id: "termination",
          title: "Termination",
          content: (
            <>
              <p>
                Either party may terminate the agreement at any time. You may cancel your subscription from within the platform settings. We reserve the right to suspend or terminate your account immediately if you violate these Terms.
              </p>
              <p>
                On cancellation of a paid plan, you will retain access until the end of the current billing period. No refunds are issued for partial months unless otherwise stated in our Refund Policy.
              </p>
            </>
          ),
        },
        {
          id: "liability",
          title: "Limitation of Liability",
          content: (
            <>
              <p>
                To the maximum extent permitted by law, Virtual Xcellence shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of data or revenue, arising from your use of the Service.
              </p>
              <p>
                Our total liability to you for any claims arising under these Terms shall not exceed the amount you paid us in the 12 months preceding the claim.
              </p>
            </>
          ),
        },
        {
          id: "changes",
          title: "Changes to Terms",
          content: (
            <p>
              We may update these Terms from time to time. We will notify you of material changes by email or via an in-app notice at least 14 days before they take effect. Continued use of the Service after changes take effect constitutes acceptance of the new Terms.
            </p>
          ),
        },
        {
          id: "governing-law",
          title: "Governing Law",
          content: (
            <p>
              These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts of Bengaluru, Karnataka.
            </p>
          ),
        },
        {
          id: "contact",
          title: "Contact Us",
          content: (
            <p>
              For any questions about these Terms, contact us at:{" "}
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
