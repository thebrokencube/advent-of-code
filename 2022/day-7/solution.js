const fs = require('fs/promises');

const INPUT_FILE = 'input.txt';

const getInput = async () => {
  try {
    return (await fs.readFile(INPUT_FILE, { encoding: 'utf8' })).trim();
  } catch (e) {
    console.error(e);
  }
};

// Parse Input

const TYPES = {
  COMMAND: 'command',
  DIR: 'dir',
  FILE: 'file'
};

const COMMAND_REGEX = /\$ (\w+)(\s*.+)*/;
const parseCommand = (line) => {
  const matchedCommand = line.match(COMMAND_REGEX);
  if (matchedCommand === null) { return null; }

  return {
    type: TYPES.COMMAND,
    command: matchedCommand[1],
    commandArgs: matchedCommand[2]?.trim(),
  }
};

const DIR_REGEX = /dir (.+)/;
const parseDirOutput = (line) => {
  const matchedDir = line.match(DIR_REGEX);
  if (matchedDir === null) { return null; }

  return {
    type: TYPES.DIR,
    dirName: matchedDir[1],
  }
}

const FILE_REGEX = /(\d+) ([\w\.]+)/;
const parseFileOutput = (line) => {
  const matchedFile = line.match(FILE_REGEX);
  if (matchedFile === null) { return null; }

  return {
    type: TYPES.FILE,
    size: parseInt(matchedFile[1]),
    fileName: matchedFile[2],
  }
}

const parseConsoleOutput = async () => {
  const input = await getInput();
  const result = input.split('\n').map((i) => {
    return parseCommand(i) || parseDirOutput(i) || parseFileOutput(i);
  });
  return result;
};

// File System Representation

const actOnFile = ({ currentNode, line }) => {
  const nodeFromChildren = currentNode.children.find(i => i.name === line.fileName);
  if (!nodeFromChildren) {
    const node = {
      name: line.fileName,
      type: TYPES.FILE,
      parent: currentNode,
      fileSize: line.size,
    }
    currentNode.children = [...(currentNode.children || []), node];
  }
  return currentNode;
};

const actOnDir = ({ currentNode, line }) => {
  const nodeFromChildren = currentNode.children.find(i => i.name === line.commandArgs);
  if (!nodeFromChildren) {
    const node = {
      name: line.dirName,
      type: TYPES.DIR,
      parent: currentNode,
      children: [],
      linkToRoot: currentNode.linkToRoot,
    }
    currentNode.children = [...(currentNode.children || []), node];
  }

  return currentNode;
};

const actOnCommand = ({ currentNode, line }) => {
  if (line.command === 'cd') {
    if (line.commandArgs === '/' && currentNode === null) {
      const node = {
        name: '/',
        type: TYPES.DIR,
        parent: null,
        children: [],
      };
      node.linkToRoot = node;
      return node;
    } else if (line.commandArgs === '/' && currentNode !== null) {
      return currentNode.linkToRoot;
    } else if (line.commandArgs === '..') {
      if (currentNode == null || currentNode.parent === null) {
        console.error('cannot go up from or to a null node');
        return;
      }
      return currentNode.parent;
    } else {
      const nodeFromChildren = currentNode.children.find(i => i.name === line.commandArgs);
      if (nodeFromChildren) {
        return nodeFromChildren;
      } else {
        const node = {
          name: line.commandArgs,
          type: TYPES.DIR,
          parent: currentNode,
          children: [],
          linkToRoot: currentNode.linkToRoot,
        }
        currentNode.children = [...(currentNode.children || []), node];
        return node;
      }
    }
  } else if (line.command === 'ls') {
    return currentNode;
  }
};

const actOnLine = ({ currentNode, line }) => {
  switch (line.type) {
    case TYPES.COMMAND:
      return actOnCommand({ currentNode, line });
    case TYPES.DIR:
      return actOnDir({ currentNode, line });
    case TYPES.FILE:
      return actOnFile({ currentNode, line });
    default:
      console.error('invalid line type', line)
      return;
  };
};

const generateFileSystemRepresentation = async () => {
  const consoleOutput = await parseConsoleOutput();
  let currentNode = null;
  consoleOutput.forEach(line => currentNode = actOnLine({ currentNode, line }));
  return currentNode.linkToRoot;
};

// File Size Calculation

const recursivelyCalculateFileSizes = (node) => {
  if (node.type === TYPES.FILE) {
    return node.fileSize;
  } else if (node.type === TYPES.DIR) {
    node.calculatedSize = node.children.map(i => {
      i.calculatedSize = recursivelyCalculateFileSizes(i);
      return i.calculatedSize;
    }).reduce((sum, i) => sum + i, 0);

    return node.calculatedSize;
  }
};

const recursivelyCalculateDirSumGivenMaxSize = ({ node, maxSize }) => {
  if (node?.type === TYPES.DIR) {
    const sum = node.children.reduce((total, i) => {
      return total + recursivelyCalculateDirSumGivenMaxSize({ node: i, maxSize });
    }, 0);
    const additionalSum = node.calculatedSize <= maxSize ? node.calculatedSize : 0;
    return sum + additionalSum;
  } else { return 0; }
};

// Part 1

const calculateTotalGivenMaxSize = async (maxSize) => {
  const rootNode = await generateFileSystemRepresentation();
  recursivelyCalculateFileSizes(rootNode);
  const sum = recursivelyCalculateDirSumGivenMaxSize({ node: rootNode, maxSize });

  console.log(`\n== Sum of all directories with less than ${maxSize} size ==\n\n`, sum, '\n\n');
};

// Part 2

const recursivelyFindClosestDirAboveMinimumSize = ({ node, closestDir, minSize }) => {
  if (node?.type === TYPES.DIR && node.calculatedSize >= minSize) {
    const currentClosestDir =
      (!closestDir || (closestDir.calculatedSize > node.calculatedSize)) ?
      node :
      closestDir;

    return node.children.map((i) => {
      return recursivelyFindClosestDirAboveMinimumSize({ node: i, closestDir: currentClosestDir, minSize });
    }).reduce((closest, i) => {
      return closest.calculatedSize > i.calculatedSize ? i : closest;
    }, currentClosestDir);
  } else {
    return closestDir;
  }
};

const findClosestDirAboveMinimumSize = ({ node, minSize }) => {
  return recursivelyFindClosestDirAboveMinimumSize({ node, closestDir: null, minSize });
};

const MAX_DISK_SPACE = 70000000;
const UPDATE_DISK_SPACE = 30000000;

const findSmallestDirectoryToDelete = async () => {
  const rootNode = await generateFileSystemRepresentation();
  recursivelyCalculateFileSizes(rootNode);

  const neededSpace = UPDATE_DISK_SPACE - (MAX_DISK_SPACE - rootNode.calculatedSize);
  const dirToDelete = findClosestDirAboveMinimumSize({ node: rootNode, minSize: neededSpace });

  console.log('\n== Size of smallest directory to delete to run update ==\n\n', dirToDelete.calculatedSize, '\n\n');
};



(async () => {
  // Part 1
  await calculateTotalGivenMaxSize(100000);

  // Part 2
  await findSmallestDirectoryToDelete();
})();
