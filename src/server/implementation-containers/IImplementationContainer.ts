import type { IAuthenticationTokenRepository } from '../../model/repositories/IAuthenticationTokenRepository.ts';
import type { IBookmarkDirectoryRepository } from '../../model/repositories/IBookmarkDirectoryRepository.ts';
import type { IBookmarkWithItemRepository } from '../../model/repositories/IBookmarkWithItemRepository.ts';
import type { IEmailVerificationDirectoryRepository } from '../../model/repositories/IEmailVerificationDirectoryRepository.ts';
import type { IGroupMemberDirectoryRepository } from '../../model/repositories/IGroupMemberDirectoryRepository.ts';
import type { IGroupPermissionDirectoryRepository } from '../../model/repositories/IGroupPermissionDirectoryRepository.ts';
import type { IGroupProfileRepository } from '../../model/repositories/IGroupProfileRepository.ts';
import type { IGroupRepository } from '../../model/repositories/IGroupRepository.ts';
import type { IItemRepository } from '../../model/repositories/IItemRepository.ts';
import type { IMemberRepository } from '../../model/repositories/IMemberRepository.ts';
import type { IMemberWithGroupProfileRepository } from '../../model/repositories/IMemberWithGroupProfileRepository.ts';
import type { IMemberWithUserProfileRepository } from '../../model/repositories/IMemberWithUserProfileRepository.ts';
import type { ITemplateRepository } from '../../model/repositories/ITemplateRepository.ts';
import type { IUserAccountRepository } from '../../model/repositories/IUserAccountRepository.ts';
import type { IUserProfileRepository } from '../../model/repositories/IUserProfileRepository.ts';
import type { IUserRepository } from '../../model/repositories/IUserRepository.ts';

export interface IImplementationContainer {
  readonly authenticationTokenRepository: IAuthenticationTokenRepository;
  readonly bookmarkDirectoryRepository: IBookmarkDirectoryRepository;
  readonly bookmarkWithItemRepository: IBookmarkWithItemRepository;
  readonly emailVerificationDirectoryRepository: IEmailVerificationDirectoryRepository;
  readonly groupMemberDirectoryRepository: IGroupMemberDirectoryRepository;
  readonly groupPermissionDirectoryRepository: IGroupPermissionDirectoryRepository;
  readonly groupProfileRepository: IGroupProfileRepository;
  readonly groupRepository: IGroupRepository;
  readonly itemRepository: IItemRepository;
  readonly memberRepository: IMemberRepository;
  readonly memberWithGroupProfileRepository: IMemberWithGroupProfileRepository;
  readonly memberWithUserProfileRepository: IMemberWithUserProfileRepository;
  readonly templateRepository: ITemplateRepository;
  readonly userAccountRepository: IUserAccountRepository;
  readonly userProfileRepository: IUserProfileRepository;
  readonly userRepository: IUserRepository;
}
