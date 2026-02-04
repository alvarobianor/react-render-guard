export const calculateWasteRatio = (
  childDuration: number,
  parentDuration: number,
): number => {
  if (parentDuration === 0) return 0;
  return childDuration / parentDuration;
};
