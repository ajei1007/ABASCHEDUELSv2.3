const db = require('../db/models');
const UsersDBApi = require('../db/api/users');
const GroupingsDBApi = require('../db/api/groupings');
const EventsDBApi = require('../db/api/events');
const SubgroupsService = require('../services/subgroups');
const ChatService = require('../services/chat/chat');
const RolesDBApi = require('../db/api/roles');
const SubgroupsDBApi = require('../db/api/subgroups');
const getFunderTagsOfFunderUsers = require('../utils/getFunderTagsOfFunderUsers');
const getNonFunderTagsFromSubgroupList = require('../utils/getNonFunderTagsFromSubgroupList');
const getNonMatchingTagsFromSubgroupList = require('../utils/getNonMatchingTagsFromSubgroupList');
const NewconstraintgeneratorService = require('../services/newconstraintgenerator');
const NewconstraintgeneratorDBApi = require('../db/api/newconstraintgenerator');
const isUserFunder = require('../utils/isUserFunder');
const isUserActivity = require('../utils/isUserActivity');
const isUserHome = require('../utils/isUserHome');
const isUserRoleOrHigher = require('../utils/isUserRoleOrHigher');
const { getRolesAndAncestors } = require('../utils/roleHierarchy');
const moment = require('moment');

const ValidationError = require('./notifications/errors/validation');
const { ValidationError: ApiValidationError } = require('../common/errors');
// const EmailSender = require('./email');
// const AuthService = require('./auth');

