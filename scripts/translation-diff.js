const fs = require('fs');
const jsonDiff = require('json-diff');

const lang = process.argv[2];
if (!lang) {
  console.error('Please provide a language code as an argument (e.g., fr, cn, ...).');
  process.exit(1);
}

const masterLangPath = 'src/locales/en.json';
const otherLangPath = `src/locales/${lang}.json`;

if (!fs.existsSync(otherLangPath)) {
  console.error(`File not found: ${otherLangPath}`);
  process.exit(1);
}

const masterLang = JSON.parse(fs.readFileSync(masterLangPath, 'utf8'));
const otherLang = JSON.parse(fs.readFileSync(otherLangPath, 'utf8'));

const diff = jsonDiff.diff(masterLang, otherLang, { keysOnly: true });

if (diff) {
  console.log(`Differences found for ${lang}.json:`);
  console.log(JSON.stringify(diff, null, 2));
} else {
  console.log(`No differences in keys for ${lang}.json.`);
}