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

async function scrapeUrl(url: string): Promise<string> {
  try {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto(url);
    const content = await page.content();
    await browser.close();

    const $ = cheerio.load(content);
    // Remove script tags, style tags, and comments
    $("script").remove();
    $("style").remove();
    $("comment").remove();
    
    // Get the text content
    const text = $("body").text().replace(/\s+/g, " ").trim();
    return text;
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return "";
  }
}

export async function POST(req: Request) {
  try {
    const { message, urls = [] } = await req.json();

    // Scrape content from provided URLs
    const scrapedContents = await Promise.all(
      urls.map((url: string) => scrapeUrl(url))
    );

    // Combine scraped content with user message
    const context = scrapedContents.length
      ? `Context from provided URLs:\n${scrapedContents.join("\n\n")}\n\nUser question: ${message}`
      : message;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a helpful AI assistant. When answering questions, if context from URLs is provided, use that information and cite the sources in your response. If no context is provided, answer based on your general knowledge.",
        },
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
    }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process your request" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
