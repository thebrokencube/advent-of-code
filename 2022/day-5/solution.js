const fs = require('fs/promises');

const INPUT_FILE = 'input.txt';

// Starting State Parsing

const STACK_TEXT_LENGTH = 3;
const STACK_SPACER_LENGTH = 1;

const parseInputRow = (row, numStacks) => {
  const result = [];
  for(i = 0; i < numStacks; i++) {
    const start = i * (STACK_TEXT_LENGTH + STACK_SPACER_LENGTH);
    const end = start + STACK_TEXT_LENGTH;
    const item = row.slice(start, end);
    result.push(item)
  }
  return result;
};

const parseStartingState = (startingStateInput) => {
  const splitStartingState = startingStateInput.split('\n').filter(i => i.trim().length > 0);
  const stackLabels = splitStartingState[splitStartingState.length-1];
  const rows = splitStartingState.slice(0, splitStartingState.length-1);

  // set up the initial structure
  const stacks = stackLabels
    .split(/(\s+)/)
    .filter(i => i.trim().length > 0)
    .reduce((all, i) => {
      all.push({ label: i.trim(), items: [] });
      return all;
    }, []);

  // go through all the rows from the bottom up
  rows.reverse().forEach((i) => {
    parseInputRow(i, stacks.length).forEach((j, stack_idx) => {
      const matchedItem = j.trim().match(/\[([a-zA-Z0-9])\]/);
      const parsedItem = matchedItem && matchedItem[1] || '';
      if (parsedItem?.length > 0) {
        stacks[stack_idx].items.push(parsedItem);
      }
    })
  });

  return stacks;
};

// Move Parsing

const MOVE_REGEX = /move (\d+) from (\d+) to (\d+)/;

const parseMoves = (movesInput) => {
  const splitMoves = movesInput.split('\n').filter(i => i.trim().length > 0);
  const parsedMoves = splitMoves.map((i) => {
    const matchedItem = i.match(MOVE_REGEX);
    if (matchedItem && matchedItem.length === 4) {
      return {
        initialCommand: matchedItem[0],
        numToMove: matchedItem[1],
        startStack: matchedItem[2],
        endStack: matchedItem[3],
      }
    } else {
      console.error('INVALID MOVE', i);
      return {}
    }
  });
  return parsedMoves;
};

const getStartingStateAndMoves = async () => {
  try {
    const data = await fs.readFile(INPUT_FILE, { encoding: 'utf8' });
    const [startingState, moves] = data.split('\n\n').filter(i => i.trim().length > 0);
    return {
      startingState: parseStartingState(startingState),
      moves: parseMoves(moves),
    };
  } catch (e) {
    console.error(e);
  }
};

// Move Execution

const getStackIndexFromLabel = (state, label) => {
  return state.findIndex((i) => i.label === label);
};

const executeMoveOnState = (state, { initialCommand, numToMove, startStack, endStack }, retainOrderOnMove = false) => {
  const startStackIdx = getStackIndexFromLabel(state, startStack);
  const endStackIdx = getStackIndexFromLabel(state, endStack);

  const startStackLength = state[startStackIdx].items.length;
  const startStackEndIdx = startStackLength - numToMove;

  if (startStackEndIdx < 0) {
    console.error('Cannot execute move:', initialCommand);
    return;
  }

  const toMove = state[startStackIdx].items.splice(startStackEndIdx);

  state[endStackIdx].items.push(
    ...(retainOrderOnMove ? toMove : toMove.reverse())
  );
};

// Simulate and calculate moves

const topCratesMessage = async ({ retainOrderOnMove = false }) => {
  const { startingState, moves } = await getStartingStateAndMoves();
  moves.forEach((i) => executeMoveOnState(startingState, i, retainOrderOnMove));

  const message = startingState
    .map((i) => i.items.length > 0 ? i.items[i.items.length-1] : '')
    .join('');

  console.log(`== Top Crates Message ==\n\n`, message, '\n\n');
};



(async () => {
  // Part 1
  await topCratesMessage({ retainOrderOnMove: false });

  // Part 2
  await topCratesMessage({ retainOrderOnMove: true });
})();
