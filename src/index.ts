import getopt from './getopt';
import read from './read';
import readLine from './readLine';
import ProgressBar from './ProgressBar';
import ask from './ask';

const stdio = {
  getopt,
  read,
  readLine,
  ask,
  ProgressBar,
};

export default stdio;
export { getopt, read, readLine, ask, ProgressBar };
