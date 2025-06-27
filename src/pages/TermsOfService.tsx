import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const TermsOfService = () => {
  // Format the current date as Month Day, Year
  const formatDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

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
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
            
            <p className="text-gray-700 mb-8 text-lg">Last Updated: {formatDate()}</p>
            
            <div className="prose prose-lg max-w-none text-gray-800">
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing or using Sweeply's services, website, or applications (collectively, the "Services"), 
                you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not 
                use our Services. These Terms constitute a legally binding agreement between you and Sweeply, Inc. ("Sweeply," "we," "us," or "our").
              </p>
              <p>
                If you are using the Services on behalf of a business or other legal entity, you represent that you have the authority 
                to bind that entity to these Terms. In such case, "you" and "your" will refer to that entity.
              </p>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Description of Services</h2>
              <p>
                Sweeply provides a platform designed for cleaning professionals to manage their business operations, 
                including client management, scheduling, team coordination, and payment processing. The specific 
                features and functionalities may change over time as we improve and expand our Services.
              </p>
              <p>
                Our Services may include:
              </p>
              <ul className="list-disc pl-6 my-4 text-gray-800">
                <li className="mb-2">Client management and communication tools</li>
                <li className="mb-2">Job scheduling and calendar management</li>
                <li className="mb-2">Team coordination and task assignment</li>
                <li className="mb-2">Invoicing and payment processing</li>
                <li className="mb-2">Quote generation and management</li>
                <li className="mb-2">Reporting and analytics</li>
                <li className="mb-2">Mobile applications for field service management</li>
              </ul>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. User Accounts</h2>
              <p>
                To access most features of our Services, you must create an account. You are responsible for 
                maintaining the confidentiality of your account credentials and for all activities that occur 
                under your account. You agree to provide accurate and complete information when creating your 
                account and to update your information as necessary.
              </p>
              <p>
                You must be at least 18 years old to create an account and use our Services. By creating an account, you represent and warrant that:
              </p>
              <ul className="list-disc pl-6 my-4 text-gray-800">
                <li className="mb-2">You are at least 18 years of age</li>
                <li className="mb-2">You have the legal capacity to enter into these Terms</li>
                <li className="mb-2">You will comply with these Terms and all applicable laws</li>
                <li className="mb-2">You will provide accurate, current, and complete information</li>
                <li className="mb-2">You will maintain and promptly update your account information</li>
              </ul>
              <p>
                We reserve the right to suspend or terminate your account if any information provided is inaccurate, 
                false, or no longer current, or if we believe that your account has been compromised.
              </p>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. User Responsibilities</h2>
              <p>
                You agree to use our Services only for lawful purposes and in accordance with these Terms. 
                You are responsible for all content and data you upload, post, or otherwise transmit through 
                our Services. You may not use our Services to:
              </p>
              <ul className="list-disc pl-6 my-4 text-gray-800">
                <li className="mb-2">Violate any applicable laws or regulations</li>
                <li className="mb-2">Infringe upon the rights of others, including intellectual property rights</li>
                <li className="mb-2">Distribute malicious software or harmful content</li>
                <li className="mb-2">Interfere with or disrupt our Services or servers</li>
                <li className="mb-2">Impersonate another person or entity</li>
                <li className="mb-2">Engage in any activity that could damage, disable, or impair our Services</li>
                <li className="mb-2">Attempt to gain unauthorized access to any portion of the Services</li>
                <li className="mb-2">Use any automated means to access or interact with our Services</li>
                <li className="mb-2">Collect or harvest user information without consent</li>
                <li className="mb-2">Transmit any viruses, worms, defects, Trojan horses, or other harmful code</li>
              </ul>
              <p>
                We reserve the right to investigate and take appropriate legal action against anyone who, in our sole discretion, 
                violates this provision, including removing the offending content, suspending or terminating the account of such violators, 
                and reporting them to law enforcement authorities.
              </p>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. User Content</h2>
              <p>
                Our Services may allow you to upload, submit, store, send, or receive content, including but not limited to text, 
                photos, videos, audio, and documents (collectively, "User Content"). You retain ownership of any intellectual 
                property rights that you hold in your User Content.
              </p>
              <p>
                By uploading, submitting, storing, sending, or receiving User Content through our Services, you grant Sweeply 
                a worldwide, non-exclusive, royalty-free license to use, host, store, reproduce, modify, create derivative works, 
                communicate, publish, publicly perform, publicly display, and distribute such User Content for the limited purpose 
                of operating, promoting, and improving our Services.
              </p>
              <p>
                You represent and warrant that:
              </p>
              <ul className="list-disc pl-6 my-4 text-gray-800">
                <li className="mb-2">You own or have the necessary rights to your User Content</li>
                <li className="mb-2">Your User Content does not violate the privacy rights, publicity rights, copyrights, contract rights, 
                intellectual property rights, or any other rights of any person or entity</li>
                <li className="mb-2">Your User Content does not contain any material that is defamatory, obscene, indecent, abusive, 
                offensive, harassing, violent, hateful, inflammatory, or otherwise objectionable</li>
              </ul>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Intellectual Property</h2>
              <p>
                All content, features, and functionality of our Services, including but not limited to text, 
                graphics, logos, icons, and software, are the exclusive property of Sweeply or its licensors 
                and are protected by copyright, trademark, and other intellectual property laws. You may not 
                reproduce, distribute, modify, create derivative works of, publicly display, or otherwise use 
                our intellectual property without our explicit written permission.
              </p>
              <p>
                Sweeply respects the intellectual property rights of others. If you believe that material available on or through 
                our Services infringes upon your intellectual property rights, please contact us at legal@sweeplypro.com with the following information:
              </p>
              <ul className="list-disc pl-6 my-4 text-gray-800">
                <li className="mb-2">Identification of the intellectual property claimed to have been infringed</li>
                <li className="mb-2">Identification of the material that is claimed to be infringing</li>
                <li className="mb-2">Your contact information</li>
                <li className="mb-2">A statement that you have a good faith belief that use of the material is not authorized</li>
                <li className="mb-2">A statement that the information in your notice is accurate</li>
              </ul>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Subscription and Payments</h2>
              <p>
                Some of our Services may require a subscription. By subscribing to our paid Services, you agree 
                to pay all fees associated with your subscription plan. We reserve the right to change our 
                subscription fees upon reasonable notice. All payments are non-refundable except as expressly 
                stated in these Terms or as required by applicable law.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">7.1 Subscription Plans</h3>
              <p>
                We offer various subscription plans with different features and pricing. The specific features, limitations, 
                and prices for each plan are described on our website. We may modify our subscription plans, features, and 
                pricing at any time, with notice to you.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">7.2 Billing and Renewal</h3>
              <p>
                Your subscription will automatically renew at the end of each billing period unless you cancel it before the renewal date. 
                By subscribing, you authorize us to charge your payment method for the subscription fees at the beginning of each billing period.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">7.3 Cancellation and Refunds</h3>
              <p>
                You may cancel your subscription at any time through your account settings or by contacting our support team. 
                If you cancel, you may continue to use the paid Services until the end of your current billing period, but you will 
                not receive a refund for any fees already paid. In certain circumstances, such as technical issues or service unavailability, 
                we may provide partial or full refunds at our discretion.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">7.4 Taxes</h3>
              <p>
                All fees are exclusive of taxes, which may be added to the fees charged to you based on applicable laws. 
                You are responsible for paying all taxes associated with your use of our Services.
              </p>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Third-Party Services and Links</h2>
              <p>
                Our Services may contain links to third-party websites, services, or content that are not owned or controlled by Sweeply. 
                We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party 
                websites or services. You acknowledge and agree that Sweeply shall not be responsible or liable for any damage or loss 
                caused by or in connection with the use of any such third-party website, service, or content.
              </p>
              <p>
                We may also integrate with third-party services to provide certain features of our Services. Your use of these 
                integrated services may be subject to the terms and conditions of those third parties, and we encourage you to 
                review those terms before using such services.
              </p>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Service Modifications and Availability</h2>
              <p>
                We are constantly improving our Services and may change or discontinue any feature or aspect of our Services at any time, 
                including, but not limited to, functionality, content, hours of availability, and equipment needed for access or use.
              </p>
              <p>
                We will make reasonable efforts to maintain the availability of our Services. However, there may be occasions when our 
                Services will be interrupted for maintenance, upgrades, or other reasons. We will strive to provide reasonable notice 
                of any scheduled service disruptions but cannot guarantee that such notice will be provided in all circumstances.
              </p>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Termination</h2>
              <p>
                We may terminate or suspend your account and access to our Services at our sole discretion, 
                without notice, for any reason, including but not limited to a breach of these Terms. You may 
                terminate your account at any time by following the instructions on our website or by contacting 
                our support team.
              </p>
              <p>
                Upon termination, your right to use the Services will immediately cease. The following provisions will survive termination: 
                Intellectual Property, Disclaimers and Limitations of Liability, Indemnification, Dispute Resolution, and any other 
                provision that by its nature should survive termination.
              </p>
              <p>
                If you have a paid subscription, termination may result in the forfeiture of any prepaid and unused subscription fees, 
                unless otherwise required by applicable law.
              </p>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">11. Disclaimers and Limitations of Liability</h2>
              <p>
                Our Services are provided "as is" and "as available" without warranties of any kind, either 
                express or implied. To the fullest extent permitted by law, we disclaim all warranties, including 
                but not limited to warranties of merchantability, fitness for a particular purpose, and non-infringement.
              </p>
              <p>
                We do not warrant that our Services will be uninterrupted, timely, secure, or error-free, or that defects will be corrected. 
                We do not warrant that the results that may be obtained from the use of our Services will be accurate or reliable.
              </p>
              <p>
                In no event shall Sweeply, its affiliates, or its licensors be liable for any indirect, incidental, 
                special, consequential, or punitive damages, including but not limited to loss of profits, data, 
                or use, arising out of or in connection with these Terms or your use of our Services, whether 
                based on warranty, contract, tort, or any other legal theory, and whether or not we have been 
                informed of the possibility of such damage.
              </p>
              <p>
                Our total liability to you for any damages shall not exceed the greater of (a) the amount paid by you to Sweeply 
                for the Services in the 12 months preceding the claim or (b) $100.
              </p>
              <p>
                Some jurisdictions do not allow the exclusion of certain warranties or the limitation or exclusion of liability 
                for certain types of damages. Therefore, some of the above limitations may not apply to you.
              </p>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">12. Indemnification</h2>
              <p>
                You agree to indemnify, defend, and hold harmless Sweeply, its affiliates, officers, directors, 
                employees, agents, and licensors from and against any claims, liabilities, damages, judgments, 
                awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of 
                or relating to your violation of these Terms or your use of our Services.
              </p>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">13. Dispute Resolution</h2>
              <p>
                PLEASE READ THIS SECTION CAREFULLY AS IT AFFECTS YOUR RIGHTS.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">13.1 Informal Resolution</h3>
              <p>
                Before filing a claim against Sweeply, you agree to try to resolve the dispute informally by contacting us at 
                legal@sweeplypro.com. We'll try to resolve the dispute informally by contacting you via email. If a dispute is not 
                resolved within 30 days of submission, you or Sweeply may proceed with filing a formal claim.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">13.2 Arbitration Agreement</h3>
              <p>
                You and Sweeply agree to resolve any claims relating to these Terms or our Services through final and binding arbitration, 
                except as set forth below. The arbitration will be conducted by the American Arbitration Association (AAA) under its 
                Commercial Arbitration Rules. The arbitration will be conducted in English and in the county where you reside.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">13.3 Exceptions</h3>
              <p>
                Nothing in this section will prevent either party from seeking injunctive or other equitable relief from the courts for 
                matters related to data security, intellectual property, or unauthorized access to the Services.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">13.4 Class Action Waiver</h3>
              <p>
                YOU AND SWEEPLY AGREE THAT EACH MAY BRING CLAIMS AGAINST THE OTHER ONLY IN YOUR OR ITS INDIVIDUAL CAPACITY, AND NOT AS 
                A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS OR REPRESENTATIVE PROCEEDING.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">13.5 Opt-Out</h3>
              <p>
                You may opt out of this arbitration agreement by notifying Sweeply in writing within 30 days of the date you first 
                accepted these Terms by emailing legal@sweeplypro.com.
              </p>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">14. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, 
                without regard to its conflict of law provisions. Any legal action or proceeding arising out of or relating 
                to these Terms or our Services shall be brought exclusively in the courts of that jurisdiction, except that 
                we may seek injunctive relief in any court having jurisdiction to protect our intellectual property rights.
              </p>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">15. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. We will provide notice of any material 
                changes by posting the updated Terms on our website or through other communication channels. 
                Your continued use of our Services after such changes constitutes your acceptance of the new Terms.
              </p>
              <p>
                If you do not agree to the changes, you must stop using our Services. We encourage you to review these 
                Terms periodically to stay informed about our practices.
              </p>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">16. Severability</h2>
              <p>
                If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated 
                to the minimum extent necessary so that these Terms will otherwise remain in full force and effect and enforceable.
              </p>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">17. Entire Agreement</h2>
              <p>
                These Terms constitute the entire agreement between you and Sweeply regarding our Services and supersede all prior 
                and contemporaneous agreements, proposals, or representations, written or oral, concerning its subject matter.
              </p>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">18. Contact Information</h2>
              <p>
                If you have any questions or concerns about these Terms, please contact us at:
                <br />
                <a href="mailto:support@sweeplypro.com" className="text-pulse-600 hover:text-pulse-800 font-medium">
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