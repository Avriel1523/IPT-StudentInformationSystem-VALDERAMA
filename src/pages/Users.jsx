import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Box, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Avatar from '@mui/material/Avatar';

function Users() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const [users, setUsers] = useState([]);
  const [editId, setEditId] = useState(null);  // holds id if available, falls back to email
  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case "name":
        if (!value) {
          newErrors.name = "Name is required";
        } else if (!/^[a-zA-Z\s]+$/.test(value)) {
          newErrors.name = "Name must contain only alphabets";
        } else {
          delete newErrors.name;
        }
        break;
        
      case "email":
        if (!value) {
          newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = "Please enter a valid email";
        } else {
          delete newErrors.email;
        }
        break;
        
      case "password":
        if (value && value.length < 6) {
          newErrors.password = "Password must be at least 6 characters";
        } else {
          delete newErrors.password;
        }
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetUserForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setImage(null);
    setImagePreview('');
    setEditId(null);
    setMessage('');
    setErrors({});
  };

  const fetchUsers = () => {
    return axios
      .get('http://localhost:5555/users')
      .then(response => {
        setUsers(response.data);
      })
      .catch(error => {
        console.error(error);
        setMessage('Failed to fetch users.');
      });
  };

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers().finally(() => setLoading(false));
  }, []);

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
      
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Apply input restrictions
    let processedValue = value;
    
    switch (name) {
      case "name":
        // Only allow alphabets and spaces, but don't restrict during editing
        if (!editId) {
          processedValue = value.replace(/[^a-zA-Z\s]/g, '');
        } else {
          processedValue = value; // Allow any characters during editing
        }
        break;
      case "email":
      case "password":
        // No restrictions for email and password
        processedValue = value;
        break;
      default:
        break;
    }
    
    if (name === 'name') {
      setName(processedValue);
    } else if (name === 'email') {
      setEmail(processedValue);
    } else if (name === 'password') {
      setPassword(processedValue);
    }
    
    // Validate the field
    validateField(name, processedValue);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate all fields
    if (!name || !email || (!editId && !password)) {
      setMessage('All required fields must be filled.');
      return;
    }
    
    // Check for duplicate email
    const duplicateEmail = users.find(user => user.email === email && user._id !== editId);
    if (duplicateEmail) {
      setMessage('Error: Email already exists!');
      return;
    }
    
    // Validate password length
    if (password && password.length < 6) {
      setMessage('Password must be at least 6 characters long!');
      return;
    }
    
    setSubmitting(true);
    
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    if (password) {
      formData.append('password', password);
    }
    if (image) {
      formData.append('image', image);
    }
    
    axios.post('http://localhost:5555/add-user-db', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(response => {
        setMessage(response.data.message || 'User added successfully!');
        resetUserForm();
        fetchUsers(); // Refresh list after adding
      })
      .catch(error => {
        setMessage('Error: ' + (error.response?.data || error.message));
      })
      .finally(() => setSubmitting(false));
  };

  const handleEdit = (user) => {  // store identifier (id or email)
    setName(user.name);
    setEmail(user.email);
    setEditId(user._id || user.id || user.email);  // prioritize MongoDB _id
    setImagePreview(user.image ? `http://localhost:5555${user.image}` : '');
    setPassword('');
    // Clear any existing errors when editing
    setErrors({});
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const identifier = editId || email; // fallback to email
    if (!identifier) return;
    
    // Validate all fields
    if (!name || !email) {
      setMessage('Name and email are required.');
      return;
    }
    
    // Check for duplicate email
    const duplicateEmail = users.find(user => user.email === email && user._id !== editId);
    if (duplicateEmail) {
      setMessage('Error: Email already exists!');
      return;
    }
    
    // Validate password length if provided
    if (password && password.length < 6) {
      setMessage('Password must be at least 6 characters long!');
      return;
    }
    
    const formData = new FormData();
    formData.append('name', name);
    formData.append('newEmail', email);
    if (password) {
      formData.append('password', password);
    }
    if (image) {
      formData.append('image', image);
    }
    
    try {
      let updateUrl;
      // Use query parameter for email updates
      if (identifier.includes('@')) {
        updateUrl = `http://localhost:5555/edit-user?email=${encodeURIComponent(identifier)}`;
      } else {
        updateUrl = `http://localhost:5555/edit-user/${identifier}`;
      }
      
      await axios.put(updateUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setMessage('User updated successfully!');
      resetUserForm();
      fetchUsers();
    } catch (error) {
      setMessage('Error updating user: ' + (error.response?.data || error.message));
    }
  };

  const handleDelete = async (user) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const identifier = user._id || user.email;
        const deleteUrl = `http://localhost:5555/users/delete/${identifier}`;
          
        await axios.delete(deleteUrl);
        setMessage('User deleted successfully!');
        fetchUsers();
      } catch (error) {
        console.error('Delete error:', error);
        setMessage('Error deleting user: ' + (error.response?.data || error.message));
      }
    }
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        {editId ? 'Edit User' : 'Add User'}
      </Typography>
      <form onSubmit={editId ? handleUpdate : handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Name"
          name="name"
          variant="outlined"
          value={name}
          onChange={handleInputChange}
          required
          fullWidth
          error={!!errors.name}
          helperText={errors.name}
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          variant="outlined"
          value={email}
          onChange={handleInputChange}
          required
          fullWidth
          error={!!errors.email}
          helperText={errors.email}
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          variant="outlined"
          value={password}
          onChange={handleInputChange}
          required={editId === null}
          fullWidth
          error={!!errors.password}
          helperText={editId === null ? "Minimum 6 characters" : errors.password || "Leave empty to keep current password"}
        />
        
        {/* Image Upload */}
        <Box sx={{ marginTop: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            User Image
          </Typography>
          
          {imagePreview ? (
            <Box sx={{ position: 'relative', display: 'inline-block' }}>
              <img 
                src={imagePreview.startsWith('data:') ? imagePreview : imagePreview} 
                alt="User preview" 
                style={{ 
                  width: '150px', 
                  height: '150px', 
                  objectFit: 'cover', 
                  borderRadius: '50%',
                  border: '2px solid #ddd'
                }} 
              />
              <Button
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
              </Button>
            </Box>
          ) : (
            <Box>
              <input
                accept="image/*"
                id="user-image-upload"
                type="file"
                hidden
                onChange={handleImageChange}
              />
              <label htmlFor="user-image-upload">
                <Button variant="outlined" component="span">
                  Upload Image
                </Button>
              </label>
              <Typography variant="caption" display="block" color="textSecondary">
                JPG, PNG, GIF up to 5MB
              </Typography>
            </Box>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, marginTop: 2 }}>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={submitting || Object.keys(errors).some(key => errors[key])}
                      >
            {submitting ? 'Processing...' : (editId ? 'Update User' : 'Add User')}
          </Button>
          {editId !== null && (
            <Button
              variant="outlined"
              color="secondary"
              type="button"
              onClick={resetUserForm}
            >
              Cancel
            </Button>
          )}
        </Box>
      </form>
      {message && (
        <div style={{ 
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

{/* Display users */}
    <div style={{ marginTop: '40px' }}>
      <Typography variant="h4" gutterBottom>
        User List
      </Typography>
      {loading ? (
        <Typography variant="body1">Loading users...</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="user table">
            <TableHead>
              <TableRow>
                <TableCell>Avatar</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Password</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body1">No users found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user._id || user.id || user.email}>
                    <TableCell>
                      {user.image ? (
                        <Avatar 
                          src={`http://localhost:5555${user.image}`} 
                          alt={user.name}
                          sx={{ width: 50, height: 50 }}
                        />
                      ) : (
                        <Avatar 
                          sx={{ width: 50, height: 50, bgcolor: '#667eea' }}
                        >
                          {user.name.charAt(0).toUpperCase()}
                        </Avatar>
                      )}
                    </TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>••••••</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEdit(user)} color="primary" title="Edit user">
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(user)}
                        aria-label="Delete user"
                        sx={{ 
                          '&:hover': {
                            backgroundColor: 'rgba(244, 67, 54, 0.1)'
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  </div>
  );
}

export default Users;