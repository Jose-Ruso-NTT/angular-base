const isGeneratedApiFile = (file) =>
  file.replaceAll('\\', '/').includes('/src/app/core/api/generated/');
const isApplicationSourceFile = (file) => file.replaceAll('\\', '/').includes('/src/');
const quoteFile = (file) => `"${file.replaceAll('"', '\\"')}"`;

module.exports = {
  '*.ts': (files) => {
    const sourceFiles = files.filter(
      (file) => isApplicationSourceFile(file) && !isGeneratedApiFile(file),
    );

    if (!sourceFiles.length) {
      return [];
    }

    const filesToFormat = sourceFiles.map(quoteFile).join(' ');
    return [`eslint --fix -- ${filesToFormat}`, `prettier --write -- ${filesToFormat}`];
  },
  '*.{html,css,json,md,yml,yaml}': 'prettier --write',
};
