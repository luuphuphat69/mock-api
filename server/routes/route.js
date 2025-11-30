const router = require('express').Router();

// middleware
const verifyToken = require('../middleware/verifyToken');

// auth controller
const register = require('../controller/authen/register');
const login = require('../controller/authen/login');
const logout = require('../controller/authen/logout');

// project controller
const addProject = require('../controller/projects/add');
const retrieveProject = require('../controller/projects/retrieve');
const deleteProject = require('../controller/projects/delete');
const updateProject = require('../controller/projects/update');

// resource controller
const addResource = require('../controller/resources/add');
const getResource = require('../controller/resources/retrieve');
const deleteResourceById = require('../controller/resources/delete');
const editResource = require('../controller/resources/edit');

// user controller
const searchUser = require('../controller/user/search');

//memeber controller
const getMembers = require('../controller/member/retrieve');
const removeMember = require('../controller/member/remove');
const sendInvite = require('../controller/member/sendInvite');

//authen route
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// projects route
router.get('/projects/user/:userID',verifyToken, retrieveProject.getByUserID)
router.get('/projects/name/:name', verifyToken, retrieveProject.getByName)
router.get('/projects', verifyToken, retrieveProject.getAll)
router.get('/project/key/:id', verifyToken, retrieveProject.getKey);
router.post('/projects', verifyToken, addProject)
router.delete('/projects/:userid/:id', verifyToken, deleteProject)
router.patch('/projects/:userid/:id', verifyToken, updateProject);
router.get('/projects/collab/:userid', verifyToken, retrieveProject.getProjectAsMemberAndGuest)

//resources route
router.post('/resources/:userid/:projectId', verifyToken, addResource)
router.get('/resources/:userid/:projectId', verifyToken, getResource.getByProjectId)
router.delete('/resources/:userid/:projectId/:id', verifyToken, deleteResourceById);
router.patch('/resources/:userid/:projectId/:id', verifyToken, editResource);

//user route
router.get('/user/search', verifyToken, searchUser)

//member route
router.get('/members/:id', verifyToken, getMembers)
router.delete('/members/:requesterid/:userid/:projectid', verifyToken, removeMember)
router.post('/members/send-invite/:inviterId/:projectId', verifyToken, sendInvite)

// token verification
router.get('/me', verifyToken, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router