# OmniReceipts Developer Guide

> Comprehensive technical documentation for developers working on OmniReceipts

## 📑 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Database Schema](#database-schema)
- [Authentication System](#authentication-system)
- [Component Structure](#component-structure)
- [Key Features Implementation](#key-features-implementation)
- [API Documentation](#api-documentation)
- [Code Examples](#code-examples)
- [Testing Strategies](#testing-strategies)
- [Troubleshooting](#troubleshooting)
- [Contributing Guidelines](#contributing-guidelines)

## 🏗 Architecture Overview

### Technology Stack Details

#### Frontend Layer
```
React 18.3.1 + TypeScript
    ↓
Vite (Build Tool & Dev Server)
    ↓
React Router v6 (Navigation)
    ↓
Tailwind CSS + shadcn/ui (Styling)
    ↓
React Hook Form + Zod (Forms & Validation)
    ↓
Supabase Client (API Communication)
```

#### Backend Layer (Supabase)
```
PostgreSQL Database
    ↓
Row Level Security (RLS)
    ↓
Edge Functions (Deno Runtime)
    ↓
Storage Buckets
    ↓
Auth Service
```

### Design Patterns

1. **Component Composition Pattern**
   - Small, focused components
   - Props for customization
   - Children for flexibility

2. **Custom Hooks Pattern**
   - `useAuth()` - Authentication state and methods
   - `useToast()` - Notification system
   - `useMobile()` - Responsive detection

3. **Registry Pattern**
   - `templateRegistry.ts` - Manages 9 invoice templates
   - `receiptRegistry.ts` - Manages 2 receipt templates
   - Dynamic component loading

4. **Security Definer Functions**
   - Avoid RLS infinite recursion
   - Admin privilege escalation prevention
   - Secure server-side operations

## 💾 Database Schema

### Tables Overview

#### 1. profiles
Stores user profile and business information.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  artisan_name TEXT NOT NULL,
  business_name TEXT,
  business_address TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  logo_url TEXT,
  role TEXT DEFAULT 'user', -- 'user' or 'admin'
  passcode_hash TEXT, -- For phone-based login
  invoice_count INTEGER DEFAULT 0,
  receipt_count INTEGER DEFAULT 0,
  subscription_type TEXT DEFAULT 'free', -- 'free', 'monthly', 'yearly'
  subscription_expires TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexes:**
- `user_id` (unique)
- `email`
- `phone`

**RLS Policies:**
- Users can view their own profile
- Users can update their own profile
- Admins can view all profiles (using security definer function)

#### 2. invoices
Stores invoice header information.

```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  record_type TEXT DEFAULT 'invoice',
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  invoice_date DATE NOT NULL,
  payment_date DATE,
  template_id INTEGER NOT NULL DEFAULT 1,
  tax_rate NUMERIC(5,2) DEFAULT 0,
  sub_total NUMERIC(12,2) NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  status TEXT DEFAULT 'created', -- 'created', 'sent', 'paid'
  service_description TEXT, -- Legacy field
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexes:**
- `user_id`
- `customer_phone`
- `invoice_date`
- `created_at`

**RLS Policies:**
- Users can view their own invoices
- Users can create invoices (with usage limit check)
- Users can update their own invoices
- Users can delete their own invoices
- Admins can view all invoices

#### 3. invoice_items
Stores line items for invoices.

```sql
CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL,
  unit_price NUMERIC(12,2) NOT NULL,
  total_price NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexes:**
- `invoice_id`

**RLS Policies:**
- Users can view items for their invoices
- Users can create items for their invoices
- Items cascade delete with invoice

#### 4. receipts
Stores receipt information (simplified from invoices).

```sql
CREATE TABLE receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  record_type TEXT DEFAULT 'receipt',
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  receipt_date DATE NOT NULL,
  receipt_id INTEGER NOT NULL DEFAULT 1,
  amount NUMERIC(12,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Similar structure to invoices but simpler for quick receipts.**

#### 5. receipt_items
Stores line items for receipts.

```sql
CREATE TABLE receipt_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id UUID REFERENCES receipts(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL,
  unit_price NUMERIC(12,2) NOT NULL,
  total_price NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 6. customers
Standalone customer database for easy management.

```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, phone) -- One customer per phone per user
);
```

### Database Functions

#### 1. increment_invoice_count()
Increments the invoice counter when a user creates an invoice.

```sql
CREATE OR REPLACE FUNCTION public.increment_invoice_count(user_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.profiles 
  SET invoice_count = invoice_count + 1
  WHERE user_id = user_uuid;
END;
$$;
```

#### 2. increment_receipt_count()
Similar to invoice count, for receipts.

#### 3. check_usage_limit()
Checks if a user has reached their monthly limit.

```sql
CREATE OR REPLACE FUNCTION public.check_usage_limit(user_uuid UUID, item_type TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_profile RECORD;
BEGIN
  SELECT * INTO user_profile 
  FROM public.profiles 
  WHERE user_id = user_uuid;
  
  -- If paid subscription, no limits
  IF user_profile.subscription_type != 'free' THEN
    RETURN true;
  END IF;
  
  -- Check limits for free users (3 documents per month)
  IF item_type = 'invoice' THEN
    RETURN user_profile.invoice_count < 3;
  ELSIF item_type = 'receipt' THEN
    RETURN user_profile.receipt_count < 3;
  END IF;
  
  RETURN false;
END;
$$;
```

#### 4. is_admin()
Checks if the current user is an admin. Uses email-based verification.

```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND email = 'johnnybgsu@gmail.com'
  );
END;
$$;
```

#### 5. authenticate_with_phone_passcode()
Allows phone-based authentication (not actively used, password auth preferred).

#### 6. get_profile_by_phone()
Retrieves profile by phone number with normalization.

```sql
CREATE OR REPLACE FUNCTION public.get_profile_by_phone(phone_number TEXT)
RETURNS TABLE(email TEXT, phone TEXT)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  normalized TEXT := regexp_replace(phone_number, '\\s+', '', 'g');
  without_cc TEXT;
BEGIN
  -- Try exact match first
  RETURN QUERY
  SELECT p.email, p.phone
  FROM public.profiles p
  WHERE p.phone = normalized
  LIMIT 1;
  IF FOUND THEN RETURN; END IF;

  -- Handle +234 country code variations
  IF normalized LIKE '+234%' THEN
    without_cc := substring(normalized FROM 5);
    -- Try without country code
    RETURN QUERY
    SELECT p.email, p.phone
    FROM public.profiles p
    WHERE p.phone = without_cc
    LIMIT 1;
    IF FOUND THEN RETURN; END IF;
    
    -- Try with leading 0
    RETURN QUERY
    SELECT p.email, p.phone
    FROM public.profiles p
    WHERE p.phone = '0' || without_cc
    LIMIT 1;
    IF FOUND THEN RETURN; END IF;
  ELSE
    -- Try with +234 prefix
    IF normalized LIKE '0%' THEN
      without_cc := substring(normalized FROM 2);
      RETURN QUERY
      SELECT p.email, p.phone
      FROM public.profiles p
      WHERE p.phone = '+234' || without_cc
      LIMIT 1;
    ELSE
      RETURN QUERY
      SELECT p.email, p.phone
      FROM public.profiles p
      WHERE p.phone = '+234' || normalized
      LIMIT 1;
    END IF;
  END IF;
END;
$$;
```

### Database Triggers

#### update_updated_at_column()
Automatically updates `updated_at` timestamp on record modification.

```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Applied to profiles, invoices, receipts, customers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
```

#### handle_new_user()
Creates a profile record when a new user signs up.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, artisan_name, phone, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'artisan_name', 'Artisan'),
    COALESCE(NEW.raw_user_meta_data ->> 'phone', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Applied to auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### Storage Buckets

#### invoices (Public)
Stores generated invoice and receipt JPEG images.

**Policies:**
```sql
-- Allow authenticated users to upload their own files
CREATE POLICY "Users can upload their own invoices"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'invoices' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to view their own files
CREATE POLICY "Users can view their own invoices"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'invoices' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Public read access (for sharing)
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'invoices');
```

## 🔐 Authentication System

### Authentication Flow

```
User Input (Email/Phone + Password)
    ↓
Frontend Validation
    ↓
Supabase Auth API
    ↓
JWT Token Generated
    ↓
Session Stored (Cookie)
    ↓
Profile Fetched from DB
    ↓
AuthContext Updated
    ↓
User Redirected to Dashboard/Admin
```

### useAuth Hook

Located in `src/hooks/useAuth.tsx`, this custom hook provides:

```typescript
interface AuthContextType {
  user: User | null;              // Supabase user object
  session: Session | null;        // Supabase session
  loading: boolean;               // Auth state loading
  profile: any;                   // User profile from DB
  signUp: (email, password, artisanName, businessAddress, phone) => Promise<{ error: any }>;
  signIn: (email, password) => Promise<{ error: any }>;
  signInWithPhone: (phone, password) => Promise<{ error: any }>;
  resetPassword: (email) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}
```

### Authentication Methods

#### 1. Email/Password Sign Up

```typescript
// src/hooks/useAuth.tsx
const signUp = async (email, password, artisanName, businessAddress, phone) => {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/`,
      data: {
        artisan_name: artisanName,
        business_address: businessAddress,
        phone: phone.replace(/\s+/g, ''),
      }
    }
  });
  
  // Profile is automatically created by database trigger
  return { error };
};
```

#### 2. Email/Password Sign In

```typescript
const signIn = async (email, password) => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { error };
};
```

#### 3. Phone-Based Sign In

```typescript
const signInWithPhone = async (phone, password) => {
  // Normalize phone number
  const normalizedPhone = phone.replace(/\s+/g, '');
  
  // Use secure RPC to find email by phone
  const { data: profileData, error: profileError } = await supabase
    .rpc('get_profile_by_phone', { phone_number: normalizedPhone });
  
  if (!profileData || profileData.length === 0) {
    return { error: new Error("Phone number not found") };
  }
  
  // Sign in with email and password
  const { error } = await supabase.auth.signInWithPassword({
    email: profileData[0].email,
    password,
  });
  
  return { error };
};
```

#### 4. Password Reset

```typescript
const resetPassword = async (email) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  return { error };
};
```

### Protected Routes

In `src/App.tsx`, routes are protected using the `useAuth` hook:

```typescript
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
}
```

### Admin Routes

Admin access is determined by email:

```typescript
// In components
const { profile } = useAuth();
const isAdmin = profile?.email === 'johnnybgsu@gmail.com';

// In database (RLS policy)
CREATE POLICY "Admin access" ON table_name
FOR ALL USING (public.is_admin());
```

## 🧩 Component Structure

### Component Hierarchy

```
App
├── AuthProvider
│   └── Routes
│       ├── Index (Landing Page)
│       ├── Auth (Login/Register)
│       ├── Dashboard
│       │   ├── RecentInvoices
│       │   ├── RecentReceipts
│       │   ├── CreateReceiptDialog
│       │   └── PaywallModal
│       ├── CreateInvoice
│       │   └── TemplateSelection
│       ├── Customers
│       │   └── CustomerListComponent
│       ├── Profile
│       │   └── SubscriptionDialog
│       ├── AdminDashboard
│       │   ├── AdminInvoicesList
│       │   └── AdminReceiptsList
│       └── NotFound
```

### Key Components

#### 1. Dashboard (`src/pages/Dashboard.tsx`)

**Purpose:** Main user dashboard showing statistics and recent activity.

**Features:**
- Total and monthly invoice/receipt counts
- Revenue tracking (all-time and monthly)
- Usage limit display with progress bar
- Quick actions (Create Invoice/Receipt)
- Recent invoices and receipts lists
- Paywall modal for free tier limits

**State Management:**
```typescript
const [stats, setStats] = useState({
  totalInvoices: 0,
  totalReceipts: 0,
  monthlyInvoices: 0,
  totalRevenue: 0,
  monthlyRevenue: 0
});
const [currentMonthUsage, setCurrentMonthUsage] = useState(0);
const [usageLimitReached, setUsageLimitReached] = useState(false);
```

#### 2. CreateInvoice (`src/pages/CreateInvoice.tsx`)

**Purpose:** Multi-step invoice creation form.

**Steps:**
1. Form input (invoice details, items, customer info)
2. Template selection
3. Preview and save

**Form Structure:**
```typescript
interface InvoiceForm {
  invoiceNumber: string;
  invoiceDate: string;
  paymentDate: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  companyName: string;
  companyPhone: string;
  companyAddress: string;
  taxRate: number;
  items: InvoiceFormItem[];
}
```

**Key Features:**
- Dynamic item array (add/remove items)
- Real-time calculation (subtotal, tax, total)
- Pre-fill from customer database
- Phone input with formatting
- Template preview before saving

#### 3. TemplateSelection (`src/components/TemplateSelection.tsx`)

**Purpose:** Visual template picker with live preview.

**Features:**
- Grid of 9 invoice templates
- Live preview with actual invoice data
- Click to select template
- Navigation back to form

**Template Registry:**
```typescript
// src/utils/templateRegistry.ts
const templates: Record<number, TemplateComponent> = {
  1: Template1,
  2: Template2,
  // ... up to 9
};

export const getTemplate = (templateNumber: number) => {
  return templates[templateNumber] || templates[1];
};
```

#### 4. InvoiceViewer (`src/components/InvoiceViewer.tsx`)

**Purpose:** Display and share generated invoices.

**Actions:**
- Download as JPEG
- Share via WhatsApp
- Export as CSV
- Export as XML
- Edit invoice
- Delete invoice

**Image Generation:**
```typescript
// src/utils/imageGeneration.ts
export const generateInvoiceImage = async (elementId: string): Promise<Blob> => {
  const element = document.getElementById(elementId);
  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: '#ffffff',
    useCORS: true,
  });
  
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to generate image'));
    }, 'image/jpeg', 0.9);
  });
};
```

#### 5. CustomerListComponent (`src/components/CustomerListComponent.tsx`)

**Purpose:** Customer database management.

**Features:**
- CRUD operations (Create, Read, Update, Delete)
- Search and filter
- Transaction history per customer
- Quick create invoice/receipt for customer
- Phone number normalization

#### 6. PaywallModal (`src/components/PaywallModal.tsx`)

**Purpose:** Subscription prompt when usage limit is reached.

**Triggers:**
- Free user creates 10th document in a month
- Automatic detection on dashboard

**Actions:**
- View subscription plans
- Initiate payment via Paystack
- Dismiss (blocks further document creation)

### UI Components (shadcn)

Located in `src/components/ui/`, these are reusable components:

- **button.tsx** - Button with variants (default, outline, ghost, destructive, cta)
- **card.tsx** - Card container with header, content, footer
- **dialog.tsx** - Modal dialogs
- **input.tsx** - Form inputs
- **label.tsx** - Form labels
- **select.tsx** - Dropdowns
- **table.tsx** - Data tables
- **toast.tsx** - Notifications
- **phone-input.tsx** - Nigerian phone number input with formatting
- **passcode-input.tsx** - 4-digit passcode input (legacy)
- **logo.tsx** - App logo component with size variants

### Custom Phone Input Component

```typescript
// src/components/ui/phone-input.tsx
export const PhoneInput = ({ value, onChange, label, required }: PhoneInputProps) => {
  const [countryCode, setCountryCode] = useState('+234');
  const [networkCode, setNetworkCode] = useState('');
  const [firstPart, setFirstPart] = useState('');
  const [lastPart, setLastPart] = useState('');
  
  // Combines parts: +234 803 123 4567
  useEffect(() => {
    const fullNumber = `${countryCode}${networkCode}${firstPart}${lastPart}`;
    onChange?.(fullNumber);
  }, [countryCode, networkCode, firstPart, lastPart]);
  
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex gap-1">
        <Input value={countryCode} readOnly maxLength={4} />
        <Input 
          placeholder="803"
          value={networkCode}
          onChange={(e) => setNetworkCode(e.target.value)}
          maxLength={3}
        />
        <Input 
          placeholder="123"
          value={firstPart}
          onChange={(e) => setFirstPart(e.target.value)}
          maxLength={3}
        />
        <Input 
          placeholder="4567"
          value={lastPart}
          onChange={(e) => setLastPart(e.target.value)}
          maxLength={4}
        />
      </div>
    </div>
  );
};
```

## 🚀 Key Features Implementation

### 1. Invoice Creation Flow

```typescript
// Step 1: User fills form in CreateInvoice.tsx
const onSubmit = async (data: InvoiceForm) => {
  // Calculate totals
  const subTotal = data.items.reduce((sum, item) => 
    sum + (item.quantity * item.unitPrice), 0);
  const taxAmount = (subTotal * data.taxRate) / 100;
  const totalAmount = subTotal + taxAmount;
  
  // Create invoice data object
  const invoiceData: InvoiceData = {
    invoiceNumber: data.invoiceNumber || `INV-${Date.now()}`,
    invoiceDate: data.invoiceDate,
    customerName: data.customerName,
    items: data.items.map((item, index) => ({
      id: `item-${index}`,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.quantity * item.unitPrice
    })),
    subTotal,
    taxRate: data.taxRate,
    totalAmount
  };
  
  // Move to template selection
  setInvoiceData(invoiceData);
  setCurrentStep('template');
};

