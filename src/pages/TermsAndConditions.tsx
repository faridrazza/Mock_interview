import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/home/Footer';
import { Mail, Globe, FileText } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const TermsAndConditions = () => {
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
              Terms and <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">Conditions</span>
            </h1>
            <p className="text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
              Effective Date: April 9, 2025
            </p>
            <div className="pt-2">
              <p className="text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto">
                Welcome to MockInterview4U.com ("Company", "we", "us", or "our"). These Terms and Conditions ("Terms") govern your access to and use of our platform and services (collectively, the "Service"). By accessing or using MockInterview4U.com, you agree to be bound by these Terms.
              </p>
              <p className="text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto mt-4">
                If you do not agree to these Terms, please do not use our platform.
              </p>
            </div>
          </div>
          
          {/* Terms and Conditions content */}
          <div className="bg-white/80 dark:bg-neutral-800/60 rounded-xl shadow-lg backdrop-blur-sm border border-indigo-100/50 dark:border-indigo-900/30 overflow-hidden">
            <div className="p-8 md:p-10">
              <div className="prose prose-indigo dark:prose-invert max-w-none">
                <h2 className="text-xl md:text-2xl font-semibold text-neutral-900 dark:text-white">Table of Contents</h2>
                <ol className="list-decimal pl-5 space-y-1 text-neutral-700 dark:text-neutral-300">
                  <li><a href="#section-1" className="text-indigo-600 dark:text-indigo-400 hover:underline">Eligibility and User Accounts</a></li>
                  <li><a href="#section-2" className="text-indigo-600 dark:text-indigo-400 hover:underline">Services and Subscriptions</a></li>
                  <li><a href="#section-3" className="text-indigo-600 dark:text-indigo-400 hover:underline">AI Services and Disclaimer</a></li>
                  <li><a href="#section-4" className="text-indigo-600 dark:text-indigo-400 hover:underline">User Responsibilities</a></li>
                  <li><a href="#section-5" className="text-indigo-600 dark:text-indigo-400 hover:underline">Intellectual Property</a></li>
                  <li><a href="#section-6" className="text-indigo-600 dark:text-indigo-400 hover:underline">Termination</a></li>
                  <li><a href="#section-7" className="text-indigo-600 dark:text-indigo-400 hover:underline">Modifications to the Service</a></li>
                  <li><a href="#section-8" className="text-indigo-600 dark:text-indigo-400 hover:underline">Limitation of Liability</a></li>
                  <li><a href="#section-9" className="text-indigo-600 dark:text-indigo-400 hover:underline">Indemnification</a></li>
                  <li><a href="#section-10" className="text-indigo-600 dark:text-indigo-400 hover:underline">Governing Law and Dispute Resolution</a></li>
                  <li><a href="#section-11" className="text-indigo-600 dark:text-indigo-400 hover:underline">Changes to These Terms</a></li>
                  <li><a href="#section-12" className="text-indigo-600 dark:text-indigo-400 hover:underline">Contact Us</a></li>
                </ol>
                
                <Separator className="my-8" />
                
                <section id="section-1">
                  <h2 className="text-xl md:text-2xl font-semibold text-neutral-900 dark:text-white">1. Eligibility and User Accounts</h2>
                  
                  <ul className="list-disc pl-5 space-y-1 text-neutral-700 dark:text-neutral-300 mt-4">
                    <li>You must be at least 16 years old and capable of forming a legally binding agreement to use this Service. By registering, you represent that you meet this requirement.</li>
                    <li>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</li>
                    <li>You agree to provide accurate and complete information when creating your account.</li>
                  </ul>
                </section>
                
                <Separator className="my-8" />
                
                <section id="section-2">
                  <h2 className="text-xl md:text-2xl font-semibold text-neutral-900 dark:text-white">2. Services and Subscriptions</h2>
                  
                  <ul className="list-disc pl-5 space-y-1 text-neutral-700 dark:text-neutral-300 mt-4">
                    <li>MockInterview4U.com provides AI-powered mock interviews using 3D avatar, AI,conversation analysis, and generative feedback.</li>
                    <li>Some features are accessible only through a paid subscription or one-time purchase. By purchasing any plan, you authorize us or our payment processor (e.g., Paypal) to charge your selected payment method.</li>
                    <li>Subscriptions automatically renew unless canceled before the next billing cycle.</li>
                  </ul>
                </section>
                
                <Separator className="my-8" />
                
                <section id="section-3">
                  <h2 className="text-xl md:text-2xl font-semibold text-neutral-900 dark:text-white">3. AI Services and Disclaimer</h2>
                  
                  <ul className="list-disc pl-5 space-y-1 text-neutral-700 dark:text-neutral-300 mt-4">
                    <li>Our platform uses AI to simulate interview experiences and provide performance feedback.</li>
                    <li>While we aim to enhance your skills, we do not guarantee job placement or hiring outcomes.</li>
                    <li>Any guidance or scoring provided is for educational and preparatory purposes only and should not be considered professional or legal advice.</li>
                  </ul>
                </section>
                
                <Separator className="my-8" />
                
                <section id="section-4">
                  <h2 className="text-xl md:text-2xl font-semibold text-neutral-900 dark:text-white">4. User Responsibilities</h2>
                  
                  <p className="my-4 text-neutral-700 dark:text-neutral-300">You agree that you will not:</p>
                  <ul className="list-disc pl-5 space-y-1 text-neutral-700 dark:text-neutral-300">
                    <li>Use the platform to impersonate others or submit false or misleading information.</li>
                    <li>Use the Service for unlawful, abusive, or unethical purposes.</li>
                    <li>Attempt to reverse-engineer, copy, or exploit our platform or proprietary features.</li>
                    <li>Violate the intellectual property rights of others or of MockInterview4U.com.</li>
                  </ul>
                </section>
                
                <Separator className="my-8" />
                
                <section id="section-5">
                  <h2 className="text-xl md:text-2xl font-semibold text-neutral-900 dark:text-white">5. Intellectual Property</h2>
                  
                  <ul className="list-disc pl-5 space-y-1 text-neutral-700 dark:text-neutral-300 mt-4">
                    <li>All content on MockInterview4U.com, including text, logos, avatars, software, and AI-generated tools, is the exclusive property of the Company or its licensors.</li>
                    <li>You may not use, copy, distribute, or create derivative works without our prior written consent.</li>
                    <li>You retain ownership of your interview responses and submitted content. By using our platform, you grant us a non-exclusive, royalty-free license to use anonymized data to improve our services.</li>
                  </ul>
                </section>
                
                <Separator className="my-8" />
                
                <section id="section-6">
                  <h2 className="text-xl md:text-2xl font-semibold text-neutral-900 dark:text-white">6. Termination</h2>
                  
                  <ul className="list-disc pl-5 space-y-1 text-neutral-700 dark:text-neutral-300 mt-4">
                    <li>We reserve the right to suspend or terminate your account at any time, with or without notice, if you violate these Terms or engage in conduct that harms our platform or users.</li>
                    <li>Upon termination, your access to any paid content may be revoked.</li>
                  </ul>
                </section>
                
                <Separator className="my-8" />
                
                <section id="section-7">
                  <h2 className="text-xl md:text-2xl font-semibold text-neutral-900 dark:text-white">7. Modifications to the Service</h2>
                  
                  <p className="my-4 text-neutral-700 dark:text-neutral-300">We may update, modify, or discontinue the Service (or parts of it) at any time, with or without notice. We are not liable for any changes that may affect your experience or data loss.</p>
                </section>
                
                <Separator className="my-8" />
                
                <section id="section-8">
                  <h2 className="text-xl md:text-2xl font-semibold text-neutral-900 dark:text-white">8. Limitation of Liability</h2>
                  
                  <p className="my-4 text-neutral-700 dark:text-neutral-300">To the maximum extent permitted by law:</p>
                  <ul className="list-disc pl-5 space-y-1 text-neutral-700 dark:text-neutral-300">
                    <li>We are not liable for any indirect, incidental, or consequential damages, including lost profits, loss of data, or business interruption arising from your use of the Service.</li>
                    <li>In no event shall we be liable for any monetary compensation or refund, regardless of the nature of the claim, whether in contract, tort (including negligence), or otherwise.</li>
                  </ul>
                </section>
                
                <Separator className="my-8" />
                
                <section id="section-9">
                  <h2 className="text-xl md:text-2xl font-semibold text-neutral-900 dark:text-white">9. Indemnification</h2>
                  
                  <p className="my-4 text-neutral-700 dark:text-neutral-300">You agree to indemnify, defend, and hold harmless MockInterview4U.com and its affiliates, officers, employees, co-founders ,founders, owners and partners from any claims, losses, liabilities, damages, or expenses (including legal fees) arising out of:</p>
                  <ul className="list-disc pl-5 space-y-1 text-neutral-700 dark:text-neutral-300">
                    <li>Your use of the Service,</li>
                    <li>Your violation of these Terms,</li>
                    <li>Your infringement of any intellectual property or privacy rights.</li>
                  </ul>
                </section>
                
                <Separator className="my-8" />
                
                <section id="section-10">
                  <h2 className="text-xl md:text-2xl font-semibold text-neutral-900 dark:text-white">10. Governing Law and Dispute Resolution</h2>
                  
                  <ul className="list-disc pl-5 space-y-1 text-neutral-700 dark:text-neutral-300 mt-4">
                    <li>These Terms shall be governed by and construed in accordance with the laws of India.</li>
                    <li>Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts located in Ranchi, India.</li>
                    <li>We aim to resolve disputes amicably, but if unresolved, both parties agree to binding arbitration in accordance with the Arbitration and Conciliation Act, 1996, India.</li>
                    <li>By using our services, you waive the right to participate in class actions or jury trials to the extent permitted under applicable law.</li>
                  </ul>
                </section>
                
                <Separator className="my-8" />
                
                <section id="section-11">
                  <h2 className="text-xl md:text-2xl font-semibold text-neutral-900 dark:text-white">11. Changes to These Terms</h2>
                  
                  <p className="my-4 text-neutral-700 dark:text-neutral-300">We may revise these Terms from time to time. If we make material changes, we will notify you via email or platform alert. Your continued use of the Service after changes become effective constitutes your agreement to the new Terms.</p>
                </section>
                
                <Separator className="my-8" />
                
                <section id="section-12">
                  <h2 className="text-xl md:text-2xl font-semibold text-neutral-900 dark:text-white">12. Contact Us</h2>
                  
                  <p className="my-4 text-neutral-700 dark:text-neutral-300">If you have any questions or concerns about these Terms, you may contact us at:</p>
                  
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

export default TermsAndConditions; 