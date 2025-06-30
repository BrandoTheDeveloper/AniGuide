
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Privacy Policy for AniGuide</CardTitle>
            <p className="text-center text-gray-600">
              <strong>Effective Date:</strong> January 1, 2025<br />
              <strong>Last Updated:</strong> January 1, 2025
            </p>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-3">Introduction</h2>
                <p>
                  AniGuide ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our anime discovery and review application (the "Service").
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">Information We Collect</h2>
                
                <h3 className="text-xl font-semibold mb-2">Personal Information</h3>
                <p>When you create an account, we collect:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Email address</strong> - for account creation and communication</li>
                  <li><strong>First and last name</strong> - for profile personalization</li>
                  <li><strong>Username</strong> - for public identification within the app</li>
                  <li><strong>Profile image URL</strong> - if provided through authentication provider</li>
                  <li><strong>Password</strong> - encrypted and stored securely (only if using direct registration)</li>
                </ul>

                <h3 className="text-xl font-semibold mb-2 mt-4">Usage Data</h3>
                <p>We automatically collect:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Anime preferences</strong> - shows you've viewed, searched for, or interacted with</li>
                  <li><strong>Watchlist data</strong> - anime you've added to your watchlist with status and progress</li>
                  <li><strong>Reviews and ratings</strong> - content you create within the app</li>
                  <li><strong>Device information</strong> - browser type, operating system, device identifiers</li>
                  <li><strong>Usage analytics</strong> - pages visited, features used, time spent in app</li>
                  <li><strong>Technical data</strong> - IP address, session information, error logs</li>
                </ul>

                <h3 className="text-xl font-semibold mb-2 mt-4">Third-Party Data</h3>
                <p>We integrate with:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>AniList API</strong> - for anime database information (no personal data shared)</li>
                  <li><strong>Replit Authentication</strong> - for secure login (follows their privacy practices)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">How We Use Your Information</h2>
                <p>We use collected information to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Provide core functionality</strong> - maintain your account, watchlist, and reviews</li>
                  <li><strong>Personalize experience</strong> - show relevant anime recommendations</li>
                  <li><strong>Sync across devices</strong> - maintain consistent data across your devices</li>
                  <li><strong>App improvements</strong> - analyze usage patterns to enhance features</li>
                  <li><strong>Communication</strong> - send important updates about your account or the service</li>
                  <li><strong>Security</strong> - prevent fraud and unauthorized access</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">Data Storage and Security</h2>
                
                <h3 className="text-xl font-semibold mb-2">Security Measures</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Encryption</strong> - All data transmission uses HTTPS/TLS encryption</li>
                  <li><strong>Secure database</strong> - PostgreSQL with industry-standard security practices</li>
                  <li><strong>Authentication</strong> - Secure OAuth-based login system</li>
                  <li><strong>Session management</strong> - Secure session handling with automatic expiration</li>
                  <li><strong>Access controls</strong> - Limited employee access to personal data</li>
                </ul>

                <h3 className="text-xl font-semibold mb-2 mt-4">Data Retention</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Account data</strong> - Retained while your account is active</li>
                  <li><strong>Usage data</strong> - Aggregated analytics retained for up to 2 years</li>
                  <li><strong>Reviews</strong> - Retained to maintain community content integrity</li>
                  <li><strong>Deleted accounts</strong> - Personal data removed within 30 days of account deletion</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">Information Sharing</h2>
                <p>We do not sell, trade, or rent your personal information. We may share data only in these circumstances:</p>
                
                <h3 className="text-xl font-semibold mb-2">Service Providers</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Database hosting</strong> - Secure cloud database providers</li>
                  <li><strong>Authentication</strong> - Replit's OAuth service for secure login</li>
                  <li><strong>Analytics</strong> - Anonymized usage data for app improvement</li>
                </ul>

                <h3 className="text-xl font-semibold mb-2 mt-4">Legal Requirements</h3>
                <p>We may disclose information when required by:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Valid legal process or court orders</li>
                  <li>Protection of our rights and property</li>
                  <li>Prevention of harm to users or the public</li>
                  <li>Investigation of potential violations of our terms</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">Your Privacy Rights</h2>
                <p>You have the right to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Access</strong> - Request a copy of your personal data</li>
                  <li><strong>Correction</strong> - Update inaccurate or incomplete information</li>
                  <li><strong>Deletion</strong> - Request deletion of your account and associated data</li>
                  <li><strong>Portability</strong> - Export your reviews and watchlist data</li>
                  <li><strong>Opt-out</strong> - Disable optional data collection features</li>
                </ul>

                <h3 className="text-xl font-semibold mb-2 mt-4">How to Exercise Rights</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Profile settings</strong> - Update personal information directly in the app</li>
                  <li><strong>Account deletion</strong> - Contact us at privacy@aniguide.app</li>
                  <li><strong>Data export</strong> - Request your data through the app's export feature</li>
                  <li><strong>Questions</strong> - Email us at privacy@aniguide.app</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">Children's Privacy</h2>
                <p>
                  AniGuide is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">Contact Information</h2>
                <p>For privacy-related questions or concerns:</p>
                <p>
                  <strong>Email:</strong> brandothedeveloper@gmail.com<br />
                  <strong>Subject:</strong> Privacy Policy Inquiry<br />
                  <strong>Response time:</strong> We aim to respond within 48 hours
                </p>
                <p>
                  For general support:<br />
                  <strong>Email:</strong> brandothedeveloper@gmail.com
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">Changes to Privacy Policy</h2>
                <p>We may update this Privacy Policy periodically. When we make changes:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Notification</strong> - Users will be notified of significant changes</li>
                  <li><strong>Effective date</strong> - New policies take effect 30 days after notification</li>
                  <li><strong>Continued use</strong> - Using the service after changes constitutes acceptance</li>
                </ul>
              </section>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 italic">
                  This privacy policy is designed to be transparent about our data practices. If you have questions about any section, please don't hesitate to contact us.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
