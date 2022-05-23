const { readdir, stat } = require('fs/promises');
const path = require('path');

const sourceFolder = path.join(__dirname, 'secret-folder');

const filesInFolders = async (source) => {
  try {
    const files = await readdir(source, { withFileTypes: true });

    for (const file of files) {
      if (file.isFile()) {
        const fullName = file.name;
        const fileStat = await stat(path.join(source, fullName));
        const extName = path.extname(fullName);
        const extNameLength = extName.length;
        const fileName = extNameLength > 0 ? fullName.slice(0, -extNameLength) : fullName;
        const filesize = fileStat.size;

        console.log(`${fileName} - ${extName.slice(1)} - ${filesize}B`);
      }
    }
  } catch (error) {
    console.error(`Error occured: ${error}`);
  }
};

filesInFolders(sourceFolder);
