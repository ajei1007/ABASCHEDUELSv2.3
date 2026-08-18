/* eslint-disable */
import fs from 'fs'

const packageJson = JSON.parse(fs.readFileSync(('./package.json')).toString()) 

const appVersion = packageJson.version;

const jsonData = {
  version: appVersion
};

const jsonContent = JSON.stringify(jsonData);

fs.writeFile('./public/meta.json', jsonContent, 'utf8', function(err) {
  if (err) {
    console.log('An error occured while writing JSON Object to meta.json');
    return console.log(err);
  }

  console.log('meta.json file has been saved with latest version number');
});

/* eslint-enable */