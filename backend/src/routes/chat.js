const UsersDBApi = require('../db/api/users');
const ChatService = require('../services/chat/chat');
const RolesDBApi = require('../db/api/roles');
const { getRolesAndAncestors } = require('../utils/roleHierarchy');
const { UnauthorizedError } = require('../common/errors');

const router = require('../utils/createRouter')();

router.get('/available-users', async (req, res) => {
  const currentUser = req.currentUser;
  const { fullName, limit, page } = req.query;

  const availableUsers = await UsersDBApi.findAvailableChatUsers({
    companyId: currentUser.companyId,
    branchIds: currentUser.branches.map((branch) => branch.id),
    fullName,
    limit: parseInt(limit, 10) || 10,
    page: parseInt(page, 10) || 1,
  });

  res.status(200).json(availableUsers);
});

router.get('/token', async (req, res) => {
  const { companyId, roles, id: userId } = req.currentUser;

  // Get all roles and their ancestors
  const allRolesAndAncestors = await getRolesAndAncestors(
    companyId,
    roles.map(role => role.name)
  );

  // Check if chat feature is enabled for any of these roles
  const hasChatFeature = await RolesDBApi.hasAnyRoleWithFeatureEnabled(
    allRolesAndAncestors,
    companyId,
    'chatFeature'
  );

  if (!hasChatFeature) {
    throw new UnauthorizedError('Chat feature not enabled for this user');
  }

  // Generate Mattermost token
  const mattermostToken = await ChatService.generateToken(userId);

  res.status(200).json({
    token: mattermostToken,
    success: true,
  });
});



module.exports = router;