import React from 'react';
import { getQuotationTemplate, QuotationData } from '@/utils/quotationRegistry';

interface QuotationTemplateProps {
  data: QuotationData;
  templateNumber: number;
}

const QuotationTemplate: React.FC<QuotationTemplateProps> = ({ data, templateNumber }) => {
  const Template = getQuotationTemplate(templateNumber);
  return <Template data={data} />;
};

export default QuotationTemplate;


