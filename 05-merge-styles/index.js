const { createWriteStream } = require('fs');
const { readdir, readFile } = require('fs/promises');
const path = require('path');

const mergeStyles = async (source, output) => {
  try {
    const files = await readdir(source, { withFileTypes: true });
    const ws = createWriteStream(output);

    const bundle = files.reduce((acc, file) => {
      if (file.isFile() && path.extname(file.name) === '.css') {
        acc.push(readFile(path.join(__dirname, 'styles', file.name)));
      }
      return acc;
    }, []);

    const result = await Promise.all(bundle);
    
    result.forEach((value) => ws.write(value));
  } catch (error) {
    console.error(`Error occurred: ${error}`);
  }
};

const source = path.join(__dirname, 'styles');
const output = path.join(__dirname, 'project-dist', 'bundle.css');

mergeStyles(source, output);
