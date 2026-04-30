// try gitcomment
import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, FormControl, InputLabel, Box, Typography, Button as MuiButton} from '@mui/material';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

import './AddStudent.css';

function AddStudent() {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
  id: '', // keep as string
  firstName: '',
  middleName: '',
  lastName: '',
  course: '',
  year: '',
  image: null,
  imagePreview: '',
});
  const [message, setMessage] = useState('');
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case "id":
        if (value && !/^\d+$/.test(value)) {
          newErrors.id = "Student ID must contain only numbers";
        } else {
          delete newErrors.id;
        }
        break;
        
      case "firstName":
      case "lastName":
      case "middleName":
        if (value && !/^[a-zA-Z\s]+$/.test(value)) {
          newErrors[name] = "Name must contain only alphabets";
        } else {
          delete newErrors[name];
        }
        break;
        
      case "course":
        if (value && !["BSIT", "BSCS", "BSLM"].includes(value)) {
          newErrors.course = "Course must be BSIT, BSCS, or BSLM";
        } else {
          delete newErrors.course;
        }
        break;
        
      case "year":
        if (value && !/^[1-4]$/.test(value)) {
          newErrors.year = "Year must be 1, 2, 3, or 4";
        } else {
          delete newErrors.year;
        }
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
  setFormData({
    id: '',
    firstName: '',
    middleName: '',
    lastName: '',
    course: '',
    year: '',
    image: null,
    imagePreview: '',
  });
  setEditId(null);
  setMessage('');
  setErrors({});
};

  // Fetch existing students on component mount
  useEffect(() => {
    setFetchLoading(true);
    axios.get('http://localhost:5555/students')
      .then((response) => {
        setStudents(response.data);
      })
      .catch((error) => {
        console.error('Error fetching students:', error);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Apply input restrictions
    let processedValue = value;
    
    switch (name) {
      case "id":
        // Only allow numbers
        processedValue = value.replace(/\D/g, '');
        break;
      case "firstName":
      case "lastName":
      case "middleName":
        // Only allow alphabets and spaces
        processedValue = value.replace(/[^a-zA-Z\s]/g, '');
        break;
      case "course":
      case "year":
        // Dropdown values don't need processing
        processedValue = value;
        break;
      default:
        break;
    }
    
    setFormData({
      ...formData,
      [name]: processedValue,
    });
    
    // Validate the field
    validateField(name, processedValue);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage('Image size must be less than 5MB');
        return;
      }
      
      // Check file type
      if (!file.type.match('image.*')) {
        setMessage('Please select an image file');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          image: file,
          imagePreview: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData({
      ...formData,
      image: null,
      imagePreview: ''
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
      image: null,
      imagePreview: student.image || ''
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

  // Check for duplicates
  const idNum = idTrimmed === '' ? null : Number(idTrimmed);
  const duplicateId = students.find(student => student.id === idNum);
  const duplicateName = students.find(student => 
    student.firstName.toLowerCase() === formData.firstName.toLowerCase() && 
    student.lastName.toLowerCase() === formData.lastName.toLowerCase()
  );

  if (duplicateId && !editId) {
    setMessage('Error: Student ID already exists!');
    return;
  }

  if (duplicateName && duplicateName.id !== editId) {
    setMessage('Error: Student with this name already exists!');
    return;
  }

  const studentData = new FormData();
    studentData.append('id', idNum);
    studentData.append('firstName', formData.firstName);
    studentData.append('middleName', formData.middleName);
    studentData.append('lastName', formData.lastName);
    studentData.append('course', formData.course);
    studentData.append('year', formData.year);
    studentData.append('existingImage', formData.imagePreview || '');
    
    if (formData.image) {
      studentData.append('image', formData.image);
    }

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
              type="text"
              value={formData.id}
              onChange={handleChange}
              fullWidth
              disabled={editId !== null}
              error={!!errors.id}
            />
            <br /><br />
            <TextField
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.firstName}
            />
            <br /><br />
            <TextField
              label="Middle Name"
              name="middleName"
              value={formData.middleName}
              onChange={handleChange}
              fullWidth
              error={!!errors.middleName}
            />
            <br /><br />
            <TextField
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.lastName}
            />
            <br /><br />
            <FormControl fullWidth required error={!!errors.course}>
              <InputLabel id="course-label">Course</InputLabel>
              <Select
                labelId="course-label"
                id="course"
                name="course"
                value={formData.course}
                onChange={handleChange}
                label="Course"
              >
                <MenuItem value="BSIT">BSIT</MenuItem>
                <MenuItem value="BSCS">BSCS</MenuItem>
                <MenuItem value="BSLM">BSLM</MenuItem>
              </Select>
              {errors.course && (
                <div style={{ color: '#d32f2f', fontSize: '0.75rem', marginTop: '4px', marginLeft: '14px' }}>
                  {errors.course}
                </div>
              )}
            </FormControl>
            <br /><br />
            <FormControl fullWidth required error={!!errors.year}>
              <InputLabel id="year-label">Year</InputLabel>
              <Select
                labelId="year-label"
                id="year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                label="Year"
              >
                <MenuItem value="1">1st Year</MenuItem>
                <MenuItem value="2">2nd Year</MenuItem>
                <MenuItem value="3">3rd Year</MenuItem>
                <MenuItem value="4">4th Year</MenuItem>
              </Select>
              {errors.year && (
                <div style={{ color: '#d32f2f', fontSize: '0.75rem', marginTop: '4px', marginLeft: '14px' }}>
                  {errors.year}
                </div>
              )}
            </FormControl>
            <br /><br />
            
            {/* Image Upload Section */}
            <Box sx={{ marginBottom: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Student Image
              </Typography>
              
              {formData.imagePreview ? (
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <img 
                    src={formData.imagePreview.startsWith('data:') ? formData.imagePreview : `http://localhost:5555${formData.imagePreview}`} 
                    alt="Student preview" 
                    style={{ 
                      width: '150px', 
                      height: '150px', 
                      objectFit: 'cover', 
                      borderRadius: '8px',
                      border: '2px solid #ddd'
                    }} 
                  />
                  <MuiButton
                    onClick={removeImage}
                    variant="contained"
                    color="error"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      minWidth: '30px',
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%'
                    }}
                  >
                    ×
                  </MuiButton>
                </Box>
              ) : (
                <Box>
                  <input
                    accept="image/*"
                    id="image-upload"
                    type="file"
                    hidden
                    onChange={handleImageChange}
                  />
                  <label htmlFor="image-upload">
                    <MuiButton
                      variant="outlined"
                      component="span"
                      sx={{ marginBottom: 1 }}
                    >
                      Choose Image
                    </MuiButton>
                  </label>
                  <Typography variant="caption" display="block" color="textSecondary">
                    JPG, PNG, GIF up to 5MB
                  </Typography>
                </Box>
              )}
            </Box>
            
            <Button 
              variant="contained" 
              margin="dense" 
              type="submit"
              disabled={Object.keys(errors).some(key => errors[key])}
            >
              {editId ? 'Update Student' : 'Add Student'}
            </Button>
          </form>
          {message && (
            <div className={`message ${message.includes('Error') ? 'error' : 'success'}`} style={{ 
              marginTop: '10px', 
              padding: '10px', 
              borderRadius: '4px',
              backgroundColor: message.includes('Error') ? '#ffebee' : '#e8f5e8',
              color: message.includes('Error') ? '#c62828' : '#2e7d32',
              border: `1px solid ${message.includes('Error') ? '#ef5350' : '#66bb6a'}`
            }}>
              {message}
            </div>
          )}
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
                    <TableCell>Image</TableCell>
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
                      <TableCell>
                        {student.image ? (
                          <img 
                            src={`http://localhost:5555${student.image}`} 
                            alt={`${student.firstName} ${student.lastName}`}
                            style={{ 
                              width: '50px', 
                              height: '50px', 
                              objectFit: 'cover', 
                              borderRadius: '50%',
                              border: '1px solid #ddd'
                            }} 
                          />
                        ) : (
                          <div style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            backgroundColor: '#f0f0f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            color: '#666'
                          }}>
                            No Image
                          </div>
                        )}
                      </TableCell>
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

export default AddStudent;
