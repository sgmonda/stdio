import getopt from './getopt';
import read from './read';
import ProgressBar from './ProgressBar';
import ask from './ask';

const stdio = {
  getopt,
  read,
  ask,
  ProgressBar,
};

export default stdio;
export { getopt, read, ask, ProgressBar };
