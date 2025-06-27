import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicy = () => {
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
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            
            <p className="text-gray-700 mb-8 text-lg">Last Updated: {formatDate()}</p>
            
            <div className="prose prose-lg max-w-none text-gray-800">
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Introduction</h2>
              <p>
                At Sweeply, we value your privacy and are committed to protecting your personal information.
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information
                when you use our website, mobile application, and services (collectively, the "Services").
              </p>
              <p>
                Please read this Privacy Policy carefully. By accessing or using our Services, you acknowledge
                that you have read, understood, and agree to be bound by this Privacy Policy.
              </p>
              <p>
                This Privacy Policy applies to all visitors, users, and others who access or use our Services.
                If you do not agree with this Privacy Policy, please do not access or use our Services.
              </p>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">2.1 Personal Information</h3>
              <p>
                We may collect personal information that you provide directly to us when you:
              </p>
              <ul className="list-disc pl-6 my-4 text-gray-800">
                <li className="mb-2">Create or modify your account</li>
                <li className="mb-2">Fill out forms or fields on our Services</li>
                <li className="mb-2">Schedule services or make payments</li>
                <li className="mb-2">Communicate with us or other users</li>
                <li className="mb-2">Sign up for newsletters or promotional materials</li>
                <li className="mb-2">Participate in surveys, contests, or promotions</li>
              </ul>
              <p>
                The types of personal information we may collect include:
              </p>
              <ul className="list-disc pl-6 my-4 text-gray-800">
                <li className="mb-2">Contact information (name, email address, postal address, phone number)</li>
                <li className="mb-2">Account credentials (username, password)</li>
                <li className="mb-2">Payment information (credit card details, billing address)</li>
                <li className="mb-2">Business information (company name, job title, tax ID)</li>
                <li className="mb-2">Demographic information (age, gender, location)</li>
                <li className="mb-2">Communications and correspondence with us</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">2.2 Information Collected Automatically</h3>
              <p>
                When you use our Services, we may automatically collect certain information, including:
              </p>
              <ul className="list-disc pl-6 my-4 text-gray-800">
                <li className="mb-2">Device information (IP address, browser type, operating system)</li>
                <li className="mb-2">Usage data (pages visited, time spent on pages, links clicked)</li>
                <li className="mb-2">Location information (with your consent)</li>
                <li className="mb-2">Cookies and similar technologies</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">2.3 Cookies and Tracking Technologies</h3>
              <p>
                We and our third-party service providers use cookies, web beacons, and other tracking technologies to track 
                information about your use of our Services. We may combine this information with other personal information 
                we collect from you.
              </p>
              <p>
                <strong>Cookies:</strong> Cookies are small data files stored on your device that help us improve your experience, 
                see which areas and features of our Services are popular, and count visits. Most web browsers are set to accept 
                cookies by default. If you prefer, you can usually choose to set your browser to remove or reject cookies. Please 
                note that if you choose to remove or reject cookies, this could affect certain features of our Services.
              </p>
              <p>
                <strong>Web Beacons:</strong> Web beacons (also known as "pixel tags" or "clear GIFs") are electronic images that 
                may be used in our Services or emails to help deliver cookies, count visits, understand usage, and determine the 
                effectiveness of email marketing campaigns.
              </p>
              <p>
                <strong>Analytics:</strong> We use third-party analytics tools, such as Google Analytics, to help us measure traffic 
                and usage trends for our Services. These tools collect information sent by your browser or mobile device, including 
                the pages you visit and other information that assists us in improving our Services.
              </p>
              <p>
                <strong>Cookie Categories:</strong> We use the following types of cookies:
              </p>
              <ul className="list-disc pl-6 my-4 text-gray-800">
                <li className="mb-2"><strong>Essential cookies:</strong> Necessary for the operation of our Services</li>
                <li className="mb-2"><strong>Analytical/performance cookies:</strong> Allow us to recognize and count visitors and see how they move around our Services</li>
                <li className="mb-2"><strong>Functionality cookies:</strong> Enable us to personalize content for you</li>
                <li className="mb-2"><strong>Targeting cookies:</strong> Record your visit to our Services, the pages you visit, and the links you follow</li>
              </ul>
              <p>
                <strong>Cookie Management:</strong> You can manage your cookie preferences through your browser settings. 
                Most browsers allow you to block or delete cookies. Please note that if you block certain cookies, you may 
                not be able to register, log in, or access certain parts of our Services.
              </p>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. How We Use Your Information</h2>
              <p>
                We may use the information we collect for various purposes, including to:
              </p>
              <ul className="list-disc pl-6 my-4 text-gray-800">
                <li className="mb-2">Provide, maintain, and improve our Services</li>
                <li className="mb-2">Process transactions and send related information</li>
                <li className="mb-2">Send administrative messages, updates, and security alerts</li>
                <li className="mb-2">Respond to your comments, questions, and requests</li>
                <li className="mb-2">Personalize your experience and provide tailored content</li>
                <li className="mb-2">Monitor and analyze trends, usage, and activities</li>
                <li className="mb-2">Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
                <li className="mb-2">Develop new products and services</li>
                <li className="mb-2">Comply with legal obligations</li>
              </ul>
              <p>
                We may also use your information for any other purpose disclosed to you at the time we collect or receive the information, 
                or otherwise with your consent.
              </p>
              <p>
                <strong>Legal Basis for Processing (for EEA Users):</strong> If you are in the European Economic Area (EEA), we will only 
                process your personal information when we have a valid legal basis to do so. Our legal bases include:
              </p>
              <ul className="list-disc pl-6 my-4 text-gray-800">
                <li className="mb-2"><strong>Contractual necessity:</strong> To perform the contract we have with you</li>
                <li className="mb-2"><strong>Legitimate interests:</strong> When processing is necessary for our legitimate interests or those of a third party</li>
                <li className="mb-2"><strong>Consent:</strong> When you have given us specific consent to process your data</li>
                <li className="mb-2"><strong>Legal obligation:</strong> When processing is necessary to comply with a legal obligation</li>
              </ul>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Sharing Your Information</h2>
              <p>
                We may share your information in the following circumstances:
              </p>
              <ul className="list-disc pl-6 my-4 text-gray-800">
                <li className="mb-2">With service providers, consultants, and other third parties who perform services on our behalf</li>
                <li className="mb-2">With other users as part of the functionality of our Services (e.g., when scheduling cleaning services)</li>
                <li className="mb-2">In connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition</li>
                <li className="mb-2">If we believe disclosure is necessary to comply with applicable laws, regulations, or legal processes</li>
                <li className="mb-2">To protect the rights, property, and safety of Sweeply, our users, and others</li>
                <li className="mb-2">With your consent or at your direction</li>
              </ul>
              <p>
                <strong>Third-Party Service Providers:</strong> We may share your personal information with third-party vendors, 
                service providers, contractors, or agents who perform services for us or on our behalf and require access to such 
                information to do that work. Examples include payment processing, data analysis, email delivery, hosting services, 
                customer service, and marketing efforts.
              </p>
              <p>
                <strong>Business Transfers:</strong> If we are involved in a merger, acquisition, financing due diligence, reorganization, 
                bankruptcy, receivership, sale of company assets, or transition of service to another provider, your information may be 
                transferred as part of such a transaction as permitted by law and/or contract.
              </p>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect the security of your
                personal information. However, no method of transmission over the Internet or electronic storage
                is 100% secure, and we cannot guarantee absolute security.
              </p>
              <p>
                We take steps to ensure that your information is treated securely and in accordance with this Privacy Policy. 
                These measures include:
              </p>
              <ul className="list-disc pl-6 my-4 text-gray-800">
                <li className="mb-2">Encrypting sensitive information using secure socket layer technology (SSL)</li>
                <li className="mb-2">Implementing access controls to limit access to personal information</li>
                <li className="mb-2">Regular security assessments and audits</li>
                <li className="mb-2">Employee training on data protection and security</li>
              </ul>
              <p>
                <strong>Data Breach Procedures:</strong> In the event of a data breach that affects your personal information, 
                we will notify you and the relevant authorities as required by applicable law. We will provide information about 
                the breach, the affected data, and steps you can take to protect yourself from potential harm.
              </p>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Data Retention</h2>
              <p>
                We will retain your personal information only for as long as necessary to fulfill the purposes
                for which it was collected, including for the purposes of satisfying any legal, accounting, or
                reporting requirements.
              </p>
              <p>
                To determine the appropriate retention period for personal information, we consider:
              </p>
              <ul className="list-disc pl-6 my-4 text-gray-800">
                <li className="mb-2">The amount, nature, and sensitivity of the personal information</li>
                <li className="mb-2">The potential risk of harm from unauthorized use or disclosure</li>
                <li className="mb-2">The purposes for which we process your personal information</li>
                <li className="mb-2">Whether we can achieve those purposes through other means</li>
                <li className="mb-2">The applicable legal, regulatory, tax, accounting, or other requirements</li>
              </ul>
              <p>
                When we no longer need your personal information, we will securely delete or anonymize it. In some circumstances, 
                we may anonymize your personal information (so that it can no longer be associated with you) for research or 
                statistical purposes, in which case we may use this information indefinitely without further notice to you.
              </p>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Your Rights and Choices</h2>
              <p>
                Depending on your location, you may have certain rights regarding your personal information, including:
              </p>
              <ul className="list-disc pl-6 my-4 text-gray-800">
                <li className="mb-2">Access to your personal information</li>
                <li className="mb-2">Correction of inaccurate or incomplete information</li>
                <li className="mb-2">Deletion of your personal information</li>
                <li className="mb-2">Restriction or objection to processing</li>
                <li className="mb-2">Data portability</li>
                <li className="mb-2">Withdrawal of consent</li>
              </ul>
              <p>
                To exercise these rights, please contact us using the information provided in the "Contact Us" section.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">7.1 European Economic Area (EEA) Residents</h3>
              <p>
                If you are located in the EEA, you have certain rights under the General Data Protection Regulation (GDPR), including:
              </p>
              <ul className="list-disc pl-6 my-4 text-gray-800">
                <li className="mb-2"><strong>Right to access:</strong> You can request a copy of the personal information we hold about you.</li>
                <li className="mb-2"><strong>Right to rectification:</strong> You can request that we correct inaccurate or incomplete information.</li>
                <li className="mb-2"><strong>Right to erasure:</strong> You can request that we delete your personal information in certain circumstances.</li>
                <li className="mb-2"><strong>Right to restrict processing:</strong> You can request that we restrict the processing of your personal information in certain circumstances.</li>
                <li className="mb-2"><strong>Right to data portability:</strong> You can request to receive your personal information in a structured, commonly used, and machine-readable format.</li>
                <li className="mb-2"><strong>Right to object:</strong> You can object to our processing of your personal information in certain circumstances.</li>
                <li className="mb-2"><strong>Right to withdraw consent:</strong> You can withdraw your consent at any time where we rely on consent to process your personal information.</li>
              </ul>
              <p>
                To exercise these rights, please contact our Data Protection Officer at privacy@sweeplypro.com. We will respond to your request within 30 days.
              </p>
              <p>
                You also have the right to lodge a complaint with a supervisory authority if you believe that our processing of your personal information violates applicable law.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">7.2 California Residents</h3>
              <p>
                If you are a California resident, you have certain rights under the California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA), including:
              </p>
              <ul className="list-disc pl-6 my-4 text-gray-800">
                <li className="mb-2"><strong>Right to know:</strong> You can request information about the categories of personal information we have collected about you, the categories of sources from which we collected the information, our purposes for collecting the information, the categories of third parties with whom we have shared the information, and the specific pieces of personal information we have collected about you.</li>
                <li className="mb-2"><strong>Right to delete:</strong> You can request that we delete the personal information we have collected from you, subject to certain exceptions.</li>
                <li className="mb-2"><strong>Right to opt-out:</strong> You can opt-out of the sale or sharing of your personal information.</li>
                <li className="mb-2"><strong>Right to non-discrimination:</strong> You have the right not to be discriminated against for exercising your CCPA rights.</li>
                <li className="mb-2"><strong>Right to limit use of sensitive personal information:</strong> You can request that we limit the use of your sensitive personal information.</li>
                <li className="mb-2"><strong>Right to correct:</strong> You can request that we correct inaccurate personal information about you.</li>
              </ul>
              <p>
                To exercise these rights, please contact us at privacy@sweeplypro.com or through the methods described in the "Contact Us" section.
              </p>
              <p>
                <strong>Do Not Track Signals:</strong> Some browsers have a "Do Not Track" feature that lets you tell websites that you do not want to have your online activities tracked. At this time, our Services do not respond to browser "Do Not Track" signals.
              </p>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Children's Privacy</h2>
              <p>
                Our Services are not intended for children under the age of 16, and we do not knowingly collect
                personal information from children under 16. If we learn that we have collected personal information
                from a child under 16, we will take steps to delete such information as soon as possible.
              </p>
              <p>
                If you are a parent or guardian and believe that your child has provided us with personal information without your consent, 
                please contact us at privacy@sweeplypro.com, and we will take steps to remove that information from our servers.
              </p>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. International Data Transfers</h2>
              <p>
                Your information may be transferred to, and maintained on, computers located outside of your state,
                province, country, or other governmental jurisdiction where the data protection laws may differ from
                those in your jurisdiction. If you are located outside the United States and choose to provide
                information to us, please note that we may transfer the information to the United States or other
                countries for processing.
              </p>
              <p>
                When we transfer personal information from the EEA, UK, or Switzerland to countries that have not been deemed to provide an adequate level of protection, 
                we use specific contractual clauses approved by the European Commission (Standard Contractual Clauses) or other appropriate safeguards to protect your personal information.
              </p>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Marketing Communications</h2>
              <p>
                You may opt out of receiving promotional emails from us by following the instructions in those emails. 
                If you opt out, we may still send you non-promotional emails, such as those about your account or our ongoing business relations.
              </p>
              <p>
                <strong>Email Preferences:</strong> You can update your email preferences by clicking on the "unsubscribe" link in our emails 
                or by contacting us using the information in the "Contact Us" section.
              </p>
              <p>
                <strong>Push Notifications:</strong> If you have opted in to receive push notifications on your device, you can opt out by 
                adjusting the settings on your device.
              </p>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">11. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting
                the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review
                this Privacy Policy periodically for any changes.
              </p>
              <p>
                For significant changes to this Privacy Policy, we will make reasonable efforts to provide notification through our Services 
                or by email. Your continued use of our Services after any changes to this Privacy Policy constitutes your acceptance of such changes.
              </p>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">12. Contact Us</h2>
              <p>
                If you have any questions or concerns about this Privacy Policy or our privacy practices, please contact us at:
                <br />
                <a href="mailto:privacy@sweeplypro.com" className="text-pulse-600 hover:text-pulse-800 font-medium">
                  privacy@sweeplypro.com
                </a>
              </p>
              <p>
                <strong>Data Protection Officer:</strong><br />
                Sweeply, Inc.<br />
                Attn: Data Protection Officer<br />
                Email: privacy@sweeplypro.com
              </p>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">13. Additional Information for Specific Jurisdictions</h2>
              <p>
                Depending on your jurisdiction, additional privacy rights and obligations may apply. Please refer to the 
                relevant sections above or contact us for more information specific to your location.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy; 