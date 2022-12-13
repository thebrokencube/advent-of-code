const fs = require('fs/promises');

const INPUT_FILE = 'input.txt'

const getParsedPairAssignments = async () => {
  try {
    const data = await fs.readFile(INPUT_FILE, { encoding: 'utf8' });
    return data.trim().split('\n').map((i) => {
      return i.split(',').map((j) => {
        return j.split('-').map((k) => {
          return parseInt(k);
        });
      });
    });
  } catch (e) {
    console.error(e);
  }
};

// Part 1
const findFullyContainedAssignmentPairs = async () => {
  const assignments = await getParsedPairAssignments();
  const fullyContainedPairs = assignments.reduce((total,i) => {
    const elf1 = i[0];
    const elf2 = i[1];

    const elf1InElf2 = (elf1[0] >= elf2[0]) && (elf1[1] <= elf2[1]);
    const elf2InElf1 = (elf2[0] >= elf1[0]) && (elf2[1] <= elf1[1]);

    return (elf1InElf2 || elf2InElf1) ? total + 1 : total;
  }, 0);
  console.log(`== Fully Contained Pairs ==\n\n`, fullyContainedPairs, '\n\n')
};

// Part 2
const numInRange = (num, range) => {
  return num >= range[0] && num <= range[1];
}

const findOverlappingAssignmentPairs = async () => {
  const assignments = await getParsedPairAssignments();
  const overlappingPairs = assignments.reduce((total, i) => {
    const elf1 = i[0];
    const elf2 = i[1];

    const isOverlappingAssginment = (
      (numInRange(elf1[0], elf2) || numInRange(elf1[1], elf2)) ||
      (numInRange(elf2[0], elf1) || numInRange(elf2[1], elf1))
    );

    return isOverlappingAssginment ? total + 1 : total;
  }, 0);
  console.log(`== Overlapping Pairs ==\n\n`, overlappingPairs, '\n\n')
};

(async () => {
  // Part 1
  await findFullyContainedAssignmentPairs();

  // Part 2
  await findOverlappingAssignmentPairs();
})()
