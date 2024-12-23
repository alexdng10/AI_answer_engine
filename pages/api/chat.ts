import type { NextApiRequest, NextApiResponse } from 'next'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { Groq } from 'groq-sdk'
import * as cheerio from 'cheerio'
import puppeteer from 'puppeteer';
import * as pdfjs from 'pdfjs-dist'
import formidable from 'formidable'
import { promises as fs } from 'fs'
export const config = {
  api: {
    bodyParser: false,
  },
}
const pdfjsWorker = require('pdfjs-dist/build/pdf.worker.entry')
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

// Create a new ratelimiter that allows 10 requests per 10 seconds
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
})

// Cache for scraped content to avoid re-scraping the same URLs
const urlCache: { [key: string]: { content: string; timestamp: number } } = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function parseForm(req: NextApiRequest) {
  const form = formidable({
    maxFileSize: 10 * 1024 * 1024, // 10MB limit
  })

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err)
      resolve({ fields, files })
    })
  })
}
async function parsePDF(buffer: Buffer): Promise<string> {
  try {
    // Convert Buffer to Uint8Array
    const uint8Array = new Uint8Array(buffer)
    
    // Load the PDF document
    const pdf = await pdfjs.getDocument({
      data: uint8Array,
      useSystemFonts: true,
    }).promise

    let fullText = ''
    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const pageText = content.items
        .map((item: any) => item.str)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim()
      fullText += pageText + '\n\n'
    }

    if (!fullText.trim()) {
      throw new Error('No text content found in PDF')
    }

    return fullText
  } catch (error: any) {
    console.error('Error parsing PDF:', error)
    throw new Error(`Failed to parse PDF file: ${error.message}`)
  }
}
// Helper function to format content consistently
function formatContent(
  content: any,
  status: { statusCode: number; errors: string[]; redirectCount: number; isRateLimited: boolean }
): string {
  return `
Title: ${content.metadata.title}
${content.metadata.description ? `Description: ${content.metadata.description}` : ''}
${content.metadata.type ? `Type: ${content.metadata.type}` : ''}
${content.metadata.image ? `Image: ${content.metadata.image}` : ''}

Main Content:
${content.mainContent || 'No content could be extracted from this page.'}

Status:
${status.errors.length > 0 ? `Errors: ${status.errors.join(', ')}` : ''}
${status.redirectCount > 0 ? `Redirect Count: ${status.redirectCount}` : ''}
${status.isRateLimited ? 'Rate Limited: Yes' : ''}
`.trim();
}

