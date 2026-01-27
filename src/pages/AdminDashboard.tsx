import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, Users, FileText, Receipt, ClipboardList } from 'lucide-react';
import { AdminInvoicesList } from '@/components/AdminInvoicesList';
import { AdminReceiptsList } from '@/components/AdminReceiptsList';
import { AdminQuotationsList } from '@/components/AdminQuotationsList';
import { TemplateAnalytics } from '@/components/TemplateAnalytics';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  user_id: string;
  artisan_name: string;
  business_name: string | null;
  phone: string;
  email: string | null;
  role: string;
  subscription_type: string;
  subscription_expires: string | null;
  payment_verified: boolean;
  last_payment_reference: string | null;
  last_payment_date: string | null;
  created_at: string;
  updated_at: string;
  referral_source: string | null;
  monthly_invoice_count?: number;
  monthly_receipt_count?: number;
  monthly_quotation_count?: number;
  monthly_revenue?: number;
}

interface Invoice {
  id: string;
  user_id: string;
  invoice_number: string;
  customer_name: string;
  amount: number;
  status: string;
  created_at: string;
  artisan_email?: string;
}

interface Receipt {
  id: string;
  user_id: string;
  receipt_number: string;
  customer_name: string;
  amount: number;
  created_at: string;
  artisan_email?: string;
}

interface PaymentTransaction {
  id: string;
  user_id: string;
  artisan_email: string;
  artisan_name: string;
  subscription_type: string;
  amount: number;
  payment_reference: string;
  payment_status: string;
  subscription_expires: string;
  payment_date: string;
  gateway: string;
}

interface Quotation {
  id: string;
  user_id: string;
  quotation_number: string;
  customer_name: string;
  amount: number;
  status: string;
  created_at: string;
  quotation_date: string;
  valid_until: string;
  artisan_email?: string;
}

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userSortField, setUserSortField] = useState<keyof UserProfile>('created_at');
  const [userSortDirection, setUserSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 20;

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        navigate('/auth');
        return;
      }

      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges",
          variant: "destructive",
        });
        navigate('/dashboard');
        return;
      }

      setIsAdmin(true);
      await fetchData();
    };

    checkAdminStatus();
  }, [user, navigate]);

