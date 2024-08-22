const db = require('../config/db.config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'your-secret-key'; // Replace with your secret key


exports.authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};
// Function to log in an admin
// Function to log in an admin
exports.loginAdmin = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        const connection = await db;

        // Check if the username exists
        const [existingAdmin] = await connection.execute(
            'SELECT * FROM admins WHERE username = ?',
            [username]
        );

        if (existingAdmin.length === 0) {
            return res.status(401).json({ message: 'Invalid username.' });
        }

        const admin = existingAdmin[0];

        // Compare the provided password with the stored hashed password
        const isPasswordValid = await bcrypt.compare(password, admin.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        // Generate a JWT token
        const token = jwt.sign({ id: admin.id, role: admin.role }, SECRET_KEY, { expiresIn: '1h' });

        res.status(200).json({ message: 'Login successful.', token });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ message: 'Error during login.', error: err.message });
    }
};