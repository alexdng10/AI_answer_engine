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

    // Set longer timeout for initial navigation
    await page.setDefaultNavigationTimeout(30000);
    
    try {
      // Wait for network idle to ensure dynamic content loads
      await page.goto(url, {
        waitUntil: ['networkidle0', 'domcontentloaded'],
        timeout: 30000
      });

      // Wait a bit for any dynamic content
      await page.waitForTimeout(2000);

      // Try to get content after scrolling
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
        return new Promise(resolve => setTimeout(resolve, 1000));
      });

      // Get the page content
      const content = await page.evaluate(() => {
        // Remove unwanted elements
        const elementsToRemove = document.querySelectorAll('script, style, noscript, iframe, img, svg, video');
        elementsToRemove.forEach(el => el.remove());

        // Get text from body
        const body = document.body;
        return body ? body.innerText : '';
      });

      await browser.close();

      // Clean up the text
      const cleanedContent = content
        .replace(/\s+/g, ' ')
        .replace(/\n+/g, '\n')
        .trim();

      if (!cleanedContent) {
        throw new Error('No content found on page');
      }

      // Cache the result
      urlCache[url] = {
        content: cleanedContent,
        timestamp: Date.now()
      };

      return cleanedContent;

    } catch (navigationError) {
      console.error(`Navigation error for ${url}:`, navigationError);
      
      // Fallback to simpler content extraction
      const content = await page.content();
      const $ = cheerio.load(content);
      
      // Remove unwanted elements
      $('script, style, noscript, iframe').remove();
      
      // Get text content
      const text = $('body').text().replace(/\s+/g, ' ').trim();
      
      if (!text) {
        throw new Error('No content found on page');
      }
      
      await browser.close();
      
      // Cache the result
      urlCache[url] = {
        content: text,
        timestamp: Date.now()
      };
      
      return text;
    }

  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    if (error instanceof Error) {
      throw new Error(`Failed to scrape ${url}: ${error.message}`);
    }
    throw new Error(`Failed to scrape ${url}`);
  }
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
        successfulScrapes.push(result.value);
      } else {
        console.error(`Failed to scrape ${urls[index]}:`, result.reason);
        failedUrls.push(urls[index]);
      }
    });

    // Create a map of URLs to their content for reference
    const urlContentMap = urls.reduce((acc, url, index) => {
      if (scrapedResults[index].status === 'fulfilled') {
        acc[url] = (scrapedResults[index] as PromiseFulfilledResult<string>).value;
      }
      return acc;
    }, {} as { [key: string]: string });

    // Convert previous messages to the correct format for Groq
    const conversationHistory = previousMessages
      .filter((msg: any) => msg.role === 'user' || msg.role === 'assistant')
      .map((msg: any) => ({
        role: msg.role === 'ai' ? 'assistant' : msg.role,
        content: msg.content
      }));

    // Combine scraped content with user message
    const context = successfulScrapes.length
      ? `Context from provided URLs:\n${Object.entries(urlContentMap)
          .map(([url, content]) => `[${url}]: ${content}`)
          .join("\n\n")}${failedUrls.length ? `\n\nNote: Failed to scrape: ${failedUrls.join(", ")}` : ""}\n\nUser question: ${message}`
      : message;

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
          content: context,
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
