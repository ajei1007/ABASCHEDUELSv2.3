const GroupingsDBApi = require('../db/api/groupings');
const SubgroupsDBApi = require('../db/api/subgroups');
const SubgroupsService = require('../services/subgroups');
const getUsersByResourceName = require('../utils/getUsersByResourceName');
const UsersDBApi = require('../db/api/users');

async function createFunderTagsForAllFunders() {
  try {
    const funderIdCompanyIds = await GroupingsDBApi.findFunderGroupIdCompanyIdPairs();

    let numberOfNewFunderTags = 0

    for (let i = 0; i < funderIdCompanyIds.length; i++) {
      let groupId = funderIdCompanyIds[i].id
      let companyId = funderIdCompanyIds[i].createdBy.companyId

      // get admin user
      let adminUser = await UsersDBApi.findOneAdminOfCompany({ companyId: companyId })
      if (!adminUser) {
        continue
      }

      const funders = await getUsersByResourceName({ currentUser: adminUser }, 'Funder', true);
      for (let i = 0; i < funders.rows.length; i++) {
        let currentFunder = funders.rows[i];

        // check if the funder tag with same name and same group id exists
        const payload = await SubgroupsDBApi.findBy({
          name: currentFunder.firstName,
          groupId: groupId,
        });

        // if there is no funder tag, then create one
        if (!payload) {
          console.log('currentFunder.firstName', currentFunder.firstName)
          console.log('groupId', groupId)
          await SubgroupsService.create(
            {
              name: currentFunder.firstName,
              group: groupId,
              user: [currentFunder.id],
            },
            adminUser,
          );
          numberOfNewFunderTags++
        }
      }
    }

    console.log('Successful! Tags are updated!');
  } catch (error) {
    console.log('Error!', error);
  }
}

createFunderTagsForAllFunders();