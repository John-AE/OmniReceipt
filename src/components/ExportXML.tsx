import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CalendarIcon, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { downloadXML } from '@/utils/downloadUtils';
import { toast } from '@/hooks/use-toast';

interface ExportXMLProps {
  title: string;
  data: any[];
  filename: string;
  onExport: (startDate?: string, endDate?: string) => Promise<string>;
  className?: string;
}

export const ExportXML: React.FC<ExportXMLProps> = ({
  title,
  data,
  filename,
  onExport,
  className = ''
}) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const exportToXML = async (dataToExport: any[], fileName: string, startDate?: string, endDate?: string) => {
    try {
      if (!dataToExport || dataToExport.length === 0) {
        toast({
          title: "No data to export",
          description: "There are no records to export",
          variant: "destructive",
        });
        return;
      }

      // Generate XML content using the provided onExport function
      const xmlContent = await onExport(startDate, endDate);
      
      // Download using cross-platform utility
      downloadXML(xmlContent, fileName);
      
      toast({
        title: "XML Export Successful",
        description: `Exported ${dataToExport.length} records in UBL format`,
      });
      
    } catch (error: any) {
      console.error('XML export error:', error);
      toast({
        title: "XML Export Failed",
        description: error.message || "Could not export XML file",
        variant: "destructive",
      });
    }
  };

  const exportAllData = async () => {
    setIsExporting(true);
    try {
      const fileName = `${filename}-all-${format(new Date(), 'yyyy-MM-dd')}.xml`;
      await exportToXML(data, fileName);
    } finally {
      setIsExporting(false);
    }
  };

  const exportFilteredData = async () => {
    setIsExporting(true);
    try {
      let filteredData = [...data];
      
      if (startDate || endDate) {
        filteredData = data.filter(item => {
          const itemDate = new Date(item.created_at || item.invoice_date || item.payment_date);
          const start = startDate ? new Date(startDate) : null;
          const end = endDate ? new Date(endDate) : null;
          
          if (start && itemDate < start) return false;
          if (end && itemDate > end) return false;
          return true;
        });
      }

      if (filteredData.length === 0) {
        toast({
          title: "No data in date range",
          description: "No records found for the selected date range",
          variant: "destructive",
        });
        return;
      }

      const fileName = `${filename}-${startDate || 'all'}-to-${endDate || 'all'}-${format(new Date(), 'yyyy-MM-dd')}.xml`;
      await exportToXML(filteredData, fileName, startDate || undefined, endDate || undefined);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={`flex items-center space-x-2 ${className}`}
        >
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Export XML</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Export {title} (UBL Format)</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Total records: {data.length}
            <br />
            <span className="text-xs">UBL XML format for FIRS e-invoice compliance</span>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date (Optional)</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-10"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date (Optional)</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-10"
              />
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <Button
              onClick={exportAllData}
              className="w-full"
              disabled={isExporting}
            >
              <FileText className="mr-2 h-4 w-4" />
              {isExporting ? 'Exporting...' : 'Export All Records'}
            </Button>
            
            {(startDate || endDate) && (
              <Button
                onClick={exportFilteredData}
                variant="outline"
                className="w-full"
                disabled={isExporting}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {isExporting ? 'Exporting...' : 'Export Filtered Records'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

