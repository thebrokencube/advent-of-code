const fs = require('fs/promises');

const INPUT_FILE = 'input.txt';

const getEncryptedMoves = async () => {
  try {
    const data = await fs.readFile(INPUT_FILE, { encoding: 'utf8' });
    const parsedData = data.trim().split('\n').map((i) => {
      const [a, b] = i.split(' ');
      return { a, b }
    });
    return parsedData;
  } catch (e) {
    console.error(e);
  }
};

const MOVE_INFO = {
  'Rock': {
    points: 1,
    losesAgainst: 'Paper',
    tiesAgainst: 'Rock',
    winsAgainst: 'Scissors',
  },
  'Paper': {
    points: 2,
    losesAgainst: 'Scissors',
    tiesAgainst: 'Paper',
    winsAgainst: 'Rock',
  },
  'Scissors': {
    points: 3,
    losesAgainst: 'Rock',
    tiesAgainst: 'Scissors',
    winsAgainst: 'Paper',
  },
};

const OPPONENT_CYPHER_MAP = {
  'A': 'Rock',
  'B': 'Paper',
  'C': 'Scissors',
};

const simulateFromMove = (opponent, you) => {
  const result = {
    opponent: {
      move: opponent,
      moveInfo: MOVE_INFO[opponent],
    },
    you: {
      move: you,
      moveInfo: MOVE_INFO[you],
    },
  };

  // we can use the diff as a heuristic for calculating the winner
  const diff = result.opponent.moveInfo.points - result.you.moveInfo.points;
  if (diff === 0) {
    // tie
    result.opponent = {
      ...result.opponent,
      resultPoints: 3,
      totalPoints: result.opponent.moveInfo.points + 3,
    };
    result.you = {
      ...result.you,
      resultPoints: 3,
      totalPoints: result.you.moveInfo.points + 3,
    };
  } else if (diff === -1 || diff === 2) {
    // you win
    // (rock - paper) or (paper - scissors), or (scissors - rock)
    result.opponent = {
      ...result.opponent,
      resultPoints: 0,
      totalPoints: result.opponent.moveInfo.points + 0,
    };
    result.you = {
      ...result.you,
      resultPoints: 6,
      totalPoints: result.you.moveInfo.points + 6,
    };
  } else if (diff === 1 || diff === -2) {
    // opponent win
    // (paper - rock) or (scissors - paper), or (rock - scissors)
    result.opponent = {
      ...result.opponent,
      resultPoints: 6,
      totalPoints: result.opponent.moveInfo.points + 6,
    };
    result.you = {
      ...result.you,
      resultPoints: 0,
      totalPoints: result.you.moveInfo.points + 0,
    };
  }

  return result;
};

const getTotalSimulatedPoints = (description, moves) => {
  const simulatedMoves = moves.map(({ opponent, you }) => {
    return simulateFromMove(opponent, you);
  });

  const totalSimulatedPoints = simulatedMoves.reduce((result, move) => {
    return {
      opponent: result.opponent + move.opponent.totalPoints,
      you: result.you + move.you.totalPoints,
    };
  }, { opponent: 0, you: 0 });

  console.log(`== ${description}: Total Simulated Points ==\n\n`, totalSimulatedPoints, '\n\n');
}


// Part 1
const NAIVE_YOU_CYPHER_MAP = {
  'X': 'Rock',
  'Y': 'Paper',
  'Z': 'Scissors',
};

const getNaiveDecipheredMoves = async () => {
  const encryptedMoves = await getEncryptedMoves();
  return encryptedMoves.map(({ a, b }) => {
    return {
      opponent: OPPONENT_CYPHER_MAP[a],
      you: NAIVE_YOU_CYPHER_MAP[b],
    };
  });
};



// Part 2
// The value maps onto what key on the opponent's move info will result in the
// expected result given the input
const YOU_FROM_OPPONENT_MOVE_INFO = {
  'X': 'winsAgainst', // you lose
  'Y': 'tiesAgainst', // tie
  'Z': 'losesAgainst', // you win
}

const getCorrectlyDecipheredMoves = async () => {
  const encryptedMoves = await getEncryptedMoves();
  return encryptedMoves.map(({ a, b }) => {
    const opponent = OPPONENT_CYPHER_MAP[a];

    const opponentMatchup = YOU_FROM_OPPONENT_MOVE_INFO[b];
    const you = MOVE_INFO[opponent][opponentMatchup];

    return { opponent, you };
  });
};


(async () => {
  // Part 1
  await getTotalSimulatedPoints('Part 1', await getNaiveDecipheredMoves());

  // Part 2
  await getTotalSimulatedPoints('Part 2', await getCorrectlyDecipheredMoves());
})();
