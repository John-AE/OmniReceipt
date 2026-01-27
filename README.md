# OmniReceipts - Professional Invoice & Receipt Management System

> Fast professional invoices and receipts for artisans, small businesses, freelancers, and everyone!

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://123185.xyz)
[![Made with Love](https://img.shields.io/badge/made%20with-love-red)](https://123185.xyz)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Deployment](#deployment)
- [Support](#support)

## 🌟 Overview

OmniReceipts is a mobile-first web application designed specifically for artisans, craftsmen, and small business owners worldwide to create professional invoices and receipts in seconds. With seamless WhatsApp integration and beautiful templates, it transforms the way small businesses manage their documentation.

**Live Application**: [https://123185.xyz](https://123185.xyz)

### Why OmniReceipts?

- ⚡ **Lightning Fast**: Create invoices and receipts in under 1 minute
- 📱 **Mobile-First**: Optimized for mobile devices with large, easy-to-tap buttons
- 💬 **WhatsApp Integration**: Share documents instantly via WhatsApp
- 🎨 **Professional Templates**: 9 invoice templates and 2 receipt templates
- 📊 **Business Analytics**: Track earnings and monitor business growth
- 👥 **Customer Management**: Maintain customer database with transaction history
- 🔐 **Secure**: Role-based access control with Supabase authentication

## ✨ Features

### Core Features

1. **Invoice Management**
   - Create professional multi-item invoices
   - 9 customizable invoice templates
   - Auto-generated invoice numbering
   - Tax calculation support
   - Payment date tracking

2. **Receipt Management**
   - Quick receipt generation
   - 2 professional receipt templates
   - Customer transaction history
   - Simple single-item receipts

3. **Customer Management**
   - Customer database with full CRUD operations
   - Transaction history per customer
   - Quick customer selection for repeat business
   - Search and filter capabilities

4. **Business Analytics**
   - Total revenue tracking (all-time and monthly)
   - Invoice/receipt count statistics
   - Usage monitoring dashboard
   - Visual analytics with charts

5. **Subscription System**
   - Free tier: 3 documents per month
   - Monthly subscription: ₦2,000/month (unlimited)
   - Yearly subscription: ₦20,000/year (2 months free)
   - Secure Paystack payment integration

6. **Export & Sharing**
   - Download as JPEG images
   - Export to CSV format
   - Export to XML format
   - WhatsApp direct sharing
   - Cross-platform support

7. **Authentication**
   - Email/password authentication
   - Phone number authentication
   - Password reset functionality
   - Secure session management

### Mobile Features

- **Progressive Web App (PWA)**: Install on mobile devices
- **Android App**: Native Android APK available
- **Offline Capability**: Service worker for offline support
- **Responsive Design**: Works on all screen sizes

## 🛠 Technology Stack

### Frontend

- **React 18.3.1** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Component library
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Backend

- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Row Level Security (RLS)
  - Authentication
  - Storage buckets
  - Edge Functions (Deno)

### External Services

- **Paystack** - Payment processing
- **Brevo** - Email notifications
- **WhatsApp API** - Document sharing

### Development Tools

- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **html2canvas** - Document to image conversion

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager
- Git
- Supabase account (for backend)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/OmniReceipts.git
   cd OmniReceipts
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   The project uses Supabase configuration in `supabase/config.toml`. Make sure you have:
   - Supabase project ID: `rwtdgknbahnvjkydzjzp`
   - Supabase anon key configured

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Open browser**
   ```
   http://localhost:8080
   ```

### Supabase Setup

The project requires a Supabase backend with:

1. **Database Tables**
   - `profiles` - User profiles and business information
   - `invoices` - Invoice records
   - `invoice_items` - Line items for invoices
   - `receipts` - Receipt records
   - `receipt_items` - Line items for receipts
   - `customers` - Customer database

2. **Storage Buckets**
   - `invoices` (public) - For storing generated invoice images

3. **Edge Functions**
   - `send-email-confirmation` - Email verification
   - `initialize-payment` - Paystack payment initialization
   - `verify-payment` - Payment verification and subscription updates

4. **Secrets Configuration**
   - `BREVO_API_KEY` - Email service
   - `PAYSTACK_SECRET_KEY` - Payment processing
   - `RESEND_API_KEY` - Alternative email service

See `DEVELOPER_GUIDE.md` for detailed database schema and RLS policies.

## 📁 Project Structure

```
OmniReceipts/
├── public/                          # Static assets
│   ├── icon-*.png                   # PWA icons
│   ├── mockup.png                   # App mockup image
│   ├── OmniReceipts.apk            # Android app
│   ├── manifest.json                # PWA manifest
│   ├── robots.txt                   # SEO configuration
│   ├── sitemap.xml                  # SEO sitemap
│   └── sw.js                        # Service worker
│
├── src/
│   ├── components/                  # React components
│   │   ├── ui/                      # Reusable UI components (shadcn)
│   │   ├── receipts/                # Receipt templates
│   │   ├── templates/               # Invoice templates
│   │   ├── AdminInvoicesList.tsx    # Admin invoice management
│   │   ├── AdminReceiptsList.tsx    # Admin receipt management
│   │   ├── CreateReceiptDialog.tsx  # Receipt creation modal
│   │   ├── CustomerListComponent.tsx # Customer list display
│   │   ├── InvoiceViewer.tsx        # Invoice preview
│   │   ├── ReceiptViewer.tsx        # Receipt preview
│   │   ├── PaywallModal.tsx         # Subscription prompt
│   │   └── ...                      # Other components
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── useAuth.tsx              # Authentication hook
│   │   ├── use-mobile.tsx           # Mobile detection
│   │   └── use-toast.ts             # Toast notifications
│   │
│   ├── pages/                       # Page components (routes)
│   │   ├── Index.tsx                # Landing page
│   │   ├── Auth.tsx                 # Login/register
│   │   ├── Dashboard.tsx            # User dashboard
│   │   ├── AdminDashboard.tsx       # Admin panel
│   │   ├── CreateInvoice.tsx        # Invoice creation
│   │   ├── Customers.tsx            # Customer management
│   │   ├── Profile.tsx              # User profile
│   │   ├── ResetPassword.tsx        # Password reset
│   │   ├── NotFound.tsx             # 404 page
│   │   └── FAQSection.tsx           # FAQ page
│   │
│   ├── utils/                       # Utility functions
│   │   ├── downloadUtils.ts         # Download helpers
│   │   ├── imageGeneration.ts       # Image generation
│   │   ├── invoiceCalculations.ts   # Invoice math
│   │   ├── templateRegistry.ts      # Template management
│   │   ├── receiptRegistry.ts       # Receipt template registry
│   │   ├── fileUpload.ts            # File upload utilities
│   │   └── xmlUtils.ts              # XML export
│   │
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts            # Supabase client
│   │       └── types.ts             # Generated types
│   │
│   ├── App.tsx                      # Main app component
│   ├── main.tsx                     # App entry point
│   ├── index.css                    # Global styles
│   └── vite-env.d.ts                # Vite type declarations
│
├── supabase/
│   ├── functions/                   # Edge functions
│   │   ├── send-email-confirmation/ # Email verification
│   │   ├── initialize-payment/      # Payment initialization
│   │   └── verify-payment/          # Payment verification
│   ├── migrations/                  # Database migrations
│   └── config.toml                  # Supabase configuration
│
├── .env                             # Environment variables (not in git)
├── tailwind.config.ts               # Tailwind configuration
├── vite.config.ts                   # Vite configuration
├── tsconfig.json                    # TypeScript configuration
├── package.json                     # Dependencies
└── README.md                        # This file
```

## 🏗 Architecture

### Application Flow

```
User Authentication
    ↓
Dashboard (Analytics & Stats)
    ↓
Create Invoice/Receipt
    ↓
Select Template
    ↓
Generate & Preview
    ↓
Download/Share via WhatsApp
```

### Key Design Patterns

1. **Component-Based Architecture**: Modular React components for reusability
2. **Custom Hooks**: Encapsulated logic (useAuth, use-toast)
3. **Registry Pattern**: Template and receipt management
4. **Form Management**: React Hook Form with validation
5. **Type Safety**: TypeScript throughout
6. **Security Definer Functions**: Secure database operations avoiding RLS recursion

### Security Architecture

- **Row Level Security (RLS)**: Database-level access control
- **Security Definer Functions**: Bypass RLS for admin operations
- **JWT Authentication**: Supabase Auth tokens
- **Client-side Guards**: Route protection
- **Input Validation**: Zod schemas and React Hook Form

See `DEVELOPER_GUIDE.md` for detailed architecture documentation.

## 🚢 Deployment

### Lovable Deployment (Recommended)

The easiest way to deploy is through Lovable:

1. Click "Share" → "Publish" in Lovable editor
2. Your app is automatically deployed
3. Custom domain can be connected via Project > Settings > Domains

### Manual Deployment

#### Vercel

```bash
npm run build
vercel --prod
```

#### Netlify

```bash
npm run build
netlify deploy --prod
```

### Environment Configuration

Ensure these are configured in your production environment:

- Supabase project URL and anon key
- Paystack public key (frontend only)
- Edge function secrets (Supabase dashboard)

### Post-Deployment Checklist

- [ ] Database migrations applied
- [ ] RLS policies active
- [ ] Storage buckets configured with correct policies
- [ ] Edge functions deployed
- [ ] Secrets configured (Paystack, Brevo, etc.)
- [ ] Custom domain connected (optional)
- [ ] SSL certificate active
- [ ] PWA manifest and service worker active

## 📱 Progressive Web App (PWA)

OmniReceipts is a full PWA with:

- **Installable**: Add to home screen on mobile devices
- **Offline Capable**: Service worker caches assets
- **App-like Experience**: Full-screen mode, splash screen
- **Manifest**: Configured in `public/manifest.json`
- **Icons**: Multiple sizes in `public/` directory

## 🔐 Security Features

- **Row Level Security (RLS)**: All database tables protected
- **Authentication Required**: Protected routes
- **Admin Role Verification**: Email-based admin check
- **Secure Functions**: Security definer for sensitive operations
- **Input Sanitization**: All user inputs validated
- **HTTPS Only**: Enforced in production
- **CORS Protection**: Configured in edge functions

## 📊 Subscription Tiers

| Feature             | Free  | Monthly (₦2,000) | Yearly (₦20,000) |
| ------------------- | ----- | ---------------- | ---------------- |
| Documents/month     | 3     | Unlimited        | Unlimited        |
| Templates           | All   | All              | All              |
| Customer Management | ✅    | ✅               | ✅               |
| Analytics           | ✅    | ✅               | ✅               |
| WhatsApp Sharing    | ✅    | ✅               | ✅               |
| Support             | Email | Priority         | Priority         |
| Savings             | -     | -                | ₦4,000/year      |

## 🤝 Support

- **Email**: johnnybgsu@gmail.com
- **Website**: [https://123185.xyz](https://123185.xyz)
- **Documentation**: See `DEVELOPER_GUIDE.md` for technical details

## 📄 License

Copyright © 2025 OmniReceipts. All rights reserved.

## 🙏 Acknowledgments

- Built with [Lovable](https://lovable.dev)
- UI Components from [shadcn/ui](https://ui.shadcn.com)
- Backend by [Supabase](https://supabase.com)
- Payments by [Paystack](https://paystack.com)

---

**Made with Love ❤️ for Artisans and Small Businesses Worldwide**
