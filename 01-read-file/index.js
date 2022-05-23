const path = require('path');
const { stdout } = require('process');
const { createReadStream } = require('fs');

const fileName = 'text.txt';
const readableStream = createReadStream(path.join(__dirname, fileName), 'utf-8');

readableStream.pipe(stdout);
