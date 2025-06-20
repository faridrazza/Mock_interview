import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/home/Footer';
import { Shield, Mail, Globe } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-white to-indigo-50/50 dark:from-neutral-950 dark:via-neutral-900 dark:to-indigo-950/30">
      {/* Background decorations */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 -right-40 w-[60%] h-[50%] bg-gradient-to-b from-indigo-200/20 via-purple-200/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-40 w-[60%] h-[50%] bg-gradient-to-t from-pink-200/20 via-indigo-200/10 to-transparent rounded-full blur-3xl" />
      </div>

      <Navbar />
      
      <main className="flex-grow container px-4 md:px-6 py-24 max-w-4xl mx-auto">
        <div className="space-y-10">
          {/* Header section */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold">
              Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">Policy</span>
            </h1>
            <p className="text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
              Effective Date: 09-04-2025
            </p>
            <div className="pt-2">
              <p className="text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto">
                Welcome to MockInterview4U.com ("we", "our", or "us"). Your privacy is important to us. This Privacy Policy explains how we collect, use, share, and protect your personal information when you use our website and services.
              </p>
            </div>
          </div>
          
          {/* Privacy Policy content */}
          <div className="bg-white/80 dark:bg-neutral-800/60 rounded-xl shadow-lg backdrop-blur-sm border border-indigo-100/50 dark:border-indigo-900/30 overflow-hidden">
            <div className="p-8 md:p-10">
              <div className="prose prose-indigo dark:prose-invert max-w-none">
                <h2 className="text-xl md:text-2xl font-semibold text-neutral-900 dark:text-white">Table of Contents</h2>
                <ol className="list-decimal pl-5 space-y-1 text-neutral-700 dark:text-neutral-300">
                  <li><a href="#section-1" className="text-indigo-600 dark:text-indigo-400 hover:underline">Information We Collect</a></li>
                  <li><a href="#section-2" className="text-indigo-600 dark:text-indigo-400 hover:underline">Legal Bases for Processing (Under GDPR)</a></li>
                  <li><a href="#section-3" className="text-indigo-600 dark:text-indigo-400 hover:underline">How We Use Your Data</a></li>
                  <li><a href="#section-4" className="text-indigo-600 dark:text-indigo-400 hover:underline">AI Data Use and Automation</a></li>
                  <li><a href="#section-5" className="text-indigo-600 dark:text-indigo-400 hover:underline">Sharing of Data</a></li>
                  <li><a href="#section-6" className="text-indigo-600 dark:text-indigo-400 hover:underline">Cookies and Tracking Technologies</a></li>
                  <li><a href="#section-7" className="text-indigo-600 dark:text-indigo-400 hover:underline">Data Retention</a></li>
                  <li><a href="#section-8" className="text-indigo-600 dark:text-indigo-400 hover:underline">Security of Your Data</a></li>
                  <li><a href="#section-9" className="text-indigo-600 dark:text-indigo-400 hover:underline">International Data Transfers</a></li>
                  <li><a href="#section-10" className="text-indigo-600 dark:text-indigo-400 hover:underline">Your Rights</a></li>
                  <li><a href="#section-11" className="text-indigo-600 dark:text-indigo-400 hover:underline">Children's Privacy</a></li>
                  <li><a href="#section-12" className="text-indigo-600 dark:text-indigo-400 hover:underline">Sub-processors and Third-Party Services</a></li>
                  <li><a href="#section-13" className="text-indigo-600 dark:text-indigo-400 hover:underline">Changes to This Policy</a></li>
                  <li><a href="#section-14" className="text-indigo-600 dark:text-indigo-400 hover:underline">Contact Us</a></li>
                </ol>
                
                <Separator className="my-8" />
                
                <section id="section-1">
                  <h2 className="text-xl md:text-2xl font-semibold text-neutral-900 dark:text-white">1. Information We Collect</h2>
                  
                  <h3 className="text-lg font-medium mt-6 mb-2 text-neutral-800 dark:text-neutral-200">a. Personal Information</h3>
                  <ul className="list-disc pl-5 space-y-1 text-neutral-700 dark:text-neutral-300">
                    <li>Name, email address, and login credentials</li>
                    <li>Profile data such as job interest, experience level, role preference</li>
                    <li>Subscription and billing information (handled by third-party processors)</li>
                  </ul>
                  
                  <h3 className="text-lg font-medium mt-6 mb-2 text-neutral-800 dark:text-neutral-200">b. Interview Data</h3>
                  <ul className="list-disc pl-5 space-y-1 text-neutral-700 dark:text-neutral-300">
                    <li>Voice recordings, text responses, and user interactions during mock interviews</li>
                    <li>AI-generated feedback, performance scoring, and session transcripts</li>
                  </ul>
                  
                  <h3 className="text-lg font-medium mt-6 mb-2 text-neutral-800 dark:text-neutral-200">c. Technical Data</h3>
                  <ul className="list-disc pl-5 space-y-1 text-neutral-700 dark:text-neutral-300">
                    <li>IP address, device type, browser, and OS</li>
                    <li>Session duration, usage patterns, clickstream data</li>
                  </ul>
                  
                  <h3 className="text-lg font-medium mt-6 mb-2 text-neutral-800 dark:text-neutral-200">d. Cookies & Tracking</h3>
                  <ul className="list-disc pl-5 space-y-1 text-neutral-700 dark:text-neutral-300">
                    <li>First- and third-party cookies (Google Analytics, session tracking)</li>
                    <li>Behavioral data for analytics and advertising (with consent)</li>
                  </ul>
                </section>
                
                <Separator className="my-8" />
                
                <section id="section-2">
                  <h2 className="text-xl md:text-2xl font-semibold text-neutral-900 dark:text-white">2. Legal Bases for Processing (Under GDPR)</h2>
                  
                  <p className="my-4 text-neutral-700 dark:text-neutral-300">We collect and process personal data under the following bases:</p>
                  <ul className="list-disc pl-5 space-y-1 text-neutral-700 dark:text-neutral-300">
                    <li><span className="italic">Consent</span>: For marketing communications and non-essential cookies</li>
                    <li><span className="italic">Contractual necessity</span>: To provide services you've subscribed to</li>
                    <li><span className="italic">Legal obligation</span>: For compliance with tax and legal requirements</li>
                    <li><span className="italic">Legitimate interest</span>: For improving services, security, and fraud prevention</li>
                  </ul>
                </section>
                
                <Separator className="my-8" />
                
                <section id="section-3">
                  <h2 className="text-xl md:text-2xl font-semibold text-neutral-900 dark:text-white">3. How We Use Your Data</h2>
                  
                  <ul className="list-disc pl-5 space-y-1 text-neutral-700 dark:text-neutral-300 mt-4">
                    <li>To deliver mock interviews and generate AI-based feedback</li>
                    <li>To create real-time, voice-enabled 3D avatar interactions</li>
                    <li>To process payments and manage subscriptions</li>
                    <li>To analyze user behavior and improve our services</li>
                    <li>To communicate with you regarding your account, changes, and offers</li>
                    <li>To detect fraud, misuse, or security incidents</li>
                  </ul>
                </section>
                
                <Separator className="my-8" />
                
                <section id="section-4">
                  <h2 className="text-xl md:text-2xl font-semibold text-neutral-900 dark:text-white">4. AI Data Use and Automation</h2>
                  
                  <ul className="list-disc pl-5 space-y-1 text-neutral-700 dark:text-neutral-300 mt-4">
                    <li>We use large language models (LLMs) such as OpenAI's models to generate feedback</li>
                    <li>Audio and text data are used temporarily for response generation and performance scoring</li>
                    <li>Your data is <span className="italic">not</span> used to retrain AI models unless explicitly permitted</li>
                    <li>All automated decisions are explainable and do not have legal or significant effects on users</li>
                  </ul>
                </section>
                
                <Separator className="my-8" />
                
                <section id="section-5">
                  <h2 className="text-xl md:text-2xl font-semibold text-neutral-900 dark:text-white">5. Sharing of Data</h2>
                  
                  <p className="my-4 text-neutral-700 dark:text-neutral-300">We do not sell your personal data. We only share it with:</p>
                  <ul className="list-disc pl-5 space-y-1 text-neutral-700 dark:text-neutral-300">
                    <li><span className="italic">Service Providers</span>: Paypal (payments), Supabase (optional), hosting partners</li>
                    <li><span className="italic">AI Providers</span>: e.g., Open AI for generating question, communication, feedback. For conducting the interviews</li>
                    <li><span className="italic">Legal Authorities</span>: When required by law or in response to lawful requests</li>
                    <li><span className="italic">Business Transfers</span>: In case of mergers, acquisitions, or company restructuring</li>
                  </ul>
                </section>
                
                <Separator className="my-8" />
                
                <section id="section-6">
                  <h2 className="text-xl md:text-2xl font-semibold text-neutral-900 dark:text-white">6. Cookies and Tracking Technologies</h2>
                  
                  <p className="my-4 text-neutral-700 dark:text-neutral-300">We use cookies for:</p>
                  <ul className="list-disc pl-5 space-y-1 text-neutral-700 dark:text-neutral-300">
                    <li><span className="italic">Essential functionality</span>: Authentication, session management</li>
                    <li><span className="font-medium">Performance Analysis</span>: ChatGPT for interview feedback</li>
                    <li><span className="italic">Marketing</span> (only with your consent): Ad targeting and retargeting</li>
                  </ul>
                  
                  <p className="my-4 text-neutral-700 dark:text-neutral-300">You can control cookies through browser settings or consent pop-ups on the site.</p>
                </section>
                
                <Separator className="my-8" />
                
                <section id="section-7">
                  <h2 className="text-xl md:text-2xl font-semibold text-neutral-900 dark:text-white">7. Data Retention</h2>
                  
                  <ul className="list-disc pl-5 space-y-1 text-neutral-700 dark:text-neutral-300 mt-4">
                    <li>Personal account data is stored for as long as your account is active</li>
                    <li>Interview data is retained to help you review your progress unless deletion is requested</li>
                    <li>Payment data is retained according to financial regulations</li>
                    <li>Analytics data is retained to improve user experience</li>
                  </ul>
                </section>
                
                <Separator className="my-8" />
                
                <section id="section-8">
                  <h2 className="text-xl md:text-2xl font-semibold text-neutral-900 dark:text-white">8. Security of Your Data</h2>
                  
                  <p className="my-4 text-neutral-700 dark:text-neutral-300">We implement strong security measures to protect your information:</p>
                  <ul className="list-disc pl-5 space-y-1 text-neutral-700 dark:text-neutral-300">
                    <li>HTTPS and TLS encryption</li>
                    <li>Role-based access controls</li>
                    <li>Anonymization and pseudonymization where possible</li>
                    <li>Regular vulnerability scans and security audits</li>
                  </ul>
                </section>
                
                <Separator className="my-8" />
                
                <section id="section-9">
                  <h2 className="text-xl md:text-2xl font-semibold text-neutral-900 dark:text-white">9. International Data Transfers</h2>
                  
                  <p className="my-4 text-neutral-700 dark:text-neutral-300">Your information may be stored and processed in the <span className="italic">United States</span> or other countries where our service providers operate. These transfers are protected by:</p>
                  <ul className="list-disc pl-5 space-y-1 text-neutral-700 dark:text-neutral-300">
                    <li><span className="italic">Standard Contractual Clauses (SCCs)</span> under GDPR</li>
                    <li>Adequate data protection agreements with third parties</li>
                  </ul>
                </section>
                
                <Separator className="my-8" />
                
                <section id="section-10">
                  <h2 className="text-xl md:text-2xl font-semibold text-neutral-900 dark:text-white">10. Your Rights</h2>
                  
                  <h3 className="text-lg font-medium mt-6 mb-2 text-neutral-800 dark:text-neutral-200">Under <span className="italic">GDPR</span> (EU Users)</h3>
                  <ul className="list-disc pl-5 space-y-1 text-neutral-700 dark:text-neutral-300">
                    <li>Right to access, correct, or delete your personal data</li>
                    <li>Right to data portability</li>
                    <li>Right to object or restrict processing</li>
                    <li>Right to withdraw consent</li>
                  </ul>
                  
                  <h3 className="text-lg font-medium mt-6 mb-2 text-neutral-800 dark:text-neutral-200">Under <span className="italic">CCPA</span> (California Users)</h3>
                  <ul className="list-disc pl-5 space-y-1 text-neutral-700 dark:text-neutral-300">
                    <li>Right to know what personal data we collect and how it's used</li>
                    <li>Right to request deletion of your data</li>
                    <li>Right to opt-out of sale or sharing (we do not sell data)</li>
                    <li>Right to non-discrimination</li>
                  </ul>
                  
                  <p className="my-4 text-neutral-700 dark:text-neutral-300">📧 To exercise any of these rights, email us at: <a href="mailto:company@mockinterview4u.com" className="text-indigo-600 dark:text-indigo-400 hover:underline">company@mockinterview4u.com</a></p>
                </section>
                
                <Separator className="my-8" />
                
                <section id="section-11">
                  <h2 className="text-xl md:text-2xl font-semibold text-neutral-900 dark:text-white">11. Children's Privacy</h2>
                  
                  <p className="my-4 text-neutral-700 dark:text-neutral-300">Our services are not intended for children under the age of <span className="italic">16</span>. We do not knowingly collect data from minors. If we discover such data, we will delete it promptly.</p>
                </section>
                
                <Separator className="my-8" />
                
                <section id="section-12">
                  <h2 className="text-xl md:text-2xl font-semibold text-neutral-900 dark:text-white">12. Sub-Processors and Third-Party Services</h2>
                  
                  <p className="my-4 text-neutral-700 dark:text-neutral-300">We use third-party tools to operate our platform, which may process personal data:</p>
                  <ul className="list-disc pl-5 space-y-1 text-neutral-700 dark:text-neutral-300">
                    <li><span className="italic">OpenAI</span> – Open AI for generating question, communication, feedback. For conducting the interviews</li>
                    <li><span className="italic">Paypal</span> – Payment processing</li>
                    <li><span className="italic">Supabase</span> (if used) – Realtime database and tracking</li>
                    <li><span className="italic">AWS / Other Hosting</span> – Secure hosting infrastructure</li>
                  </ul>
                  
                  <p className="my-4 text-neutral-700 dark:text-neutral-300">Each provider complies with applicable privacy laws and maintains a Data Processing Agreement (DPA) with us.</p>
                </section>
                
                <Separator className="my-8" />
                
                <section id="section-13">
                  <h2 className="text-xl md:text-2xl font-semibold text-neutral-900 dark:text-white">13. Changes to This Policy</h2>
                  
                  <p className="my-4 text-neutral-700 dark:text-neutral-300">We may update this Privacy Policy from time to time to reflect changes in technology, law, or business operations. When we do, we will notify you via email or platform alert. Continued use of our platform after changes means you accept the updated policy.</p>
                </section>
                
                <Separator className="my-8" />
                
                <section id="section-14">
                  <h2 className="text-xl md:text-2xl font-semibold text-neutral-900 dark:text-white">14. Contact Us</h2>
                  
                  <p className="my-4 text-neutral-700 dark:text-neutral-300">If you have any questions or concerns about this policy or your data:</p>
                  
                  <div className="bg-indigo-50/50 dark:bg-indigo-900/20 rounded-lg p-6 mt-4">
                    <p className="font-medium text-lg text-neutral-900 dark:text-white mb-2">MockInterview4U.com</p>
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      <a href="mailto:company@mockinterview4u.com" className="text-indigo-600 dark:text-indigo-400 hover:underline">company@mockinterview4u.com</a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      <a href="https://mockinterview4u.com" className="text-indigo-600 dark:text-indigo-400 hover:underline">https://mockinterview4u.com</a>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PrivacyPolicy; 