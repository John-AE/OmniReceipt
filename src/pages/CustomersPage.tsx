import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Users, Search, Phone, Mail, TrendingDown, TrendingUp, ArrowLeft, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { getCurrencyLocale } from '@/utils/currencyConfig';
import { useNavigate } from 'react-router-dom';
import CreateReceiptDialog from '@/components/CreateReceiptDialog';

interface Customer {
  name: string;
  phone: string;
  email?: string;
  totalSpent: number;
  invoiceCount: number;
  receiptCount: number;
  lastTransaction: string;
}

const CustomersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'totalSpent' | 'lastTransaction'>('totalSpent');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(100);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<{name: string, phone: string, email?: string} | null>(null);
  const [userCurrency, setUserCurrency] = useState<string>('NGN');

  // Fetch user currency
  useEffect(() => {
    const fetchUserCurrency = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('currency')
            .eq('user_id', user.id)
            .single();
          if (profile?.currency) {
            setUserCurrency(profile.currency);
          }
        }
      } catch (error) {
        console.error('Error fetching user currency:', error);
      }
    };
    fetchUserCurrency();
  }, []);

  useEffect(() => {
    if (user) {
      fetchCustomers();
    }
  }, [user]);

  useEffect(() => {
    let filtered = customers;
    
    if (searchTerm) {
      filtered = customers.filter(customer => 
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm) ||
        (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Sort customers
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'totalSpent':
          aValue = a.totalSpent;
          bValue = b.totalSpent;
          break;
        case 'lastTransaction':
          aValue = new Date(a.lastTransaction).getTime();
          bValue = new Date(b.lastTransaction).getTime();
          break;
        default:
          aValue = a.totalSpent;
          bValue = b.totalSpent;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredCustomers(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [customers, searchTerm, sortBy, sortOrder]);

  const fetchCustomers = async () => {
    try {
      // Fetch all invoices and receipts for the user
      const [invoicesResponse, receiptsResponse] = await Promise.all([
        supabase
          .from('invoices')
          .select('customer_name, customer_phone, customer_email, amount, created_at')
          .eq('user_id', user?.id),
        supabase
          .from('receipts')
          .select('customer_name, customer_phone, customer_email, amount, created_at')
          .eq('user_id', user?.id)
      ]);

      if (invoicesResponse.error) throw invoicesResponse.error;
      if (receiptsResponse.error) throw receiptsResponse.error;

      // Combine and process customer data
      const customerMap = new Map<string, Customer>();

      // Process invoices
      (invoicesResponse.data || []).forEach(invoice => {
        const key = `${invoice.customer_name}-${invoice.customer_phone}`;
        if (customerMap.has(key)) {
          const customer = customerMap.get(key)!;
          customer.totalSpent += Number(invoice.amount);
          customer.invoiceCount += 1;
          if (new Date(invoice.created_at) > new Date(customer.lastTransaction)) {
            customer.lastTransaction = invoice.created_at;
          }
        } else {
          customerMap.set(key, {
            name: invoice.customer_name,
            phone: invoice.customer_phone,
            email: invoice.customer_email || undefined,
            totalSpent: Number(invoice.amount),
            invoiceCount: 1,
            receiptCount: 0,
            lastTransaction: invoice.created_at
          });
        }
      });

      // Process receipts
      (receiptsResponse.data || []).forEach(receipt => {
        const key = `${receipt.customer_name}-${receipt.customer_phone}`;
        if (customerMap.has(key)) {
          const customer = customerMap.get(key)!;
          customer.totalSpent += Number(receipt.amount);
          customer.receiptCount += 1;
          if (new Date(receipt.created_at) > new Date(customer.lastTransaction)) {
            customer.lastTransaction = receipt.created_at;
          }
        } else {
          customerMap.set(key, {
            name: receipt.customer_name,
            phone: receipt.customer_phone,
            email: receipt.customer_email || undefined,
            totalSpent: Number(receipt.amount),
            invoiceCount: 0,
            receiptCount: 1,
            lastTransaction: receipt.created_at
          });
        }
      });

      const customersArray = Array.from(customerMap.values());
      setCustomers(customersArray);

    } catch (error: any) {
      console.error('Error fetching customers:', error);
      toast({
        title: "Error loading customers",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(getCurrencyLocale(userCurrency), {
      style: 'currency',
      currency: userCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG');
  };

  const handleSort = (field: 'name' | 'totalSpent' | 'lastTransaction') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? <TrendingUp className="h-4 w-4 ml-1" /> : <TrendingDown className="h-4 w-4 ml-1" />;
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCustomers = filteredCustomers.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading customers...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-primary/10">
                <div className="w-8 h-8 bg-primary rounded text-primary-foreground flex items-center justify-center font-bold text-sm">
                  OR
                </div>
              </div>
              <span className="text-2xl font-poppins font-extrabold tracking-tight">OmniReceipts</span>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            onClick={async () => {
              await supabase.auth.signOut();
              navigate('/auth');
            }}
            size="sm"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Customer List Card */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Users className="h-6 w-6" />
                  Customer List
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Total customers: {customers.length} | Showing {startIndex + 1}-{Math.min(endIndex, filteredCustomers.length)} of {filteredCustomers.length}
                </p>
              </div>
              
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by name, phone, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto h-16 w-16 text-muted-foreground opacity-50 mb-4" />
                <p className="text-lg text-muted-foreground mb-2">
                  {searchTerm ? 'No customers match your search' : 'No customers yet'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {searchTerm ? 'Try adjusting your search criteria' : 'Customers will appear here after you create invoices or receipts'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          <Button 
                            variant="ghost" 
                            onClick={() => handleSort('name')}
                            className="hover:bg-transparent p-0 h-auto font-semibold flex items-center"
                          >
                            Customer Name {getSortIcon('name')}
                          </Button>
                        </TableHead>
                        <TableHead className="hidden sm:table-cell">Contact Info</TableHead>
                        <TableHead>
                          <Button 
                            variant="ghost" 
                            onClick={() => handleSort('totalSpent')}
                            className="hover:bg-transparent p-0 h-auto font-semibold flex items-center"
                          >
                            Total Spent {getSortIcon('totalSpent')}
                          </Button>
                        </TableHead>
                        <TableHead className="hidden md:table-cell">Transactions</TableHead>
                        <TableHead>
                          <Button 
                            variant="ghost" 
                            onClick={() => handleSort('lastTransaction')}
                            className="hover:bg-transparent p-0 h-auto font-semibold flex items-center"
                          >
                            Last Transaction {getSortIcon('lastTransaction')}
                          </Button>
                        </TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentCustomers.map((customer, index) => (
                        <TableRow key={`${customer.name}-${customer.phone}-${index}`}>
                          <TableCell className="font-medium">
                            <div>
                              <p className="font-semibold">{customer.name}</p>
                              <div className="sm:hidden text-xs text-muted-foreground mt-1">
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {customer.phone}
                                </div>
                                {customer.email && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <Mail className="h-3 w-3" />
                                    {customer.email}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          
                          <TableCell className="hidden sm:table-cell">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-sm">
                                <Phone className="h-3 w-3" />
                                {customer.phone}
                              </div>
                              {customer.email && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Mail className="h-3 w-3" />
                                  {customer.email}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="font-bold text-primary">
                              {formatCurrency(customer.totalSpent)}
                            </div>
                          </TableCell>
                          
                          <TableCell className="hidden md:table-cell">
                            <div className="space-y-1">
                              {customer.invoiceCount > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {customer.invoiceCount} Invoice{customer.invoiceCount > 1 ? 's' : ''}
                                </Badge>
                              )}
                              {customer.receiptCount > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  {customer.receiptCount} Receipt{customer.receiptCount > 1 ? 's' : ''}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              {formatDate(customer.lastTransaction)}
                            </div>
                            <div className="md:hidden mt-1">
                              {customer.invoiceCount > 0 && (
                                <Badge variant="outline" className="text-xs mr-1">
                                  {customer.invoiceCount}I
                                </Badge>
                              )}
                              {customer.receiptCount > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  {customer.receiptCount}R
                                </Badge>
                              )}
                            </div>
                          </TableCell>

                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const params = new URLSearchParams({
                                    customerName: customer.name,
                                    customerPhone: customer.phone,
                                    ...(customer.email && { customerEmail: customer.email })
                                  });
                                  navigate(`/create-invoice?${params.toString()}`);
                                }}
                                className="text-xs font-bold"
                              >
                                Create Invoice
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                               onClick={() => {
                                  setSelectedCustomer({
                                    name: customer.name,
                                    phone: customer.phone,
                                    email: customer.email
                                  });
                                  setShowReceiptDialog(true);
                                }}
                                className="text-xs font-bold"
                              >
                                Create Receipt
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      
                      <span className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                      </span>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''} total
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {showReceiptDialog && selectedCustomer && (
        <CreateReceiptDialog
          open={showReceiptDialog}
          onOpenChange={setShowReceiptDialog}
          prefillCustomer={{
            name: selectedCustomer.name,
            phone: selectedCustomer.phone,
            email: selectedCustomer.email
          }}
          onReceiptCreated={() => {
            setShowReceiptDialog(false);
            fetchCustomers(); // Refresh customer list
          }}
        />
      )}
    </div>
  );
};

export default CustomersPage;


