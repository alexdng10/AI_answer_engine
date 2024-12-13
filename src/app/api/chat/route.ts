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
      ]
    });

    const page = await browser.newPage();
    
    // Set viewport and user agent
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Enable JavaScript
    await page.setJavaScriptEnabled(true);

    try {
      // Navigate to the page and wait for content
      await page.goto(url, {
        waitUntil: ['networkidle0', 'domcontentloaded'],
        timeout: 30000
      });

      // Wait for specific elements that indicate the page has loaded
      await page.waitForTimeout(3000); // Give more time for dynamic content

      // Extract visible UI elements and their text
      const content = await page.evaluate(() => {
        const getVisibleText = (element: Element): string => {
          // Check if element is visible
          const style = window.getComputedStyle(element);
          if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
            return '';
          }

          // Get text content of this element
          let text = element.textContent || '';

          // Get additional UI information
          if (element instanceof HTMLElement) {
            // Get button text and labels
            if (element.tagName === 'BUTTON' || element.role === 'button') {
              const buttonText = `Button: ${text.trim()}`;
              text = buttonText;
            }

            // Get input placeholders and labels
            if (element.tagName === 'INPUT') {
              const placeholder = element.getAttribute('placeholder');
              const label = element.getAttribute('aria-label') || element.getAttribute('title');
              if (placeholder || label) {
                text = `Input field: ${placeholder || label}`;
              }
            }

            // Get link text and href
            if (element.tagName === 'A' && element.getAttribute('href')) {
              const href = element.getAttribute('href');
              if (!href?.startsWith('#')) {
                text = `Link: ${text.trim()} (${href})`;
              }
            }

            // Get aria labels and titles
            const ariaLabel = element.getAttribute('aria-label');
            const title = element.getAttribute('title');
            if (ariaLabel || title) {
              text = `${ariaLabel || title}: ${text.trim()}`;
            }
          }

          return text.trim();
        };

        // Get all elements
        const elements = document.body.getElementsByTagName('*');
        const visibleTexts: string[] = [];

        // Process each element
        for (const element of elements) {
          const text = getVisibleText(element);
          if (text) {
            visibleTexts.push(text);
          }
        }

        // Get any visible configuration options
        const configElements = document.querySelectorAll('[class*="config"], [id*="config"], [class*="setting"], [id*="setting"]');
        const configTexts: string[] = [];
        configElements.forEach(element => {
          const text = getVisibleText(element);
          if (text) {
            configTexts.push(`Configuration: ${text}`);
          }
        });

        // Combine all text content
        return {
          title: document.title,
          mainContent: visibleTexts.join('\n'),
          configuration: configTexts.join('\n')
        };
      });

      await browser.close();

      // Format the content
      const formattedContent = `
Title: ${content.title}

Main Content:
${content.mainContent}

Configuration Options:
${content.configuration}
`.trim();

      // Cache the result
      urlCache[url] = {
        content: formattedContent,
        timestamp: Date.now()
      };

      return formattedContent;

    } catch (navigationError) {
      console.error(`Navigation error for ${url}:`, navigationError);
      
      // Fallback to simpler content extraction
      const content = await page.content();
      const $ = cheerio.load(content);
      
      // Get title
      const title = $('title').text();
      
      // Remove unwanted elements
      $('script, style, noscript, iframe').remove();
      
      // Get text content with better structure
      const mainContent = $('body').find('*').map(function() {
        const text = $(this).text().trim();
        const ariaLabel = $(this).attr('aria-label');
        const title = $(this).attr('title');
        
        if (text && (ariaLabel || title)) {
          return `${ariaLabel || title}: ${text}`;
        }
        return text;
      }).get().filter(text => text.length > 0).join('\n');
      
      if (!mainContent) {
        throw new Error('No content found on page');
      }
      
      await browser.close();
      
      const formattedContent = `
Title: ${title}

Content:
${mainContent}
`.trim();
      
      // Cache the result
      urlCache[url] = {
        content: formattedContent,
        timestamp: Date.now()
      };
      
      return formattedContent;
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
function summarizeContent(content: string, maxLength: number = 2000): string {
  if (content.length <= maxLength) return content;

  // Split content into sections
  const sections = content.split('\n\n');
  const processedSections: string[] = [];
  let currentLength = 0;

  for (const section of sections) {
    // Always include section headers
    if (section.startsWith('Title:') || section.startsWith('Main Content:') || section.startsWith('Configuration Options:')) {
      processedSections.push(section);
      currentLength += section.length;
      continue;
    }

    // For content sections, keep only unique and important information
    const lines = section.split('\n')
      .filter(line => line.trim())
      // Prioritize lines with UI elements and configuration
      .filter(line => 
        line.includes('Button:') ||
        line.includes('Input field:') ||
        line.includes('Configuration:') ||
        line.includes('Link:') ||
        line.length > 10
      )
      // Remove duplicate information
      .filter((line, index, self) => 
        self.findIndex(l => l.toLowerCase().includes(line.toLowerCase())) === index
      );

    const summarizedSection = lines.join('\n');
    if (currentLength + summarizedSection.length <= maxLength) {
      processedSections.push(summarizedSection);
      currentLength += summarizedSection.length;
    } else {
      // If we can't fit the whole section, add a note
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
        // Summarize each scraped content
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
      // Only keep last few messages to reduce context size
      .slice(-3);

    // Combine scraped content with user message, ensuring it's not too long
    const context = successfulScrapes.length
      ? `Context from provided URLs:\n${Object.entries(urlContentMap)
          .map(([url, content]) => `[${url}]:\n${content}`)
          .join("\n\n")}${failedUrls.length ? `\n\nNote: Failed to scrape: ${failedUrls.join(", ")}` : ""}\n\nUser question: ${message}`
      : message;

    // Ensure final context isn't too long
    const finalContext = summarizeContent(context, 4000);

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a helpful AI assistant. When answering questions, if context from URLs is provided, use that information and cite the sources in your response. Always reference the specific URL when citing information. If no context is provided, answer based on your general knowledge.",
        },
        ...conversationHistory,
        {
          role: "user",
          content: finalContext,
        },
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.5,
      max_tokens: 2048,
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
