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
    // Validate URL
    new URL(url);

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
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080',
        '--enable-javascript',
        '--disable-extensions', // Disable extensions that might interfere
        '--allow-running-insecure-content', // Allow mixed content
      ]
    });

    const page = await browser.newPage();
    
    // Set viewport and user agent
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Enable JavaScript and CSS
    await page.setJavaScriptEnabled(true);
    
    // Intercept requests to detect loading issues
    let loadingIssues: string[] = [];
    await page.setRequestInterception(true);
    
    page.on('request', request => {
      request.continue();
    });
    
    page.on('requestfailed', request => {
      if (request.url().endsWith('.css')) {
        loadingIssues.push(`Failed to load CSS: ${request.url()}`);
      } else if (request.url().endsWith('.js')) {
        loadingIssues.push(`Failed to load JavaScript: ${request.url()}`);
      } else if (request.url().includes('service-worker')) {
        loadingIssues.push(`Service Worker issue: ${request.url()}`);
      }
    });

    try {
      // Navigate with longer timeout and wait for everything
      await page.goto(url, {
        waitUntil: ['networkidle0', 'domcontentloaded', 'load'],
        timeout: 45000 // 45 seconds timeout
      });

      // Check for JavaScript errors
      const jsErrors = await page.evaluate(() => {
        const errors: string[] = [];
        if (!window.localStorage) errors.push('LocalStorage is not available');
        if (!window.indexedDB) errors.push('IndexedDB is not available');
        if (!navigator.serviceWorker) errors.push('ServiceWorker is not supported');
        return errors;
      });
      
      loadingIssues.push(...jsErrors);

      // Wait for any CSS files to load
      await page.waitForFunction(() => {
        const styleSheets = document.styleSheets;
        return Array.from(styleSheets).some(sheet => sheet.cssRules && sheet.cssRules.length > 0);
      }, { timeout: 10000 }).catch(() => {
        loadingIssues.push('Timeout waiting for CSS to load');
      });

      // Check for cookie consent and dark mode issues
      const siteIssues = await page.evaluate(() => {
        const issues: string[] = [];
        if (document.querySelector('[class*="cookie"]')) {
          issues.push('Cookie consent banner detected');
        }
        if (document.querySelector('[class*="dark"]')) {
          issues.push('Dark mode elements detected - check for theme compatibility');
        }
        return issues;
      });
      
      loadingIssues.push(...siteIssues);

      // Get computed styles to verify CSS loading
      const stylesLoaded = await page.evaluate(() => {
        const body = document.body;
        const computedStyle = window.getComputedStyle(body);
        return {
          backgroundColor: computedStyle.backgroundColor,
          color: computedStyle.color,
          fontFamily: computedStyle.fontFamily,
          visibility: computedStyle.visibility,
          display: computedStyle.display
        };
      });

      // Extract page information
      const content = await page.evaluate(() => {
        const getVisibleText = (element: Element): string => {
          const style = window.getComputedStyle(element);
          if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
            return '';
          }

          let text = element.textContent || '';
          if (element instanceof HTMLElement) {
            const role = element.getAttribute('role');
            const ariaLabel = element.getAttribute('aria-label');
            const title = element.getAttribute('title');
            
            if (element.tagName === 'BUTTON' || role === 'button') {
              text = `Button: ${text.trim()}`;
            } else if (element.tagName === 'INPUT') {
              const placeholder = element.getAttribute('placeholder');
              text = `Input: ${placeholder || ariaLabel || title || text}`;
            } else if (ariaLabel || title) {
              text = `${ariaLabel || title}: ${text}`;
            }
          }
          return text.trim();
        };

        const elements = document.body.getElementsByTagName('*');
        const visibleTexts = Array.from(elements)
          .map(getVisibleText)
          .filter(text => text.length > 0);

        return {
          title: document.title,
          description: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
          mainContent: visibleTexts.join('\n'),
        };
      });

      await browser.close();

      // Format the content with loading status
      const formattedContent = `
Title: ${content.title}
Description: ${content.description}

${loadingIssues.length > 0 ? `Technical Details:
${loadingIssues
  .filter(issue => 
    // Only show critical issues
    issue.includes('JavaScript') || 
    issue.includes('Service Worker') ||
    issue.includes('Failed to load')
  )
  .map(issue => `- ${issue}`)
  .join('\n')}

Site Configuration:
${JSON.stringify({
  theme: stylesLoaded.backgroundColor === 'rgb(50, 52, 55)' ? 'dark' : 'light',
  font: stylesLoaded.fontFamily
}, null, 2)}` : '✅ Page loaded successfully'}

Main Content:
${content.mainContent
  .split('\n')
  .filter(line => 
    // Filter out technical details from content
    !line.includes('JavaScript') &&
    !line.includes('service worker') &&
    !line.includes('cache') &&
    !line.includes('cookie')
  )
  .join('\n')}
`.trim();

      // Cache the result
      urlCache[url] = {
        content: formattedContent,
        timestamp: Date.now()
      };

      return formattedContent;

    } catch (navigationError) {
      console.error(`Navigation error for ${url}:`, navigationError);
      await browser.close();
      throw navigationError;
    }

  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    if (error instanceof Error) {
      throw new Error(`Failed to scrape ${url}: ${error.message}`);
    }
    throw new Error(`Failed to scrape ${url}`);
  }
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
      section.startsWith('Page Status:') ||
      section.includes('Loading Issues:')
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