async function scrapeUrl(url: string): Promise<string> {
  try {
    // Check cache first
    const cached = urlCache[url];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.content;
    }

    // Try fetch first - it's faster
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      const $ = cheerio.load(text);

      // Get metadata
      const metadata = {
        title: $('title').text() || '',
        description: $('meta[name="description"]').attr('content') || 
                    $('meta[property="og:description"]').attr('content') || '',
        type: $('meta[property="og:type"]').attr('content') || '',
        image: $('meta[property="og:image"]').attr('content') || ''
      };

      // Get main content
      const mainContent = new Set<string>();

      // Try different content selectors
      const selectors = [
        'main',
        'article',
        '[role="main"]',
        '#main-content',
        '.main-content',
        '.content',
        '[data-testid]',
        '[class*="container"]',
        '[class*="wrapper"]'
      ];

      selectors.forEach(selector => {
        $(selector).each((_, el) => {
          const text = $(el).text().trim();
          if (text.length > 50) {
            mainContent.add(text);
          }
        });
      });

      // Look for download/install sections
      $('a:contains("Download"), a:contains("Install"), [class*="download"], [class*="install"]').each((_, el) => {
        const section = $(el).closest('section, div[class*="section"], div[class*="container"]');
        if (section.length) {
          const text = section.text().trim();
          if (text.length > 50) {
            mainContent.add(text);
          }
        }
      });

      // If no content found, try Puppeteer
      if (mainContent.size === 0) {
        throw new Error('No content found with fetch, trying Puppeteer');
      }

      const content = {
        metadata,
        mainContent: Array.from(mainContent).join('\n\n')
      };

      const formattedContent = formatContent(content, { 
        statusCode: response.status, 
        errors: [], 
        redirectCount: 0, 
        isRateLimited: false 
      });
      
      // Cache successful result
      urlCache[url] = {
        content: formattedContent,
        timestamp: Date.now()
      };

      return formattedContent;

    } catch (fetchError) {
      console.log('Fetch failed, trying Puppeteer:', fetchError);
      
      // If fetch fails, try Puppeteer
      const browser = await puppeteer.launch({
        headless: "new",
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-web-security',
          '--disable-features=IsolateOrigins',
          '--disable-site-isolation-trials',
          '--window-size=1920x1080'
        ]
      });

      try {
        const page = await browser.newPage();
        
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1920, height: 1080 });
        await page.setExtraHTTPHeaders({
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Sec-Fetch-Dest': 'document'
        });

        // Wait longer for SPAs
        await page.goto(url, {
          waitUntil: 'networkidle0',
          timeout: 30000
        });

        // Wait for content
        await page.waitForFunction(() => {
          const selectors = [
            'main',
            'article',
            '[role="main"]',
            '#main-content',
            '.main-content',
            '.content',
            '[data-testid]',
            '[class*="container"]',
            '[class*="wrapper"]'
          ];
          
          return selectors.some(selector => 
            document.querySelector(selector)?.textContent?.trim().length > 100
          );
        }, { timeout: 10000 }).catch(() => {
          console.log('Timeout waiting for content selectors');
        });

        const content = await page.evaluate(() => {
          function getVisibleText(element) {
            const style = window.getComputedStyle(element);
            if (style.display === 'none' || style.visibility === 'hidden') return '';
            
            const role = element.getAttribute('role')?.toLowerCase();
            if (['navigation', 'banner', 'footer'].includes(role)) return '';
            
            return element.textContent?.trim() || '';
          }

          const metadata = {
            title: document.title,
            description: '',
            type: '',
            image: ''
          };

          // Get meta tags
          const metaSelectors = {
            description: [
              'meta[name="description"]',
              'meta[property="og:description"]',
              'meta[name="twitter:description"]'
            ],
            image: [
              'meta[property="og:image"]',
              'meta[name="twitter:image"]',
              'meta[itemprop="image"]'
            ]
          };

          for (const [key, selectors] of Object.entries(metaSelectors)) {
            for (const selector of selectors) {
              const content = document.querySelector(selector)?.getAttribute('content');
              if (content) {
                metadata[key] = content;
                break;
              }
            }
          }

          const mainContent = new Set();
          
          // Try to get structured content
          const contentSelectors = [
            'main', '[role="main"]', '#root', '#app', '#__next',
            '[class*="content"]', '[class*="container"]', '[class*="wrapper"]',
            '[data-testid]', '[data-component]', '[data-section]',
            'article', '.post', '.article',
            '[class*="download"]', '[class*="docs"]', '[class*="documentation"]',
            '[class*="pricing"]', '[class*="features"]'
          ];

          for (const selector of contentSelectors) {
            for (const el of document.querySelectorAll(selector)) {
              const text = getVisibleText(el);
              if (text && text.length > 50) {
                mainContent.add(text);
              }
            }
          }

          // Look for interactive elements
          const interactiveSelectors = [
            'button', 'a', 'input', 'select',
            '[role="button"]', '[role="link"]',
            '[class*="button"]', '[class*="link"]'
          ];

          for (const selector of interactiveSelectors) {
            for (const el of document.querySelectorAll(selector)) {
              const text = el.textContent?.trim();
              if (text && (text.includes('Download') || text.includes('Install'))) {
                const section = el.closest('section, div[class*="section"], div[class*="container"]');
                if (section) {
                  const text = getVisibleText(section);
                  if (text) mainContent.add(text);
                }
              }
            }
          }

          // Fallback to text nodes
          if (mainContent.size === 0) {
            const walker = document.createTreeWalker(
              document.body,
              NodeFilter.SHOW_TEXT,
              {
                acceptNode: (node) => {
                  const parent = node.parentElement;
                  if (!parent) return NodeFilter.FILTER_REJECT;
                  
                  const style = window.getComputedStyle(parent);
                  if (style.display === 'none' || style.visibility === 'hidden') {
                    return NodeFilter.FILTER_REJECT;
                  }
                  
                  const text = node.textContent?.trim();
                  if (!text || text.length < 20 || text.split(' ').length < 4) {
                    return NodeFilter.FILTER_REJECT;
                  }
                  
                  return NodeFilter.FILTER_ACCEPT;
                }
              }
            );

            while (walker.nextNode()) {
              const text = walker.currentNode.textContent?.trim();
              if (text) mainContent.add(text);
            }
          }

          return {
            metadata,
            mainContent: Array.from(mainContent).join('\n\n')
          };
        });

        await browser.close();

        const formattedContent = formatContent(content, { 
          statusCode: 200, 
          errors: [], 
          redirectCount: 0, 
          isRateLimited: false 
        });

        // Cache successful result
        urlCache[url] = {
          content: formattedContent,
          timestamp: Date.now()
        };

        return formattedContent;

      } catch (error) {
        await browser.close();
        throw error;
      }
    }

  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    throw new Error(`Failed to access ${url}. ${error instanceof Error ? error.message : 'Unknown error occurred.'}`);
  }
}

interface Message {
  role: string;
  content: string;
}

