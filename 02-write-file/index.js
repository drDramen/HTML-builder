const path = require('path');
const process = require('process');
const { createWriteStream } = require('fs');
const { stdout, stdin } = process;

const ws = createWriteStream(path.join(__dirname, 'text.txt'));

stdin.on('data', (chunk) => {
  const chunkStringified = chunk.toString();

  if (chunkStringified.match('exit')) return process.exit();

  ws.write(chunkStringified);
});

ws.on('error', (err) => console.log(err));
process.on('exit', () => stdout.write('Bye, see you again.'));
process.on('SIGINT', () => process.exit());

stdout.write('Hello my friend!\n');
stdout.write('Type text here:\n');
