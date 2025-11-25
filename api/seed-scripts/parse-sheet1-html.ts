import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

export interface ParsedSupplier {
  name: string;
  website?: string;
  address?: string;
  phone?: string;
  email?: string;
  description?: string;
  imagePath?: string; // Local path to image file
  facebookUrl?: string;
  instagramUrl?: string;
  status?: string;
}

/**
 * Parse Sheet1.html and extract supplier data from the table
 */
export function parseSheet1Html(filePath: string): ParsedSupplier[] {
  const html = fs.readFileSync(filePath, 'utf-8');
  const $ = cheerio.load(html);
  const suppliers: ParsedSupplier[] = [];

  // Find all table rows (skip header row)
  $('table tbody tr').each((index, row) => {
    const $row = $(row);
    const cells = $row.find('td');

    // Skip rows with no cells or header rows
    if (cells.length === 0) {
      return;
    }

    // Extract data from columns
    // Column A (index 0): Name
    // Column B (index 1): Website
    // Column C (index 2): Address
    // Column D (index 3): Phone
    // Column E (index 4): Email
    // Column F (index 5): Description
    // Column G (index 6): Image
    // Column H (index 7): Facebook
    // Column I (index 8): Instagram
    // Column J (index 9): Status

    const name = cleanText($(cells[0]).text().trim());
    
    // Skip rows without a name
    if (!name || name === '') {
      return;
    }

    const website = extractUrl($(cells[1]).html() || '');
    const address = cleanText($(cells[2]).text().trim());
    const phone = cleanText($(cells[3]).text().trim());
    const email = extractEmail($(cells[4]).html() || '');
    const description = cleanText($(cells[5]).text().trim());
    
    // Extract image path from img src
    const imageHtml = $(cells[6]).html() || '';
    const imageMatch = imageHtml.match(/src="([^"]+)"/);
    const imagePath = imageMatch ? imageMatch[1] : undefined;
    
    const facebookUrl = extractUrl($(cells[7]).html() || '');
    const instagramUrl = extractUrl($(cells[8]).html() || '');
    const status = cleanText($(cells[9]).text().trim());

    // Skip suppliers marked as closed
    if (status && (status.toLowerCase().includes('closed') || status.toLowerCase().includes('temporary'))) {
      return;
    }

    suppliers.push({
      name,
      website,
      address,
      phone,
      email,
      description,
      imagePath,
      facebookUrl,
      instagramUrl,
      status,
    });
  });

  return suppliers;
}

/**
 * Clean text by removing extra whitespace and newlines
 */
function cleanText(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Extract URL from HTML anchor tag or return the text if it's already a URL
 */
function extractUrl(html: string): string | undefined {
  if (!html) return undefined;
  
  // Try to extract from anchor tag
  const anchorMatch = html.match(/<a[^>]+href=["']([^"']+)["'][^>]*>/i);
  if (anchorMatch) {
    return anchorMatch[1];
  }
  
  // If it's already a URL (starts with http), return it
  const trimmed = html.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  
  return undefined;
}

/**
 * Extract email from HTML anchor tag or return the text if it's already an email
 */
function extractEmail(html: string): string | undefined {
  if (!html) return undefined;
  
  // Try to extract from mailto link
  const mailtoMatch = html.match(/mailto:([^\s"']+)/i);
  if (mailtoMatch) {
    return mailtoMatch[1];
  }
  
  // If it's already an email (contains @), return it
  const trimmed = html.trim();
  if (trimmed.includes('@') && trimmed.includes('.')) {
    return trimmed;
  }
  
  return undefined;
}



