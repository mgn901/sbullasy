/**
 * テンプレートのプレースホルダーを`values`で指定された値に置き換えたものを返す。
 * `${`と`}`に囲まれた文字列（英数字と`-`、`_`、`.`から成り、英字で始まり、`.`以外の文字で終わる）はプレースホルダーになる。`$`は`\`でエスケープできる。
 *
 * @param params `values`は、プレースホルダーの名前をキーとして、その名前のプレースホルダーに割り当てたい文字列を値とする辞書。
 * @returns 置き換え後の文字列を返す。
 */
export const renderTemplate = (params: {
  readonly template: string;
  readonly values: { readonly [k in string]: string };
}): string => {
  const { template, values } = params;

  const placeHolderRegexp = /(?<!\\)\${([a-zA-Z_][a-zA-Z0-9_.-]+[a-zA-Z0-9_-])}/g;
  const placeHolders = [...template.matchAll(placeHolderRegexp)].map((match) => match[0]);

  return placeHolders.reduce<string>((prev, placeHolder) => {
    const replacedBy = values[placeHolder.replace(placeHolderRegexp, '$1')];
    return prev.replace(placeHolder, replacedBy?.toString() ?? '');
  }, template);
};
