import { Users, Heart, Video, FileText, Wallet, Share2 } from "lucide-react";

interface Feature {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const features: Feature[] = [
  {
    title: "Devotee Management",
    description: "Comprehensive system to manage devotee information, relationships, and engagement.",
    icon: Users,
  },
  {
    title: "Donation Management",
    description: "Track donations with tax-free receipt generation. Secure and compliant donation processing.",
    icon: Heart,
  },
  {
    title: "Livestream & Meetings",
    description: "Integrated livestreaming, video meetings via Zoom or Google Meet for virtual satsangs and events.",
    icon: Video,
  },
  {
    title: "Invoicing",
    description: "Generate and manage invoices for services, events, and donations with professional templates.",
    icon: FileText,
  },
  {
    title: "Accounts",
    description: "Complete financial management with accounts, transactions, and comprehensive reporting.",
    icon: Wallet,
  },
  {
    title: "Social Media",
    description: "Manage and schedule social media posts across platforms to engage with your community.",
    icon: Share2,
  },
];

export function FeatureSection() {
  return (
    <section className="py-16 hidden" style={{ backgroundColor: "#fbf9ef" }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl font-bold mb-4" style={{ color: "#14181f" }}>
            Complete Management Solution
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "#14181f" }}>
            Everything you need to manage your Ashram operations efficiently in one place.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="p-6"
                style={{
                  backgroundColor: "#fbf9ef",
                  border: "2px solid #3c0212",
                }}
              >
                <div className="mb-4" style={{ color: "#3c0212" }}>
                  <IconComponent className="w-12 h-12" />
                </div>
                <h3 className="font-serif text-xl font-bold mb-3" style={{ color: "#14181f" }}>
                  {feature.title}
                </h3>
                <p className="text-sm" style={{ color: "#14181f" }}>
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
