# Deno Page Metadata Scraper 

written off the cloudflare meta worker from https://github.com/TheFoundation/cloudflare-worker-scraper

```
deno add npm:html-entities;deno add npm:top-user-agents;deno add npm:unique-random-array

deno run --allow-run --allow-net --allow-write --allow-read --allow-import index.ts
```

This starts the server at http://localhost:8000/

use it like http://localhost:8000/?url=https://my.domain.lan/my-link

