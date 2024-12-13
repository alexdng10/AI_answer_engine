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

async function scrapeUrl(url: string): Promise<string> {
  try {
    const parsedUrl = new URL(url);
    
    // Check cache first
    const cached = urlCache[url];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.content;
    }

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
      
      // Set modern browser configuration
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      await page.setViewport({ width: 1920, height: 1080 });
      await page.setExtraHTTPHeaders({
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Sec-Fetch-Dest': 'document'
      });

      // Enable request interception BEFORE adding listeners
      await page.setRequestInterception(true);

      // Track network requests
      const requests = new Map();
      page.on('request', request => {
        requests.set(request.url(), request);
        const resourceType = request.resourceType();
        if (['document', 'script', 'xhr', 'fetch'].includes(resourceType)) {
          request.continue();
        } else {
          request.abort();
        }
      });

      // Handle responses and collect API data
      const apiData = new Map();
      page.on('response', async response => {
        try {
          const contentType = response.headers()['content-type'];
          if (contentType?.includes('application/json')) {
            const json = await response.json();
            apiData.set(response.url(), json);
          }
        } catch (e) {
          // Not JSON, ignore
        }
      });

      // Wait longer for modern SPAs
      await page.goto(url, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      // Wait for dynamic content
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

      // Extract content
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

      const formattedContent = `
Title: ${content.metadata.title}
${content.metadata.description ? `Description: ${content.metadata.description}` : ''}
${content.metadata.type ? `Type: ${content.metadata.type}` : ''}
${content.metadata.image ? `Image: ${content.metadata.image}` : ''}

Main Content:
${content.mainContent || 'No content could be extracted from this page.'}
`.trim();

      // Cache the result
      urlCache[url] = {
        content: formattedContent,
        timestamp: Date.now()
      };

      return formattedContent;

    } catch (error) {
      await browser.close();
      throw error;
    }

  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    throw new Error(`Failed to access ${url}. ${error instanceof Error ? error.message : 'Unknown error occurred.'}`);
  }
}

// Method 2: Simple fetch API
async function tryFetchAPI(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const text = await response.text();
  
  // Simple regex-based extraction
  const content = {
    metadata: {
      title: text.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || '',
      description: text.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"[^>]*>/i)?.[1] ||
                  text.match(/<meta[^>]*property="og:description"[^>]*content="([^"]+)"[^>]*>/i)?.[1] || '',
      type: text.match(/<meta[^>]*property="og:type"[^>]*content="([^"]+)"[^>]*>/i)?.[1] || '',
      image: text.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"[^>]*>/i)?.[1] || ''
    },
    mainContent: text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, '\n')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 20)
      .join('\n\n')
  };

  return formatContent(content, { 
    statusCode: response.status, 
    errors: [], 
    redirectCount: 0, 
    isRateLimited: false 
  });
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
Status: ${status.statusCode}
${status.redirectCount > 0 ? `Redirects: ${status.redirectCount}` : ''}
${status.errors.length > 0 ? `\nIssues:\n${status.errors.map(e => `- ${e}`).join('\n')}` : ''}
${status.isRateLimited ? '\n⚠️ Rate limited by server. Content may be incomplete.' : ''}

Main Content:
${content.mainContent || 'No content could be extracted from this page.'}
`.trim();
}

// Helper function to truncate text while preserving important information
function summarizeContent(content: string, maxLength: number = 4000): string {
  if (content.length <= maxLength) return content;

  // Split content into sections
  const sections = content.split('\n\n');
  const processedSections: string[] = [];
  let currentLength = 0;

  for (const section of sections) {
    // Always include headers and status information
    if (
      section.startsWith('Title:') || 
      section.startsWith('Description:') || 
      section.startsWith('Status:') ||
      section.includes('Issues:')
    ) {
      processedSections.push(section);
      currentLength += section.length;
      continue;
    }

    // For content sections, keep important information
    const lines = section.split('\n')
      .filter(line => line.trim())
      .filter(line => 
        line.includes('Button:') ||
        line.includes('Input:') ||
        line.includes('CSS') ||
        line.includes('style') ||
        line.length > 10
      )
      .filter((line, index, self) => 
        self.findIndex(l => l.toLowerCase().includes(line.toLowerCase())) === index
      );

    const summarizedSection = lines.join('\n');
    if (currentLength + summarizedSection.length <= maxLength) {
      processedSections.push(summarizedSection);
      currentLength += summarizedSection.length;
    } else {
      processedSections.push('... (additional content truncated)');
      break;
    }
  }

  return processedSections.join('\n\n');
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages = [], urls = [] } = body;

    let scrapedContent = '';
    let failedUrls = [];

    // Scrape all provided URLs
    if (urls.length > 0) {
      for (const url of urls) {
        try {
          const content = await scrapeUrl(url);
          scrapedContent += `\n\nSource:\n${url}\n${content}`;
        } catch (error) {
          console.error(`Error scraping ${url}:`, error);
          failedUrls.push(url);
          scrapedContent += `\n\nSource:\n${url}\nThis page is currently inaccessible. Please try again later or check if the URL is correct.`;
        }
      }
    }

    // Prepare system message with scraped content
    const systemMessage = `You are an AI assistant that helps users understand web content.${
      scrapedContent ? `\n\nSources:${scrapedContent}` : ''
    }${
      failedUrls.length > 0 ? `\n\n⚠️ Some URLs were inaccessible: ${failedUrls.join(', ')}` : ''
    }`;

    // Call Groq API
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemMessage
        },
        ...(Array.isArray(messages) ? messages : [])
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.5,
      max_tokens: 4096,
      top_p: 1,
      stream: false
    });

    return new Response(
      JSON.stringify({
        content: completion.choices[0]?.message?.content || "No response generated",
        failedUrls: failedUrls
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error('Error in POST handler:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
