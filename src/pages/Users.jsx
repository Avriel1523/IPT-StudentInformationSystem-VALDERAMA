import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Box } from '@mui/material';
import Button from '@mui/material/Button';

function Users() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [users, setUsers] = useState([]);
  const [editId, setEditId] = useState(null);  // holds id if available, falls back to email

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

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    axios.post('http://localhost:5555/addUser', { name, email })
      .then(response => {
        setMessage(response.data);
        setName('');
        setEmail('');
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
    setEditId(user.id || user.email);  // use email when id missing
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const identifier = editId || email; // fallback to email
    if (!identifier) return;
    try {
      await axios.put(`http://localhost:5555/edit-user/${encodeURIComponent(identifier)}`, {
        name: name,
        newEmail: email,
      });
      console.log('User updated successfully');
      fetchUsers();
      setName('');
      setEmail('');
      setEditId(null);
    } catch (error) {
      console.error(error);
      setMessage('Error updating user: ' + (error.response?.data || error.message));
    }
  };

  return (
    <div>
      <h2>Add User</h2>
  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    <TextField
      label="Name"
      variant="outlined"
      value={name}
      onChange={(e) => setName(e.target.value)}
      required
    />
    <TextField
      label="Email"
      type="email"
      variant="outlined"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      required
    />
    <Box sx={{ display: 'flex', gap: 2, marginTop: 2 }}>
      <Button
        variant="contained"
        color="primary"
        type="submit"
        disabled={submitting}
      >
        {submitting ? 'Adding...' : 'Add User'}
      </Button>
      {editId !== null && (
        <Button
          variant="outlined"
          color="secondary"
          type="button"
          onClick={handleUpdate}
        >
          Update User
        </Button>
      )}
    </Box>
  </form>
  {message && <p>{message}</p>}

   
  {/* Display users */}
    <div style={{ marginTop: '40px' }}>
      <h3>User List</h3>
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="user table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Edit</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id || user.email}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleEdit(user)}
                      >
                        Edit
                      </Button>
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