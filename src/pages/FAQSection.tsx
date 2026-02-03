import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FAQSection = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(item => item !== index)
        : [...prev, index]
    );
  };

  const faqs = [
    {
      question: "What is OmniReceipts and how does it work?",
      answer: "OmniReceipts is a simple-to-use online tool that helps businesses, freelancers, and entrepreneurs create professional invoices and receipts in JPEG format. You simply just enter your customer details, transaction details, customize, and share/issue instantly."
    },
    {
      question: "Can OmniReceipts invoices and receipts be used for tax or record-keeping purposes?",
      answer: (
          <>
            Yes, especially with the new tax law coming into effect in 2026, receipts generated can be saved,
            downloaded and printed for accounting, audits, and tax purposes. They can also be exported in XML and CSV format.
            We know that many countries are aligning with global standards in terms of e-invoicing.
          </>
        )
      },
     {
      question: "Can I generate a JPEG invoice or receipt instantly?",
      answer: "Yes. OmniReceipts is designed for ease and speed — you can create and share a receipt or invoice in less than a minute. Once the share button is clicked, your Whatsapp is opened up immediately, with the document attached and the customer's phone number set as recipient. All that will then be required is to hit send on Whatsapp. For repeat customers, their information is pre-filled in the creation forms which will allow for a faster sharing of documents. "
    },
    {
      question: "Why should businesses switch from handwritten receipts to digital receipts?",
      answer: (
        <>
          Again, because of the new tax law coming into effect from 1st January 2026, record-keeping has become very essential for all business owners, freelancers, entrepreneurs and self-employed workers. We need to start aligning with global standards. You can read more about e-invoicing trends globally.
        </>
      )
    },
    {
      question: "What is the payment method?",
      answer: "The preferred payment method will be announced soon. Stay tuned for our new payment integration."
    },
    {
      question: "How long is a month's subscription if I subscribe in the middle of any month?",
      answer: "On the monthly plan, you are given 30 calendar days of unlimited document creation. On the yearly plan, you are given 365 days of unlimited document creation."
    },
    {
      question: "How do I get or use OmniReceipts?",
      answer: "OmniReceipts can simply be used with a desktop, tablet, or mobile phone with an internet connection. The Android application is currently available for free download here on this page."
    },
    {
      question: "Do I need to install any software to use OmniReceipts on my laptop, desktop or tablet?",
      answer: "No installation required. Everything runs directly in your browser, making it fast and hassle-free. However, if you have an android phone, you can download the app from this landing page for free. When you are not in front of a laptop/desktop, the android app installed on your mobile phone allows a much quicker access especially when you have the customer in front of you. "
    },
    {
      question: "How do I create a receipt online on OmniReceipts?",
      answer: "Simply open OmniReceipts and log in with your email and password, click the 'Create Receipt' button, and then fill in your business details (if different from your pre-filled details during registration), add customer information, add transaction details, and share your receipt via Whatsapp in one-click as a JPEG instantly."
    },
    {
      question: "Can I create professional-looking receipts without design skills?",
      answer: "Yes. Our ready-to-use templates automatically format your receipts and invoices, so they look neat and professional. You will be able to preview the receipt or invoice before it is generated."
    },
     {
      question: "Are receipts and invoices generated with OmniReceipts accepted for business transactions?",
      answer: "OmniReceipts receipts and invoices are professional and valid for day-to-day business use. Many small businesses already save paper by the use of digital invoices and receipts."
    },
     {
      question: "What details are included or can I include on my invoice or receipt?",
      answer: "You can add your business name, business address, customer details, amount, payment date, and even automatic numbering for professional record-keeping. You can also include an itemized list of the transaction details."
    },
     {
      question: "How do small businesses issue professional invoices or receipts?",
      answer: "It is common to have invoices and receipts issued as handwritten notes, when these documents can simply be made using OmniReceipts to create clean, branded digital documents that customers trust and portray professionalism."
    },
    {
      question: "Are there hidden charges for using OmniReceipts?",
      answer: "No hidden charges. Everything is clear and transparent."
    },
    {
      question: "Can I try OmniReceipts before paying?",
      answer: "Yes, you can use the free tier subscription to test it out before upgrading. Everyone that signs up is placed in the free tier by default."
    },
    {
      question: "What is the best free invoice generator?",
      answer: "OmniReceipts is one of the best free invoice and receipt generators — simple, fast, and built for small businesses."
    },
    {
      question: "How can I create a receipt for my small business without using paper?",
      answer: (
        <>
          You can create receipts online with OmniReceipts by signing up, entering transaction details and sharing a ready-made receipt instantly via your Whatsapp. Moreover, in alignment with many countries' Digital Economy Policies, emphasizing transparency, compliance, and efficiency is key.
        </>
      )
    },
    {
      question: "What is the easiest way to create professional invoices?",
      answer: "One of the easiest ways is using OmniReceipts — no design skills, no software, just enter your transaction details and share."
    }
  ];

  return (
    <div className="py-24 bg-gradient-to-br from-background via-background/80 to-primary/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-muted-foreground">
            Everything you need to know about OmniReceipts
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* Question Header */}
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-primary/5 transition-colors duration-200"
              >
                <h3 className="text-lg font-semibold text-foreground pr-4">
                  {faq.question}
                </h3>
                <div className="flex-shrink-0">
                  {openItems.includes(index) ? (
                    <Minus className="h-5 w-5 text-primary transition-transform duration-200" />
                  ) : (
                    <Plus className="h-5 w-5 text-primary transition-transform duration-200" />
                  )}
                </div>
              </button>

              {/* Answer Dropdown - Using details/summary pattern for crawler visibility */}
              <div
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{
                  maxHeight: openItems.includes(index) ? '500px' : '0',
                  opacity: openItems.includes(index) ? 1 : 0
                }}
                aria-hidden={!openItems.includes(index)}
              >
                <div className="px-6 pb-5 pt-0">
                  <div className="border-l-4 border-primary/20 pl-4">
                    <p className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-12 p-8 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl border border-border/30">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Still have questions?
          </h3>
          <p className="text-muted-foreground mb-4">
            Can't find the answer you're looking for? Feel free to reach out to our support team.
          </p>
          <a 
            href="https://tally.so/r/wzVXq1"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button 
              variant="outline" 
              className="bg-background/80 hover:bg-primary/10 border-primary/20"
            >
              Contact Support
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQSection;
