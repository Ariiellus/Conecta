"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Clock, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { usePrivy } from "@privy-io/react-auth";

export default function Landing() {
  const [recipientIndex, setRecipientIndex] = useState(0);
  const [fadeState, setFadeState] = useState(true); // true = visible, false = fading
  const { login, authenticated, ready } = usePrivy();
  const router = useRouter();
  const recipientFormats = [
    "sara@example.com",
    "sara.eth",
    "sara.base.eth",
    "sara@mail.com",
    "IG: @Sarah",
    "TG: @Sarah"
  ];

  useEffect(() => {
    // Set up a timer to rotate through recipient formats with fade animation
    const changeTimer = setInterval(() => {
      // First fade out
      setFadeState(false);
      
      // Then change the index and fade in after a delay
      setTimeout(() => {
        setRecipientIndex((prevIndex) => (prevIndex + 1) % recipientFormats.length);
        setFadeState(true);
      }, 300); // Half of the transition time
      
    }, 2500); // Total time for each item (including transition)

    return () => clearInterval(changeTimer); // Clean up on unmount
  }, []);

  const handleScrollToFeatures = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.querySelector('#features');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleGetStarted = (e: React.MouseEvent) => {
    e.preventDefault();
    if (ready && authenticated) {
      router.push("/dashboard");
    } else {
      login();
    }
  };

  return (
    <div className="flex flex-col min-h-screen" id="home">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-slate-50 to-blue-50 py-16 md:py-24 mt-16">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-700 bg-clip-text text-transparent">
              Pay now, anywhere
            </h1>
            <p className="text-gray-600 text-lg mb-8">
              Send and receive money instantly with our secure payment platform. 
              No hidden fees, no complications.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary-dark"
                onClick={handleGetStarted}
              >
                Send Money Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <a href="#features" onClick={handleScrollToFeatures}>
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </a>
            </div>
          </div>
          <div className="md:w-1/2 md:pl-10">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-primary font-semibold">JD</span>
                  </div>
                  <div className="ml-3">
                    <p className="font-medium">John Doe</p>
                    <p className="text-sm text-gray-500">Balance: $2,456.80</p>
                  </div>
                </div>
                <div className="bg-green-100 px-3 py-1 rounded-full">
                  <span className="text-green-600 text-sm font-medium">Active</span>
                </div>
              </div>
              <div className="mb-6">
                <div className="bg-gray-100 p-4 rounded-lg mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-500">Send to:</span>
                    <div className="flex flex-col items-end">
                      <span 
                        className="font-medium transition-all duration-300 inline-block min-w-32 text-right" 
                        style={{ 
                          opacity: fadeState ? 1 : 0,
                          color: fadeState ? '#3B82F6' : 'transparent',
                          transform: `translateY(${fadeState ? 0 : '5px'})`
                        }}
                      >
                        {recipientFormats[recipientIndex]}
                      </span>
                      <div className="flex space-x-1 mt-1">
                        {recipientFormats.map((_, index) => (
                          <div 
                            key={index}
                            className="h-1 w-1 rounded-full transition-colors duration-300"
                            style={{
                              backgroundColor: index === recipientIndex ? '#3B82F6' : '#CBD5E1'
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-500">Amount:</span>
                    <span className="font-medium">$150.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Fee:</span>
                    <span className="text-green-500 font-medium">Free</span>
                  </div>
                </div>
                <Button className="w-full bg-primary hover:bg-primary-dark">
                  Confirm Payment
                </Button>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-500 mb-3">Recent Transactions</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                        <ArrowRight className="h-4 w-4 text-red-500" />
                      </div>
                      <div className="ml-2">
                        <p className="text-sm font-medium">
                          To{" "}
                          <span 
                            className="text-red-500 transition-all duration-300"
                            style={{ 
                              opacity: fadeState ? 1 : 0.7
                            }}
                          >
                            {(recipientIndex + 2) % 2 === 0 ? "Alex" : recipientFormats[(recipientIndex + 3) % recipientFormats.length].includes("@") ? recipientFormats[(recipientIndex + 3) % recipientFormats.length] : "Alex"}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                    <span className="text-red-500">-$24.99</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <ArrowRight className="h-4 w-4 text-green-500 transform rotate-180" />
                      </div>
                      <div className="ml-2">
                        <p className="text-sm font-medium">
                          From{" "}
                          <span 
                            className="text-primary transition-all duration-300"
                            style={{ 
                              opacity: fadeState ? 1 : 0.7
                            }}
                          >
                            {recipientIndex % 2 === 0 ? "David" : recipientFormats[recipientIndex % recipientFormats.length].includes("@") ? recipientFormats[recipientIndex % recipientFormats.length] : "David"}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500">Yesterday</p>
                      </div>
                    </div>
                    <span className="text-green-500">+$75.50</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Conecta</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-6 rounded-xl">
              <div className="h-12 w-12 bg-primary-dark bg-opacity-10 rounded-lg flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Instant Transfers</h3>
              <p className="text-gray-600">
                Send and receive money in seconds, not days. Our platform ensures your money moves as fast as you need it.
              </p>
            </div>
            <div className="bg-slate-50 p-6 rounded-xl">
              <div className="h-12 w-12 bg-primary-dark bg-opacity-10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Advanced Security</h3>
              <p className="text-gray-600">
                Your security is our priority. We use bank-level encryption to keep your data and money safe at all times.
              </p>
            </div>
            <div className="bg-slate-50 p-6 rounded-xl">
              <div className="h-12 w-12 bg-primary-dark bg-opacity-10 rounded-lg flex items-center justify-center mb-4">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Zero Fees</h3>
              <p className="text-gray-600">
                No hidden charges or surprise fees. Send and receive money without paying extra for the service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to simplify your payments?</h2>
          <p className="text-blue-100 max-w-2xl mx-auto mb-8">
            Join thousands of users who trust Conecta for their payment needs. Fast, secure, and simple.
          </p>
          <Button 
            size="lg" 
            className="bg-white text-primary hover:bg-gray-100"
            onClick={handleGetStarted}
          >
            Get Started Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer id="footer" className="bg-gray-800 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center">
                  <CreditCard className="h-5 w-5" />
                </div>
                <span className="ml-3 text-white text-xl font-semibold">Conecta</span>
              </div>
              <p className="text-gray-400">
                Making payments simple, fast and secure for everyone.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Press</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Support Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Community</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Partners</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Security</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Compliance</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p>© 2025 Conecta. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}