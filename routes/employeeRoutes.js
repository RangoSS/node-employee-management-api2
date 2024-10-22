const express = require('express');
const upload = require('../middleware/upload'); // Adjust the path if necessary
const { postEmployee, getAllEmployees, updateEmployee, deleteEmployee ,getAllEmployeesCount } = require('../controllers/employeeController');

const router = express.Router();

// Log the imported functions
console.log('postEmployee:', postEmployee);
//console.log('getAllEmployees:', getAllEmployees);
console.log('updateEmployee:', updateEmployee);
console.log('deleteEmployee:', deleteEmployee);

// POST endpoint to add an employee
router.post('/employees', upload.single('photo'), postEmployee);

// GET endpoint to retrieve all employees
//router.get('/employees', getAllEmployees);

// PUT endpoint to update an employee (with an optional new photo)
router.put('/employees/:id', upload.single('photo'), updateEmployee);

// DELETE endpoint to remove an employee by ID
router.delete('/employees/:id', deleteEmployee);


// Define the route for counting employees
router.get('/employees/count', getAllEmployeesCount);


module.exports = router;
