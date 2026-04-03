import { LegalPageLayout } from "@/components/marketing/legal-page-layout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "Our refund and cancellation policy for Ashram Management subscriptions.",
};

export default function RefundPage() {
  return (
    <LegalPageLayout
      title="Refund Policy"
      lastUpdated="April 3, 2026"
      sections={[
        {
          id: "overview",
          title: "Overview",
          content: (
            <>
              <p>
                We want you to be satisfied with the Ashram Management platform. This policy explains when and how refunds are issued for subscription payments.
              </p>
              <p>
                All refund requests should be sent to{" "}
                <a href="mailto:hello@virtualxcellence.com" className="text-[#DC2626] hover:underline">
                  hello@virtualxcellence.com
                </a>{" "}
                with your account email and reason for the request.
              </p>
            </>
          ),
        },
        {
          id: "free-plan",
          title: "Free Plan",
          content: (
            <p>
              The free plan has no charges and therefore no refunds apply. You may cancel or delete your account at any time without any financial obligation.
            </p>
          ),
        },
        {
          id: "monthly",
          title: "Monthly Subscriptions",
          content: (
            <>
              <p>
                Monthly subscriptions are billed at the start of each billing cycle and are <strong>non-refundable</strong> for the current month. You may cancel at any time and you will retain access until the end of the current billing period.
              </p>
              <p>
                <strong>Exception:</strong> If you have not used the platform at all during the current billing cycle and request a refund within 48 hours of the charge, we will process a full refund at our discretion.
              </p>
            </>
          ),
        },
        {
          id: "annual",
          title: "Annual Subscriptions",
          content: (
            <>
              <p>
                Annual subscriptions are billed upfront for 12 months at a discounted rate.
              </p>
              <ul>
                <li>
                  <strong>Within 14 days of purchase:</strong> Full refund if you have not actively used the platform (i.e., no data entered beyond initial setup).
                </li>
                <li>
                  <strong>After 14 days:</strong> Pro-rated refund for unused full months remaining, minus a 10% administration fee. For example, if you cancel after 3 months of a 12-month plan, you would receive a refund for 9 months less the administration fee.
                </li>
                <li>
                  <strong>After 10 months:</strong> No refund for the remaining period.
                </li>
              </ul>
            </>
          ),
        },
        {
          id: "exceptions",
          title: "Exceptional Circumstances",
          content: (
            <>
              <p>We consider refunds outside the above policy in the following circumstances:</p>
              <ul>
                <li><strong>Service unavailability:</strong> If the platform experiences downtime exceeding 24 consecutive hours in a billing period, you may request a pro-rated credit for the affected period.</li>
                <li><strong>Duplicate charge:</strong> If you were charged twice for the same period, we will refund the duplicate charge immediately upon verification.</li>
                <li><strong>Unauthorised charge:</strong> If your account was charged without authorisation, please contact us within 30 days and we will investigate and refund if confirmed.</li>
              </ul>
            </>
          ),
        },
        {
          id: "process",
          title: "Refund Process",
          content: (
            <>
              <p>Approved refunds are processed as follows:</p>
              <ul>
                <li>Refunds are returned to the original payment method.</li>
                <li>Processing time: 5–10 business days depending on your bank or card issuer.</li>
                <li>We will confirm your refund request by email within 2 business days.</li>
              </ul>
            </>
          ),
        },
        {
          id: "cancellation",
          title: "Cancellation vs. Refund",
          content: (
            <>
              <p>
                Cancelling your subscription stops future charges but does not automatically trigger a refund of past charges. To request a refund in addition to cancellation, you must contact us separately.
              </p>
              <p>
                You can cancel your subscription at any time from <strong>Dashboard → Settings → Billing</strong>.
              </p>
            </>
          ),
        },
        {
          id: "contact",
          title: "Contact Us",
          content: (
            <p>
              For refund requests or billing questions, contact us at:{" "}
              <a href="mailto:hello@virtualxcellence.com" className="text-[#DC2626] hover:underline">
                hello@virtualxcellence.com
              </a>{" "}
              — include your account email and a description of your request.
            </p>
          ),
        },
      ]}
    />
  );
}
