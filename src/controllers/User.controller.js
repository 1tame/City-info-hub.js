// Function to create a new user
exports.createUser = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const connection = await db;

        // Check if the username already exists
        const [existingUser] = await connection.execute(
            'SELECT * FROM Users WHERE username = ?',
            [username]
        );

        if (existingUser.length > 0) {
            return res.status(409).json({ message: 'Username already exists.' });
        }

        // Check if the email already exists
        const [existingEmail] = await connection.execute(
            'SELECT * FROM Users WHERE email = ?',
            [email]
        );

        if (existingEmail.length > 0) {
            return res.status(409).json({ message: 'Email already exists.' });
        }

        // Hash the password before saving it to the database
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const [result] = await connection.execute(
            'INSERT INTO Users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );

        res.status(201).json({ message: 'User created successfully.', userId: result.insertId });
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ message: 'Error creating user.', error: err.message });
    }
};

// Function to find a user by username
exports.findUserByUsername = async (username) => {
    try {
        const connection = await db;
        const [rows] = await connection.execute(
            'SELECT * FROM Users WHERE username = ?',
            [username]
        );
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error('Error finding user by username:', error);
        throw error;
    }
};


// Login a user
exports.loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await exports.findUserByUsername(username);

        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        // Store the user ID in the session (using Express.js)
        req.session.userId = user.id; 

        res.status(200).json({ message: 'Authentication successful.' }); 
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Error logging in user.' });
    }
};


// Check if the user is logged in 
exports.isLoggedIn = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Authentication required.' });
    }
    next(); 
};


// Like a post
exports.likePost = async (req, res) => {
    const { postId } = req.params;
    const userId = req.session.userId; // Get userId from session

    try {
        const connection = await db;

        // Insert reaction into Reactions table
        const [result] = await connection.execute(
            'INSERT INTO Reactions (postId, userId, type) VALUES (?, ?, ?)',
            [postId, userId, 'like']
        );

        // Update likes count in Posts table
        const [updatedPost] = await connection.execute(
            'UPDATE Posts SET likes = likes + 1 WHERE id = ?',
            [postId]
        );

        res.status(200).json({ message: 'Post liked successfully.' });
    } catch (error) {
        console.error('Error liking post:', error);
        res.status(500).json({ message: 'Error liking post.' });
    }
};

// Dislike a post
exports.dislikePost = async (req, res) => {
    const { postId } = req.params;
    const userId = req.session.userId; // Get userId from session

    try {
        const connection = await db;

        // Insert reaction into Reactions table
        const [result] = await connection.execute(
            'INSERT INTO Reactions (postId, userId, type) VALUES (?, ?, ?)',
            [postId, userId, 'dislike']
        );

        // Update dislikes count in Posts table
        const [updatedPost] = await connection.execute(
            'UPDATE Posts SET dislikes = dislikes + 1 WHERE id = ?',
            [postId]
        );

        res.status(200).json({ message: 'Post disliked successfully.' });
    } catch (error) {
        console.error('Error disliking post:', error);
        res.status(500).json({ message: 'Error disliking post.' });
    }
};