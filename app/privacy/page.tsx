import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Shield, Lock, Eye, FileText, Server, Database } from "lucide-react"

export default function PrivacyPolicyPage() {
  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <Link href="/">
          <Button variant="ghost" className="mb-6 pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <div className="flex items-center gap-2 mb-6">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
        </div>

        <div className="text-sm text-muted-foreground mb-8">Last updated: April 3, 2024</div>

        <div className="prose dark:prose-invert max-w-none">
          <p>
            At MindfulMe, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose,
            and safeguard your information when you use our mental health support application.
          </p>

          <h2 className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Information We Collect
          </h2>

          <p>We collect information that you provide directly to us when you:</p>

          <ul>
            <li>Create an account (email, name, password)</li>
            <li>Complete your profile (demographic information, preferences)</li>
            <li>Use our chat feature (conversation content)</li>
            <li>Track your mood (mood entries, notes)</li>
            <li>Use our meditation features (usage patterns, preferences)</li>
            <li>Subscribe to our premium services (payment information)</li>
          </ul>

          <p>
            We also automatically collect certain information about your device and how you interact with our
            application, including:
          </p>

          <ul>
            <li>Device information (type, operating system, browser)</li>
            <li>Usage data (features accessed, time spent, interactions)</li>
            <li>Log data (IP address, access times, pages viewed)</li>
          </ul>

          <h2 className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            How We Use Your Information
          </h2>

          <p>We use the information we collect to:</p>

          <ul>
            <li>Provide, maintain, and improve our services</li>
            <li>Personalize your experience and content</li>
            <li>Generate insights and recommendations for your mental wellbeing</li>
            <li>Process transactions and manage your account</li>
            <li>Communicate with you about our services, updates, and promotions</li>
            <li>Monitor and analyze usage patterns and trends</li>
            <li>Protect the security and integrity of our platform</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2 className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Data Storage and Security
          </h2>

          <p>
            Your data is stored securely on our servers using industry-standard encryption and security practices. We
            use Supabase for our database services, which provides robust security features including:
          </p>

          <ul>
            <li>Data encryption at rest and in transit</li>
            <li>Row-level security policies</li>
            <li>Regular security audits and updates</li>
            <li>Compliance with data protection regulations</li>
          </ul>

          <p>
            For payment processing, we use Stripe, which is PCI-DSS compliant. We do not store your complete payment
            information on our servers.
          </p>

          <h2 className="flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" />
            Data Sharing and Disclosure
          </h2>

          <p>We do not sell your personal information. We may share your information in the following circumstances:</p>

          <ul>
            <li>
              With service providers who perform services on our behalf (e.g., payment processing, data analytics)
            </li>
            <li>To comply with legal obligations, enforce our terms, or protect our rights</li>
            <li>In connection with a business transaction (e.g., merger, acquisition, or sale of assets)</li>
            <li>With your consent or at your direction</li>
          </ul>

          <p>
            We may share aggregated, anonymized data that cannot be used to identify you for research, analysis, or
            business purposes.
          </p>

          <h2 className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Your Rights and Choices
          </h2>

          <p>Depending on your location, you may have certain rights regarding your personal information, including:</p>

          <ul>
            <li>Access and review your personal information</li>
            <li>Correct inaccuracies in your personal information</li>
            <li>Delete your personal information</li>
            <li>Export your data in a portable format</li>
            <li>Opt out of certain data processing activities</li>
            <li>Withdraw consent for processing based on consent</li>
          </ul>

          <p>
            You can exercise these rights by accessing your account settings or contacting us directly at
            privacy@mindfulme.app.
          </p>

          <h2>Data Retention</h2>

          <p>
            We retain your personal information for as long as necessary to provide our services, comply with legal
            obligations, resolve disputes, and enforce our agreements. If you delete your account, we will delete or
            anonymize your personal information within 30 days, except where we are required to retain it for legal
            purposes.
          </p>

          <h2>Children's Privacy</h2>

          <p>
            Our services are not intended for individuals under the age of 16. We do not knowingly collect personal
            information from children. If we learn that we have collected personal information from a child under 16, we
            will take steps to delete that information.
          </p>

          <h2>International Data Transfers</h2>

          <p>
            Your information may be transferred to and processed in countries other than your country of residence.
            These countries may have different data protection laws. We ensure appropriate safeguards are in place to
            protect your information when it is transferred internationally.
          </p>

          <h2>Changes to This Privacy Policy</h2>

          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new
            Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy
            Policy periodically.
          </p>

          <h2>Contact Us</h2>

          <p>
            If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at:
          </p>

          <p>
            Email: privacy@mindfulme.app
            <br />
            Address: 123 Wellness Street, Mindful City, MC 12345
          </p>
        </div>
      </div>
    </div>
  )
}