module.exports = class UsersService {
  static async create(
    data,
    currentUser,
    sendInvitationEmails = true,
    host,
    next,
  ) {
    let transaction = await db.sequelize.transaction();
    let mainTransactionCommitted = false;
    let email = data.email;
    let emailsToInvite = [];
    let newUser = null;
    try {
      // check if there exist user with same first and last names
      let usersWithSameFirstLastNames = await UsersDBApi.findByFirstLastNames(
        {
          firstName: data.firstName,
          lastName: data.lastName,
        },
        {
          currentUser,
          transaction,
        },
      );

      if (usersWithSameFirstLastNames.length > 0) {
        throw new ValidationError(
          'iam.errors.userWithSameUserbaneAlreadyExists',
        );
      }

      // validate users uniqueness by email
      if (
        !['Activity', 'Block', 'Funder', 'Location', 'Home'].includes(
          data?.resourceName,
        )
      ) {
        if (email) {
          let isEmailBeingUsedByAnotherUser = await UsersDBApi.checkEmailUsed({ email : data.email }, { transaction } )
          // check if the email is being used by another user
          if (isEmailBeingUsedByAnotherUser) {
            throw new ValidationError('iam.errors.userAlreadyExists');
          }
          emailsToInvite.push(email);
        } else {
          throw new ValidationError('auth.invalidEmail');
        }
      }

      let PersonRoleId = null;
      const personRoles = await RolesDBApi.findAll({
        companyId: currentUser.companyId,
        name: 'Person',
      });
      if (personRoles?.rows?.length > 0) {
        PersonRoleId = personRoles.rows[0].id;
      }

      // every company will have group with name "Funder"
      // so the funder tags needs to be under that group
      const funderGroupId = await GroupingsDBApi.findFunderGroupID({
        companyId: currentUser.companyId,
      });

      //every company will have group with name "Matching"
      //so the matching tags should be under that group
      //If you do not find it, create it
      let matchingGroup = await GroupingsDBApi.findMatchingGroupID({
        companyId: currentUser.companyId,
      });

      if (!matchingGroup || !matchingGroup.id) {
        let roles1OfGroup = [];
        if (PersonRoleId) {
          roles1OfGroup.push(PersonRoleId);
        }
        if (roles1OfGroup.length) {
          let newMatchingGroup = await GroupingsDBApi.create(
            {
              name: 'Matching',
              roles1: roles1OfGroup,
            },
            {
              currentUser,
            },
          );

          matchingGroup = {
            id: newMatchingGroup.dataValues.id,
          };
        }
      }

      if (!data.subgroups) {
        data.subgroups = new Array();
      }

      // if there is funder tag on subgroups, exclude them
      // because they should be only set from credential Funders
      if (
        data.subgroups &&
        data.subgroups.length > 0 &&
        funderGroupId &&
        funderGroupId.id
      ) {
        let nonFunderTags = await getNonFunderTagsFromSubgroupList({
          subgroups: data.subgroups,
          groupId: funderGroupId.id,
        });
        data.subgroups = nonFunderTags;
      }

      // if there is 'Matching' tag on subgroups, exclude them
      // because they should be only set from other users profiles
      if (
        data.subgroups &&
        data.subgroups.length > 0 &&
        matchingGroup &&
        matchingGroup.id
      ) {
        let nonMatchingTags = await getNonMatchingTagsFromSubgroupList({
          subgroups: data.subgroups,
          groupId: matchingGroup.id,
        });
        data.subgroups = nonMatchingTags;
      }

      // get the funder tags of credential funders and set them
      // remove duplicates from user subgroups
      // because user might send the funder tag of some credential funders
      // in subgroups parameter
      let funderTagIdsOfFunder = await getFunderTagsOfFunderUsers(
        data.credentialFunders,
      );
      data.subgroups.push(...funderTagIdsOfFunder);
      data.subgroups = Array.from(new Set(data.subgroups));

      // create the user
      newUser = await UsersDBApi.create(
        { data },
        {
          currentUser,
          transaction,
        },
      );

      // If the user is Funder then create its funder tag with same name
      if ('Funder' === data?.resourceName) {
        // create funder tag
        if (funderGroupId) {
          await SubgroupsService.create(
            {
              name: data.firstName,
              group: funderGroupId.id,
              user: [newUser.id],
            },
            currentUser,
          );
        }
      }

      // commit this transaction because we will need the userId
      // while creating the tag and constraint
      await transaction.commit();
      mainTransactionCommitted = true;

      // if there is matching users, then create tag and constraint
      if (data.matchingUsers?.length > 0) {
        // Ensure having matching tag for matching people
        let matchingTag = await SubgroupsService.create(
          {
            name: data.firstName + ' ' + data.lastName + ' - Matching group',
            group: matchingGroup.id,
            user: data.matchingUsers,
            relatedUser: newUser.id,
          },
          currentUser,
        );

        // Ensure having matching constraint for current user with new matching-group tag (forever)
        await NewconstraintgeneratorService.create(
          // default constraint data for generating matching constraint
          {
            alias: '',
            all: false,
            antecedentType: 'specific',
            antecedentTypeDaySelection: 'alldays',
            antecedentTypeUser: newUser.id,
            branches: [],
            consequenceType: 'type',
            consequenceTypeDaySelection: 'alldays',
            consequenceTypeEachOrAll: 'each',
            consequenceTypeSubgroup: matchingTag.dataValues.id,
            consequenceTypeRole: PersonRoleId,
            constraintType: 'matching',
            description: `<strong>${data.firstName} ${data.lastName}</strong> <strong>must</strong> have a <strong>Person</strong> tagged <strong>${matchingTag.dataValues.name}</strong>. Valid forever`,
            disabled: false,
            end: '2200-01-01',
            forever: true,
            frequency: 'day',
            fromHome: false,
            max: 1,
            min: 0,
            nolimit: false,
            rollover: false,
            soft: data.matchingSoft || false,
            start: '1970-01-01',
            tag1: false,
            tag2: true,
            units: 'miles',
            weight: 1,
          },
          currentUser,
        );
      }

      try {
        await UsersService.syncUserChatStatus(newUser);
      } catch (error) {
        console.log('Error syncing chat status', error);
      }

      return newUser;
    } catch (error) {
      if (!mainTransactionCommitted) {
        await transaction.rollback();
      }
      next(error);
    }
  }

  static async update(data, id, currentUser) {
    const transaction = await db.sequelize.transaction();
    let mainTransactionCommitted = false;
    try {
      if (!data.subgroups) {
        data.subgroups = new Array();
      }

      let user = await UsersDBApi.findBy({ id }, { transaction });

      if (!user) {
        throw new ValidationError('iam.errors.userNotFound');
      }

      // if it is Activity, check is it mutable
      if (isUserActivity(user) && user.immutable) {
        throw new ApiValidationError('This activity is immutable and cannot be updated');
      }

      // check if there exist user with same first and last names
      let usersWithSameFirstLastNames = await UsersDBApi.findByFirstLastNames(
        {
          firstName: data.firstName,
          lastName: data.lastName,
        },
        {
          currentUser,
          transaction,
        },
      );

      if (usersWithSameFirstLastNames.length > 0) {
        for (let u of usersWithSameFirstLastNames) {
          if (u.id !== id) {
            throw new ValidationError(
              'iam.errors.userWithSameUserbaneAlreadyExists',
            );
          }
        }
      }

      // validate users uniqueness by email
      if (
        !['Activity', 'Block', 'Funder', 'Location'].includes(
          data?.resourceName,
        )
      ) {
        if (data.email) {
          let isEmailBeingUsedByAnotherUser = await UsersDBApi.checkEmailUsed({ email : data.email, notThisID : id }, { transaction } )
          // check if the email is existing and if it is not the current user
          if (isEmailBeingUsedByAnotherUser) {
            throw new ValidationError('iam.errors.userAlreadyExists');
          }
        } else {
          throw new ValidationError('auth.invalidEmail');
        }
      }

      // get Person Role
      let PersonRoleId = null;
      const personRoles = await RolesDBApi.findAll({
        companyId: currentUser.companyId,
        name: 'Person',
      });
      if (personRoles && personRoles.rows && personRoles.rows.length > 0) {
        PersonRoleId = personRoles.rows[0].id;
      }

      // get "Funder" group id
      const funderGroupId = await GroupingsDBApi.findFunderGroupID({
        companyId: currentUser.companyId,
      });

      // get `Matching` group id
      let matchingGroup = await GroupingsDBApi.findMatchingGroupID({
        companyId: currentUser.companyId,
      });

      if (!matchingGroup || !matchingGroup.id) {
        let roles1OfGroup = [];
        if (PersonRoleId) {
          roles1OfGroup.push(PersonRoleId);
        }
        let newMatchingGroup = await GroupingsDBApi.create(
          {
            name: 'Matching',
            roles1: roles1OfGroup,
          },
          {
            currentUser,
          },
        );

        matchingGroup = {
          id: newMatchingGroup.dataValues.id,
        }; 
      }

      // check if user is funder
      let isFunder = isUserFunder(user);

      // if there is funder tag on subgroups, exclude them
      // because they should be only set from credential Funders
      if (
        data.subgroups &&
        data.subgroups.length > 0 &&
        funderGroupId &&
        funderGroupId.id
      ) {
        let nonFunderTags = await getNonFunderTagsFromSubgroupList({
          subgroups: data.subgroups,
          groupId: funderGroupId.id,
        });
        data.subgroups = nonFunderTags;
      }

      // set the funder tags of credential funder to subgroups
      let funderTagIdsOfFunder = await getFunderTagsOfFunderUsers(
        data.credentialFunders,
      );
      data.subgroups.push(...funderTagIdsOfFunder);

      if (isFunder) {
        // if user is funder then add his related funder tag to the data.subgroups
        // otherwise it will lose his connection with funder tag
        if (funderGroupId?.id) {
          for (let q = 0; q < user.subgroups.length; q++) {
            if (
              user.subgroups[q].name === user.firstName &&
              user.subgroups[q].groupId === funderGroupId.id
            ) {
              data.subgroups.push(user.subgroups[q].id);
              break;
            }
          }
        }
      }

      // remove duplicates from user subgroups
      data.subgroups = Array.from(new Set(data.subgroups));

      // if there is 'Matching' tag on subgroups, exclude them
      // because they should be only set from other users profiles
      if (
        data.subgroups &&
        data.subgroups.length > 0 &&
        matchingGroup &&
        matchingGroup.id
      ) {
        let nonMatchingTags = await getNonMatchingTagsFromSubgroupList({
          subgroups: data.subgroups,
          groupId: matchingGroup.id,
        });
        data.subgroups = nonMatchingTags;
      }

      // set the matching tags already related to the being updated user
      if (matchingGroup?.id) {
        for (let q = 0; q < user.subgroups.length; q++) {
          if (user.subgroups[q].groupId === matchingGroup.id) {
            data.subgroups.push(user.subgroups[q].id);
          }
        }
      }

      // remove duplicates from user subgroups
      data.subgroups = Array.from(new Set(data.subgroups));

      // update the user
      const updatedUser = await UsersDBApi.update(id, data, {
        currentUser,
        transaction,
      });

      // if user is Funder then update the related funder tag
      if (isFunder) {
        if (funderGroupId?.id) {
          // get the funder tag ID and update its name
          for (let q = 0; q < user.subgroups.length; q++) {
            if (
              user.subgroups[q].name === user.firstName &&
              user.subgroups[q].groupId === funderGroupId.id
            ) {
              await SubgroupsDBApi.updateName(
                user.subgroups[q].id,
                data.firstName,
                {
                  currentUser,
                  transaction,
                },
              );
            }
          }
        }
      }

      // if the user is disabled and it was not disabled before
      // then delete the events of that user which starts in future and ends in future
      // and update the events which started in past and ending in future to end today
      if (data.deleteEvents && data.disabled && !user.disabled) {
        const currentDate = data?.deleteEventsFromDate;
        let modifiedDeletedEvents = await EventsDBApi.deletedAndModifyTheFutureEventsOfUsers(
          {
            userId: id,
            date: currentDate,
          },
          { transaction },
        );
      }
      

      // commit this transaction because we will need the userId
      // while creating the tag and constraint
      await transaction.commit();
      mainTransactionCommitted = true;

      // if there is matching users, then create tag and constraint if they don't exist
      // if they exist then update them
      if (data.matchingUsers && data.matchingUsers.length > 0) {
        // check if the matching tag of user exists
        const oldtag = await SubgroupsDBApi.findBy({
          groupId: matchingGroup.id,
          relatedUserId: id,
        });

        // Ensure having matching tag for matching people exists
        // if it is not existing then create it
        let tagID = false;
        let tagName = '';
        if (!oldtag) {
          let matchingTag = await SubgroupsService.create(
            {
              name: data.firstName + ' ' + data.lastName + ' - Matching group',
              group: matchingGroup.id,
              user: data.matchingUsers,
              relatedUser: id,
            },
            currentUser,
          );
          tagID = matchingTag.dataValues.id;
          tagName = data.firstName + ' ' + data.lastName + ' - Matching group';
        } else {
          // update the name and users
          await SubgroupsDBApi.updateNameAndUsers(
            oldtag.id,
            {
              name: data.firstName + ' ' + data.lastName + ' - Matching group',
              user: data.matchingUsers,
            },
            {
              currentUser,
            },
          );
          tagID = oldtag.id;
          tagName = data.firstName + ' ' + data.lastName + ' - Matching group';
        }

        // check if the matching constraint exists for this user
        let oldConstraint = await NewconstraintgeneratorDBApi.findBy({
          antecedentUserId: id,
          consequenceSubgroupId: tagID,
          constraintType: 'matching',
        });

        // Ensure having matching constraint for current user with matching-group tag (forever)
        // if it is not existing then create it
        if (!oldConstraint) {
          await NewconstraintgeneratorService.create(
            // default constraint data for generating matching constraint
            {
              alias: '',
              all: false,
              antecedentType: 'specific',
              antecedentTypeDaySelection: 'alldays',
              antecedentTypeUser: id,
              branches: [],
              consequenceType: 'type',
              consequenceTypeDaySelection: 'alldays',
              consequenceTypeEachOrAll: 'each',
              consequenceTypeSubgroup: tagID,
              consequenceTypeRole: PersonRoleId,
              constraintType: 'matching',
              description: `<strong>${data.firstName} ${data.lastName}</strong> <strong>must</strong> have a <strong>Person</strong> tagged <strong>${tagName}</strong>. Valid forever`,
              disabled: false,
              end: '2200-01-01',
              forever: true,
              frequency: 'day',
              fromHome: false,
              max: 1,
              min: 0,
              nolimit: false,
              rollover: false,
              soft: data.matchingSoft || false,
              start: '1970-01-01',
              tag1: false,
              tag2: true,
              units: 'miles',
              weight: 1,
            },
            currentUser,
          );
        } else {
          // if it is existing
          // just update the description
          await NewconstraintgeneratorDBApi.update(
            oldConstraint.id,
            {
              alias: '',
              all: false,
              antecedentType: 'specific',
              antecedentTypeDaySelection: 'alldays',
              antecedentTypeUser: id,
              branches: [],
              consequenceType: 'type',
              consequenceTypeDaySelection: 'alldays',
              consequenceTypeEachOrAll: 'each',
              consequenceTypeSubgroup: tagID,
              consequenceTypeRole: PersonRoleId,
              constraintType: 'matching',
              description: `<strong>${data.firstName} ${data.lastName}</strong> <strong>must</strong> have a <strong>Person</strong> tagged <strong>${tagName}</strong>. Valid forever`,
              disabled: false,
              end: '2200-01-01',
              forever: true,
              frequency: 'day',
              fromHome: false,
              max: 1,
              min: 0,
              nolimit: false,
              rollover: false,
              soft: data.matchingSoft || false,
              start: '1970-01-01',
              tag1: false,
              tag2: true,
              units: 'miles',
              weight: 1,
            },
            {
              currentUser,
            },
          );
        }
      } else if(matchingGroup) {
        // if there is no matching users then delete the tag and constraint if they exist
        // check if the matching tag of user exists
        const oldtag = await SubgroupsDBApi.findBy({
          groupId: matchingGroup.id,
          relatedUserId: id,
        });

        // if tag exists then delete and look for constraint
        if (oldtag) {
          // delete related users from tag
          await SubgroupsDBApi.updateNameAndUsers(
            oldtag.id,
            {
              name: oldtag.name,
              user: [],
            },
            {
              currentUser,
            },
          );
          // delete the tag
          await SubgroupsService.remove(oldtag.id, currentUser);

          // check if the matching constraint exists for this user
          let oldConstraint = await NewconstraintgeneratorDBApi.findBy({
            antecedentUserId: id,
            consequenceSubgroupId: oldtag.id,
            constraintType: 'matching',
          });

          if (oldConstraint) {
            // delete constraint
            await NewconstraintgeneratorService.remove(
              oldConstraint.id,
              currentUser,
            );
          }
        }
      }

      try {
        await UsersService.syncUserChatStatus(updatedUser);
      } catch (error) {
        console.log('Error syncing chat status', error);
      }

      return user;
    } catch (error) {
      if (!mainTransactionCommitted) {
        await transaction.rollback();
      }
      throw error;
    }
  }

  static async updateDynamic(data, id, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      let user = await UsersDBApi.findBy({ id }, { transaction });

      if (!user) {
        throw new ValidationError('iam.errors.userNotFound');
      }

      /* Fill the data which are not sent from user
       for example if the FirstName was not sent then it means
       it will not be updated so we can put the old firstName as data.firstName */
      if (!data?.firstName) {
        data.firstName = user.firstName;
      }

      if (!data?.lastName) {
        data.lastName = user.lastName;
      }

      if (!data?.email) {
        data.email = user.email;
      }

      if (!data?.phoneNumber) {
        data.phoneNumber = user.phoneNumber;
      }

      if (!data?.idCustom2) {
        data.idCustom2 = user.idCustom2;
      }

      if (!data?.address) {
        data.address = user.address;
      }

      if (!data?.longtitude) {
        data.longtitude = user.longtitude;
      }

      if (!data?.latitude) {
        data.latitude = user.latitude;
      }

      if (!data?.disabled) {
        data.disabled = user.disabled;
      }

      // check if there exist user with same first and last names
      let usersWithSameFirstLastNames = await UsersDBApi.findByFirstLastNames(
        {
          firstName: data.firstName,
          lastName: data.lastName,
        },
        {
          currentUser,
          transaction,
        },
      );

      if (usersWithSameFirstLastNames.length > 0) {
        for (let u of usersWithSameFirstLastNames) {
          if (u.id !== id) {
            throw new ValidationError(
              'iam.errors.userWithSameUserbaneAlreadyExists',
            );
          }
        }
      }

      // validate users uniqueness by email
      if (data.email) {
        let isEmailBeingUsedByAnotherUser = await UsersDBApi.checkEmailUsed({ email : data.email, notThisID : id }, { transaction } )
        // check if the email is existing and if it is not the current user
        if (isEmailBeingUsedByAnotherUser) {
          throw new ValidationError('iam.errors.userAlreadyExists');
        }
      }  

      // update the user
      await UsersDBApi.updateDynamic(id, data, {
        currentUser,
        transaction,
      });

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async remove(id, currentUser, query) {
    const transaction = await db.sequelize.transaction();
    try {
      if (currentUser.id === id) {
        throw new ValidationError('iam.errors.deletingHimself');
      }

      if (!isUserRoleOrHigher(currentUser.role, 'admin')) {
        throw new ValidationError('errors.forbidden.message');
      }

      let user = await UsersDBApi.findBy({ id }, { transaction });
      if (!user) {
        throw new ValidationError('iam.errors.userNotFound');
      }

      if (isUserHome(user.firstName, user.lastName)) {
        throw new ValidationError('iam.errors.systemLevelRecord');
      }

      // if it is Activity check if there is event assigned
      if(isUserActivity(user)){
        if (user.immutable) {
          throw new ApiValidationError('This activity is immutable and cannot be deleted');
        }
        let activityHasEvent = await EventsDBApi.isActivityHasEvent({ activity0Id : id }, { transaction });
        if (activityHasEvent){
          throw new ValidationError('activity.hasEvent')
        }
      }

      await UsersDBApi.remove(id, {
        currentUser,
        transaction,
      });

      // check if user is funder if it is then remove the related funder tag
      let isFunder = isUserFunder(user);

      if (isFunder) {
        // get "Funder" group id
        const funderGroupId = await GroupingsDBApi.findFunderGroupID({
          companyId: currentUser.companyId,
        });

        if (funderGroupId && funderGroupId.id) {
          // get the funder tag ID and delete it
          for (let q = 0; q < user.subgroups.length; q++) {
            if (
              user.subgroups[q].name === user.firstName &&
              user.subgroups[q].groupId === funderGroupId.id
            ) {
              await SubgroupsDBApi.remove(user.subgroups[q].id, {
                currentUser,
                transaction,
              });
            }
          }
        }
      }

      if (query?.deleteEvents === 'true' && query?.deleteEventsFromDate) {
        const currentDate = query?.deleteEventsFromDate;
        let modifiedDeletedEvents = await EventsDBApi.deletedAndModifyTheFutureEventsOfUsers(
          {
            userId: id,
            date: currentDate,
          },
          { transaction },
        );
      }

      await transaction.commit();

      try {
        await UsersService.syncUserChatStatus(user, true);
      } catch (error) {
        console.log('Error syncing chat status', error);
      }
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async syncUserChatStatus(user, isRemoving = false) {
    if (isRemoving) {
      await ChatService.deleteUsersIfExists([user.id]);
      return;
    }

    const rolesAndAncestors = await getRolesAndAncestors(
      user.companyId,
      user.roles.map(role => role.name)
    );

    const hasChatAccess = await RolesDBApi.hasAnyRoleWithFeatureEnabled(
      rolesAndAncestors,
      user.companyId,
      'chatFeature'
    );

    if (hasChatAccess) {
      await ChatService.upsertUsers([{
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        company: {
          name: user.company.name,
        },
      }]);
    } else {
      await ChatService.deleteUsersIfExists([user.id]);
    }
  }
};
