import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { Menu, X, Mail, FileText } from 'lucide-react';
import MetaSEO from '@/components/MetaSEO';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

const TermsAndConditions = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Scroll to top when component mounts - fixes navigation starting at bottom
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  const sections = [
    {
      id: 1,
      title: "Acceptance of Terms",
      content: `By accessing and using OmniReceipts ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms, please do not use our Service. We reserve the right to modify these terms at any time. Your continued use of the Service constitutes acceptance of those changes.`
    },
    {
      id: 2,
      title: "Eligibility",
      content: `To use OmniReceipts, you must:
      
• Provide accurate information on you and your business during registration.
• Use the Service only for lawful business or personal purposes.
• You must be at least 13 years old to create an account. Users under 18 require parental consent.`
    },
    {
      id: 3,
      title: "Account Responsibility",
      content: `• You are responsible for all activity that occurs under your account.
• Do not share your password or access credentials.
• Every user account will be limited to a specific email and a specific phone number. Phone numbers serve as alternative usernames like email addresses, and hence every user is restricted to one distinct email and one distinct phone number.
• You are responsible for maintaining the confidentiality of your account credentials.
• You agree not to create multiple accounts to bypass limits, such as the free document creation cap.
  - If we detect duplicate or fraudulent accounts, we reserve the right to suspend or delete them without notice.`
    },
    {
      id: 4,
      title: "Free and Paid Plans",
      content: `• OmniReceipts offers a free tier with limited document creation.
• Upgrades to paid plans are optional but provide additional features and unlimited document creation.
• Attempting to manipulate or cheat the free plan limits (e.g., by using multiple emails) is strictly prohibited.
• Subscription fees may change. However, we see that for the foreseeable future, they will remain at their current level.
• You can downgrade or cancel subscription at any time. It is advised that downgrades are done on the current subscription expiry date.`
    },
    {
      id: 5,
      title: "Acceptable Use",
      content: `You agree not to:

• Use OmniReceipts for fraudulent, misleading, or illegal activities.
• Upload or generate false or offensive content.
• Reverse-engineer, scrape, or exploit the platform's source code or design.`
    },
    {
      id: 6,
      title: "Data and Privacy",
      content: `• Your information is handled in line with this Privacy Policy.
• We do not sell your data to third parties.
• You are responsible for the accuracy of any data you input or documents you generate.
• You can request deletion of your account and all respective data by sending an email request to admin@OmniReceipts.com.ng
• Where account or data deletion is requested, it will be assumed that the user has downloaded or made copies of their customer list database and all associated documents created.
• In cases of account deletion, we may retain certain information as required by law or for legitimate business purposes.`
    },
    {
      id: 7,
      title: "Ownership and Intellectual Property",
      content: `All content, design, and technology on OmniReceipts remain our property. You may only use the platform as permitted by these Terms.`
    },
    {
      id: 8,
      title: "Termination",
      content: `We may suspend or delete your account if:

• You violate these Terms,
• We detect suspicious or abusive activity, or
• You misuse the free or paid plan benefits.`
    },
    {
      id: 9,
      title: "Limitation of Liability",
      content: `OmniReceipts is provided "as is."

We are not liable for:

• Any loss of data or business caused by user error or service downtime,
• Misuse of generated documents, or
• We do not guarantee uninterrupted or error-free service. We will strive to communicate any downtime or glitches such as AWS service issues.
• Any indirect, incidental, or consequential damages.`
    },
    {
      id: 10,
      title: "Changes to These Terms",
      content: `We may update these Terms periodically. Continued use after updates means you accept the revised Terms.`
    },
    {
      id: 11,
      title: "Complaints",
      content: `For questions or complaints, contact:
admin@OmniReceipts.com.ng`
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <MetaSEO
        title="Terms and Conditions"
        description="Read the terms and conditions for using OmniReceipts. Understand your rights and responsibilities when using our professional invoice and receipt management system."
        canonicalPath="/terms"
      />
      <SiteHeader />

      {/* Hero Section */}
      {/* Added pt-24 instead of pt-16 to account for fixed navbar height and provide proper spacing */}
      <div className="relative overflow-hidden pt-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mb-6">
              <FileText className="h-10 w-10" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 font-poppins">
              Terms and Conditions
            </h1>
            <p className="text-xl text-muted-foreground mb-2">
              Effective Date: 1 November 2025
            </p>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Welcome to OmniReceipts ("we," "our," or "us"). These Terms and Conditions ("Terms") govern your use of our website OmniReceipts.com.ng and mobile app (collectively, the "Service").
            </p>
            <p className="text-md text-muted-foreground mt-4 max-w-3xl mx-auto">
              By creating an account or using OmniReceipts, you agree to these Terms. If you do not agree, please do not use the Service.
            </p>
          </div>
        </div>
      </div>

      {/* Terms Sections */}
      <div className="py-12 pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {sections.map((section, index) => (
              <div
                key={section.id}
                className={`p-8 rounded-xl shadow-sm transition-all hover:shadow-md ${index % 4 === 0
                  ? 'bg-primary/5 border border-primary/20'
                  : index % 4 === 1
                    ? 'bg-accent/5 border border-accent/20'
                    : index % 4 === 2
                      ? 'bg-secondary/5 border border-secondary/20'
                      : 'bg-muted/30 border border-muted/40'
                  }`}
              >
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${index % 4 === 0
                    ? 'bg-primary text-primary-foreground'
                    : index % 4 === 1
                      ? 'bg-accent text-accent-foreground'
                      : index % 4 === 2
                        ? 'bg-secondary text-secondary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                    {section.id}
                  </span>
                  {section.title}
                </h2>
                <div className="text-foreground whitespace-pre-line leading-relaxed">
                  {section.content}
                </div>
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-12 text-center p-8 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Have Questions?
            </h3>
            <p className="text-muted-foreground mb-6">
              If you have any questions about these Terms and Conditions, please contact us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="mailto:admin@OmniReceipts.com.ng">
                <Button size="lg" className="gap-2">
                  <Mail className="h-4 w-4" />
                  Contact Us
                </Button>
              </a>
              <Link to="/auth">
                <Button variant="outline" size="lg">
                  Sign In to OmniReceipts
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
};

export default TermsAndConditions;


