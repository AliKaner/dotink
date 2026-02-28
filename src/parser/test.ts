import { parseInk } from './index';
import * as fs from 'fs';
import * as path from 'path';

const examplePath = path.resolve(__dirname, '../examples/dark-path.ink');

if (!fs.existsSync(examplePath)) {
  console.log('Test skipped: no example file');
  process.exit(0);
}

const content = fs.readFileSync(examplePath, 'utf8');
const result = parseInk(content);

console.log('--- PARSER OUTPUT ---');
console.log(JSON.stringify(result, null, 2));

if (result.errors.length > 0) {
    console.error('--- VALIDATION ERRORS ---');
    result.errors.forEach(e => console.error(e));
    process.exit(1);
}

console.log('SUCCESS: File parsed with no errors according to INK FORMAT v1.0 strict rules.');
