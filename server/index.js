import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import connectDB from './config/database.js';
import Student from './models/Student.js';
import User from './models/User.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Connect to MongoDB
connectDB();

const app = express();
const port = 5555;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    fieldSize: 1024 * 1024, // 1MB limit for form fields
    fields: 10, // Maximum number of non-file fields
    fieldNameSize: 100 // Maximum field name size
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

 
app.get('/user/:name', (req, res) => {
  const name = req.params.name;
  res.send(`Welcome, ${name}!`);
});
 
app.get('/calculate/:num1/:num2', (req, res) => {
  const num1 = parseInt(req.params.num1);
  const num2 = parseInt(req.params.num2);
 
  if (isNaN(num1) || isNaN(num2)) {
    return res.status(400).send('Please provide valid numbers.');
  }
 
  const sum = num1 + num2;
  res.send(`The sum of ${num1} and ${num2} is ${sum}`);
});
 
app.get('/search', (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.send('Please provide a search query using ?q=your_query');
  }
  res.send(`You searched for: ${query}`);
});
 
// User routes with MongoDB
app.post('/add-user-db', upload.single('image'), async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input first
    if (!name || !email || !password) {
      return res.status(400).send('Name, email, and password are required.');
    }

    if (password.length < 6) {
      return res.status(400).send('Password must be at least 6 characters long.');
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send('Email already exists.');
    }

    // Create new user with image and password
    const userData = {
      name,
      email,
      password, // Will be hashed by pre-save hook
      image: req.file ? `/uploads/${req.file.filename}` : ''
    };

    const newUser = new User(userData);
    await newUser.save();
    
    // Don't send password back to client
    const { password: _, ...userWithoutPassword } = newUser.toObject();
    
    res.status(201).json({ message: 'User added successfully!', user: userWithoutPassword });
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).send('Error saving user data.');
  }
});

app.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('Error reading users data.');
  }
});

// Login route
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required.' 
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found.' 
      });
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid password.' 
      });
    }

    // Generate a simple token (in production, use JWT)
    const token = Buffer.from(`${user.email}:${Date.now()}`).toString('base64');

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user.toObject();

    res.json({
      success: true,
      message: 'Login successful!',
      user: userWithoutPassword,
      token: token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login.' 
    });
  }
});

// Registration route
app.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email, and password are required.' 
      });
    }

    // Validate name format
    if (!/^[a-zA-Z\s]+$/.test(name)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name must contain only alphabets and spaces.' 
      });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please enter a valid email address.' 
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters long.' 
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already exists.' 
      });
    }

    // Create new user
    const newUser = new User({
      name,
      email,
      password
    });

    await newUser.save();

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser.toObject();

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration.' 
    });
  }
});

app.put('/edit-user/:identifier', upload.single('image'), async (req, res) => {
  try {
    const identifier = req.params.identifier;
    const { name, newEmail, password } = req.body;

    // Find user by email or generate ObjectId from string id
    let user;
    if (identifier.includes('@')) {
      user = await User.findOne({ email: identifier });
    } else {
      user = await User.findById(identifier);
    }

    if (!user) {
      return res.status(404).send('User not found.');
    }

    if (name) user.name = name;
    if (newEmail) {
      // Check if new email already exists
      const existingUser = await User.findOne({ email: newEmail, _id: { $ne: user._id } });
      if (existingUser) {
        return res.status(400).send('Email already exists.');
      }
      user.email = newEmail;
    }

    // Update password if provided
    if (password && password.length >= 6) {
      user.password = password; // Will be hashed by pre-save hook
    }

    // Update image if new one is uploaded
    if (req.file) {
      user.image = `/uploads/${req.file.filename}`;
    }

    await user.save();
    
    // Don't send password back to client
    const { password: _, ...userWithoutPassword } = user.toObject();
    
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).send('Error saving user data.');
  }
});

// Alternative edit route for emails using query parameter
app.put('/edit-user', upload.single('image'), async (req, res) => {
  try {
    const email = req.query.email;
    const { name, newEmail, password } = req.body;

    if (!email) {
      return res.status(400).send('Email parameter is required.');
    }

    let user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send('User not found.');
    }

    if (name) user.name = name;
    if (newEmail) {
      // Check if new email already exists
      const existingUser = await User.findOne({ email: newEmail, _id: { $ne: user._id } });
      if (existingUser) {
        return res.status(400).send('Email already exists.');
      }
      user.email = newEmail;
    }

    // Update password if provided
    if (password && password.length >= 6) {
      user.password = password; // Will be hashed by pre-save hook
    }

    // Update image if new one is uploaded
    if (req.file) {
      user.image = `/uploads/${req.file.filename}`;
    }

    await user.save();
    
    // Don't send password back to client
    const { password: _, ...userWithoutPassword } = user.toObject();
    
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).send('Error saving user data.');
  }
});

