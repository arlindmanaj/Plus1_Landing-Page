import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { translations } from './translations.mjs';

const root = new URL('./', import.meta.url);
const source = await readFile(new URL('index.html', root), 'utf8');
const languages = [{ code: 'en', column: 1, locale: 'en_GB' }, { code: 'de', column: 2, locale: 'de_DE' }, { code: 'mk', column: 3, locale: 'mk_MK' }];
const entries = translations.map((copy, index) => ({ copy, token: `__PLUS1_COPY_${index}__` })).sort((a, b) => b.copy[0].length - a.copy[0].length);

// Protect longer phrases before replacing single words, and never translate
// text that was already inserted by another entry.
let template = source;
for (const { copy, token } of entries) {
  if (!template.includes(copy[0])) throw new Error(`Missing Albanian source copy: ${copy[0]}`);
  if (copy.length !== 4 || copy.some(text => typeof text !== 'string' || !text.trim())) throw new Error(`Incomplete translations: ${copy[0]}`);
  template = template.replaceAll(copy[0], token);
}
for (const { code, column, locale } of languages) {
  let html = template;
  for (const { copy, token } of entries) html = html.replaceAll(token, copy[column]);
  html = html.replace('<html lang="sq">', `<html lang="${code}">`)
    .replaceAll(/(href|src)="\.\//g, '$1="../')
    .replace('rel="canonical" href="https://www.plus1.to/"', `rel="canonical" href="https://www.plus1.to/${code}/"`)
    .replace('property="og:url" content="https://www.plus1.to/"', `property="og:url" content="https://www.plus1.to/${code}/"`)
    .replace('property="og:locale" content="sq_AL"', `property="og:locale" content="${locale}"`)
    .replace(' title="Shqip" aria-current="page"', ' title="Shqip"')
    .replace(new RegExp(`(hreflang="${code}" lang="${code}"[^>]*)(>)`), '$1 aria-current="page"$2');
  if (code !== 'en') html = html.replace('<strong>2,500<span>', '<strong>2.500<span>');
  await mkdir(new URL(`${code}/`, root), { recursive: true });
  await writeFile(new URL(`${code}/index.html`, root), html);
}
console.log(`Generated ${languages.map(language => language.code).join(', ')} landing pages with ${translations.length} translated copy entries.`);