const fetchData = async () => {
  try {
    setLoading(true);
    
    // Get current month start and end dates
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
    
    // Fetch all users with RLS bypass for admin
   const { data: usersData, error: usersError } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
    
    if (usersError) {
      console.error('Users error:', usersError);
      throw usersError;
    }

    console.log('Fetched users:', usersData?.length);

    // Fetch all invoices
    const { data: invoicesData, error: invoicesError } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false });

    // Fetch all receipts
    const { data: receiptsData, error: receiptsError } = await supabase
      .from('receipts')
      .select('*')
      .order('created_at', { ascending: false });

    // Fetch all quotations
    const { data: quotationsData, error: quotationsError } = await supabase
      .from('quotations')
      .select('*')
      .order('created_at', { ascending: false });

    // Create a lookup map for user emails, monthly counts, and revenue
    const userEmailMap = new Map();
    const monthlyInvoiceCounts = new Map();
    const monthlyReceiptCounts = new Map();
    const monthlyQuotationCounts = new Map();
    const monthlyRevenue = new Map();
    
    usersData?.forEach(user => {
      userEmailMap.set(user.user_id, user.email);
      monthlyInvoiceCounts.set(user.user_id, 0);
      monthlyReceiptCounts.set(user.user_id, 0);
      monthlyQuotationCounts.set(user.user_id, 0);
      monthlyRevenue.set(user.user_id, 0);
    });

    // Count invoices and calculate revenue for current month per user
    invoicesData?.forEach(invoice => {
      const createdAt = new Date(invoice.created_at);
      if (createdAt >= new Date(currentMonthStart) && createdAt < new Date(nextMonthStart)) {
        const currentCount = monthlyInvoiceCounts.get(invoice.user_id) || 0;
        monthlyInvoiceCounts.set(invoice.user_id, currentCount + 1);
        
        const currentRevenue = monthlyRevenue.get(invoice.user_id) || 0;
        monthlyRevenue.set(invoice.user_id, currentRevenue + (invoice.amount || 0));
      }
    });

    // Count quotations for current month per user
    quotationsData?.forEach(quotation => {
      const createdAt = new Date(quotation.created_at);
      if (createdAt >= new Date(currentMonthStart) && createdAt < new Date(nextMonthStart)) {
        const currentCount = monthlyQuotationCounts.get(quotation.user_id) || 0;
        monthlyQuotationCounts.set(quotation.user_id, currentCount + 1);
      }
    });

    // Count receipts and calculate revenue for current month per user
    receiptsData?.forEach(receipt => {
      const createdAt = new Date(receipt.created_at);
      if (createdAt >= new Date(currentMonthStart) && createdAt < new Date(nextMonthStart)) {
        const currentCount = monthlyReceiptCounts.get(receipt.user_id) || 0;
        monthlyReceiptCounts.set(receipt.user_id, currentCount + 1);
        
        const currentRevenue = monthlyRevenue.get(receipt.user_id) || 0;
        monthlyRevenue.set(receipt.user_id, currentRevenue + (receipt.amount || 0));
      }
    });

    // Transform users data to create payment transactions for paid subscriptions
    const paidSubscriptions = usersData?.filter(user => 
      user.subscription_type !== 'free' && 
      user.payment_verified && 
      user.last_payment_reference
    ) || [];

    const transformedTransactions = paidSubscriptions.map(user => ({
      id: user.id,
      user_id: user.user_id,
      artisan_email: user.email,
      artisan_name: user.artisan_name,
      subscription_type: user.subscription_type,
      amount: user.subscription_type === 'monthly' ? 2000 : 20000,
      payment_reference: user.last_payment_reference,
      payment_status: user.payment_verified ? 'success' : 'pending',
      subscription_expires: user.subscription_expires,
      payment_date: (user as any).last_payment_date || user.updated_at, // Use dedicated payment date field
      gateway: 'paystack'
    }));
    
    // Transform users data to include monthly counts, revenue, referral_source and last_payment_date
    const transformedUsers = usersData?.map(user => ({
      ...user,
      last_payment_date: (user as any).last_payment_date || null,
      referral_source: (user as any).referral_source || null,
      monthly_invoice_count: monthlyInvoiceCounts.get(user.user_id) || 0,
      monthly_receipt_count: monthlyReceiptCounts.get(user.user_id) || 0,
      monthly_quotation_count: monthlyQuotationCounts.get(user.user_id) || 0,
      monthly_revenue: monthlyRevenue.get(user.user_id) || 0,
    })) || [];

    // Transform invoices data to include artisan email
    const transformedInvoices = invoicesData?.map(invoice => ({
      ...invoice,
      artisan_email: userEmailMap.get(invoice.user_id)
    })) || [];
    
    // Transform receipts data to include artisan email
    const transformedReceipts = receiptsData?.map(receipt => ({
      ...receipt,
      artisan_email: userEmailMap.get(receipt.user_id)
    })) || [];

    // Transform quotations data to include artisan email
    const transformedQuotations = quotationsData?.map(quotation => ({
      ...quotation,
      artisan_email: userEmailMap.get(quotation.user_id)
    })) || [];
    
    setUsers(transformedUsers);
    setInvoices(transformedInvoices);
    setReceipts(transformedReceipts);
    setQuotations(transformedQuotations);
    setTransactions(transformedTransactions);
  } catch (error: any) {
    console.error('Fetch error:', error);
    toast({
      title: "Error fetching data",
      description: error.message,
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (!isAdmin || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const filteredAndSortedUsers = users
    .filter(user => 
      user.artisan_name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.business_name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.phone.includes(userSearchTerm) ||
      user.referral_source?.toLowerCase().includes(userSearchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aVal = a[userSortField];
      const bVal = b[userSortField];
      const direction = userSortDirection === 'asc' ? 1 : -1;
      
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return aVal.localeCompare(bVal) * direction;
      }
      return (aVal > bVal ? 1 : -1) * direction;
    });

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedUsers.length / usersPerPage);
  const paginatedUsers = filteredAndSortedUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  // Reset to page 1 when search changes
  const handleSearchChange = (value: string) => {
    setUserSearchTerm(value);
    setCurrentPage(1);
  };
  
  const handleSort = (field: keyof UserProfile) => {
    if (userSortField === field) {
      setUserSortDirection(userSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setUserSortField(field);
      setUserSortDirection('asc');
    }
  };
  
  const exportUsersToCSV = () => {
    const headers = ['Artisan Name', 'Business Name', 'Email', 'Phone', 'Role', 'Subscription', 'Referral Source', 'Invoices (Month)', 'Quotations (Month)', 'Receipts (Month)', 'Monthly Revenue', 'Joined'];
    const rows = filteredAndSortedUsers.map(user => [
      user.artisan_name,
      user.business_name || 'N/A',
      user.email,
      user.phone,
      user.role,
      user.subscription_type,
      user.referral_source || 'N/A',
      user.monthly_invoice_count || 0,
      user.monthly_quotation_count || 0,
      user.monthly_receipt_count || 0,
      (user.monthly_revenue || 0),
      new Date(user.created_at).toLocaleDateString()
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };
  // Calculate subscription revenue from actual payments
  const totalSubscriptionRevenue = transactions.reduce((sum, transaction) => {
    return sum + transaction.amount;
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <div className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="text-xl font-bold text-primary">Admin Dashboard</h1>
          <Button onClick={handleSignOut} variant="outline" size="sm">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{invoices.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Receipts</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{receipts.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Quotations</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{quotations.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{totalSubscriptionRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">from verified subscription payments</p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Breakdown */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Users with Paid Subscriptions</CardTitle>
            <CardDescription>List of users with active paid subscriptions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              {transactions.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Artisan</th>
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Subscription</th>
                      <th className="text-left p-2">Amount</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Payment Ref</th>
                      <th className="text-left p-2">Expires</th>
                      <th className="text-left p-2">Days Used</th>
                      <th className="text-left p-2">Payment Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b">
                        <td className="p-2 font-medium">{transaction.artisan_name}</td>
                        <td className="p-2">{transaction.artisan_email}</td>
                        <td className="p-2">
                          <Badge variant={transaction.subscription_type === 'yearly' ? 'default' : 'secondary'}>
                            {transaction.subscription_type}
                          </Badge>
                        </td>
                        <td className="p-2 font-semibold">₦{Number(transaction.amount).toLocaleString()}</td>
                        <td className="p-2">
                          <Badge variant={transaction.payment_status === 'success' ? 'default' : 'destructive'}>
                            {transaction.payment_status}
                          </Badge>
                        </td>
                        <td className="p-2 text-xs font-mono">{transaction.payment_reference}</td>
                        <td className="p-2">{transaction.subscription_expires ? new Date(transaction.subscription_expires).toLocaleDateString() : 'N/A'}</td>
                        <td className="p-2">
                          {(() => {
                            if (!transaction.subscription_expires) return 'N/A';
                            const totalDays = transaction.subscription_type === 'yearly' ? 365 : 30;
                            const startDate = new Date(transaction.payment_date);
                            const endDate = new Date(transaction.subscription_expires);
                            const today = new Date();
                            const elapsedMs = today.getTime() - startDate.getTime();
                            const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
                            const daysUsed = Math.min(Math.max(elapsedDays, 0), totalDays);
                            return `${daysUsed}/${totalDays}`;
                          })()}
                        </td>
                        <td className="p-2">{new Date(transaction.payment_date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No payment transactions found
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Template Analytics */}
        <div className="mb-8">
          <TemplateAnalytics />
        </div>

        {/* Users Table */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Users</CardTitle>
                <CardDescription>Manage all registered users ({filteredAndSortedUsers.length} total)</CardDescription>
              </div>
              <Button onClick={exportUsersToCSV} variant="outline" size="sm">
                Export to CSV
              </Button>
            </div>
            <div className="mt-4">
              <input
                type="text"
                placeholder="Search users by name, email, business, phone, or referral source..."
                value={userSearchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full min-w-[1750px]">
                <thead className="sticky top-0 bg-background">
                  <tr className="border-b">
                    <th className="text-left p-2 cursor-pointer hover:bg-muted/50" onClick={() => handleSort('artisan_name')}>
                      Artisan Name {userSortField === 'artisan_name' && (userSortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="text-left p-2 cursor-pointer hover:bg-muted/50" onClick={() => handleSort('business_name')}>
                      Business Name {userSortField === 'business_name' && (userSortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="text-left p-2 cursor-pointer hover:bg-muted/50" onClick={() => handleSort('email')}>
                      Email {userSortField === 'email' && (userSortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="text-left p-2 cursor-pointer hover:bg-muted/50" onClick={() => handleSort('phone')}>
                      Phone {userSortField === 'phone' && (userSortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="text-left p-2 cursor-pointer hover:bg-muted/50" onClick={() => handleSort('referral_source')}>
                      Referral Source {userSortField === 'referral_source' && (userSortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="text-left p-2 cursor-pointer hover:bg-muted/50" onClick={() => handleSort('role')}>
                      Role {userSortField === 'role' && (userSortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="text-left p-2 cursor-pointer hover:bg-muted/50" onClick={() => handleSort('subscription_type')}>
                      Subscription {userSortField === 'subscription_type' && (userSortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="text-left p-2 cursor-pointer hover:bg-muted/50" onClick={() => handleSort('monthly_invoice_count')}>
                      Invoices {userSortField === 'monthly_invoice_count' && (userSortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="text-left p-2 cursor-pointer hover:bg-muted/50" onClick={() => handleSort('monthly_quotation_count')}>
                      Quotations {userSortField === 'monthly_quotation_count' && (userSortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="text-left p-2 cursor-pointer hover:bg-muted/50" onClick={() => handleSort('monthly_receipt_count')}>
                      Receipts {userSortField === 'monthly_receipt_count' && (userSortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="text-left p-2 cursor-pointer hover:bg-muted/50" onClick={() => handleSort('monthly_revenue')}>
                      Revenue {userSortField === 'monthly_revenue' && (userSortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="text-left p-2 cursor-pointer hover:bg-muted/50" onClick={() => handleSort('created_at')}>
                      Joined {userSortField === 'created_at' && (userSortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-muted/30">
                      <td className="p-2 font-medium">{user.artisan_name}</td>
                      <td className="p-2">{user.business_name || 'N/A'}</td>
                      <td className="p-2">{user.email}</td>
                      <td className="p-2">{user.phone}</td>
                      <td className="p-2">
                        <span className="text-sm text-muted-foreground max-w-[150px] truncate block" title={user.referral_source || 'N/A'}>
                          {user.referral_source || 'N/A'}
                        </span>
                      </td>
                      <td className="p-2">
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <Badge variant={user.subscription_type === 'free' ? 'outline' : 'default'}>
                          {user.subscription_type}
                        </Badge>
                      </td>
                      <td className="p-2 text-center">
                        <span className="inline-flex items-center justify-center bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm font-medium">
                          {user.monthly_invoice_count || 0}
                        </span>
                      </td>
                      <td className="p-2 text-center">
                        <span className="inline-flex items-center justify-center bg-yellow-100 text-yellow-800 rounded-full px-3 py-1 text-sm font-medium">
                          {user.monthly_quotation_count || 0}
                        </span>
                      </td>
                      <td className="p-2 text-center">
                        <span className="inline-flex items-center justify-center bg-green-100 text-green-800 rounded-full px-3 py-1 text-sm font-medium">
                          {user.monthly_receipt_count || 0}
                        </span>
                      </td>
                      <td className="p-2">
                        <span className="inline-flex items-center gap-1 font-semibold text-green-600">
                          ₦{(user.monthly_revenue || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="p-2 whitespace-nowrap">{new Date(user.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {paginatedUsers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No users found matching your search
                </div>
              )}
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between mt-4 pt-4 border-t gap-4">
                <div className="text-sm text-muted-foreground text-center sm:text-left">
                  Showing {((currentPage - 1) * usersPerPage) + 1} to {Math.min(currentPage * usersPerPage, filteredAndSortedUsers.length)} of {filteredAndSortedUsers.length} users
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  >
                    First
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="px-4 py-2 text-sm font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    Last
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Invoices, Quotations and Receipts */}
        <div className="grid grid-cols-1 gap-6 mb-6">
          <AdminInvoicesList invoices={invoices} />
        </div>
        <div className="grid grid-cols-1 gap-6 mb-6">
          <AdminQuotationsList quotations={quotations} />
        </div>
        <div className="grid grid-cols-1">
          <AdminReceiptsList receipts={receipts} />
        </div>
      </div>
    </div>
  );
}


