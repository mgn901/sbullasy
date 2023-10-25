import { IGroupMemberDirectoryRepository } from '../repositories/IGroupMemberDirectoryRepository.ts';
import { IGroupProfileRepository } from '../repositories/IGroupProfileRepository.ts';
import { IGroupRepository } from '../repositories/IGroupRepository.ts';
import { IItemRepository } from '../repositories/IItemRepository.ts';
import { IItemTypeRepository } from '../repositories/IItemTypeRepository.ts';
import { IUserProfileRepository } from '../repositories/IUserProfileRepository.ts';
import { IUserRepository } from '../repositories/IUserRepository.ts';
import { IUserShelfRepository } from '../repositories/IUserShelfRepository.ts';

export interface IImplementations {
  readonly groupRepository: IGroupRepository;
  readonly groupMemberDirectoryRepository: IGroupMemberDirectoryRepository;
  readonly groupProfileRepository: IGroupProfileRepository;
  readonly itemRepository: IItemRepository;
  readonly itemTypeRepository: IItemTypeRepository;
  readonly userRepository: IUserRepository;
  readonly userProfileRepository: IUserProfileRepository;
  readonly userShelfRepository: IUserShelfRepository;
}
