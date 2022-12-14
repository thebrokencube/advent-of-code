const fs = require('fs/promises');

const INPUT_FILE = 'input.txt';

const getForestGrid = async () => {
  try {
    const input = (await fs.readFile(INPUT_FILE, { encoding: 'utf8' })).trim();
    return input.split('\n').map(i => i.split('').map(j => parseInt(j)));
  } catch (e) {
    console.error(e);
  }
};

const generateTreeGridInfo = ({ grid, rowIdx, colIdx }) => {
  const current = grid[rowIdx][colIdx];

  const gridRow = grid[rowIdx];
  const gridCol = grid.map(i => i[colIdx]);

  const east = gridRow.slice(0, colIdx);
  const west = gridRow.slice(colIdx+1);
  const north = gridCol.slice(0, rowIdx);
  const south = gridCol.slice(rowIdx+1);

  return { current, east, west, north, south };
};

// Part 1

const isVisible = ({ grid, rowIdx, colIdx }) => {
  const { current, east, west, north, south } = generateTreeGridInfo({ grid, rowIdx, colIdx });

  const visibleFromEast = east.every(i => i < current);
  const visibleFromWest = west.every(i => i < current);
  const visibleFromNorth = north.every(i => i < current);
  const visibleFromSouth = south.every(i => i < current);

  return visibleFromEast || visibleFromWest || visibleFromNorth || visibleFromSouth;
};

const generateVisibleMap = (grid) => {
  return grid.map((_, rowIdx) => {
    return grid.map((_, colIdx) => {
      return isVisible({ grid, rowIdx, colIdx }) ? 1 : 0;
    })
  })
};

const calculateNumberVisibleTrees = async () => {
  const grid = await getForestGrid();
  const visibleMap = generateVisibleMap(grid);

  const numberVisibleTrees = visibleMap.reduce((total, i) => {
    return total + i.reduce((innerTotal, j) => innerTotal + j, 0);
  }, 0);

  console.log(`\n== Total visible trees ==\n\n`, numberVisibleTrees, '\n\n')
};

// Part 2

const calculateScenicScore = ({ grid, rowIdx, colIdx }) => {
  const { current, east, west, north, south } = generateTreeGridInfo({ grid, rowIdx, colIdx });

  const eastIndex = east.reverse().findIndex(i => i >= current);
  const eastScore = eastIndex === -1 ? east.length || 1 : eastIndex + 1;

  const westIndex = west.findIndex(i => i >= current);
  const westScore = westIndex === -1 ? west.length || 1 : westIndex + 1;

  const northIndex = north.reverse().findIndex(i => i >= current);
  const northScore = northIndex === -1 ? north.length || 1 : northIndex + 1;

  const southIndex = south.findIndex(i => i >= current);
  const southScore = southIndex === -1 ? south.length || 1 : southIndex + 1;

  const totalScore = eastScore * westScore * northScore * southScore;
  return totalScore;
};

const generateScenicScoreMap = (grid) => {
  return grid.map((_, rowIdx) => {
    return grid.map((_, colIdx) => {
      return calculateScenicScore({ grid, rowIdx, colIdx });
    })
  })
};

const calculateHighestScenicScore = async () => {
  const grid = await getForestGrid();
  const scenicScoreMap = generateScenicScoreMap(grid);

  const highestScenicScore = scenicScoreMap.reduce((highestScore, i) => {
    const innerHighestScore = i.reduce((localHighestScore, j) => localHighestScore > j ? localHighestScore : j, 0);
    return highestScore > innerHighestScore ? highestScore : innerHighestScore;
  }, 0);

  console.log(`\n== Highest scenic score ==\n\n`, highestScenicScore, '\n\n')
}


(async () => {
  // Part 1
  await calculateNumberVisibleTrees();

  // Part 2
  await calculateHighestScenicScore();
})();