// Step 2: User selects template
const handleTemplateSelection = async (templateId: number) => {
  // Insert invoice record
  const { data: invoice, error } = await supabase
    .from('invoices')
    .insert({
      user_id: user.id,
      customer_name: invoiceData.customerName,
      // ... other fields
      template_id: templateId,
      amount: invoiceData.totalAmount,
    })
    .select()
    .single();
  
  // Insert invoice items
  const itemsToInsert = invoiceData.items.map(item => ({
    invoice_id: invoice.id,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    total_price: item.totalPrice
  }));
  
  await supabase.from('invoice_items').insert(itemsToInsert);
  
  // Navigate to dashboard
  navigate('/dashboard');
};
```

### 2. WhatsApp Sharing

```typescript
// src/utils/imageGeneration.ts
export const shareImageViaWhatsApp = async (
  blob: Blob, 
  message: string, 
  phoneNumber: string
) => {
  try {
    // Check if running in Android app
    if ('AndroidShare' in window && (window as any).AndroidShare) {
      const objectUrl = URL.createObjectURL(blob);
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      (window as any).AndroidShare.shareToWhatsApp(cleanPhone, objectUrl, message);
      return;
    }
    
    // For web: Download image and open WhatsApp
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    
    // Download image first
    downloadImage(blob, 'receipt.jpg');
    
    // Then open WhatsApp
    window.open(whatsappUrl, '_blank');
  } catch (error) {
    console.error('Error sharing via WhatsApp:', error);
    throw new Error('Unable to share. Please try again.');
  }
};
```

### 3. Usage Limit Enforcement

```typescript
// Client-side check (Dashboard.tsx)
const fetchCurrentMonthUsage = async () => {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [invoicesResponse, receiptsResponse] = await Promise.all([
    supabase
      .from('invoices')
      .select('id')
      .eq('user_id', user?.id)
      .gte('created_at', firstDayOfMonth.toISOString())
      .lt('created_at', firstDayOfNextMonth.toISOString()),
    supabase
      .from('receipts')
      .select('id')
      .eq('user_id', user?.id)
      .gte('created_at', firstDayOfMonth.toISOString())
      .lt('created_at', firstDayOfNextMonth.toISOString())
  ]);

  const totalMonthlyUsage = 
    (invoicesResponse.data?.length || 0) +
    (receiptsResponse.data?.length || 0);
  
  setCurrentMonthUsage(totalMonthlyUsage);
  
  const limitReached = 
    profile?.subscription_type === 'free' && 
    totalMonthlyUsage >= 10;
  
  setUsageLimitReached(limitReached);
  setShowPaywall(limitReached);
};

