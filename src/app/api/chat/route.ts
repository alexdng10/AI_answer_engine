// TODO: Implement the chat API with Groq and web scraping with Cheerio and Puppeteer
// Refer to the Next.js Docs on how to read the Request body: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
// Refer to the Groq SDK here on how to use an LLM: https://www.npmjs.com/package/groq-sdk
// Refer to the Cheerio docs here on how to parse HTML: https://cheerio.js.org/docs/basics/loading
// Refer to Puppeteer docs here: https://pptr.dev/guides/what-is-puppeteer

import { Groq } from "groq-sdk";
import * as cheerio from "cheerio";
import puppeteer from "puppeteer";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

// Cache for scraped content to avoid re-scraping the same URLs
const urlCache: { [key: string]: { content: string; timestamp: number } } = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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
Status Code: ${status.statusCode}
${status.errors.length > 0 ? `Errors: ${status.errors.join(', ')}` : ''}
${status.redirectCount > 0 ? `Redirect Count: ${status.redirectCount}` : ''}
${status.isRateLimited ? 'Rate Limited: Yes' : ''}
`.trim();
}

async function scrapeUrl(url: string): Promise<string> {
  try {
    const parsedUrl = new URL(url);
    
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

// Helper function to retry operations
async function retryWithTimeout<T>(
  operation: () => Promise<T>,
  maxRetries: number,
  delay: number
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError || new Error('Operation failed after retries');
}

// Helper function to truncate text while preserving important information
function summarizeContent(content: string, maxLength: number = 4000): string {
  if (content.length <= maxLength) return content;

  // Split content into sections
  const sections = content.split('\n\n');
  
  if (sections.length === 1) {
    // Single section, just truncate
    return content.slice(0, maxLength - 3) + '...';
  }

  // Calculate target length for each section
  const targetSectionLength = Math.floor(maxLength / sections.length);
  
  // Truncate each section proportionally
  const truncatedSections = sections.map(section => {
    if (section.length <= targetSectionLength) return section;
    return section.slice(0, targetSectionLength - 3) + '...';
  });

  // Join sections back together
  let result = truncatedSections.join('\n\n');
  
  // Final truncation if still too long
  if (result.length > maxLength) {
    result = result.slice(0, maxLength - 3) + '...';
  }

  return result;
}

// Helper function to chunk content intelligently
function chunkContent(content: string, maxTokens: number = 4000): string[] {
  // Rough estimate: 1 token ≈ 4 characters
  const maxChars = maxTokens * 4;
  
  if (content.length <= maxChars) return [content];

  const chunks: string[] = [];
  const sections = content.split('\n\n');
  let currentChunk = '';

  for (const section of sections) {
    if (currentChunk.length + section.length + 2 <= maxChars) {
      currentChunk += (currentChunk ? '\n\n' : '') + section;
    } else {
      if (currentChunk) chunks.push(currentChunk);
      currentChunk = section;
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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, urls = [], previousMessages = [] } = body;
    
    // Extract URLs from the message if not provided
    const messageUrls = (message?.match(/(https?:\/\/[^\s]+)/g) || []) as string[];
    const allUrls = Array.from(new Set([...urls, ...messageUrls]));
    
    // Scrape content from URLs
    const scrapedContents: string[] = [];
    const failedUrls: string[] = [];
    
    for (const url of allUrls) {
      try {
        const content = await scrapeUrl(url);
        scrapedContents.push(content);
      } catch (error) {
        console.error(`Error scraping ${url}:`, error);
        failedUrls.push(url);
      }
    }

    // Prepare base prompt
    let prompt = message;
    if (scrapedContents.length > 0) {
      const sources = scrapedContents.map(content => summarizeContent(content)).join('\n\n');
      prompt = `Sources:\n\n${sources}\n\n${message}`;
    }

    // Split into chunks if needed
    const chunks = chunkContent(prompt);
    const responses: string[] = [];

    // Process each chunk
    for (const chunk of chunks) {
      const completion = await groq.chat.completions.create({
        messages: [
          ...previousMessages.map(m => ({
            role: m.role,
            content: m.content,
          })),
          { 
            role: 'user', 
            content: chunk + (chunks.length > 1 ? '\n\nNote: This is part of a larger content. Please focus on extracting and analyzing the information from this part.' : '')
          }
        ],
        model: 'mixtral-8x7b-32768',
        temperature: 0.5,
        max_tokens: 4096,
        top_p: 1,
        stop: null,
        stream: false,
      });

      responses.push(completion.choices[0]?.message?.content || '');
    }

    // Merge responses if needed
    const finalResponse = chunks.length > 1 ? mergeResponses(responses) : responses[0];

    return new Response(
      JSON.stringify({
        content: finalResponse,
        sources: allUrls.filter(url => !failedUrls.includes(url)),
        failedUrls,
        chunked: chunks.length > 1
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in chat route:', error);
    if (error.message?.includes('rate_limit_exceeded')) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again in a moment.',
          content: "I apologize, but I'm receiving too many requests right now. Please try sending a shorter message or wait a moment before trying again.",
          failedUrls: []
        }),
        { 
          status: 429, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to process request',
        content: "Sorry, I encountered an error processing your request.",
        failedUrls: []
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}