interface RequestBody {
  message: string;
  urls: string[];
  previousMessages: Message[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { fields, files }: any = await parseForm(req)
    const message = fields.message[0]
    let pdfText = ''
    let urlContents = ''

    // Process URLs from message
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const urls = message.match(urlRegex)
    if (urls) {
      for (const url of urls) {
        try {
          const content = await scrapeUrl(url)
          urlContents += `\n\nURL: ${url}\n${content}`
        } catch (error) {
          console.error(`Error processing URL ${url}:`, error)
          urlContents += `\n\nURL: ${url}\nError: Could not access URL`
        }
      }
    }

    // Process PDF if present
    if (files.file0) {
      const file = files.file0[0]
      if (file.mimetype === 'application/pdf') {
        try {
          const fileData = await fs.readFile(file.filepath)
          const content = await parsePDF(fileData)
          pdfText = `\n\nPDF Content from ${file.originalFilename}:\n${content}`
        } catch (error) {
          console.error('Error processing PDF:', error)
          pdfText = `\nError processing PDF ${file.originalFilename}`
        }
        await fs.unlink(file.filepath).catch(console.error)
      }
    }

    // Combine content and get completion
    const prompt = `Analyze this content:${urlContents}${pdfText}`.slice(0, 4000)
    
    const completion = await groq.chat.completions.create({
      messages: [
        ...JSON.parse(fields.previousMessages[0]).slice(-1).map(m => ({
          role: m.role,
          content: m.content.slice(0, 500),
        })),
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'llama-3.3-70b-specdec',
      temperature: 0.5,
      max_tokens: 1000,
    })

    return res.status(200).json({
      content: completion.choices[0]?.message?.content || 'No response generated.',
      processedFiles: files.file0 ? [files.file0[0].originalFilename] : [],
    })

  } catch (error) {
    console.error('Handler error:', error)
    return res.status(500).json({
      error: 'Failed to process request',
      content: 'Sorry, there was an error processing your request.'
    })
  }
}

// Helper function to truncate text while preserving important information
function summarizeContent(content: string): string {
  // Remove any mentions of status codes
  content = content.replace(/\b(status code|code|HTTP) \d{3}\b/gi, '');
  
  // Remove any remaining technical details that users don't need to see
  content = content.replace(/\b(response|request) status:?\s*\d+/gi, '');
  
  const lines = content.split('\n');
  const result = lines
    .filter(line => line.trim().length > 0)  // Remove empty lines
    .filter(line => !line.includes('<!DOCTYPE'))  // Remove HTML declarations
    .filter(line => !line.match(/<\/?[a-z][\s\S]*>/i))  // Remove HTML tags
    .join('\n')
    .trim();

  return result;
}

// Helper function to chunk content intelligently
function chunkContent(content: string, maxTokens: number = 2000): string[] {
  // More conservative estimate: 1 token ≈ 3 characters
  const maxChars = maxTokens * 3;
  
  if (content.length <= maxChars) return [content];

  const chunks: string[] = [];
  let currentChunk = '';

  // Split by paragraphs first
  const paragraphs = content.split('\n\n');

  for (const paragraph of paragraphs) {
    // If paragraph is too long, split by sentences
    if (paragraph.length > maxChars) {
      const sentences = paragraph.split(/(?<=[.!?])\s+/);
      for (const sentence of sentences) {
        if (currentChunk.length + sentence.length + 2 <= maxChars) {
          currentChunk += (currentChunk ? ' ' : '') + sentence;
        } else {
          if (currentChunk) chunks.push(currentChunk);
          // If single sentence is too long, split by words
          if (sentence.length > maxChars) {
            const words = sentence.split(' ');
            currentChunk = '';
            for (const word of words) {
              if (currentChunk.length + word.length + 1 <= maxChars) {
                currentChunk += (currentChunk ? ' ' : '') + word;
              } else {
                if (currentChunk) chunks.push(currentChunk);
                currentChunk = word;
              }
            }
          } else {
            currentChunk = sentence;
          }
        }
      }
    } else if (currentChunk.length + paragraph.length + 2 <= maxChars) {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    } else {
      if (currentChunk) chunks.push(currentChunk);
      currentChunk = paragraph;
    }
  }

  if (currentChunk) chunks.push(currentChunk);
  return chunks;
}

// Helper function to merge LLM responses intelligently
function mergeResponses(responses: string[]): string {
  // Remove duplicate information
  const uniqueInfo = new Set<string>();
  const merged: string[] = [];

  for (const response of responses) {
    const sentences = response.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
    
    for (const sentence of sentences) {
      // Simple deduplication based on sentence similarity
      const normalized = sentence.toLowerCase();
      if (!Array.from(uniqueInfo).some(existing => 
        normalized.includes(existing.toLowerCase()) || 
        existing.toLowerCase().includes(normalized)
      )) {
        uniqueInfo.add(sentence);
        merged.push(sentence);
      }
    }
  }

  return merged.join('. ') + '.';
}

// Rate limiting configuration
const RATE_LIMIT = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 20, // max requests per window
  delayMs: 1000, // delay between requests
};

// Simple in-memory store for rate limiting
const requestStore = new Map<string, { count: number; timestamp: number }>();

async function isRateLimited(clientId: string): Promise<boolean> {
  const now = Date.now();
  const clientRequests = requestStore.get(clientId);

  if (!clientRequests) {
    requestStore.set(clientId, { count: 1, timestamp: now });
    return false;
  }

  // Reset count if window has passed
  if (now - clientRequests.timestamp > RATE_LIMIT.windowMs) {
    requestStore.set(clientId, { count: 1, timestamp: now });
    return false;
  }

  // Check if limit exceeded
  if (clientRequests.count >= RATE_LIMIT.maxRequests) {
    return true;
  }

  // Increment count
  clientRequests.count++;
  return false;
}

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
