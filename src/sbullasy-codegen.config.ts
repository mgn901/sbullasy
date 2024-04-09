import type { GroupMemberDirectory } from './model/group-member-directory/GroupMemberDirectory.ts';
import type { GroupPermissionDirectory } from './model/group-permission-directory/GroupPermissionDirectory.ts';
import type { GroupProfile } from './model/group-profile/GroupProfile.ts';
import type { Group } from './model/group/Group.ts';
import type { Item } from './model/item/Item.ts';
import type { Template } from './model/template/Template.ts';
import type { UserAccount } from './model/user-account/UserAccount.ts';
import type { BookmarkDirectory } from './model/user-bookmark-directory/BookmarkDirectory.ts';
import type { EmailVerificationDirectory } from './model/user-email-verification-directory/EmailVerificationDirectory.ts';
import type { UserProfile } from './model/user-profile/UserProfile.ts';
import type { User } from './model/user/User.ts';
import type { IImplementationContainer } from './server/implementation-containers/IImplementationContainer.ts';
import type { belongsToNoGroupCertificateService } from './server/services/belongsToNoGroupCertificateService.ts';
import type { myselfCertificateService } from './server/services/myselfCertificateService.ts';

export default interface ISbullasyCodegenConfig {
  containers: [{ container: IImplementationContainer }];

  services: [
    { service: typeof myselfCertificateService },
    { service: typeof belongsToNoGroupCertificateService },
  ];

