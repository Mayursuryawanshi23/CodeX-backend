var express = require('express');
const { signUp, login, createProj, saveProject, getProjects, getProject, deleteProject, editProject, getUserData } = require('../controllers/userController');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// Authentication routes
router.post("/signUp", signUp);
router.post("/login", login);

// User routes
router.post("/getUserData", getUserData);

// Project routes
router.post("/createProj", createProj);
router.post("/saveProject", saveProject);
router.post("/getProjects", getProjects);
router.post("/getProject", getProject);
router.post("/deleteProject", deleteProject);
router.post("/editProject", editProject);

module.exports = router;
