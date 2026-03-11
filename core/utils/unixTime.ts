export const dayStartAndEnd = () => {
  const now = new Date();

  const dayStart = Math.floor(new Date(now.setHours(0, 0, 0, 1)).getTime() / 1000);
  const dayEnd = Math.floor(new Date(now.setHours(23, 59, 59, 999)).getTime() / 1000);

  return { dayStart, dayEnd };
};
