import generator from 'generate-password-browser';

const passwordGenerator = ():string => {
  return generator.generate({
    length: 15,
    numbers: true,
    uppercase: true,
    lowercase: true,
    symbols: true,
    strict: true,
  });
}

export default passwordGenerator;
