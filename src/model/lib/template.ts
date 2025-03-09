export const renderTemplate = (params: {
  readonly template: string;
  readonly values: { readonly [k in string]: string };
}): string => {
  const { template, values } = params;

  const placeHolderRegexp = /\${([a-zA-Z_][a-zA-Z0-9_.\-]+[a-zA-Z0-9_\-])}/g;
  const placeHolders = [...template.matchAll(placeHolderRegexp)].map((match) => match[0]);

  return placeHolders.reduce<string>((prev, placeHolder) => {
    const replacedBy = values[placeHolder.replace(placeHolderRegexp, '$1')];
    return prev.replace(placeHolder, replacedBy?.toString() ?? '');
  }, template);
};