// Server-side enforcement (Database function)
-- Used in RLS policies
CREATE POLICY "Users can create invoices if within limit"
ON invoices FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  public.check_usage_limit(auth.uid(), 'invoice')
);
```

### 4. Payment Processing (Paystack)

#### Initialize Payment

```typescript
// supabase/functions/initialize-payment/index.ts
const handler = async (req: Request): Promise<Response> => {
  const { email, amount, planType } = await req.json();
  
  const reference = `NR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const response = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('PAYSTACK_SECRET_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      amount: amount * 100, // Paystack uses kobo
      reference,
      metadata: { planType },
      callback_url: `${req.headers.get('origin')}/payment-callback`
    })
  });
  
  const data = await response.json();
  
  return new Response(JSON.stringify({
    authorization_url: data.data.authorization_url,
    reference: data.data.reference
  }));
};
```

#### Verify Payment

```typescript
// supabase/functions/verify-payment/index.ts
const handler = async (req: Request): Promise<Response> => {
  const { reference } = await req.json();
  
  // Verify with Paystack
  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      headers: {
        'Authorization': `Bearer ${Deno.env.get('PAYSTACK_SECRET_KEY')}`,
      }
    }
  );
  
  const data = await response.json();
  
  if (data.data.status === 'success') {
    const planType = data.data.metadata.planType;
    
    // Calculate expiry
    const expiryDate = new Date();
    if (planType === 'monthly') {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    } else if (planType === 'yearly') {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    }
    
    // Update user profile
    const authHeader = req.headers.get('Authorization');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_ANON_KEY'),
      { global: { headers: { Authorization: authHeader } } }
    );
    
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    await supabaseClient
      .from('profiles')
      .update({
        subscription_type: planType,
        subscription_expires: expiryDate.toISOString()
      })
      .eq('user_id', user.id);
    
    return new Response(JSON.stringify({ success: true }));
  }
  
  return new Response(
    JSON.stringify({ success: false, message: 'Payment not verified' }),
    { status: 400 }
  );
};
```

### 5. Export Features

#### CSV Export

```typescript
// src/components/ExportCSV.tsx
export const generateCSV = (invoices: Invoice[]): string => {
  const headers = [
    'Invoice Number',
    'Date',
    'Customer Name',
    'Customer Phone',
    'Amount',
    'Status'
  ];
  
  const rows = invoices.map(inv => [
    inv.invoice_number,
    inv.invoice_date,
    inv.customer_name,
    inv.customer_phone,
    inv.amount,
    inv.status
  ]);
  
  return [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
};

export const downloadCSV = (csvContent: string, filename: string) => {
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
};
```

#### XML Export

```typescript
// src/utils/xmlUtils.ts
export const generateInvoiceXML = (invoice: Invoice, items: InvoiceItem[]): string => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice>
  <Header>
    <InvoiceNumber>${invoice.invoice_number}</InvoiceNumber>
    <InvoiceDate>${invoice.invoice_date}</InvoiceDate>
    <CustomerName>${invoice.customer_name}</CustomerName>
    <CustomerPhone>${invoice.customer_phone}</CustomerPhone>
  </Header>
  <Items>
    ${items.map(item => `
    <Item>
      <Description>${item.description}</Description>
      <Quantity>${item.quantity}</Quantity>
      <UnitPrice>${item.unit_price}</UnitPrice>
      <TotalPrice>${item.total_price}</TotalPrice>
    </Item>`).join('')}
  </Items>
  <Summary>
    <SubTotal>${invoice.sub_total}</SubTotal>
    <TaxRate>${invoice.tax_rate}</TaxRate>
    <TotalAmount>${invoice.amount}</TotalAmount>
  </Summary>
</Invoice>`;
};
```

## 📚 Code Examples

### Example 1: Creating a New Template

```typescript
// 1. Create template component
// src/components/templates/Template10.tsx
import { InvoiceData } from '@/utils/templateRegistry';

