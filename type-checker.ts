import { fileExtension } from "https://deno.land/x/file_extension/mod.ts";
import { types } from './types.ts'

export type LinkType =
  | 'link'
  | 'video'
  | 'audio'
  | 'recipe'
  | 'image'
  | 'document'
  | 'article'
  | 'game'
  | 'book'
  | 'event'
  | 'product'
  | 'note'
  | 'file'
export type TypeDictionary = Record<string, LinkType>
export const typeChecker = (path: string): LinkType | undefined => {
  try {
    const url = new URL(path)
    const hostname = url.hostname.replace('www.', '')
    return types[hostname]
  } catch (err) {
    // swallow the error, no need to do anything
  }

  const extension = fileExtension(path)
  if (extension) {
    return types[extension]
  }

  return undefined
}
