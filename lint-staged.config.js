module.exports = {
  // '*.{js,jsx,less,json}': ['prettier --write'],
  // '*.ts?(x)': ['prettier --parser=typescript --write'],
  'packages/**/*.{css,less}': ['stylelint --fix'],
  'packages/**/*.ts?(x)': ['eslint'],
  // 'packages/*/**/*.{js,jsx,ts,tsx,less}': (filenames) => {
  //   const compReg = /\/packages\/([^/]+)\//;
  //   const paths = new Set();
  //   filenames.forEach((filename) => {
  //     const matchs = filename.match(compReg);
  //     if (matchs && matchs[0]) {
  //       paths.add(matchs[0]);
  //     }
  //   });

  //   const pathStr = Array.from(paths).join(' ');
  //   console.log('jest paths => ', pathStr);
  //   return pathStr ? [`jest ${pathStr} --passWithNoTests`] : [];
  // },
};
