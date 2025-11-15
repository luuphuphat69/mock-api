const verifyToken = require('../middleware/verifyToken');
const register = require('../controller/authen/register');
const login = require('../controller/authen/login');
const logout = require('../controller/authen/logout');

const addProject = require('../controller/projects/add');
const retrieveProject = require('../controller/projects/retrieve');
const deleteProject = require('../controller/projects/delete');
const updateProject = require('../controller/projects/update');

const router = require('express').Router();

//authen route
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// projects route
router.get('/projects/:userID',verifyToken, retrieveProject.getByUserID)
router.get('/projects/:name', verifyToken, retrieveProject.getByName)
router.get('/projects', verifyToken, retrieveProject.getAll)
router.post('/projects', verifyToken, addProject)
router.delete('/projects/:id', verifyToken, deleteProject)
router.patch('/project/:id', verifyToken, updateProject);

router.get('/me', verifyToken, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router