const fs = require('fs/promises');

const INPUT_FILE = 'input.txt';

const getRucksackContents = async () => {
  try {
    const data = await fs.readFile(INPUT_FILE, { encoding: 'utf8' });
    return data.trim().split('\n');
  } catch (e) {
    console.error(e);
  }
};

const getUniqueChars = (str) => {
  return Object.keys(
    str.split('').reduce((obj,i) => {
      if (!obj.hasOwnProperty(i)) {
        obj[i] = true;
      }
      return obj;
    }, {})
  );
};

const calculatePriorityFromChar = (char) => {
  const asciiCode = char.charCodeAt();

  let priority;
  if (asciiCode >= 'A'.charCodeAt() && asciiCode <= 'Z'.charCodeAt()) {
    priority = asciiCode - 'A'.charCodeAt() + 27;
  } else if (asciiCode >= 'a'.charCodeAt() && asciiCode <= 'z'.charCodeAt()) {
    priority = asciiCode - 'a'.charCodeAt() + 1;
  } else {
    priority = null;
  }

  return priority;
};


// Part 1
const getSplitRucksackContents = async () => {
  const rucksackContents = await getRucksackContents();
  const splitRucksackContents = rucksackContents.map(i => {
    const middle = i.length / 2;
    if (i.length % 2 === 0) {
      return {
        left: i.slice(0, middle),
        middle: null,
        right: i.slice(middle)
      };
    } else {
      return {
        left: i.slice(0, middle),
        middle,
        right: i.slice(middle + 1)
      };
    }
  });

  return splitRucksackContents;
};

const findMisorganizedContents = ({ left, middle, right }) => {
  const leftItems = getUniqueChars(left);
  const rightItems = getUniqueChars(right);
  return leftItems.filter(i => rightItems.includes(i));
};

const calculatePrioritiesForMisorganizedContents = async () => {
  const rucksackContents = await getSplitRucksackContents();
  const priorityStats = rucksackContents.map(i => {
    return findMisorganizedContents(i).map(j => {
      const priority = calculatePriorityFromChar(j);

      return { char: j, priority };
    });
  }).map(i => {
    return {
      misorganizedContents: i,
      totalPriority: i.reduce((sum,j) => sum = sum + j.priority, 0),
    }
  });

  return priorityStats;
};

const calculateTotalPriorityForMisorganizedContents = async () => {
  const prioritiesForMisorganizedContents = await calculatePrioritiesForMisorganizedContents();
  const totalPriority = prioritiesForMisorganizedContents.reduce((sum,i) => sum + i.totalPriority, 0);
  console.log(`== Misorganized Contents Total Priority ==\n\n`, totalPriority, '\n\n');
};



// Part 2
const getGroupedRucksacks = async () => {
  const rucksackContents = await getRucksackContents();
  const groupedRucksacks = [];
  // We're making an assumption that the rucksacks are divisible by 3 here
  for (i = 0; i < rucksackContents.length; i = i + 3) {
    groupedRucksacks.push(rucksackContents.slice(i, i + 3));
  }
  return groupedRucksacks;
};

const findBadgesForGroup = (groupOfRucksacks) => {
  return groupOfRucksacks.map(i => getUniqueChars(i)).reduce((arr,i) => {
    return arr.filter(j => i.includes(j));
  });
};

const calculatePrioritiesForGroupedRucksacks = async () => {
  const groupedRucksacks = await getGroupedRucksacks();
  return priorityStats = groupedRucksacks.map(i => {
    return {
      rucksacks: i,
      badges: findBadgesForGroup(i).map(i => {
        return { char: i, priority: calculatePriorityFromChar(i) };
      }),
    };
  });
};

const calculateTotalPriorityForBadges = async () => {
  const prioritiesForGroupedRucksacks = await calculatePrioritiesForGroupedRucksacks();
  const totalPriority = prioritiesForGroupedRucksacks.reduce((sum,i) => {
    return sum + i.badges.reduce((badgePriorityTotal, j) => {
      return badgePriorityTotal + j.priority;
    }, 0)
  }, 0);
  console.log(`== Badges Total Priority ==\n\n`, totalPriority, '\n\n');
}



(async () => {
  // Part 1
  await calculateTotalPriorityForMisorganizedContents();

  // Part 2
  await calculateTotalPriorityForBadges();
})();