const Template10: React.FC<{ data: InvoiceData }> = ({ data }) => {
  return (
    <div className="p-8 bg-white">
      {/* Header */}
      <div className="flex justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-600">
            {data.companyName}
          </h1>
          <p>{data.companyAddress}</p>
          <p>{data.companyPhone}</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-semibold">INVOICE</h2>
          <p>#{data.invoiceNumber}</p>
          <p>{new Date(data.invoiceDate).toLocaleDateString()}</p>
        </div>
      </div>
      
      {/* Customer Info */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Bill To:</h3>
        <p>{data.customerName}</p>
        <p>{data.customerPhone}</p>
        {data.customerEmail && <p>{data.customerEmail}</p>}
      </div>
      
      {/* Items Table */}
      <table className="w-full mb-6">
        <thead>
          <tr className="border-b-2">
            <th className="text-left py-2">Description</th>
            <th className="text-right py-2">Qty</th>
            <th className="text-right py-2">Price</th>
            <th className="text-right py-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="py-2">{item.description}</td>
              <td className="text-right">{item.quantity}</td>
              <td className="text-right">₦{item.unitPrice.toLocaleString()}</td>
              <td className="text-right">₦{item.totalPrice.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-64">
          <div className="flex justify-between py-2">
            <span>Subtotal:</span>
            <span>₦{data.subTotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-2">
            <span>Tax ({data.taxRate}%):</span>
            <span>₦{((data.totalAmount - data.subTotal)).toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-2 border-t-2 font-bold">
            <span>Total:</span>
            <span>₦{data.totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Template10;

// 2. Register in templateRegistry.ts
// src/utils/templateRegistry.ts
import Template10 from '@/components/templates/Template10';

const templates: Record<number, TemplateComponent> = {
  1: Template1,
  // ... existing templates
  10: Template10, // Add new template
};

// 3. Update getAvailableTemplates if needed
export const getAvailableTemplates = () => {
  return Object.keys(templates).map(Number); // Returns [1,2,3...10]
};
```

### Example 2: Adding a New Database Table

```sql
-- 1. Create migration file
-- supabase/migrations/YYYYMMDDHHMMSS_create_notes_table.sql

-- Create notes table
CREATE TABLE public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index
CREATE INDEX idx_notes_user_id ON public.notes(user_id);

-- Enable RLS
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notes"
ON public.notes FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notes"
ON public.notes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
ON public.notes FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
ON public.notes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
```

```typescript
// 2. Create TypeScript types
// src/types/notes.ts
export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
}

// 3. Create component to use it
// src/components/NotesManager.tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Note } from '@/types/notes';

export const NotesManager = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  
  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user]);
  
  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setNotes(data);
    }
  };
  
  const createNote = async (title: string, content: string) => {
    const { error } = await supabase
      .from('notes')
      .insert({
        user_id: user?.id,
        title,
        content
      });
    
    if (!error) {
      fetchNotes();
    }
  };
  
  return (
    <div>
      {/* UI implementation */}
    </div>
  );
};
```

### Example 3: Creating a Custom Hook

```typescript
// src/hooks/useInvoices.tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  amount: number;
  created_at: string;
}

