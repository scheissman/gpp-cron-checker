export const URLS = {
  bus: 'https://www.vozaci.gpp-osijek.com/md_bus.php',
  tram: 'https://www.vozaci.gpp-osijek.com/md_tram.php',
};

export function cleanHtml(html) {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let body = bodyMatch ? bodyMatch[1] : html;

  body = body.replace(/<script[\s\S]*?<\/script>/gi, '');
  body = body.replace(/<style[\s\S]*?<\/style>/gi, '');
  body = body.replace(/<!--[\s\S]*?-->/g, '');
  body = body.replace(/<[^>]+>/g, ' ');

  body = body
    .replace(/\s+/g, ' ')
    .replace(/[^\w\dčćđšžČĆĐŠŽ.:,-]/g, '')
    .trim();

  return body;
}

export function djb2Hash(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}

export async function getHashes() {
  const result = {};

  for (const [type, url] of Object.entries(URLS)) {
    const res = await fetch(url);
    const html = await res.text();
    const cleaned = cleanHtml(html);
    result[type] = {
      hash: djb2Hash(cleaned),
      length: cleaned.length
    };
  }

  return result;
}
