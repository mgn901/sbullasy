import { IGroupProfile } from '../../../models/entities/group-profile/IGroupProfile.ts';
import { IGroup } from '../../../models/entities/group/IGroup.ts';
import { InvalidRequestException } from '../../../models/errors/InvalidRequestException.ts';
import { isId } from '../../../models/values/TId.ts';
import { isName } from '../../../models/values/TName.ts';
import { IImplementations } from '../IImplementations.ts';

/**
 * 指定したID・名前を持つグループのエンティティオブジェクトを取得する。
 * @param groupIdOrName グループのIDまたは名前。名前を指定する場合は先頭に`@`を付ける。
 * @param implementations この操作に使用するインフラストラクチャの実装。
 * @returns グループのエンティティオブジェクト。
 */
export const getGroup = async (
  groupIdOrName: IGroup['id'] | `@${IGroupProfile['name']}`,
  implementations: IImplementations,
): Promise<IGroup> => {
  if (groupIdOrName[0] === '@') {
    const groupName = groupIdOrName.slice(1);
    if (!isName(groupName)) {
      throw new InvalidRequestException();
    }

    const groupProfile =
      await implementations.groupProfileRepository.getOneByNameOrThrow(groupName);

    return implementations.groupRepository.getOneByIdOrThrow(groupProfile.id);
  }

  if (!isId<IGroup>(groupIdOrName)) {
    throw new InvalidRequestException();
  }

  return implementations.groupRepository.getOneByIdOrThrow(groupIdOrName);
};
