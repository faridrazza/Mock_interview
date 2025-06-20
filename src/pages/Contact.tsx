import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/home/Footer';
import { Mail, Phone, MapPin, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const Contact = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-white to-indigo-50/50 dark:from-neutral-950 dark:via-neutral-900 dark:to-indigo-950/30">
      {/* Background decorations */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 -right-40 w-[60%] h-[50%] bg-gradient-to-b from-indigo-200/20 via-purple-200/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-40 w-[60%] h-[50%] bg-gradient-to-t from-pink-200/20 via-indigo-200/10 to-transparent rounded-full blur-3xl" />
      </div>

      <Navbar />
      
      <main className="flex-grow container px-4 md:px-6 py-16 md:py-24 max-w-5xl mx-auto">
        <div className="space-y-6 md:space-y-10">
          {/* Header section */}
          <div className="text-center space-y-3 md:space-y-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
              {/* Contact <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">Us</span> */}
            </h1>
            <p className="text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto text-sm sm:text-base">
              We're here to help with any questions about our AI interview platform. Reach out and we'll get back to you as soon as possible.
            </p>
          </div>
          
          {/* Contact card */}
          <div className="bg-white/80 dark:bg-neutral-800/60 rounded-xl shadow-lg backdrop-blur-sm border border-indigo-100/50 dark:border-indigo-900/30 overflow-hidden">
            <div className="grid md:grid-cols-2">
              {/* Contact details */}
              <div className="p-5 sm:p-6 md:p-10 bg-gradient-to-br from-indigo-50/80 to-purple-50/80 dark:from-indigo-900/30 dark:to-purple-900/30">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4 md:mb-6">Contact Information</h2>
                <div className="space-y-4 md:space-y-6">
                  {/* Email */}
                  <div className="flex items-start space-x-3 md:space-x-4">
                    <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 md:p-3 rounded-lg shrink-0">
                      <Mail className="h-4 w-4 md:h-5 md:w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-neutral-500 dark:text-neutral-400">Email</p>
                      <a 
                        href="mailto:company@mockinterview4u.com" 
                        className="text-sm md:text-base text-neutral-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors break-words"
                      >
                        company@mockinterview4u.com
                      </a>
                    </div>
                  </div>
                  
                  {/* Office Location */}
                  <div className="flex items-start space-x-3 md:space-x-4">
                    <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 md:p-3 rounded-lg shrink-0">
                      <MapPin className="h-4 w-4 md:h-5 md:w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-neutral-500 dark:text-neutral-400">Location</p>
                      <p className="text-sm md:text-base text-neutral-900 dark:text-white">Bangalore, Karanataka, India</p>
                    </div>
                  </div>
                  
                  {/* Hours */}
                  <div className="flex items-start space-x-3 md:space-x-4">
                    <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 md:p-3 rounded-lg shrink-0">
                      <Clock className="h-4 w-4 md:h-5 md:w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-neutral-500 dark:text-neutral-400">Working Hours</p>
                      <p className="text-sm md:text-base text-neutral-900 dark:text-white">Monday - Friday, 9AM - 5PM PST</p>
                    </div>
                  </div>
                </div>
                
                {/* Social links would go here if needed */}
              </div>
              
              {/* Support message */}
              <div className="p-5 sm:p-6 md:p-10 flex flex-col justify-center items-start">
                <div className="w-full max-w-sm">
                  <h2 className="text-xl sm:text-2xl font-semibold mb-3 md:mb-4">Need Support?</h2>
                  <p className="text-sm md:text-base text-neutral-600 dark:text-neutral-300 mb-4 md:mb-6">
                    Our support team is just an email away —
                  </p>
                  
                  <a 
                    href="mailto:company@mockinterview4u.com" 
                    className="inline-flex items-center text-base sm:text-lg md:text-xl font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors break-words"
                  >
                    <span className="mr-1">📧</span>
                    <span className="break-all">company@mockinterview4u.com</span>
                  </a>
                  
                  <Separator className="my-4 md:my-8" />
                  
                  <p className="text-sm md:text-base text-neutral-600 dark:text-neutral-300 mb-4 md:mb-6">
                    We prioritize all support requests and aim to respond within 24 hours during business days.
                  </p>
                  
                  <Button 
                    className="mt-2 md:mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-full px-4 md:px-6 py-4 md:py-6 h-auto border-0 shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 text-sm md:text-base w-full sm:w-auto"
                    asChild
                  >
                    <a href="mailto:company@mockinterview4u.com">
                      Contact Support
                      <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* FAQ section could go here if needed */}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Contact;
