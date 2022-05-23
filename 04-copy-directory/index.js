const { constants } = require('fs');
const { mkdir, stat, readdir, copyFile, rm, access } = require('fs/promises');
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

const source = path.join(__dirname, 'files');
const destination = path.join(__dirname, 'files-copy');


(async () => {
  const isExist = await folderExist(destination);

  if (isExist) {
    await removeDir(destination);
  }

  await copyDir(source, destination);
})();