  entryPoints: [
    //#region Group
    {
      method: (typeof Group)['create'];
      interactor: { name: '/group/createGroup' };
      router: { method: 'POST'; path: '/groups' };
    },
    {
      method: (typeof Group)['createGetByIdRequest'];
      interactor: { name: '/group/getGroupById' };
      router: { method: 'GET'; path: '/groups/:id' };
    },
    {
      method: Group['createDeleteRequest'];
      interactor: { name: '/group/deleteGroup' };
      router: { method: 'DELETE'; path: '/groups/:id' };
    },
    //#endregion

    //#region GroupMemberDirectory
    {
      method: (typeof GroupMemberDirectory)['createGetByIdRequest'];
      interactor: { name: '/group-member-directory/getGroupMemberDirectoryById' };
      router: { method: 'GET'; path: '/group-member-directories/:id' };
    },
    {
      method: GroupMemberDirectory['createGetMembersRequest'];
      interactor: { name: '/group-member-directory/getManyMembersInGroupMemberDirectory' };
      router: { method: 'GET'; path: '/group-member-directories/:id/members' };
    },
    {
      method: GroupMemberDirectory['toInvitationSecretResetRequestCreated'];
      interactor: { name: '/group-member-directory/createGroupInvitationSecretResetRequest' };
      router: {
        method: 'POST';
        path: '/group-member-directories/:id/invitation-secret-reset-requests';
      };
    },
    {
      method: GroupMemberDirectory['toMemberAdded'];
      interactor: { name: '/group-member-directory/addMember' };
      router: { method: 'PUT'; path: '/group-member-directories/:id/members/:userId' };
    },
    {
      method: GroupMemberDirectory['toMemberRemovedByAdmin'];
      interactor: { name: '/group-member-directory/removeMemberByAdmin' };
      router: { method: 'DELETE'; path: '/group-member-directories/:id/members/:userId' };
    },
    {
      method: GroupMemberDirectory['toMemberRemovedByMyself'];
      interactor: { name: '/group-member-directory/removeMemberByMyself' };
      router: { method: 'DELETE'; path: '/group-member-directories/:id/members/:userId' };
    },
    //#endregion

    //#region GroupPermissionDirectory
    {
      method: (typeof GroupPermissionDirectory)['createGetByIdRequest'];
      interactor: { name: '/group-permission-directory/getGroupPermissionDirectoryById' };
      router: { method: 'GET'; path: '/group-permission-directories/:id' };
    },
    {
      method: GroupPermissionDirectory['toBodySet'];
      interactor: { name: '/group-permission-directory/setGroupPermissionDirectoryBody' };
      router: { method: 'PUT'; path: '/group-permission-directories/:id' };
    },
    //#endregion

    //#region GroupProfile
    {
      method: (typeof GroupProfile)['createGetByIdRequest'];
      interactor: { name: '/group-profile/getGroupProfileById' };
      router: { method: 'GET'; path: '/group-profiles/:id' };
    },
    {
      method: (typeof GroupProfile)['createGetManyRequest'];
      interactor: { name: '/group-profile/getManyGroupProfile' };
      router: { method: 'GET'; path: '/group-profiles' };
    },
    {
      method: GroupProfile['createGetItemsRequest'];
      interactor: { name: '/group-profile/getManyItemsInGroupProfile' };
      router: { method: 'GET'; path: '/group-profiles/:id/items' };
    },
    {
      method: GroupProfile['toBodySet'];
      interactor: { name: '/group-profile/setGroupProfileBody' };
      router: { method: 'PUT'; path: '/group-profiles/:id' };
    },
    //#endregion

    //#region Item
    {
      method: (typeof Item)['create'];
      interactor: { name: '/item/createItem' };
      router: { method: 'POST'; path: '/items' };
    },
    {
      method: (typeof Item)['createGetByIdRequest'];
      interactor: { name: '/item/getItemById' };
      router: { method: 'GET'; path: '/items/:id' };
    },
    {
      method: (typeof Item)['createGetByTitleForUrlRequest'];
      interactor: { name: '/item/getItemByTitleForUrl' };
      router: { method: 'GET'; path: '/items/@:title' };
    },
    {
      method: Item['createDeleteRequest'];
      interactor: { name: '/item/deleteItem' };
      router: { method: 'DELETE'; path: '/items/:id' };
    },
    {
      method: Item['toBodySet'];
      interactor: { name: '/items/:id' };
      router: { method: 'PUT'; path: '/items/:id' };
    },
    //#endregion

    //#region Template
    {
      method: (typeof Template)['create'];
      interactor: { name: '/template/createTemplate' };
      router: { method: 'POST'; path: '/templates' };
    },
    {
      method: (typeof Template)['createGetByIdRequest'];
      interactor: { name: '/template/getTemplateById' };
      router: { method: 'GET'; path: '/templates/:id' };
    },
    {
      method: Template['createDeleteRequest'];
      interactor: { name: '/template/delete' };
      router: { method: 'DELETE'; path: '/templates/:id' };
    },
    {
      method: Template['toBodySet'];
      interactor: { name: '/template/setTemplateBody' };
      router: { method: 'PUT'; path: '/templates/:id' };
    },
    //#endregion

    //#region User
    {
      method: (typeof User)['create'];
      interactor: { name: '/user/createUser' };
      router: { method: 'POST'; path: '/users' };
    },
    {
      method: (typeof User)['createGetByIdRequest'];
      interactor: { name: '/user/getUserById' };
      router: { method: 'GET'; path: '/users/:id' };
    },
    {
      method: User['createDeleteRequest'];
      interactor: { name: '/user/deleteUser' };
      router: { method: 'DELETE'; path: '/users/:id' };
    },
    {
      method: User['toEmailSet'];
      interactor: { name: '/user/setUserEmail' };
      router: { method: 'PUT'; path: '/users/:id/email' };
    },
    //#endregion

    //#region UserAccount
    {
      method: (typeof UserAccount)['createGetByIdRequest'];
      interactor: { name: '/user-account/getUserAccountById' };
      router: { method: 'GET'; path: '/user-accounts/:id' };
    },
    {
      method: UserAccount['toAuthenticationTokenCreated'];
      interactor: { name: '/user-account/createAuthenticationToken' };
      router: { method: 'POST'; path: '/user-accounts/:id/authentication-tokens' };
    },
    {
      method: UserAccount['toAuthenticationTokenDeleted'];
      interactor: { name: '/user-account/deleteAuthenticationToken' };
      router: {
        method: 'DELETE';
        path: '/user-accounts/:id/authentication-tokens/:authenticationTokenId';
      };
    },
    //#endregion

    //#region BookmarkDirectory
    {
      method: (typeof BookmarkDirectory)['createGetByIdRequest'];
      interactor: { name: '/user-bookmark-directory/getBookmarkDirectoryById' };
      router: { method: 'GET'; path: '/bookmark-directories/:id' };
    },
    {
      method: BookmarkDirectory['createGetBookmarksRequest'];
      interactor: { name: '/bookmark-directory/getBookmarksInBookmarkDirectory' };
      router: { method: 'GET'; path: '/bookmark-directories/:id/bookmarks' };
    },
    {
      method: BookmarkDirectory['toBookmarkAdded'];
      interactor: { name: '/user-bookmark-directory/addBookmark' };
      router: { method: 'POST'; path: '/bookmark-directories/:id/bookmarks' };
    },
    {
      method: BookmarkDirectory['toBookmarkRemoved'];
      interactor: { name: '/user-bookmark-directory/removeBookmark' };
      router: { method: 'DELETE'; path: '/bookmark-directories/:id/bookmarks/:tag/:itemId' };
    },
    //#endregion

    //#region EmailVerificationDirectory
    {
      method: EmailVerificationDirectory['toEmailVerificationChallengeCreatedFromUser'];
      interactor: {
        name: '/user-email-verification-directory/createEmailVerificationChallengeFromUser';
      };
      router: {
        method: 'POST';
        path: '/email-verification-directories/:email/email-verification-challenges';
      };
    },
    {
      method: EmailVerificationDirectory['toEmailVerificationChallengeCreatedFromCustomEmail'];
      interactor: {
        name: '/user-email-verification-directory/createEmailVerificationChallengeFromCustomEmail';
      };
      router: {
        method: 'POST';
        path: '/email-verification-directories/:id/email-verification-challenges';
      };
    },
    //#endregion

    //#region UserProfile
    {
      method: (typeof UserProfile)['create'];
      interactor: {
        name: '/user-profile/createUserProfile';
        router: { method: 'POST'; path: '/user-profiles' };
      };
    },
    {
      method: (typeof UserProfile)['createGetByIdRequest'];
      interactor: { name: '/user-profile/getUserProfileById' };
      router: { method: 'GET'; path: '/user-profiles/:id' };
    },
    {
      method: UserProfile['createGetBelongsToRequest'];
      interactor: { name: '/user-profile/getManyBelongsToInUserProfile' };
      router: { method: 'GET'; path: '/user-profiles/:id/belongs-to' };
    },
    {
      method: UserProfile['toBodySet'];
      interactor: { name: '/user-profile/setUserProfileBody' };
      router: { method: 'PUT'; path: '/user-profiles/:id' };
    },
    {
      method: UserProfile['toExpirationExtended'];
      interactor: { name: '/user-profile/extendUserProfileExpiration' };
      router: {
        method: 'POST';
        router: { method: 'POST'; path: '/user-profiles/:id/expiration-extention-requests' };
      };
    },
    //#endregion
  ];
}
