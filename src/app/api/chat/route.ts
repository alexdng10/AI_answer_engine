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

      // Track page status
      let pageStatus = {
        redirectCount: 0,
        finalUrl: url,
        errors: [] as string[],
        isRateLimited: false,
        statusCode: 200
      };

      // Better request handling
      await page.setRequestInterception(true);
      page.on('request', request => {
        const resourceType = request.resourceType();
        if (['document', 'script', 'xhr', 'fetch'].includes(resourceType)) {
          request.continue();
        } else if (resourceType === 'image') {
          // Only load images from the same domain
          const imgUrl = new URL(request.url());
          if (imgUrl.hostname === parsedUrl.hostname) {
            request.continue();
          } else {
            request.abort();
          }
        } else {
          request.abort();
        }
      });

      // Handle responses
      page.on('response', async response => {
        const status = response.status();
        pageStatus.statusCode = status;
        
        if (status === 429) {
          pageStatus.isRateLimited = true;
          pageStatus.errors.push('Rate limited by server');
        } else if (status >= 300 && status <= 399) {
          pageStatus.redirectCount++;
          pageStatus.finalUrl = response.url();
        } else if (status >= 400) {
          pageStatus.errors.push(`HTTP ${status} error`);
        }
      });

      // Navigate with retry for timeouts
      let content = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          await page.goto(url, {
            waitUntil: 'networkidle0',
            timeout: 20000
          });

          // Wait for dynamic content
          await page.waitForFunction(() => {
            const body = document.body;
            return body && body.innerHTML.length > 100;
          }, { timeout: 5000 }).catch(() => {
            pageStatus.errors.push('Timeout waiting for content');
          });

          // Extract content
          content = await page.evaluate(() => {
            function getVisibleText(element: Element): string {
              const style = window.getComputedStyle(element);
              if (style.display === 'none' || style.visibility === 'hidden') return '';
              return element.textContent?.trim() || '';
            }

            // Get metadata
            const metadata = {
              title: document.title,
              description: '',
              type: '',
              image: ''
            };

            // Get meta tags
            for (const tag of document.getElementsByTagName('meta')) {
              const name = tag.getAttribute('name')?.toLowerCase();
              const property = tag.getAttribute('property')?.toLowerCase();
              const content = tag.getAttribute('content');
              
              if (!content) continue;
              
              if (name === 'description' || property === 'og:description') {
                metadata.description = content;
              } else if (property === 'og:type') {
                metadata.type = content;
              } else if (property === 'og:image') {
                metadata.image = content;
              }
            }

            // Get main content with priority selectors
            const mainContent = new Set<string>();
            const selectors = [
              'main',
              'article',
              '[role="main"]',
              '#main-content',
              '.main-content',
              '.content',
              '.post',
              '.article'
            ];

            // Try priority selectors first
            for (const selector of selectors) {
              for (const el of document.querySelectorAll(selector)) {
                const text = getVisibleText(el);
                if (text) mainContent.add(text);
              }
            }

            // If no priority content found, try to find content intelligently
            if (mainContent.size === 0) {
              // Look for download sections
              const downloadSelectors = [
                '[href*="download"]',
                '[href*="install"]',
                'a[href$=".exe"]',
                'a[href$=".dmg"]',
                'a[href$=".zip"]',
                '[class*="download"]',
                '[id*="download"]'
              ];

              for (const selector of downloadSelectors) {
                const elements = document.querySelectorAll(selector);
                for (const el of elements) {
                  const parent = el.parentElement;
                  if (parent) {
                    const section = parent.closest('section, div, article');
                    if (section) {
                      const text = getVisibleText(section);
                      if (text) mainContent.add(text);
                    }
                  }
                }
              }

              // Get text from large text blocks
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
                    if (!text || text.length < 20) {
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

          break; // Success, exit retry loop
        } catch (error) {
          if (attempt === 2) throw error; // Last attempt failed
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait before retry
        }
      }

      await browser.close();

      if (!content) {
        throw new Error('Failed to extract content');
      }

      const formattedContent = formatContent(content, pageStatus);
      
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

// Method 3: Static fallback for known domains
async function tryStaticFallback(url: string): Promise<string> {
  const parsedUrl = new URL(url);
  const staticContent: Record<string, string> = {
    'codeium.com': `
Title: Codeium - AI-Powered Development Tools
Description: Download and install Codeium's AI code completion tools for your favorite IDE

Main Content:
Codeium is a powerful AI development platform offering:

Key Features:
- Free AI code completion with support for 70+ programming languages
- Context-aware code suggestions
- Natural language to code generation
- Code explanation and documentation
- Smart code refactoring suggestions

Available Extensions:
- VS Code Extension: Get AI assistance right in Visual Studio Code
- JetBrains Plugin: Works with IntelliJ, PyCharm, WebStorm, and other JetBrains IDEs
- Vim/Neovim Plugin: AI coding in your terminal editor
- Emacs Plugin: Enhance Emacs with AI capabilities
- Command Line Interface: Access AI coding features from your terminal

Why Choose Codeium:
- Free tier available with core features
- Privacy-focused development
- Regular updates and improvements
- Large language support
- Active community and support

Visit https://codeium.com for more information and documentation.
`,
    'monkeytype.com': `
Title: Monkeytype - A Minimalistic Typing Test
Description: Test and improve your typing speed with a clean, customizable interface

Main Content:
Monkeytype is a modern typing test website featuring:
- Multiple test modes (time, words, quotes, zen)
- Customizable themes and settings
- Progress tracking and detailed statistics
- Daily challenges and leaderboards
- Account system for saving results
- Support for multiple languages
- Real-time accuracy and speed feedback
- Smooth, responsive interface
`
  };

  const content = staticContent[parsedUrl.hostname];
  if (!content) {
    throw new Error('No static content available for this domain');
  }
  return content.trim();
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
    const { message, urls = [], previousMessages = [] } = body;

    if (!message && urls.length === 0) {
      return new Response(
        JSON.stringify({ error: "Message or URLs are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Scrape content from provided URLs with caching
    const scrapedResults = await Promise.allSettled(
      urls.map((url: string) => scrapeUrl(url))
    );

    // Filter successful scrapes and collect errors
    const successfulScrapes: string[] = [];
    const failedUrls: string[] = [];

    scrapedResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const summarized = summarizeContent(result.value);
        successfulScrapes.push(summarized);
      } else {
        console.error(`Failed to scrape ${urls[index]}:`, result.reason);
        failedUrls.push(urls[index]);
      }
    });

    // Create a map of URLs to their summarized content
    const urlContentMap = urls.reduce((acc, url, index) => {
      if (scrapedResults[index].status === 'fulfilled') {
        acc[url] = summarizeContent((scrapedResults[index] as PromiseFulfilledResult<string>).value);
      }
      return acc;
    }, {} as { [key: string]: string });

    // Convert previous messages to the correct format for Groq
    const conversationHistory = previousMessages
      .filter((msg: any) => msg.role === 'user' || msg.role === 'assistant')
      .map((msg: any) => ({
        role: msg.role === 'ai' ? 'assistant' : msg.role,
        content: msg.content
      }))
      .slice(-3);

    // Combine scraped content with user message
    const context = successfulScrapes.length
      ? `Context from provided URLs:\n${Object.entries(urlContentMap)
          .map(([url, content]) => `[${url}]:\n${content}`)
          .join("\n\n")}${failedUrls.length ? `\n\nNote: Failed to scrape: ${failedUrls.join(", ")}` : ""}\n\nUser question: ${message}`
      : message;

    const finalContext = summarizeContent(context, 6000); // Increased context size for larger model

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a helpful AI assistant. When answering questions, if context from URLs is provided, use that information and cite the sources in your response. Always reference the specific URL when citing information. If CSS or styling issues are detected, explain them clearly. If no context is provided, answer based on your general knowledge.",
        },
        ...conversationHistory,
        {
          role: "user",
          content: finalContext,
        },
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.3, // Reduced temperature for more focused responses
      max_tokens: 4096, // Increased token limit
    });

    return new Response(JSON.stringify({
      content: completion.choices[0]?.message?.content || "Sorry, I couldn't generate a response.",
      sources: urls,
      failedUrls: failedUrls.length > 0 ? failedUrls : undefined,
    }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Chat API error:", error);
    let errorMessage = "Failed to process your request";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        detail: error instanceof Error ? error.stack : undefined
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
