import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <Link
            to="/"
            className="inline-flex items-center text-sm font-medium text-pulse-600 hover:text-pulse-700 mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>

          <div className="bg-white shadow-sm rounded-xl p-6 sm:p-8 md:p-10">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
            
            <div className="prose prose-blue max-w-none">
              <p className="text-gray-600 mb-6">Last Updated: June 8, 2024</p>
              
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing or using Sweeply's services, website, or applications (collectively, the "Services"), 
                you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not 
                use our Services.
              </p>
              
              <h2>2. Description of Services</h2>
              <p>
                Sweeply provides a platform designed for cleaning professionals to manage their business operations, 
                including client management, scheduling, team coordination, and payment processing. The specific 
                features and functionalities may change over time as we improve and expand our Services.
              </p>
              
              <h2>3. User Accounts</h2>
              <p>
                To access most features of our Services, you must create an account. You are responsible for 
                maintaining the confidentiality of your account credentials and for all activities that occur 
                under your account. You agree to provide accurate and complete information when creating your 
                account and to update your information as necessary.
              </p>
              
              <h2>4. User Responsibilities</h2>
              <p>
                You agree to use our Services only for lawful purposes and in accordance with these Terms. 
                You are responsible for all content and data you upload, post, or otherwise transmit through 
                our Services. You may not use our Services to:
              </p>
              <ul>
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon the rights of others</li>
                <li>Distribute malicious software or harmful content</li>
                <li>Interfere with or disrupt our Services or servers</li>
                <li>Impersonate another person or entity</li>
                <li>Engage in any activity that could damage, disable, or impair our Services</li>
              </ul>
              
              <h2>5. Intellectual Property</h2>
              <p>
                All content, features, and functionality of our Services, including but not limited to text, 
                graphics, logos, icons, and software, are the exclusive property of Sweeply or its licensors 
                and are protected by copyright, trademark, and other intellectual property laws. You may not 
                reproduce, distribute, modify, create derivative works of, publicly display, or otherwise use 
                our intellectual property without our explicit written permission.
              </p>
              
              <h2>6. Subscription and Payments</h2>
              <p>
                Some of our Services may require a subscription. By subscribing to our paid Services, you agree 
                to pay all fees associated with your subscription plan. We reserve the right to change our 
                subscription fees upon reasonable notice. All payments are non-refundable except as expressly 
                stated in these Terms or as required by applicable law.
              </p>
              
              <h2>7. Termination</h2>
              <p>
                We may terminate or suspend your account and access to our Services at our sole discretion, 
                without notice, for any reason, including but not limited to a breach of these Terms. You may 
                terminate your account at any time by following the instructions on our website or by contacting 
                our support team.
              </p>
              
              <h2>8. Disclaimers and Limitations of Liability</h2>
              <p>
                Our Services are provided "as is" and "as available" without warranties of any kind, either 
                express or implied. To the fullest extent permitted by law, we disclaim all warranties, including 
                but not limited to warranties of merchantability, fitness for a particular purpose, and non-infringement.
              </p>
              <p>
                In no event shall Sweeply, its affiliates, or its licensors be liable for any indirect, incidental, 
                special, consequential, or punitive damages, including but not limited to loss of profits, data, 
                or use, arising out of or in connection with these Terms or your use of our Services, whether 
                based on warranty, contract, tort, or any other legal theory, and whether or not we have been 
                informed of the possibility of such damage.
              </p>
              
              <h2>9. Indemnification</h2>
              <p>
                You agree to indemnify, defend, and hold harmless Sweeply, its affiliates, officers, directors, 
                employees, agents, and licensors from and against any claims, liabilities, damages, judgments, 
                awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of 
                or relating to your violation of these Terms or your use of our Services.
              </p>
              
              <h2>10. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction 
                in which Sweeply is established, without regard to its conflict of law provisions. Any legal 
                action or proceeding arising out of or relating to these Terms or our Services shall be brought 
                exclusively in the courts of that jurisdiction.
              </p>
              
              <h2>11. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. We will provide notice of any material 
                changes by posting the updated Terms on our website or through other communication channels. 
                Your continued use of our Services after such changes constitutes your acceptance of the new Terms.
              </p>
              
              <h2>12. Contact Information</h2>
              <p>
                If you have any questions or concerns about these Terms, please contact us at:
                <br />
                <a href="mailto:support@sweeplypro.com" className="text-pulse-600 hover:text-pulse-800">
                  support@sweeplypro.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService; 