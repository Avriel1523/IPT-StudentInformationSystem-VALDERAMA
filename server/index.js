import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
 
const app = express();
const port = 5555;
app.use(cors());
app.use(express.json());
 
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
 
app.post('/addUser', (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).send('Name and email are required.');
  }

  const filePath = path.join(__dirname, 'users.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    let users = [];
    if (!err && data) {
      try {
        users = JSON.parse(data);
      } catch {
        return res.status(500).send('Error parsing user data.');
      }
    }

    // assign a unique id to the new user
    const newUser = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      name,
      email,
    };
    users.push(newUser);

    fs.writeFile(filePath, JSON.stringify(users, null, 2), (err) => {
      if (err) {
        return res.status(500).send('Error saving user data.');
      }
      res.send('User added successfully!');
    });
  });
});

// helper to read users file and ensure every record has an id
function readUsers(callback) {
  const filePath = path.join(__dirname, 'users.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return callback(err);
    }
    let users;
    try {
      users = data ? JSON.parse(data) : [];
    } catch {
      return callback(new Error('Error parsing data'));
    }

    let modified = false;
    users.forEach(u => {
      if (!u.id) {
        u.id = Date.now().toString(36) + Math.random().toString(36).slice(2);
        modified = true;
      }
    });

    if (modified) {
      fs.writeFile(filePath, JSON.stringify(users, null, 2), writeErr => {
        if (writeErr) console.error('Failed to add ids to users.json', writeErr);
        callback(null, users);
      });
    } else {
      callback(null, users);
    }
  });
}

app.get('/users', (req, res) => {
  readUsers((err, users) => {
    if (err) {
      return res.status(500).send('Error reading users data.');
    }
    res.json(users);
  });
});
 
// **PUT route for updating a user by id or email**
app.put('/edit-user/:identifier', (req, res) => {
  const identifier = req.params.identifier;
  const { name, newEmail } = req.body;
  const filePath = path.join(__dirname, 'users.json');

  // readUsers ensures ids exist and returns the user array
  readUsers((err, users) => {
    if (err) {
      return res.status(500).send('Error reading users data.');
    }

    const idx = users.findIndex(u => u.id === identifier || u.email === identifier);
    if (idx === -1) {
      return res.status(404).send('User not found.');
    }

    // assign id if it was missing
    if (!users[idx].id) {
      users[idx].id = Date.now().toString(36) + Math.random().toString(36).slice(2);
    }

    if (name) users[idx].name = name;
    if (newEmail) {
      users[idx].email = newEmail;
    }

    fs.writeFile(filePath, JSON.stringify(users, null, 2), (writeErr) => {
      if (writeErr) {
        return res.status(500).send('Error saving user data.');
      }
      res.send('User updated successfully!');
    });
  });
});

// Delete student route
app.delete('/students/:id', (req, res) => {
  const { id } = req.params;

  fs.readFile(studentsFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading students data.');
    }
    let students;
    try {
      students = JSON.parse(data);
    } catch {
      return res.status(500).send('Error parsing students data.');
    }

    const newStudents = students.filter(student => student.id != id);
    if (students.length === newStudents.length) {
      return res.status(404).send('Student not found.');
    }

    fs.writeFile(studentsFilePath, JSON.stringify(newStudents, null, 2), (err) => {
      if (err) {
        return res.status(500).send('Error deleting student.');
      }
      res.json({ message: 'Student deleted successfully!' });
    });
  });
});
 
// Add student route
const studentsFilePath = path.join(__dirname, 'students.json');
 
app.post('/students', (req, res) => {
  const student = req.body;
 
  // Validate input
  if (
    !student.firstName ||
    !student.lastName ||
    !student.course ||
    !student.year
  ) {
    return res.status(400).send('All student fields are required.');
  }

  // Generate id if not provided
  if (!student.id) {
    student.id = Date.now().toString(36) + Math.random().toString(36).slice(2);
  }
 
  fs.readFile(studentsFilePath, 'utf8', (err, data) => {
    let students = [];
    if (!err && data) {
      try {
        students = JSON.parse(data);
      } catch {
        console.error('Error parsing students.json');
        return res.status(500).send('Error parsing students data.');
      }
    }
 
    students.push(student);
 
    fs.writeFile(studentsFilePath, JSON.stringify(students, null, 2), (err) => {
      if (err) {
        console.error('Error writing students.json:', err);
        return res.status(500).send('Error saving students data.');
      }
      res.status(201).json({ message: 'Student added successfully!' });
    });
  });
});
 
app.get('/students', (req, res) => {
  fs.readFile(studentsFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading students.json:', err);
      return res.status(500).send('Error reading students data.');
    }
    const students = JSON.parse(data);
    res.json(students);
  });
});

app.put('/students/:id', (req, res) => {
  const { id } = req.params;
  const updatedStudent = req.body;

  // Validation
  if (
    !updatedStudent.firstName ||
    !updatedStudent.lastName ||
    !updatedStudent.course ||
    !updatedStudent.year
  ) {
    return res.status(400).send('All student fields are required.');
  }

  // Read students data
  fs.readFile(studentsFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading students data.');
    }
    let students;
    try {
      students = JSON.parse(data);
    } catch {
      return res.status(500).send('Error parsing students data.');
    }

    const studentIndex = students.findIndex(student => student.id == id);
    if (studentIndex === -1) {
      return res.status(404).send('Student not found.');
    }

    // Update student data, preserve id
    students[studentIndex] = { ...students[studentIndex], ...updatedStudent, id: students[studentIndex].id };

    fs.writeFile(studentsFilePath, JSON.stringify(students, null, 2), (err) => {
      if (err) {
        return res.status(500).send('Error saving students data.');
      }
      res.json({ message: 'Student updated successfully!' });
    });
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});