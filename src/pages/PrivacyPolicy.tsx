import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicy = () => {
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
            
            <div className="prose prose-blue max-w-none">
              <p className="text-gray-600 mb-6">Last Updated: June 8, 2024</p>
              
              <h2>1. Introduction</h2>
              <p>
                At Sweeply, we value your privacy and are committed to protecting your personal information.
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information
                when you use our website, mobile application, and services (collectively, the "Services").
              </p>
              <p>
                Please read this Privacy Policy carefully. By accessing or using our Services, you acknowledge
                that you have read, understood, and agree to be bound by this Privacy Policy.
              </p>
              
              <h2>2. Information We Collect</h2>
              
              <h3>2.1 Personal Information</h3>
              <p>
                We may collect personal information that you provide directly to us when you:
              </p>
              <ul>
                <li>Create or modify your account</li>
                <li>Fill out forms or fields on our Services</li>
                <li>Schedule services or make payments</li>
                <li>Communicate with us or other users</li>
                <li>Sign up for newsletters or promotional materials</li>
                <li>Participate in surveys, contests, or promotions</li>
              </ul>
              <p>
                The types of personal information we may collect include:
              </p>
              <ul>
                <li>Contact information (name, email address, postal address, phone number)</li>
                <li>Account credentials (username, password)</li>
                <li>Payment information (credit card details, billing address)</li>
                <li>Business information (company name, job title, tax ID)</li>
                <li>Demographic information (age, gender, location)</li>
                <li>Communications and correspondence with us</li>
              </ul>
              
              <h3>2.2 Information Collected Automatically</h3>
              <p>
                When you use our Services, we may automatically collect certain information, including:
              </p>
              <ul>
                <li>Device information (IP address, browser type, operating system)</li>
                <li>Usage data (pages visited, time spent on pages, links clicked)</li>
                <li>Location information (with your consent)</li>
                <li>Cookies and similar technologies</li>
              </ul>
              
              <h2>3. How We Use Your Information</h2>
              <p>
                We may use the information we collect for various purposes, including to:
              </p>
              <ul>
                <li>Provide, maintain, and improve our Services</li>
                <li>Process transactions and send related information</li>
                <li>Send administrative messages, updates, and security alerts</li>
                <li>Respond to your comments, questions, and requests</li>
                <li>Personalize your experience and provide tailored content</li>
                <li>Monitor and analyze trends, usage, and activities</li>
                <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
                <li>Develop new products and services</li>
                <li>Comply with legal obligations</li>
              </ul>
              
              <h2>4. Sharing Your Information</h2>
              <p>
                We may share your information in the following circumstances:
              </p>
              <ul>
                <li>With service providers, consultants, and other third parties who perform services on our behalf</li>
                <li>With other users as part of the functionality of our Services (e.g., when scheduling cleaning services)</li>
                <li>In connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition</li>
                <li>If we believe disclosure is necessary to comply with applicable laws, regulations, or legal processes</li>
                <li>To protect the rights, property, and safety of Sweeply, our users, and others</li>
                <li>With your consent or at your direction</li>
              </ul>
              
              <h2>5. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect the security of your
                personal information. However, no method of transmission over the Internet or electronic storage
                is 100% secure, and we cannot guarantee absolute security.
              </p>
              
              <h2>6. Data Retention</h2>
              <p>
                We will retain your personal information only for as long as necessary to fulfill the purposes
                for which it was collected, including for the purposes of satisfying any legal, accounting, or
                reporting requirements.
              </p>
              
              <h2>7. Your Rights and Choices</h2>
              <p>
                Depending on your location, you may have certain rights regarding your personal information, including:
              </p>
              <ul>
                <li>Access to your personal information</li>
                <li>Correction of inaccurate or incomplete information</li>
                <li>Deletion of your personal information</li>
                <li>Restriction or objection to processing</li>
                <li>Data portability</li>
                <li>Withdrawal of consent</li>
              </ul>
              <p>
                To exercise these rights, please contact us using the information provided in the "Contact Us" section.
              </p>
              
              <h2>8. Children's Privacy</h2>
              <p>
                Our Services are not intended for children under the age of 16, and we do not knowingly collect
                personal information from children under 16. If we learn that we have collected personal information
                from a child under 16, we will take steps to delete such information as soon as possible.
              </p>
              
              <h2>9. International Data Transfers</h2>
              <p>
                Your information may be transferred to, and maintained on, computers located outside of your state,
                province, country, or other governmental jurisdiction where the data protection laws may differ from
                those in your jurisdiction. If you are located outside the United States and choose to provide
                information to us, please note that we may transfer the information to the United States or other
                countries for processing.
              </p>
              
              <h2>10. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting
                the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review
                this Privacy Policy periodically for any changes.
              </p>
              
              <h2>11. Contact Us</h2>
              <p>
                If you have any questions or concerns about this Privacy Policy or our privacy practices, please contact us at:
                <br />
                <a href="mailto:privacy@sweeplypro.com" className="text-pulse-600 hover:text-pulse-800">
                  privacy@sweeplypro.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy; 