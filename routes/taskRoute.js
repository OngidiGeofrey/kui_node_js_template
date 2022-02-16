const { Router } = require('express');
const router = Router();

// Import Middlewares
const {
	validationCreate,
	isTaskExistsCreate,
	validationUpdate,
	isTaskExistsUpdate,
	validationDelete,
} = require('../middlewares/taskMiddleware');

// Import Controllers
const tasksController = require('../controllers/tasksController');

router.post('/tasks', tasksController.getAll);
router.post('/tasks/get/:id', tasksController.getOne);
router.post(
	'/tasks/create',
	[validationCreate, isTaskExistsCreate],
	tasksController.create
);
router.post(
	'/tasks/update/:id',
	[validationUpdate, isTaskExistsUpdate],
	tasksController.update
);
router.post('/tasks/delete/:id', [validationDelete], tasksController.delete);
router.post('/tasks/update-picture', tasksController.updatePicture);
router.post('/tasks/send-email', tasksController.sendEmail);

module.exports = router;
