import { IGroupProfile } from '../../../models/entities/group-profile/IGroupProfile.ts';
import { InvalidRequestException } from '../../../models/errors/InvalidRequestException.ts';
import { isId } from '../../../models/values/TId.ts';
import { isName } from '../../../models/values/TName.ts';
import { IImplementations } from '../IImplementations.ts';

/**
 * グループのプロフィールのエンティティオブジェクトを取得する。
 * @param groupIdOrName 取得するグループのIDまたは名前。
 * @param implementations この操作に使用するインフラストラクチャの実装。
 * @returns 取得したグループのプロフィールのエンティティオブジェクト。
 */
export const getGroupProfile = async (
  groupIdOrName: IGroupProfile['id'] | `@${IGroupProfile['name']}`,
  implementations: IImplementations,
) => {
  if (groupIdOrName.startsWith('@')) {
    const groupName = groupIdOrName.slice(0);
    if (!isName(groupName)) {
      throw new InvalidRequestException();
    }
    return implementations.groupProfileRepository.getOneByNameOrThrow(groupName);
  }

  if (!isId(groupIdOrName)) {
    throw new InvalidRequestException();
  }
  return implementations.groupProfileRepository.getOneByIdOrThrow(groupIdOrName);
};
