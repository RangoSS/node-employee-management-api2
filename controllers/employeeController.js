const { db } = require('../config/firebaseConfig'); // Import Firestore db
const admin = require('firebase-admin'); // Ensure you have firebase-admin set up

// Controller function to handle posting an employee
const postEmployee = async (req, res) => {
    const { name, surname, age, idNumber, role } = req.body;
    const photo = req.file;

    try {
        // Create a timestamp for the creation date and time
        const createdAt = admin.firestore.Timestamp.now(); // Get the current timestamp

        // Add the employee to Firestore first
        const employeeRef = await db.collection('employees').add({
            name,
            surname,
            age,
            idNumber,
            role,
            photo: null, // Initialize the photo field as null
            createdAt, // Add the createdAt field
        });

        const employeeId = employeeRef.id; // Get the document ID

        // Check if a photo was uploaded
        if (photo) {
            // Define the file upload path using the employee ID
            const filePath = `uploads/employees/${employeeId}/${photo.originalname}`;

            // Upload the photo to Firebase Storage
            const bucket = admin.storage().bucket();
            const file = bucket.file(filePath);
            await file.save(photo.buffer, {
                metadata: {
                    contentType: photo.mimetype,
                },
                resumable: false, // Prevents the file from being uploaded in resumable mode
            });

            // Generate a public URL for the uploaded photo
            const photoUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

            // Update the employee document with the photo URL
            await employeeRef.update({ photo: photoUrl });
        }

        res.status(201).json({
            message: 'Employee created successfully',
            employee: {
                id: employeeId,
                name,
                surname,
                age,
                idNumber,
                role,
                photo: photo ? `uploads/employees/${employeeId}/${photo.originalname}` : null,
                createdAt: createdAt, // Include createdAt in the response
            },
        });
    } catch (error) {
        console.error('Error adding employee:', error);
        res.status(500).json({ error: 'Error creating employee' });
    }
};

//get all employee or filter by id or age
const getAllEmployees = async (req, res) => {
    console.log('Received request for employees'); // Log when the endpoint is hit

    // Get query parameters (idNumber and age from the request)
    const { idNumber, age } = req.query;

    try {
        let query = db.collection('employees'); // Start with the employees collection

        // If idNumber is provided, apply the filter
        if (idNumber) {
            query = query.where('idNumber', '==', idNumber); // Filter employees by idNumber
        }

        if (age) {
            query = query.where('age', '==', age); // Filter employees by age
        }

        // Execute the query and get results
        const snapshot = await query.get();

        if (snapshot.empty) {
            return res.status(404).json({ message: 'No employees found' }); // Handle case where no matching records are found
        }

        // Process and return the results
        const employees = [];
        snapshot.forEach(doc => {
            employees.push({
                id: doc.id, // Include document ID
                ...doc.data(), // Spread all the fields from the document data
            });
        });

        // Send the list of employees as a JSON response
        res.status(200).json(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ error: 'Error fetching employees' });
    }
};

// UPDATE employee details
const updateEmployee = async (req, res) => {
    const { id } = req.params; // Get employee ID from request parameters
    const { name, surname, age, idNumber, role } = req.body;
    const photo = req.file; // Check if a new photo is uploaded

    try {
        // Reference to the specific employee document
        const employeeRef = db.collection('employees').doc(id);

        // Check if the employee exists
        const employeeDoc = await employeeRef.get();
        if (!employeeDoc.exists) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        const updatedData = {
            name,
            surname,
            age,
            idNumber,
            role,
        };

        if (photo) {
            // If a new photo is uploaded, update it in Firebase Storage
            const filePath = `uploads/employees/${id}/${photo.originalname}`;
            const bucket = admin.storage().bucket();
            const file = bucket.file(filePath);
            await file.save(photo.buffer, {
                metadata: {
                    contentType: photo.mimetype,
                },
                resumable: false, // Prevents the file from being uploaded in resumable mode
            });

            // Generate a public URL for the new photo
            const photoUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
            updatedData.photo = photoUrl; // Add the photo URL to updated data
        }

        // Update employee details in Firestore
        await employeeRef.update(updatedData);

        res.status(200).json({ message: 'Employee updated successfully' });
    } catch (error) {
        console.error('Error updating employee:', error);
        res.status(500).json({ error: 'Error updating employee' });
    }
};

// DELETE employee by ID
const deleteEmployee = async (req, res) => {
    console.log("DELETE request received"); // Check if the route is hit

    const { id } = req.params; // Get employee ID from request parameters
    console.log("Employee ID:", id); // Log the ID to verify it is being received

    try {
        // Reference to the specific employee document
        const employeeRef = db.collection('employees').doc(id);

        // Check if the employee exists
        const employeeDoc = await employeeRef.get();
        if (!employeeDoc.exists) {
            console.log("Employee not found with ID:", id);
            return res.status(404).json({ message: 'Employee not found' });
        }

        console.log("Employee exists, deleting now...");

        // Delete the employee from Firestore
        await employeeRef.delete();

        // Optional: If the employee had a photo, you can also delete it from Firebase Storage
        const photoUrl = employeeDoc.data().photo;
        if (photoUrl) {
            console.log("Employee has a photo, deleting from storage...");
            const bucket = admin.storage().bucket();
            const filePath = photoUrl.replace(`https://storage.googleapis.com/${bucket.name}/`, ''); // Extract the file path
            const file = bucket.file(filePath);
            await file.delete(); // Delete the file from Firebase Storage
            console.log("Photo deleted successfully");
        }

        console.log("Employee deleted successfully");
        res.status(200).json({ message: 'Employee deleted successfully' });
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).json({ error: 'Error deleting employee' });
    }
};


module.exports = { postEmployee, getAllEmployees,updateEmployee,deleteEmployee };
