import fs from 'fs';
import path from 'path';

const templatesDir = path.join(process.cwd(), 'src', 'components', 'templates');

function updateConvertAmountToWords(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Replace convertAmountToWords(displayTotal) with convertAmountToWords(displayTotal, data.currency)
    let updatedContent = content.replace(/convertAmountToWords\(displayTotal\)/g, 'convertAmountToWords(displayTotal, data.currency)');
    
    // Replace convertAmountToWords(data.totalAmount) with convertAmountToWords(data.totalAmount, data.currency)
    updatedContent = updatedContent.replace(/convertAmountToWords\(data\.totalAmount\)/g, 'convertAmountToWords(data.totalAmount, data.currency)');
    
    if (updatedContent !== content) {
        fs.writeFileSync(filePath, updatedContent, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            processDirectory(filePath);
        } else if (file.endsWith('.tsx')) {
            updateConvertAmountToWords(filePath);
        }
    });
}

processDirectory(templatesDir);
console.log('All files updated successfully');