export const useInvoices = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (user) {
      fetchInvoices();
    }
  }, [user]);
  
  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setInvoices(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const createInvoice = async (invoiceData: Partial<Invoice>) => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .insert({
          user_id: user?.id,
          ...invoiceData
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Refresh list
      await fetchInvoices();
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };
  
  const deleteInvoice = async (id: string) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Refresh list
      await fetchInvoices();
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };
  
  return {
    invoices,
    loading,
    error,
    fetchInvoices,
    createInvoice,
    deleteInvoice
  };
};

// Usage in component
import { useInvoices } from '@/hooks/useInvoices';

const MyComponent = () => {
  const { invoices, loading, createInvoice } = useInvoices();
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {invoices.map(invoice => (
        <div key={invoice.id}>{invoice.invoice_number}</div>
      ))}
    </div>
  );
};
```

## 🧪 Testing Strategies

### Manual Testing Checklist

#### Authentication Tests
- [ ] Sign up with email
- [ ] Sign in with email
- [ ] Sign in with phone number
- [ ] Password reset flow
- [ ] Auto-redirect after login
- [ ] Session persistence across page refresh
- [ ] Sign out functionality

#### Invoice Creation Tests
- [ ] Create invoice with single item
- [ ] Create invoice with multiple items
- [ ] Add/remove items dynamically
- [ ] Tax calculation accuracy
- [ ] Template selection and preview
- [ ] Invoice saves to database
- [ ] Invoice appears in dashboard

#### Receipt Creation Tests
- [ ] Create quick receipt
- [ ] Receipt saves correctly
- [ ] Receipt appears in dashboard

#### Customer Management Tests
- [ ] Create new customer
- [ ] Update customer details
- [ ] Delete customer
- [ ] Search customers
- [ ] View customer transaction history
- [ ] Create invoice for existing customer

#### Payment Tests
- [ ] Initialize payment (Paystack sandbox)
- [ ] Verify payment callback
- [ ] Subscription updated after payment
- [ ] Usage limit removed for paid users

#### Export Tests
- [ ] Download invoice as JPEG
- [ ] Export invoices as CSV
- [ ] Export invoices as XML
- [ ] Share via WhatsApp (web)
- [ ] Share via WhatsApp (Android app)

#### Usage Limit Tests
- [ ] Free user hits 10 document limit
- [ ] Paywall appears correctly
- [ ] Document creation blocked
- [ ] Counter resets at month start
- [ ] Paid user has unlimited access

#### Admin Tests
- [ ] Admin can access admin dashboard
- [ ] Admin can view all invoices/receipts
- [ ] Non-admin cannot access admin routes
- [ ] Admin email verification works

### Automated Testing (Future Enhancement)

```typescript
// Example unit test structure (not currently implemented)
// tests/utils/invoiceCalculations.test.ts
import { describe, it, expect } from 'vitest';
import { 
  calculateSubTotal, 
  calculateTaxAmount, 
  calculateGrandTotal 
} from '@/utils/invoiceCalculations';

