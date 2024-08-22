const db = require('../config/db.config');
const bcrypt = require('bcrypt');


// Function to create a new admin
exports.createAdmin = async (req, res) => {
    console.log('Request Body:', req.body);

    const { username, password, role } = req.body;

    if (!username || !password || !role) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const connection = await db;

        // Check if the username already exists
        const [existingAdmin] = await connection.execute(
            'SELECT * FROM admins WHERE username = ?',
            [username]
        );

        if (existingAdmin.length > 0) {
            return res.status(409).json({ message: 'Username already exists.' });
        }

        // Hash the password before saving it to the database
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new admin
        const [result] = await connection.execute(
            'INSERT INTO admins (username, password, role) VALUES (?, ?, ?)',
            [username, hashedPassword, role]
        );

        res.status(201).json({ message: 'Admin created successfully.', adminId: result.insertId });
    } catch (err) {
        console.error('Error creating admin:', err);
        res.status(500).json({ message: 'Error creating admin.', error: err.message });
    }
};

// Function to get all admins
exports.getAllAdmins = async (req, res) => {
    try {
        const connection = await db;

        const [admins] = await connection.execute('SELECT * FROM admins');

        res.status(200).json(admins);
    } catch (err) {
        console.error('Error fetching admins:', err);
        res.status(500).json({ message: 'Error fetching admins.', error: err.message });
    }
};

// Function to get an admin by ID
exports.getAdminById = async (req, res) => {
    const { id } = req.params;

    try {
        const connection = await db;

        const [admin] = await connection.execute('SELECT * FROM admins WHERE id = ?', [id]);

        if (admin.length === 0) {
            return res.status(404).json({ message: 'Admin not found.' });
        }

        res.status(200).json(admin[0]);
    } catch (err) {
        console.error('Error fetching admin:', err);
        res.status(500).json({ message: 'Error fetching admin.', error: err.message });
    }
};

// Function to update an admin
exports.updateAdmin = async (req, res) => {
    const { id } = req.params;
    const { username, password, role } = req.body;

    if (!username || !password || !role){
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const connection = await db;

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await connection.execute(
            'UPDATE admins SET username = ?, password = ?, role = ? WHERE id = ?',
            [username, hashedPassword, role, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Admin not found.' });
        }

        res.status(200).json({ message: 'Admin updated successfully.' });
    } catch (err) {
        console.error('Error updating admin:', err);
        res.status(500).json({ message: 'Error updating admin.', error: err.message });
    }
};

// Function to delete an admin
exports.deleteAdmin = async (req, res) => {
    const { id } = req.params;

    try {
        const connection = await db;

        const [result] = await connection.execute('DELETE FROM admins WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Admin not found.' });
        } 

        res.status(200).json({ message: 'Admin deleted successfully.' });
    } catch (err) {
        console.error('Error deleting admin:', err);
        res.status(500).json({ message: 'Error deleting admin.', error: err.message });
    }
};