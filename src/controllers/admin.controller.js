const db = require('../config/db.config');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');


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


// Function to update admin details, including password change
// Function to update admin details, including password change
exports.updateAdminDetails = async (req, res) => {
    const { id } = req.params; // Assuming ID is passed as part of the URL
    const { username, oldPassword, newPassword, role } = req.body;

    try {
        const connection = await db;

        // Fetch the existing admin data
        const [admin] = await connection.execute('SELECT * FROM admins WHERE id = ?', [id]);

        if (admin.length === 0) {
            return res.status(404).json({ message: 'Admin not found.' });
        }

        const existingAdmin = admin[0];

        // Only perform actions if the field is provided in the request
        if (username) {
            await connection.execute('UPDATE admins SET username = ? WHERE id = ?', [username, id]);
        }
        if (newPassword && oldPassword) {
            // Compare old password with the existing password 
            const passwordMatch = await bcrypt.compare(oldPassword, existingAdmin.password);

            if (!passwordMatch) {
                return res.status(400).json({ message: 'Old password is incorrect.' });
            }

            // Hash the new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await connection.execute('UPDATE admins SET password = ? WHERE id = ?', [hashedPassword, id]);
        }

        // **Don't update the role, it's read-only**

        res.status(200).json({ message: 'Admin details updated successfully.' });
    } catch (err) {
        console.error('Error updating admin details:', err);
        res.status(500).json({ message: 'Error updating admin details.', error: err.message });
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

 
// Password reset function
exports.resetPassword = async (req, res) => {
    const { adminId, email } = req.body;
  
    if (!adminId || !email) {
      return res.status(400).json({ message: 'Admin ID and Email are required.' });
    }
  
    try {
      const connection = await db;
  
      // Check if admin exists
      const [admin] = await connection.execute('SELECT * FROM admins WHERE id = ? ', [adminId]);
  
      if (admin.length === 0) {
        return res.status(404).json({ message: 'Admin not found.' });
      }
  
      const newGeneratedPassword = Math.random().toString(36).slice(-8); // Generate a random 8-character password
      const hashedPassword = await bcrypt.hash(newGeneratedPassword, 10); // Hash the new password
  
     
      // Send the new password via email
      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
  
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset',
        text: `Your new password is: ${newGeneratedPassword}`,
      };
  
      transporter.sendMail(mailOptions, async (error, info) => {
       // console.log('mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm',error);
        
        if (error) {
          return res.status(500).json({ message: 'Error sending email.', error });
        }
         // Update the password in the database
      await connection.execute('UPDATE admins SET password = ? WHERE id = ?', [hashedPassword, adminId]);
  
        res.status(200).json({ message: 'Password reset successful. Please check your email.' });
      });
  
    } catch (err) {
      console.error('Error resetting password:', err);
      res.status(500).json({ message: 'Error resetting password.', error: err.message });
    }
  };