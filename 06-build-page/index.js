const { readFile, readdir, mkdir, writeFile, copyFile, stat, rm, access } = require('fs/promises');
const { createWriteStream, constants } = require('fs');
const path = require('path');

const removeDir = async (target) => {
  const stats = await stat(target);
  const isDirectory = stats.isDirectory();

  if (isDirectory) {
    const files = await readdir(target);

    const results = files.map((file) => {
      return removeDir(path.join(target, file));
    });

    await Promise.all(results);
  }

  await rm(target, { recursive: true, force: true });
};

const folderExist = async (target) => {
  try {
    await access(target, constants.F_OK);
    return true;
  } catch {
    return false;
  }
};

const buildHtml = async (src, components, output) => {
  try {
    const template = await readFile(src, 'utf8');
    const templateTags = [...template.matchAll(/{{(.*)}}/g)].map((item) => item[1]);
    let newTemplate = template;

    for (let tag of templateTags) {
      const tagText = await readFile(path.join(components, `${tag}.html`), 'utf8');

      newTemplate = newTemplate.replace(`{{${tag}}}`, tagText);
    }

    await writeFile(output, newTemplate);
  } catch (error) {
    console.error(`Error occurred: ${error}`);
  }
};

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

const copyDir = async (src, dest) => {
  try {
    const stats = await stat(src);
    const isDirectory = stats.isDirectory();

    if (isDirectory) {
      await mkdir(dest, { recursive: true });
      const files = await readdir(src);

      const results = files.map((file) => {
        return copyDir(path.join(src, file), path.join(dest, file));
      });

      await Promise.all(results);
    } else {
      await copyFile(src, dest);
    }
  } catch (error) {
    console.error(`Error occurred: ${error}`);
  }
};

const bundle = async (outputDir) => {
  try {
    const isExist = await folderExist(outputDir);

    if (isExist) {
      await removeDir(outputDir);
    }

    await mkdir(outputDir, { recursive: true });

    const src = {
      htmlTemplate: path.join(__dirname, 'template.html'),
      htmlComponents: path.join(__dirname, 'components'),
      stylesDir: path.join(__dirname, 'styles'),
      assetsDir: path.join(__dirname, 'assets')
    };

    const output = {
      html: path.join(outputDir, 'index.html'),
      style: path.join(outputDir, 'style.css'),
      assets: path.join(outputDir, 'assets')
    };

    await buildHtml(src.htmlTemplate, src.htmlComponents, output.html);
    await mergeStyles(src.stylesDir, output.style);
    await copyDir(src.assetsDir, output.assets);
  } catch (error) {
    console.error(`Error occurred: ${error}`);
  }
};

const outputDir = path.join(__dirname, 'project-dist');

bundle(outputDir);