describe('Invoice Calculations', () => {
  it('calculates subtotal correctly', () => {
    const items = [
      { quantity: 2, unitPrice: 100, totalPrice: 200 },
      { quantity: 1, unitPrice: 50, totalPrice: 50 }
    ];
    expect(calculateSubTotal(items)).toBe(250);
  });
  
  it('calculates tax amount correctly', () => {
    const subTotal = 1000;
    const taxRate = 7.5;
    expect(calculateTaxAmount(subTotal, taxRate)).toBe(75);
  });
  
  it('calculates grand total correctly', () => {
    const subTotal = 1000;
    const taxAmount = 75;
    expect(calculateGrandTotal(subTotal, taxAmount)).toBe(1075);
  });
});
```

### Integration Testing Approach

1. **Database Operations**: Test CRUD operations with Supabase
2. **Edge Functions**: Test with local Supabase CLI
3. **Payment Flow**: Use Paystack test keys
4. **Authentication**: Test all auth flows
5. **File Upload**: Test storage bucket operations

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. Authentication Issues

**Problem:** User can't log in with phone number

**Solution:**
- Check `get_profile_by_phone()` function is deployed
- Verify phone number normalization (spaces, country code)
- Check RLS policies on profiles table
- Ensure phone column is indexed

**Debug:**
```typescript
// Add console logs in signInWithPhone
console.log('Normalized phone:', normalizedPhone);
console.log('Profile data:', profileData);
```

#### 2. Invoice Not Saving

**Problem:** Invoice form submits but doesn't save to database

**Solution:**
- Check RLS policies allow INSERT
- Verify user is authenticated
- Check usage limit hasn't been reached
- Ensure all required fields are provided

**Debug:**
```typescript
// Check response
const { data, error } = await supabase.from('invoices').insert(...);
console.log('Insert result:', { data, error });
```

#### 3. Usage Limit Not Working

**Problem:** Free users can create more than 3 documents

**Solution:**
- Verify `check_usage_limit()` function exists
- Check function is called in RLS policy
- Ensure invoice_count and receipt_count are incrementing
- Check subscription_type is set correctly

**Debug:**
```sql
-- Check user's current counts
SELECT invoice_count, receipt_count, subscription_type
FROM profiles
WHERE user_id = 'user-uuid-here';
```

#### 4. WhatsApp Sharing Not Working

**Problem:** WhatsApp button doesn't work

**Solution:**
- Ensure phone number is properly formatted
- Check if running on mobile vs desktop
- Verify image generation is successful
- Check browser permissions for downloads

**Debug:**
```typescript
// Test image generation
try {
  const blob = await generateInvoiceImage('invoice-element-id');
  console.log('Image blob:', blob);
} catch (error) {
  console.error('Image generation failed:', error);
}
```

#### 5. Payment Verification Fails

**Problem:** Payment successful but subscription not updated

**Solution:**
- Check Paystack webhook/callback URL is correct
- Verify `verify-payment` edge function is deployed
- Check edge function logs in Supabase dashboard
- Ensure Paystack secret key is set in Supabase secrets

**Debug:**
```typescript
// Check edge function logs
// In Supabase dashboard: Functions > verify-payment > Logs
```

#### 6. Template Not Displaying

**Problem:** Selected template doesn't render

**Solution:**
- Verify template is registered in `templateRegistry.ts`
- Check template component doesn't have errors
- Ensure invoice data structure matches template props
- Check console for React errors

**Debug:**
```typescript
// Check template registry
import { getTemplate } from '@/utils/templateRegistry';
const Template = getTemplate(1);
console.log('Template component:', Template);
```

#### 7. RLS Policy Errors

**Problem:** "new row violates row-level security policy"

**Solution:**
- Ensure user_id is set to auth.uid() in INSERT
- Check WITH CHECK clause in policy
- Verify user is authenticated
- Check policy applies to correct operation (SELECT, INSERT, UPDATE, DELETE)

**Debug:**
```sql
-- Test policy directly
SELECT * FROM invoices; -- Should only show user's invoices
```

#### 8. Database Function Recursion Error

**Problem:** "infinite recursion detected in policy"

**Solution:**
- Use SECURITY DEFINER functions for admin checks
- Don't query the same table in its RLS policy
- Use helper functions instead of direct queries

**Example:**
```sql
-- WRONG (causes recursion)
CREATE POLICY "Admin access"
ON profiles FOR SELECT
USING (
  (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin'
);

-- RIGHT (uses security definer function)
CREATE POLICY "Admin access"
ON profiles FOR SELECT
USING (public.is_admin());
```

### Performance Optimization Tips

1. **Database Indexes**: Ensure all foreign keys and frequently queried columns are indexed
2. **Query Optimization**: Use `.select()` to fetch only needed columns
3. **Lazy Loading**: Load images and components on demand
4. **Caching**: Use React Query or similar for data caching
5. **Image Optimization**: Compress generated JPEG images
6. **Bundle Size**: Code split large components

### Debugging Tools

1. **Browser DevTools**
   - Network tab for API calls
   - Console for errors
   - React DevTools for component state

2. **Supabase Dashboard**
   - Table editor for data inspection
   - SQL Editor for manual queries
   - Logs Viewer for edge function logs
   - Auth Users for user management

3. **Lovable Dev Mode**
   - Real-time code editing
   - Hot module replacement
   - Error overlay

## 🤝 Contributing Guidelines

### Code Style

1. **TypeScript**: Use TypeScript for all new code
2. **Components**: Functional components with hooks
3. **Naming**: PascalCase for components, camelCase for functions
4. **Comments**: JSDoc comments for functions, inline for complex logic
5. **Imports**: Organize imports (React, external libs, internal, styles)

### Git Workflow

1. Create feature branch from `main`
2. Make changes with descriptive commits
3. Test thoroughly
4. Push and create pull request
5. Code review and merge

### Commit Messages

```
feat: Add customer export feature
fix: Resolve WhatsApp sharing on Android
docs: Update README with deployment steps
refactor: Simplify invoice calculation logic
test: Add unit tests for template registry
```

### Adding New Features

1. **Plan**: Document feature requirements
2. **Database**: Create migration if needed
3. **Types**: Define TypeScript interfaces
4. **Components**: Build UI components
5. **Logic**: Implement business logic
6. **Test**: Manual and automated testing
7. **Document**: Update this guide

---

## 📞 Support

For technical support or questions:
- **Email**: johnnybgsu@gmail.com
- **Documentation**: This guide
- **Supabase Docs**: https://supabase.com/docs

---

**Last Updated:** 2025-01-10
**Version:** 1.0.0
**Maintainer:** OmniReceipts Development Team


