import { TFindUniqueArgs, TInclude } from './types.ts';

export const memberInclude = {
  user: true,
} satisfies TInclude['member'];

export const groupMemberDirectoryInclude = {
  members: { include: memberInclude },
} satisfies TInclude['groupMemberDirectory'];

export const badgeInclude = {
  item: { include: { type: true } },
} satisfies TInclude['badge'];

export const permissionInclude = {
  itemType: true,
} satisfies TInclude['permission'];

export const itemIncludeForItemSummary = {
  owner: { include: { badges: { include: badgeInclude } } },
  type: true,
  body: true,
} satisfies TInclude['item'];

export const groupProfileInclude = {
  badges: { include: badgeInclude },
  editableItemTypes: { include: permissionInclude },
  items: { include: itemIncludeForItemSummary },
} satisfies TInclude['groupProfile'];

export const groupProfileIncludeForGroupProfileSummary = {
  badges: { include: badgeInclude },
} satisfies TInclude['groupProfile'];

export const itemBodyInclude = {
  valueInItem: { include: itemIncludeForItemSummary },
} satisfies TInclude['itemBody'];

export const itemInclude = {
  owner: { include: groupProfileIncludeForGroupProfileSummary },
  type: true,
  body: { include: itemBodyInclude },
} satisfies TInclude['item'];

export const userInclude = {
  tokens: true,
  emailVerifications: true,
} satisfies TInclude['user'];

export const userProfileInclude = {
  belongsTo: {
    include: { groupProfile: { include: groupProfileIncludeForGroupProfileSummary } },
  },
} satisfies TInclude['userProfile'];

export const userShelfInclude = {
  bookmarks: { include: { item: { include: itemIncludeForItemSummary } } },
} satisfies TInclude['userShelf'];

export type TGetFindUniqueArgsFromInclude<I extends TInclude[K], K extends keyof TInclude> = Omit<
  TFindUniqueArgs[K],
  'include'
> & { include: I };
