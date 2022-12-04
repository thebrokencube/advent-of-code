const fs = require('fs/promises');

const INPUT_FILE = 'input.txt';

const getGroupedCaloriesByElf = async () => {
  try {
    const data = await fs.readFile(INPUT_FILE, { encoding: 'utf8' });
    const groupedData = data.split('\n\n').map((i) => {
      const calories = i.split('\n').map((j) => parseInt(j));
      return {
        calories,
        total: calories.reduce((sum,j) => sum + j),
      }
    });
    return groupedData;
  } catch (e) {
    console.error(e);
  }
};

// Part 1
const findGreatestCalories = async () => {
  const groupedCaloriesByElf = await getGroupedCaloriesByElf();
  const greatestCaloriesElf = groupedCaloriesByElf.reduce((largest,i) => {
    return (i.total > largest.total) ? i : largest;
  }, {calories: [], total: 0});
  console.log('== Greatest Calories Elf ==\n\n', greatestCaloriesElf, '\n\n');
};



// Part 2
const getTopXElves = async (x) => {
  const groupedCaloriesByElf = await getGroupedCaloriesByElf();
  const sortedElves = groupedCaloriesByElf.sort((a, b) => {
    return b.total - a.total;
  });
  topXElves = sortedElves.slice(0,x);
  console.log(`== Top ${x} Elves ==\n\n`, topXElves, '\n\n');
  return topXElves;
};

const getTopXElvesTotal = async (x) => {
  const topXElves = await getTopXElves(x);
  const topXElvesTotal = topXElves.reduce((sum,i) => { return sum + i.total; }, 0);
  console.log(`== Top ${x} Elves Total ==\n\n`, topXElvesTotal, '\n\n');
  return topXElvesTotal;
};



(async () => {
  // Part 1
  await findGreatestCalories();

  // Part 2
  await getTopXElvesTotal(3);
})();
