import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { Smartphone, Menu, X, Mail, Phone, Laptop, CheckCircle } from 'lucide-react';
import { AndroidDownloadModal } from '@/components/AndroidDownloadModal';
import MetaSEO from '@/components/MetaSEO';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

const DeviceReceipts = () => {
  // State for mobile menu toggle
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // State for download modal
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  // Handle download button click - show modal and trigger download
  const handleDownloadClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsDownloadModalOpen(true);

    // Trigger the actual download
    const link = document.createElement('a');
    link.href = 'https://www.OmniReceipts.com.ng/OmniReceipts.apk';
    link.download = 'OmniReceipts.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-white font-poppins">
      <MetaSEO
        title="Phone & Laptop Receipts - Device Sales Receipt Generator"
        description="Create professional receipts for phone and laptop sales. Instant generation and WhatsApp sharing with OmniReceipts."
        canonicalPath="/device-receipts"
      />
      <SiteHeader />

      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Device Sales Receipts
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Create professional receipts for phone and laptop sales with OmniReceipts.
              Our app makes it easy to generate beautiful, shareable receipts instantly.
            </p>

            {/* Key Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="flex items-center justify-center gap-3 bg-white p-4 rounded-lg shadow-sm">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <span className="font-medium text-gray-800">Instant Generation</span>
              </div>
              <div className="flex items-center justify-center gap-3 bg-white p-4 rounded-lg shadow-sm">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <span className="font-medium text-gray-800">WhatsApp Sharing</span>
              </div>
              <div className="flex items-center justify-center gap-3 bg-white p-4 rounded-lg shadow-sm">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <span className="font-medium text-gray-800">Professional Templates</span>
              </div>
            </div>

            <a
              href="https://www.OmniReceipts.com.ng/OmniReceipts.apk"
              download="OmniReceipts.apk"
              onClick={handleDownloadClick}
              className="inline-block"
            >
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg font-semibold rounded-lg shadow-lg">
                Download OmniReceipts App
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Phone Receipt Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Create Phone Receipts
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Whether you're selling smartphones, accessories, or mobile devices, OmniReceipts helps you create
                professional receipts that impress your customers. Perfect for phone dealers, retailers, and resellers worldwide.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <span className="text-gray-700">Mobile phone sales receipts</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <span className="text-gray-700">Accessory and gadget receipts</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <span className="text-gray-700">Repair service receipts</span>
                </li>
              </ul>
            </div>
            <div className="flex justify-center">
              <img
                src="/mockup.png"
                alt="OmniReceipts App - Phone Receipt Creation"
                className="w-80 h-auto drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Laptop Receipt Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <img
                src="/laptop-mockup.png"
                alt="OmniReceipts App - Laptop Receipt Creation"
                className="w-80 h-auto drop-shadow-2xl"
              />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Create Laptop Receipts
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                For computer stores, tech retailers, and online sellers, generate professional laptop receipts
                that build trust with your customers. OmniReceipts supports all types of computer equipment sales.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3">
                  <Laptop className="h-5 w-5 text-primary" />
                  <span className="text-gray-700">Laptop and notebook sales</span>
                </li>
                <li className="flex items-center gap-3">
                  <Laptop className="h-5 w-5 text-primary" />
                  <span className="text-gray-700">Desktop computer receipts</span>
                </li>
                <li className="flex items-center gap-3">
                  <Laptop className="h-5 w-5 text-primary" />
                  <span className="text-gray-700">Computer accessories</span>
                </li>
                <li className="flex items-center gap-3">
                  <Laptop className="h-5 w-5 text-primary" />
                  <span className="text-gray-700">IT service receipts</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Start Creating Professional Receipts Today
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of businesses worldwide using OmniReceipts for their receipt and invoice creation needs
          </p>
          <a
            href="https://www.OmniReceipts.com.ng/OmniReceipts.apk"
            download="OmniReceipts.apk"
            onClick={handleDownloadClick}
            className="inline-block"
          >
            <Button size="lg" className="bg-white text-primary hover:bg-gray-100 px-8 py-3 text-lg font-semibold rounded-lg shadow-lg">
              Download Free Android App
            </Button>
          </a>
        </div>
      </section>

      <SiteFooter />

      {/* Android Download Modal */}
      <AndroidDownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
      />
    </div>
  );
};

export { DeviceReceipts as PhoneReceiptNigeria };
