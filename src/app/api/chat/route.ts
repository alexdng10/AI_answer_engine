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
    new URL(url); // This will throw if URL is invalid

    // Check cache first
    const cached = urlCache[url];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.content;
    }

    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(30000); // 30 second timeout
    await page.goto(url, { waitUntil: 'networkidle0' });
    const content = await page.content();
    await browser.close();

    const $ = cheerio.load(content);
    // Remove script tags, style tags, and comments
    $("script").remove();
    $("style").remove();
    $("comment").remove();
    
    // Get the text content
    const text = $("body").text().replace(/\s+/g, " ").trim();

    // Cache the result
    urlCache[url] = {
      content: text,
      timestamp: Date.now()
    };

    return text;
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

    // Build conversation history
    const conversationHistory = previousMessages.map((msg: any) => ({
      role: msg.role,
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