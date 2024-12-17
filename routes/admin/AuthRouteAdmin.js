import express from "express";
//import { AuthControllerAdmin } from "../../controllers/admin/index.js";
//import { productController } from "../../controllers/admin/index.js";
//import { Admin } from "../../controllers/admin/index.js";
import { InsertProjectAdmin  } from "../../controllers/admin/index.js";
import { getAllProjects } from "../../controllers/admin/index.js";
import { getProject } from "../../controllers/admin/index.js";
import { editProject } from "../../controllers/admin/index.js";
import { delProject } from "../../controllers/admin/index.js";
import { getAcceptedChef } from "../../controllers/admin/index.js";
import { assignProjectChef } from "../../controllers/admin/index.js";

import { getAllProjectsAvanc } from "../../controllers/admin/index.js";

import { getAllUsers } from "../../controllers/admin/index.js";
import { deleteUser } from "../../controllers/admin/index.js";
import { addUser } from "../../controllers/admin/index.js";
import { updateUser } from "../../controllers/admin/index.js";
import { acceptNewUser } from "../../controllers/admin/index.js";

import { userCompteManage } from "../../controllers/admin/index.js";

import { countUser } from "../../controllers/admin/index.js";

import { getTaskForEmploye } from "../../controllers/admin/index.js";

import { insertReportNow } from "../../controllers/admin/index.js";


const router = express.Router();


router.get("/getTasksForUser", getTaskForEmploye.getTaskUser);
router.put("/taskStart", getTaskForEmploye.startTask);

router.get("/taskNow", getTaskForEmploye.taskNowForUser);
router.get("/project/:projectId/tasks-status", getTaskForEmploye.statusTask);

router.post("/insertReport", insertReportNow.insertReport);
router.get("/employeStat", insertReportNow.statEmploye);
router.get("/employeStatPrevious", insertReportNow.statEmployePrevious);


// Projet
router.post("/projets", InsertProjectAdmin.addProject);
router.get("/allProjects", getAllProjects.selectProjects); //
router.get("/projets/projectNowForChef", getAllProjects.projectNow);
router.get('/projets/rapportForChef/:idProjet', getAllProjects.allRapport);
router.get("/statProject", getAllProjects.projectStats);
router.get("/projetsEnAttente", getAllProjects.selectPendingProjects);
router.get("/oneProject/:id_projet", getProject.selectProject);
router.put("/allProjects/:id_projet", editProject.updateProject);

router.post("/assignProject", assignProjectChef.assignProject);
router.get("/acceptedChefs", getAcceptedChef.getAcceptedChefs);

router.patch("/allProjects/accept/:id_projet", editProject.statusAccept);
router.patch("/allProjects/rejet/:id_projet", editProject.statusRejet);

router.delete("/allProjects/:id_projet", delProject.deleteProject);
router.get("/project", getAllProjects.selectionProject); //
router.get("/task/:id_projet", getAllProjects.getTasks); //
router.get("/projectAccept", getAllProjects.getAccept);
router.get("/projectChef", getAllProjects.getProjectsByUser);
router.get("/budget", getAllProjects.budgetCount);
router.get("/project/weekly-progress", getAllProjects.getProjectWeeklyProgress);
router.get("/project/daily-progress", getAllProjects.getProjectDailyProgress);
router.get("/project/:id_projet/taskStatusCount", getAllProjects.countTaskStatusByProject)

router.get("/avancProject", getAllProjectsAvanc.selectProjectsAvanc);
router.get("/avancProject/:id_projet/getTask", getAllProjectsAvanc.getTasksByProject);
router.post("/avancProject/:id_projet/createTask", getAllProjectsAvanc.createTasksByProject); 
router.get("/getAvailableEmployees", getAllProjectsAvanc.employeeAvailable);
router.put("/assignTaskforUser", getAllProjectsAvanc.taskAssign);
// // assignTaskforUser getAvailableEmployees

router.get("/allUsers", getAllUsers.selectUsers); 

router.post("/addUser", addUser.insertUser);
router.put("/updateUser/:idUtilisateur", updateUser.editUser);
router.delete("/delUser/:idUtilisateur", deleteUser.delUser);

router.put('/acceptUser/:idUtilisateur', acceptNewUser.acceptUser);

// Récupérer tous les utilisateurs dans compteUtilisateur
router.get('/accountUsers', userCompteManage.selectAccountUsers);

// Bloquer un utilisateur
router.post('/userStatus/:idUtilisateur', userCompteManage.userStatus);

router.get('/countUser', countUser.accountUsers);
router.get('/userDiscussion', countUser.userDiscu);
router.get('/allUserDiscussion', countUser.allUserDiscu);
router.get('/projectManager', countUser.allProjectManagers);

export default router;
