import { addProject } from "./project/insertProject.js";
import { selectProjects, projectStats, projectNow, allRapport, getTasks, selectionProject, getAccept, getProjectsByUser, budgetCount, getProjectWeeklyProgress, getProjectDailyProgress, countTaskStatusByProject, selectPendingProjects} from "./project/getProjects.js";
import { selectProject } from "./project/getProject.js";
import { deleteProject } from "./project/deleteProject.js";
import { updateProject, getAllAvancementProjects, statusAccept, statusRejet } from "./project/updateProject.js";
import { assignProject } from "./project/assignProject.js";
import { getAcceptedChefs } from "./project/acceptedChef.js";

import { selectProjectsAvanc, getTasksByProject, createTasksByProject, taskAssign, employeeAvailable } from "./project/getProjectsAvanc.js";

import { selectUsers } from "./userManagement/getUsers.js";
import { insertUser } from "./userManagement/addUser.js";
import { delUser } from "./userManagement/deleteUser.js";
import { editUser } from "./userManagement/updateUser.js";

import { acceptUser } from "./userManagement/acceptUserRegister.js";

import { selectAccountUsers, userStatus } from "./userManagement/userCompte.js";

import { accountUsers, userDiscu, allUserDiscu, allProjectManagers } from "./userManagement/countUser.js";


import { getTaskUser, startTask, taskNowForUser, statusTask } from "./task/getTask.js"
import { insertReport, statEmploye, statEmployePrevious } from "./task/reportTask.js";


export const getTaskForEmploye = Object.freeze({
  getTaskUser,
  startTask,
  taskNowForUser,
  statusTask
});

export const insertReportNow = Object.freeze({
  insertReport,
  statEmploye,
  statEmployePrevious
});

export const InsertProjectAdmin = Object.freeze({
  addProject,
});

export const getAllProjects = Object.freeze({
  selectProjects,
  projectNow,
  allRapport,
  projectStats,
  selectionProject,
  getTasks,
  getAccept,
  getProjectsByUser,
  budgetCount,
  getProjectWeeklyProgress,
  getProjectDailyProgress,
  countTaskStatusByProject,
  selectPendingProjects
});

export const getProject = Object.freeze({
  selectProject,
});

export const editProject = Object.freeze({
  updateProject,
  getAllAvancementProjects,
  statusAccept,
  statusRejet
});

export const delProject = Object.freeze({
  deleteProject,
});

export const getAllProjectsAvanc = Object.freeze({
  selectProjectsAvanc,
  getTasksByProject,
  createTasksByProject,
  taskAssign,
  employeeAvailable
});

export const getAcceptedChef = Object.freeze({
  getAcceptedChefs,
});

export const assignProjectChef = Object.freeze({
  assignProject,
});


export const getAllUsers = Object.freeze({
  selectUsers,
});

export const addUser = Object.freeze({
  insertUser,
});

export const deleteUser = Object.freeze({
  delUser,
});

export const updateUser = Object.freeze({
  editUser,
});


export const acceptNewUser = Object.freeze({
  acceptUser,
});

export const userCompteManage = Object.freeze({
  selectAccountUsers,
  userStatus
})

export const countUser = Object.freeze({
  accountUsers,
  userDiscu,
  allUserDiscu,
  allProjectManagers
})
