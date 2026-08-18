const TJS = require("typescript-json-schema");
const path = require("path");
const fs = require("fs");

function getAllTypeScriptFiles(directory) {
  try {
    const files = fs.readdirSync(directory);
    return files
      .filter(file => file.endsWith('.ts'))
      .map(file => path.resolve(directory, file));
  } catch (error) {
    console.warn(`⚠️  Could not read directory ${directory}:`, error.message);
    return [];
  }
}

function extractExportedTypes(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const exportMatches = content.match(/export\s+(?:interface|type)\s+(\w+)/g) || [];
    return exportMatches.map(match => {
      const nameMatch = match.match(/export\s+(?:interface|type)\s+(\w+)/);
      return nameMatch ? nameMatch[1] : null;
    }).filter(Boolean);
  } catch (error) {
    console.warn(`⚠️  Could not read file ${filePath}:`, error.message);
    return [];
  }
}

function generateAllSwaggerSchemas() {
  try {

    const typesDirectory = path.resolve("src/types");
    const typeFiles = getAllTypeScriptFiles(typesDirectory);

    if (typeFiles.length === 0) {
      console.log('📂 No TypeScript files found in src/types directory');
      return {};
    }


    // Extract exported types from each file
    const allExportedTypes = [];
    typeFiles.forEach(file => {
      const types = extractExportedTypes(file);
      allExportedTypes.push(...types);
    });

    const program = TJS.getProgramFromFiles(typeFiles);

    const generator = TJS.buildGenerator(program, {
      required: true,
      noExtraProps: true,
      ref: false
    });

    const schemas = {};


    allExportedTypes.forEach(symbolName => {
      const schema = generator.getSchemaForSymbol(symbolName);
      if (schema) {
        delete schema.$schema;
        schemas[symbolName] = schema;
      } else {
        console.log(`❌ Failed to generate schema for ${symbolName}`);
      }
    });

    console.log('🎉 Total schemas generated:', Object.keys(schemas).length);

    return schemas;
  } catch (error) {
    console.error('❌ Error generating schemas:', error);
    return {};
  }
}

module.exports = { generateAllSwaggerSchemas };