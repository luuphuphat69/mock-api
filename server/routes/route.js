const router = require('express').Router();

// middleware
const verifyToken = require('../middleware/verifyToken');

// auth controller
const register = require('../controller/authen/register');
const login = require('../controller/authen/login');
const logout = require('../controller/authen/logout');
const ResetPassword = require('../controller/authen/resetpass');
const ChangePassword = require('../controller/authen/changepass');

// project controller
const addProject = require('../controller/projects/add');
const retrieveProject = require('../controller/projects/retrieve');
const deleteProject = require('../controller/projects/delete');
const updateProject = require('../controller/projects/update');
const renewApiKey = require('../controller/projects/renewApiKey');
const searchProject = require('../controller/projects/search');
const updateVisibility = require('../controller/projects/updateVisibility');

// resource controller
const addResource = require('../controller/resources/add');
const getResource = require('../controller/resources/retrieve');
const deleteResourceById = require('../controller/resources/delete');
const editResource = require('../controller/resources/edit');

// user controller
const searchUser = require('../controller/user/search');
const updateUser = require('../controller/user/update');

//memeber controller
const getMembers = require('../controller/member/retrieve');
const removeMember = require('../controller/member/remove');
const sendInvite = require('../controller/member/sendInvite');
const changeRole = require('../controller/member/edit');
const leaveProject = require('../controller/member/leave');

// logs controller
const getLogs = require('../controller/activitylogs/retrieve');
const clearLogs = require('../controller/activitylogs/clear');

// mock logs controller
const getMockLogs = require('../controller/mock-logs/get');
const clearMockLogs = require('../controller/mock-logs/clear');

// metrics controller
const getGeneralMetrics = require('../controller/metrics/getGeneral');
const getMethodMetrics = require('../controller/metrics/getMethods');
const getByTimeline = require('../controller/metrics/getByTimeline');
const { writeLimit } = require('./rate-limit');

// ------------------------ route begin ------------------------

//authen route
router.post('/register', writeLimit,register);
router.post('/login', writeLimit,login);
router.post('/logout', logout);
router.post('/reset-password', ResetPassword)
router.post('/change-password', verifyToken, ChangePassword);

// projects route
router.get('/projects/search', verifyToken, searchProject)
router.get('/projects/user', verifyToken, retrieveProject.getByUserID)
router.get('/projects/collab', verifyToken, retrieveProject.getProjectAsMemberAndGuest)
router.get('/projects/:id', verifyToken, retrieveProject.getById)
router.get('/projects', verifyToken, retrieveProject.getAll)
router.patch('/projects/key/renew/:projectid', verifyToken, renewApiKey)
router.post('/projects', verifyToken, writeLimit, addProject)
router.delete('/projects/:id', verifyToken, deleteProject)
router.patch('/projects/:id', verifyToken, updateProject)
router.patch('/projects/set-visibility/:projectId', verifyToken, updateVisibility)

//resources route
router.post('/resources/:projectId', verifyToken, writeLimit ,addResource)
router.get('/resources/:projectId', verifyToken, getResource.getByProjectId)
router.delete('/resources/:projectId/:id', verifyToken, deleteResourceById);
router.patch('/resources/:projectId/:id', verifyToken, editResource);

//user route
router.get('/user/search', verifyToken, searchUser)
router.patch('/user/update', verifyToken, updateUser)

//member route
router.get('/members/:id', verifyToken, getMembers)
router.post('/members/send-invite/:projectId', verifyToken, writeLimit,sendInvite)
router.patch('/members/update-role/:userid/:projectid', verifyToken, changeRole)
router.delete('/members/leave/:projectId', verifyToken, leaveProject)
router.delete('/members/:userid/:projectid', verifyToken, removeMember)

// logs route
router.get('/logs/:projectid', verifyToken, getLogs)
router.delete('/logs/:projectid', verifyToken, clearLogs);

// mock logs route
router.get('/mock-logs/project/:projectId', verifyToken, getMockLogs.byProject)
router.get('/mock-logs/method/:projectId', verifyToken, getMockLogs.byMethod);
router.delete('/mock-logs/clear/:projectid/:days', verifyToken, clearMockLogs);

//metrics route
router.get('/metrics/general/:projectId', verifyToken, getGeneralMetrics)
router.get('/metrics/method/:projectId', verifyToken, getMethodMetrics)
router.get('/metrics/monthly/:projectId', verifyToken, getByTimeline)

// token verification
router.get('/me', verifyToken, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router
