const express = require('express');
const upload = require('../middleware/upload'); // Adjust the path if necessary
const { postEmployee ,getAllEmployees , updateEmployee ,deleteEmployee} = require('../controllers/employeeController');

const router = express.Router();

// POST endpoint to add an employee
router.post('/employees', upload.single('photo'), postEmployee);

// GET endpoint to retrieve all employees
router.get('/employees', getAllEmployees);

// PUT endpoint to update an employee (with an optional new photo)
router.put('/employees/:id', upload.single('photo'), updateEmployee);

// DELETE endpoint to remove an employee by ID
router.delete('/employees/:id', deleteEmployee);

module.exports = router;
