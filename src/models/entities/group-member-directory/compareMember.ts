import { compareString } from '../../../utils/compare-functions/compareString.ts';
import { IMember } from './IMember.ts';

export const compareMember = (a: IMember, b: IMember) => {
  const compareIdResult = compareString(a.user.id, b.user.id);
  if (compareIdResult === 0) {
    return compareString(a.type, b.type);
  }
  return compareIdResult;
};
