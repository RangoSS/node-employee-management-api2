const express = require('express');
const upload = require('../middleware/upload'); // File upload middleware (if needed)
const {
    postEmployee,
    getAllEmployeesData,
    getAllEmployeesCount,
    updateEmployee,
    deleteEmployee
} = require('../controllers/employeeController');

const router = express.Router();

// POST endpoint to add an employee
router.post('/employees', upload.single('photo'), postEmployee);

// GET endpoint to retrieve all employees
router.get('/employees', getAllEmployeesData);

// GET endpoint to count employees
router.get('/employees/count', getAllEmployeesCount);

// PUT endpoint to update an employee
router.put('/employees/:id', upload.single('photo'), updateEmployee);

// DELETE endpoint to delete an employee by ID
router.delete('/employees/:id', deleteEmployee);

module.exports = router;
