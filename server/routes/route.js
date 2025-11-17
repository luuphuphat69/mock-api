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

//authen route
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// projects route
router.get('/projects/:userID',verifyToken, retrieveProject.getByUserID)
router.get('/projects/:name', verifyToken, retrieveProject.getByName)
router.get('/projects', verifyToken, retrieveProject.getAll)
router.get('/project/key/:id', verifyToken, retrieveProject.getKey);
router.post('/projects', verifyToken, addProject)
router.delete('/projects/:id', verifyToken, deleteProject)
router.patch('/project/:id', verifyToken, updateProject);

//resources route
router.post('/resources/:projectId', verifyToken, addResource)
router.get('/resources/:projectId', verifyToken, getResource.getByProjectId)
router.delete('/resources/:id', verifyToken, deleteResourceById);
router.patch('/resources/:id', verifyToken, editResource);

// token verification
router.get('/me', verifyToken, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router