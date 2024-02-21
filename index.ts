import {
  generateErrorJSONResponse,
  generateJSONResponse,
} from './json-response'
import { linkType } from './link-type'
import Scraper from './scraper'
//import { TidyURL } from 'tidy-url'
import { TidyURL } from "npm:tidy-url^1.10.1"
import { scraperRules } from './scraper-rules'

//    "": "^4.0.5",
//    "html-entities": "^2.4.0",
//    "isomorphic-dompurify": "^1.9.0",
//    "tidy-url": "^1.10.1",
//    "top-user-agents": "^1.0.66",
//    "unique-random-array": "^3.0.0"
//import express from "npm:express@4.18.2";

//import file-extension from "npm:file-extension^4.0.5"
//import html-entities from "npm:html-entities^2.4.0"

addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(handleRequest(event.request))
})

type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue }

interface JSONObject {
  [k: string]: JSONValue
}

export type ScrapeResponse = string | string[] | JSONObject

async function handleRequest(request: Request) {
  const searchParams = new URL(request.url).searchParams
  const scraper = new Scraper()
  let response: Record<string, ScrapeResponse>
  let url = searchParams.get('url')
  const cleanUrl = searchParams.get('cleanUrl')

  if (!url) {
    return generateErrorJSONResponse(
      'Please provide a `url` query parameter, e.g. ?url=https://example.com'
    )
  }

  if (url && !url.match(/^[a-zA-Z]+:\/\//)) {
    url = 'https://' + url
  }

  try {
    const requestedUrl = new URL(url)

    // If the url is a reddit url, use old.reddit.com because it has much
    // more information when scraping
    if (url.includes('reddit.com')) {
      requestedUrl.hostname = 'old.reddit.com'
      url = requestedUrl.toString()
    }

    await scraper.fetch(url)
  } catch (error) {
    return generateErrorJSONResponse(error, url)
  }

  try {
    // Get metadata using the rules defined in `src/scraper-rules.ts`
    response = await scraper.getMetadata(scraperRules)

    const unshortenedUrl = scraper.response.url

    // Add cleaned url
    if (cleanUrl) {
      const cleanedUrl = TidyURL.clean(unshortenedUrl || url)
      response.cleaned_url = cleanedUrl.url
    }

    // Add unshortened url
    response.url = unshortenedUrl

    // Add url type
    response.urlType = linkType(url, false)

    // Parse JSON-LD
    if (response?.jsonld) {
      response.jsonld = JSON.parse(response.jsonld as string)
    }
  } catch (error) {
    return generateErrorJSONResponse(error, url)
  }

  return generateJSONResponse(response)
}
