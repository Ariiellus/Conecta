"use client";

import { useState, useEffect } from "react";
import { CreditCard, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { usePrivy } from "@privy-io/react-auth";

const navItems = [
  {
    name: "Home",
    href: "#home",
  },
  {
    name: "Features",
    href: "#features",
  },
  {
    name: "About",
    href: "#footer",
  },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { login, authenticated, ready } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  const handleLoginClick = () => {
    if (ready && authenticated) {
      router.push("/dashboard");
    } else {
      login();
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${scrolled ? 'shadow-md bg-white/95 backdrop-blur-sm' : 'bg-white'}`}>
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center">
            <CreditCard className="h-5 w-5" />
          </div>
          <span className="ml-3 text-xl font-semibold">Conecta</span>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item, index) => (
            <a 
              key={index} 
              href={item.href} 
              className="text-gray-600 hover:text-primary"
              onClick={(e) => scrollToSection(e, item.href)}
            >
              {item.name}
            </a>
          ))}
        </nav>
        
        <div className="flex items-center space-x-4">
          <Button 
            className="bg-primary hover:bg-primary-dark"
            onClick={handleLoginClick}
          >
            {ready && authenticated ? "Dashboard" : "Log in"}
          </Button>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 rounded-md hover:bg-gray-100"
            onClick={toggleMobileMenu}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden py-4 px-4 border-t border-gray-200 bg-white shadow-lg">
          <div className="flex flex-col space-y-4">
            {navItems.map((item, index) => (
              <a 
                key={index} 
                href={item.href} 
                className="text-gray-600 hover:text-primary py-2"
                onClick={(e) => scrollToSection(e, item.href)}
              >
                {item.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
} 