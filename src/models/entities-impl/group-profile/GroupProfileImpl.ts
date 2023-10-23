import { ArrayWithDiff } from '../../../utils/ArrayWithDiff.ts';
import { IGroupProfile } from '../../entities/group-profile/IGroupProfile.ts';
import { IGroup } from '../../entities/group/IGroup.ts';
import { GroupProfileBase } from './GroupProfileBase.ts';

/**
 * {@linkcode GroupProfileBase}の具象クラスで、正しいインスタンスを生成できるコンストラクタを持つ。
 */
export class GroupProfileImpl extends GroupProfileBase {
  public constructor(group: IGroup, groupProfile: Pick<IGroupProfile, 'name' | 'displayName'>) {
    super({
      id: group.id,
      name: groupProfile.name,
      displayName: groupProfile.displayName,
      items: [],
      badges: new ArrayWithDiff(),
      editableItemTypes: new ArrayWithDiff(),
    });
  }
}
