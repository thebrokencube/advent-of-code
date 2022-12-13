const fs = require('fs/promises');

const INPUT_FILE = 'input.txt';

const getInput = async () => {
  try {
    return await fs.readFile(INPUT_FILE, { encoding: 'utf8' });
  } catch (e) {
    console.error(e);
  }
};

const findMatchingCharactersProcessed = (input, matchingCharacters) => {
  if (input.length < matchingCharacters) {
    console.error(`input length is less than ${matchingCharacters}, so no packet marker can be found`, input);
  }

  let charactersProcessed;
  for (idx = matchingCharacters - 1; idx < input.length; idx++) {
    const startIdx = idx - matchingCharacters

    const uniqueValues = new Set(input.slice(startIdx, idx));
    if (uniqueValues.size === matchingCharacters) {
      charactersProcessed = idx;
      break;
    }
  }

  return charactersProcessed;
};

const findStartOfPacketMarker = async () => {
  const input = (await getInput()).trim();
  const charactersProcessed = findMatchingCharactersProcessed(input, 4);
  console.log(`== Start-Of-Message ==\n\n`, charactersProcessed || 'could not find', '\n\n')
};

const findStartOfMessageMarker = async () => {
  const input = (await getInput()).trim();
  const charactersProcessed = findMatchingCharactersProcessed(input, 14);
  console.log(`== Start-Of-Message ==\n\n`, charactersProcessed || 'could not find', '\n\n')
}

(async () => {
  // Part 1
  await findStartOfPacketMarker();

  // Part 2
  await findStartOfMessageMarker();
})();