app.delete('/users/:identifier', async (req, res) => {
  try {
    const identifier = req.params.identifier;
    console.log('Delete request for identifier:', identifier);
    console.log('Identifier type:', typeof identifier);
    
    // Find user by email or generate ObjectId from string id
    let user;
    if (identifier.includes('@')) {
      user = await User.findOneAndDelete({ email: identifier });
      console.log('Deleted by email, result:', user);
    } else {
      user = await User.findByIdAndDelete(identifier);
      console.log('Deleted by ID, result:', user);
    }
    
    if (!user) {
      console.log('User not found for identifier:', identifier);
      return res.status(404).send('User not found.');
    }
    
    res.json({ message: 'User deleted successfully!' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).send('Error deleting user.');
  }
});

// Simple delete route using MongoDB _id only
app.delete('/users/delete/:id', async (req, res) => {
  try {
    const id = req.params.id;
    console.log('Simple delete request for ID:', id);
    
    const user = await User.findByIdAndDelete(id);
    console.log('Delete result:', user);
    
    if (!user) {
      console.log('User not found for ID:', id);
      return res.status(404).send('User not found.');
    }
    
    res.json({ message: 'User deleted successfully!' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).send('Error deleting user.');
  }
});

// Alternative delete route for emails using query parameter
app.delete('/users/by-email', async (req, res) => {
  try {
    const email = req.query.email;
    console.log('Delete request for email:', email);
    
    if (!email) {
      return res.status(400).send('Email parameter is required.');
    }
    
    const user = await User.findOneAndDelete({ email });
    
    if (!user) {
      return res.status(404).send('User not found.');
    }
    
    res.json({ message: 'User deleted successfully!' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).send('Error deleting user.');
  }
});

// Student routes with MongoDB
app.delete('/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = parseInt(id);
    
    const result = await Student.findOneAndDelete({ id: studentId });
    
    if (!result) {
      return res.status(404).send('Student not found.');
    }
    
    res.json({ message: 'Student deleted successfully!' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).send('Error deleting student.');
  }
});

app.post('/students', upload.single('image'), async (req, res) => {
  try {
    console.log('POST /students - req.body:', req.body);
    console.log('POST /students - req.file:', req.file);
    
    // Handle both JSON and FormData cases
    let studentData;
    
    if (req.body && typeof req.body === 'object' && req.body.firstName !== undefined) {
      // FormData case - extract from req.body
      studentData = {
        id: req.body.id ? parseInt(req.body.id) : Date.now(),
        firstName: req.body.firstName,
        middleName: req.body.middleName || '',
        lastName: req.body.lastName,
        course: req.body.course,
        year: req.body.year,
        image: req.file ? `/uploads/${req.file.filename}` : (req.body.existingImage || '')
      };
    } else if (req.body && typeof req.body === 'object') {
      // JSON case
      studentData = {
        ...req.body,
        image: req.file ? `/uploads/${req.file.filename}` : (req.body.image || '')
      };
    } else {
      return res.status(400).send('Invalid request data format');
    }
 
    // Validate input
    if (
      !studentData.firstName ||
      !studentData.lastName ||
      !studentData.course ||
      !studentData.year
    ) {
      return res.status(400).send('All student fields are required.');
    }

    // Check for duplicate ID
    const existingStudent = await Student.findOne({ id: studentData.id });
    if (existingStudent) {
      return res.status(400).send('Student ID already exists.');
    }

    // Create new student
    const newStudent = new Student(studentData);
    await newStudent.save();
    
    res.status(201).json({ message: 'Student added successfully!', student: newStudent });
  } catch (error) {
    console.error('Error adding student:', error);
    res.status(500).send('Error saving students data.');
  }
});

app.get('/students', async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).send('Error reading students data.');
  }
});

app.put('/students/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = parseInt(id);

    // Handle both JSON and FormData
    let updatedData;

    // Check if this is FormData (multer processes it differently)
    if (req.file || (req.body && typeof req.body === 'object' && req.body.constructor === Object)) {
      // FormData case - extract from req.body
      updatedData = {
        firstName: req.body.firstName,
        middleName: req.body.middleName || '',
        lastName: req.body.lastName,
        course: req.body.course,
        year: req.body.year,
        image: req.file ? `/uploads/${req.file.filename}` : req.body.existingImage
      };
    } else {
      // JSON case or direct object
      updatedData = req.body;
      if (req.file) {
        updatedData.image = `/uploads/${req.file.filename}`;
      }
    }

    // Validation
    if (
      !updatedData.firstName ||
      !updatedData.lastName ||
      !updatedData.course ||
      !updatedData.year
    ) {
      return res.status(400).send('All student fields are required.');
    }

    // Find and update student
    const student = await Student.findOneAndUpdate(
      { id: studentId },
      updatedData,
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).send('Student not found.');
    }

    res.json({ message: 'Student updated successfully!', student });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).send('Error saving students data.');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});