import React from "react";
import { formatCurrency } from "@/utils/invoiceCalculations";
import { getCurrencySymbol } from "@/utils/currencyConfig";

interface BaseTemplateProps {
  width?: string;
  height?: string;
  className?: string;
  children: React.ReactNode;
  isPrint?: boolean;
}

const BaseTemplate = ({
  width = "210mm",
  height = "auto",
  className = "",
  children,
  isPrint = false,
}: BaseTemplateProps) => {
  return (
    <div
      className={`bg-white ${isPrint ? "print:shadow-none" : "shadow-lg"} ${className}`}
      style={{
        width: width,
        minHeight: isPrint ? "297mm" : "auto",
        height: height,
        margin: "0 auto",
        padding: isPrint ? "0" : "20px",
      }}
    >
      {children}
    </div>
  );
};

export default BaseTemplate;
