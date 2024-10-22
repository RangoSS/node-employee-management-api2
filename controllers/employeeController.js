const { db, bucket } = require('../config/firebaseConfig'); // Ensure bucket is imported from Firebase config
const admin = require('firebase-admin'); // Ensure you have firebase-admin set up
const { v4: uuidv4 } = require('uuid'); // Use UUID for generating unique names


const postEmployee = async (req, res) => {
    try {
        const { name, surname, age, idNumber, role } = req.body;
        let photoUrl = '';

        if (req.file) {
            // Generate a unique filename for the uploaded photo
            const fileName = `employees/${uuidv4()}_${req.file.originalname}`;
            const blob = bucket.file(fileName);
            const blobStream = blob.createWriteStream();

            blobStream.on('finish', async () => {
                // Generate a signed URL
                const [signedUrl] = await blob.getSignedUrl({
                    action: 'read',
                    expires: '03-01-2500', // Adjust expiration date as needed
                });

                // The signed URL with access ID, expiration, and signature
                photoUrl = signedUrl;

                // Save employee data to Firestore with the signed URL
                await db.collection('employees').add({
                    name,
                    surname,
                    age,
                    idNumber,
                    role,
                    photoUrl
                });

                // Respond with the employee data including photo URL
                res.status(201).send({
                    message: 'Employee added successfully',
                    employee: {
                        name,
                        surname,
                        age,
                        idNumber,
                        role,
                        photoUrl
                    }
                });
            });

            blobStream.on('error', (err) => {
                console.error('File upload error:', err);
                res.status(500).send({ error: 'Failed to upload photo', details: err.message });
            });

            blobStream.end(req.file.buffer); // Upload the file buffer
        } else {
            // If no photo is uploaded, save employee data without the photo
            await db.collection('employees').add({
                name,
                surname,
                age,
                idNumber,
                role
            });

            res.status(201).send({
                message: 'Employee added successfully without photo',
                employee: {
                    name,
                    surname,
                    age,
                    idNumber,
                    role
                }
            });
        }
    } catch (error) {
        res.status(500).send({ error: 'Failed to add employee', details: error.message });
    }
};

// UPDATE employee details
const updateEmployee = async (req, res) => {
    const { id } = req.params; // Get employee ID from request parameters
    const { name, surname, age, idNumber, role } = req.body;
    const photo = req.file; // Check if a new photo is uploaded

    try {
        await ensureEmployeesCollectionExists(); // Ensure collection exists
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
            const filePath = `employees/${id}/${photo.originalname}`;
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
        await ensureEmployeesCollectionExists(); // Ensure collection exists
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

const getAllEmployeesCount = async (req, res) => {
    console.log("GET /employees/count endpoint was hit");

    try {
        const employeesSnapshot = await db.collection('employees').get();
        const employeeCount = employeesSnapshot.size; // Get the count of documents

        console.log("Number of employees found:", employeeCount); // Log the count

        // Respond with the count of employees
        res.status(200).json({ count: employeeCount });
    } catch (error) {
        console.error("Error fetching employees count:", error); // Log the error
        res.status(500).json({ message: 'Error fetching employees count', details: error.message });
    }
};




module.exports = { postEmployee, updateEmployee, deleteEmployee, getAllEmployeesCount };
