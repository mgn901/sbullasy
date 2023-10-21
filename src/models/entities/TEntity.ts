import { IGroupMemberDirectory } from './group-member-directory/IGroupMemberDirectory.ts';
import { IMember } from './group-member-directory/IMember.ts';
import { IGroupProfile } from './group-profile/IGroupProfile.ts';
import { IGroup } from './group/IGroup.ts';
import { IItemType } from './item-type/IItemType.ts';
import { IItemTypeSummary } from './item-type/IItemTypeSummary.ts';
import { IItem } from './item/IItem.ts';
import { IItemSummary } from './item/IItemSummary.ts';
import { IUserProfile } from './user-profile/IUserProfile.ts';
import { IUserShelf } from './user-shelf/IUserShelf.ts';
import { IAuthenticationToken } from './user/IAuthenticationToken.ts';
import { IEmailVerification } from './user/IEmailVerification.ts';
import { IEmailVerificationAnswer } from './user/IEmailVerificationAnswer.ts';
import { IUser } from './user/IUser.ts';

/**
 * エンティティクラス。
 */
export type TEntity =
  | IGroup
  | IGroupProfile
  | IGroupMemberDirectory
  | IMember
  | IItem
  | IItemSummary
  | IItemType
  | IItemTypeSummary
  | IAuthenticationToken
  | IEmailVerification
  | IEmailVerificationAnswer
  | IUser
  | IUserProfile
  | IUserShelf;
