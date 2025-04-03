import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Database, Shield, Lock, Server, FileText, Download } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DataPage() {
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
          <Database className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Data Collection & Storage</h1>
        </div>

        <div className="text-sm text-muted-foreground mb-8">Last updated: April 3, 2024</div>

        <div className="prose dark:prose-invert max-w-none mb-8">
          <p>
            At MindfulMe, we believe in transparency about how we collect, process, and store your data. This page
            explains our data practices in detail to help you understand how your information is handled.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Data We Collect
              </CardTitle>
              <CardDescription>Information you provide and we gather</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="font-medium">User-Provided Information</h3>
              <ul className="space-y-2 text-sm">
                <li>Account information (email, name, password)</li>
                <li>Profile details (preferences, demographic information)</li>
                <li>Mood tracking entries and notes</li>
                <li>Chat conversations with our AI assistant</li>
                <li>Meditation usage and preferences</li>
                <li>Subscription and payment details</li>
              </ul>

              <h3 className="font-medium">Automatically Collected Information</h3>
              <ul className="space-y-2 text-sm">
                <li>Device information (type, operating system, browser)</li>
                <li>Usage patterns (features accessed, time spent)</li>
                <li>Performance metrics (app crashes, loading times)</li>
                <li>IP address and general location (country/region)</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                How We Secure Your Data
              </CardTitle>
              <CardDescription>Security measures we implement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="font-medium">Technical Safeguards</h3>
              <ul className="space-y-2 text-sm">
                <li>End-to-end encryption for sensitive data</li>
                <li>Database encryption at rest and in transit</li>
                <li>Row-level security policies in our database</li>
                <li>Regular security audits and penetration testing</li>
                <li>Multi-factor authentication for admin access</li>
                <li>Secure API endpoints with rate limiting</li>
              </ul>

              <h3 className="font-medium">Organizational Measures</h3>
              <ul className="space-y-2 text-sm">
                <li>Regular security training for all team members</li>
                <li>Strict access controls based on need-to-know</li>
                <li>Comprehensive security policies and procedures</li>
                <li>Incident response plan for potential breaches</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5 text-primary" />
              Where Your Data Is Stored
            </CardTitle>
            <CardDescription>Our data storage infrastructure</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We use Supabase as our primary database provider, which offers enterprise-grade security and compliance
              features. Your data is stored in secure data centers with the following characteristics:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">Database Infrastructure</h3>
                <ul className="space-y-1 text-sm">
                  <li>PostgreSQL database with row-level security</li>
                  <li>Automated backups with point-in-time recovery</li>
                  <li>Data replication across multiple availability zones</li>
                  <li>Continuous monitoring and threat detection</li>
                </ul>
              </div>

              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">Data Center Security</h3>
                <ul className="space-y-1 text-sm">
                  <li>SOC 2 Type II certified facilities</li>
                  <li>24/7 physical security and surveillance</li>
                  <li>Biometric access controls</li>
                  <li>Environmental controls and redundant power</li>
                </ul>
              </div>
            </div>

            <p className="text-sm">
              For users in India, we maintain a data processing infrastructure within the country to comply with local
              data residency requirements. For international users, data is stored in the region closest to you to
              ensure optimal performance.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Compliance & Certifications
            </CardTitle>
            <CardDescription>How we meet regulatory requirements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">GDPR Compliance</h3>
                <ul className="space-y-1 text-sm">
                  <li>Data processing agreements</li>
                  <li>Data protection impact assessments</li>
                  <li>User rights management system</li>
                  <li>72-hour breach notification process</li>
                </ul>
              </div>

              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">HIPAA Compliance</h3>
                <ul className="space-y-1 text-sm">
                  <li>Business associate agreements</li>
                  <li>Audit logging and monitoring</li>
                  <li>Encryption of PHI at rest and in transit</li>
                  <li>Regular risk assessments</li>
                </ul>
              </div>

              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">Indian Data Protection</h3>
                <ul className="space-y-1 text-sm">
                  <li>Compliance with IT Act, 2000</li>
                  <li>Adherence to SPDI Rules, 2011</li>
                  <li>Local data processing infrastructure</li>
                  <li>Consent management framework</li>
                </ul>
              </div>
            </div>

            <p className="text-sm mt-4">
              We regularly review and update our compliance measures to align with evolving regulations and best
              practices in data protection.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Your Data Rights
            </CardTitle>
            <CardDescription>Control over your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>You have several rights regarding your personal data:</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">Access & Control</h3>
                <ul className="space-y-1 text-sm">
                  <li>Right to access your personal data</li>
                  <li>Right to correct inaccurate information</li>
                  <li>Right to delete your data (where applicable)</li>
                  <li>Right to restrict certain processing</li>
                </ul>
              </div>

              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">Data Portability</h3>
                <ul className="space-y-1 text-sm">
                  <li>Export your data in machine-readable format</li>
                  <li>Transfer your data to another service</li>
                  <li>Download complete history of your activities</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-center mt-4">
              <Button className="gap-2">
                <Download className="h-4 w-4" />
                Request Your Data
              </Button>
            </div>

            <p className="text-sm text-center mt-4">
              To exercise any of these rights, please visit your account settings or contact our privacy team at
              privacy@mindfulme.app
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

