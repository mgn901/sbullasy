export const orderStringToPrismaOrder = <K extends string, V extends string>(
  orderString: `${K}_${V}` | undefined,
): { [key in K]?: V } | undefined => {
  if (!orderString) {
    return undefined;
  }
  const [key, value] = orderString.split('_');
  return { [key]: value } as { [key in K]?: V };
};
