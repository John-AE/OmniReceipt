import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templatesDir = path.join(__dirname, 'src', 'components', 'templates');

// Function to replace hardcoded currency symbols in a file
function replaceCurrencyInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace all occurrences of hardcoded ₦ with formatCurrency function
    content = content.replace(/₦\{(.*?)\.toLocaleString\(\)\}/g, (match, p1) => {
      return `{formatCurrency(${p1}, data.currency, data.locale)}`;
    });
    
    // Add import statements for formatCurrency if not present
    if (content.includes('import React')) {
      const importStatements = `import { formatCurrency } from '@/utils/invoiceCalculations';
import { getCurrencySymbol } from '@/utils/currencyConfig';
`;
      
      if (!content.includes('formatCurrency')) {
        // Fix the import statement handling
        content = content.replace(/import React.*from.*['"]react['"];/, (match) => {
          return `${match}\n${importStatements}`;
        });
      }
    }
    
    // Fix optional chaining syntax errors
    content = content.replace(/formatCurrency\((.*?)\?\s*,/, (match, p1) => {
      return `formatCurrency(${p1} || 0,`;
    });
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error);
  }
}

// Recursively traverse the templates directory
function traverseDirectory(dir) {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      traverseDirectory(fullPath);
    } else if (stat.isFile() && fullPath.endsWith('.tsx')) {
      replaceCurrencyInFile(fullPath);
    }
  });
}

console.log('Updating currency formatting in all template files...');
traverseDirectory(templatesDir);
console.log('Currency formatting update complete!');
