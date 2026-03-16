import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper} from '@mui/material';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

import './AddStudent.css';

function Students() {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
  id: '', // keep as string
  firstName: '',
  middleName: '',
  lastName: '',
  course: '',
  year: '',
});
  const [message, setMessage] = useState('');
  const [editId, setEditId] = useState(null);

  const resetForm = () => {
  setFormData({
    id: '',
    firstName: '',
    middleName: '',
    lastName: '',
    course: '',
    year: '',
  });
  setEditId(null);
  setMessage('');
};

  // Fetch existing students on component mount
  useEffect(() => {
    axios.get('http://localhost:5555/students')
      .then((response) => {
        setStudents(response.data);
      })
      .catch((error) => {
        console.error('Error fetching students:', error);
      });
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleEdit = (student) => {
    setEditId(student.id);
    setFormData({
      id: student.id || '',
      firstName: student.firstName,
      middleName: student.middleName,
      lastName: student.lastName,
      course: student.course,
      year: student.year,
    });
  };

  const handleDelete = (studentId) => {
  axios.delete(`http://localhost:5555/students/${studentId}`)
    .then(() => {
      setMessage('Student deleted successfully!');
      // Refresh the student list
      return axios.get('http://localhost:5555/students');
    })
    .then((response) => {
      setStudents(response.data);
    })
    .catch((error) => {
      console.error('Delete error:', error);
      setMessage('Error deleting student: ' + (error.response?.data || error.message));
    });
};

  const handleAddStudent = (e) => {
  e.preventDefault();

  // Safely handle id: ensure it's a string before trim, then convert to number if not empty
  const idStr = formData.id.toString();
  const idTrimmed = idStr.trim();

  const studentData = {
    ...formData,
    id: idTrimmed === '' ? null : Number(idTrimmed),
  };

  console.log('Submitting student data:', studentData);

  if (editId) {
    // Edit mode
    axios.put(`http://localhost:5555/students/${editId}`, studentData)
      .then(() => {
        setMessage('Student updated successfully!');
        return axios.get('http://localhost:5555/students');
      })
      .then((response) => {
        setStudents(response.data);
        resetForm();
      })
      .catch((error) => {
        console.error('Update error:', error);
        setMessage('Error updating student: ' + (error.response?.data || error.message));
      });
  } else {
    // Add mode
    axios.post('http://localhost:5555/students', studentData)
      .then(() => {
        setMessage('Student added successfully!');
        return axios.get('http://localhost:5555/students');
      })
      .then((response) => {
        setStudents(response.data);
        resetForm();
      })
      .catch((error) => {
        console.error('Add error:', error);
        setMessage('Error adding student: ' + (error.response?.data || error.message));
      });
  }
};

  return (
    <div>
      <div style={{ display: 'flex', gap: '20px', flexDirection: 'column' }}>
        {/* Form Section */}
        <div style={{ flex: 1 }}>
          <h3>{editId ? 'Edit Student' : 'Add Students'}</h3>
          <form onSubmit={handleAddStudent}>
            <TextField
              label="Student ID"
              name="id"
              type="number"
              value={formData.id}
              onChange={handleChange}
              fullWidth
              inputProps={{ min: 0 }}
              onKeyDown={(e) => {
                if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              disabled={editId !== null}
            />
            <br /><br />
            <TextField
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              fullWidth
              required
            />
            <br /><br />
            <TextField
              label="Middle Name"
              name="middleName"
              value={formData.middleName}
              onChange={handleChange}
              fullWidth
            />
            <br /><br />
            <TextField
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              fullWidth
              required
            />
            <br /><br />
            <TextField
              label="Course"
              name="course"
              value={formData.course}
              onChange={handleChange}
              fullWidth
              required
            />
            <br /><br />
            <TextField
              label="Year"
              name="year"
              value={formData.year}
              onChange={handleChange}
              fullWidth
              required
            />
            <br /><br />
            <Button variant="contained" margin="dense" type="submit">
              {editId ? 'Update Student' : 'Add Student'}
            </Button>
          </form>
          {message && <p>{message}</p>}
        </div>

        {/* Student List Table */}
        <div style={{ marginTop: '40px' }}>
          <h3>Student List</h3>
          {students.length === 0 ? (
            <p>No students available.</p>
          ) : (
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="student table">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>First Name</TableCell>
                    <TableCell>Middle Name</TableCell>
                    <TableCell>Last Name</TableCell>
                    <TableCell>Course</TableCell>
                    <TableCell>Year</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>{student.id ?? 'N/A'}</TableCell>
                      <TableCell>{student.firstName}</TableCell>
                      <TableCell>{student.middleName}</TableCell>
                      <TableCell>{student.lastName}</TableCell>
                      <TableCell>{student.course}</TableCell>
                      <TableCell>{student.year}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEdit(student)} color="primary">
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(student.id)} color="secondary">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </div>
      </div>
    </div>
  );
}

export default Students;