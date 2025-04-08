'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button, TextField, Table, TableHead, TableBody, TableCell, TableContainer, TableRow, Paper, Pagination, Dialog, DialogTitle, DialogContent, DialogActions, Alert, IconButton, MenuItem, Select, InputLabel, FormControl, Checkbox, ListItemText, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [newUser, setNewUser] = useState({ id: null, name: '', email: '', phone_number: '', password: '', role: '', clinic_ids: [] });
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [confirmationPopup, setConfirmationPopup] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState({
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
    length: false
  });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchClinics();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:4353/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error('Error fetching users:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch('http://localhost:4353/api/users/roles');
      if (response.ok) {
        const data = await response.json();
        setRoles(data);
      } else {
        console.error('Error fetching roles:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchClinics = async () => {
    try {
      const response = await fetch('http://localhost:4353/api/clinics');
      if (response.ok) {
        const data = await response.json();
        setClinics(data);
      } else {
        console.error('Error fetching clinics:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching clinics:', error);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!Object.values(passwordStrength).every(Boolean)) {
      setPopupMessage('Please ensure the password meets all requirements.');
      setShowPopup(true);
      return;
    }
    const url = editMode ? `http://localhost:4353/api/users/${newUser.id}` : 'http://localhost:4353/api/users';
    const method = editMode ? 'PUT' : 'POST';
    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        fetchUsers();
        setShowForm(false);
        setEditMode(false);
        setPopupMessage(editMode ? 'User updated successfully' : 'User added successfully');
        setShowPopup(true);
      } else {
        console.error('Error adding/updating user:', response.statusText);
      }
    } catch (error) {
      console.error('Error adding/updating user:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };

  const checkPasswordStrength = (password) => {
    setPasswordStrength({
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      specialChar: /[!@#^&*]/.test(password),
      length: password.length >= 8 && password.length <= 12
    });
  };

  const handleClinicChange = (event) => {
    const {
      target: { value },
    } = event;
    setNewUser({ ...newUser, clinic_ids: typeof value === 'string' ? value.split(',') : value });
  };

  const handleEditUser = (user) => {
    const clinicIds = user.clinic_names.split(', ').map(name => {
      const clinic = clinics.find(c => c.name === name);
      return clinic ? clinic.id : null;
    }).filter(id => id !== null);

    setNewUser({ ...user, clinic_ids: clinicIds });
    setShowForm(true);
    setEditMode(true);
  };

  const handleDeleteUser = async () => {
    try {
      const response = await fetch(`http://localhost:4353/api/users/${userToDelete}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchUsers();
        setPopupMessage('User deleted successfully');
        setShowPopup(true);
        setConfirmationPopup(false);
      } else {
        console.error('Error deleting user:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const filteredUsers = users.filter(
    (user) =>
      (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.phone_number && user.phone_number.includes(searchTerm))
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePhoneNumber = (phone) => {
    const re = /^\d{10}$/;
    return re.test(String(phone));
  };

  return (
    <div className="w-full h-full">
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="pb-30">Users</CardTitle>
          <div className="flex items-center gap-2 justify-end">
            <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => { setShowForm(true); setEditMode(false); setNewUser({ id: null, name: '', email: '', phone_number: '', password: '', role: '', clinic_ids: [] }); }}>Add New User</Button>
            <TextField
              type="search"
              placeholder="Search users..."
              value={searchTerm}
              onChange={handleSearch}
              variant="outlined"
              size="small"
              className="max-w-xs"
            />
          </div>
        </CardHeader>
        <CardContent className="flex-1">
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone Number</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Clinics</TableCell>
                  <TableCell className="text-right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentItems.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone_number}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.clinic_names}</TableCell>
                    <TableCell className="text-right">
                      <IconButton size="small" onClick={() => handleEditUser(user)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => { setUserToDelete(user.id); setConfirmationPopup(true); }}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
        <CardFooter>
          <Pagination count={totalPages} page={currentPage} onChange={(e, page) => handlePageChange(page)} color="primary" />
        </CardFooter>
      </Card>
      <Dialog open={showForm} onClose={() => setShowForm(false)}>
        <DialogTitle>{editMode ? 'Edit User' : 'Add New User'}</DialogTitle>
        <DialogContent>
          <form onSubmit={handleAddUser}>
            <TextField
              type="text"
              name="name"
              label="Name"
              value={newUser.name}
              onChange={handleInputChange}
              required
              fullWidth
              margin="normal"
            />
            <TextField
              type="email"
              name="email"
              label="Email"
              value={newUser.email}
              onChange={handleInputChange}
              required
              fullWidth
              margin="normal"
              error={newUser.email && !validateEmail(newUser.email)}
              helperText={newUser.email && !validateEmail(newUser.email) ? 'Invalid email address' : ''}
            />
            <TextField
              type="text"
              name="phone_number"
              label="Phone Number"
              value={newUser.phone_number}
              onChange={handleInputChange}
              required
              fullWidth
              margin="normal"
              error={newUser.phone_number && !validatePhoneNumber(newUser.phone_number)}
              helperText={newUser.phone_number && !validatePhoneNumber(newUser.phone_number) ? 'Phone number must be 10 digits' : ''}
            />
            <TextField
              type="password"
              name="password"
              label="Password"
              value={newUser.password}
              onChange={handleInputChange}
              required
              fullWidth
              margin="normal"
              error={newUser.password && !Object.values(passwordStrength).every(Boolean)}
              helperText={
                <div>
                  <Typography color={passwordStrength.uppercase ? 'green' : 'error'}>
                    Uppercase letter
                  </Typography>
                  <Typography color={passwordStrength.lowercase ? 'green' : 'error'}>
                    Lowercase letter
                  </Typography>
                  <Typography color={passwordStrength.number ? 'green' : 'error'}>
                    Number
                  </Typography>
                  <Typography color={passwordStrength.specialChar ? 'green' : 'error'}>
                    Special character (!@#^&*)
                  </Typography>
                  <Typography color={passwordStrength.length ? 'green' : 'error'}>
                    8-12 characters
                  </Typography>
                </div>
              }
            />
            <FormControl fullWidth margin="normal">
              <InputLabel id="role-label">Role</InputLabel>
              <Select
                labelId="role-label"
                name="role"
                value={newUser.role}
                onChange={handleInputChange}
                required
              >
                {roles.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel id="clinic-label">Clinics</InputLabel>
              <Select
                labelId="clinic-label"
                name="clinic_ids"
                multiple
                value={newUser.clinic_ids}
                onChange={handleClinicChange}
                renderValue={(selected) => selected.join(', ')}
                required
              >
                {clinics.map((clinic) => (
                  <MenuItem key={clinic.id} value={clinic.id}>
                    <Checkbox checked={newUser.clinic_ids.indexOf(clinic.id) > -1} />
                    <ListItemText primary={clinic.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <DialogActions>
              <Button onClick={() => setShowForm(false)} color="secondary">Cancel</Button>
              <Button type="submit" color="primary">Submit</Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={showPopup} onClose={() => setShowPopup(false)}>
        <DialogContent>
          <Alert onClose={() => setShowPopup(false)} severity="success">
            {popupMessage}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPopup(false)} color="primary">OK</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={confirmationPopup} onClose={() => setConfirmationPopup(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Alert severity="warning">Are you sure you want to delete this user?</Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmationPopup(false)} color="secondary">Cancel</Button>
          <Button onClick={handleDeleteUser} color="primary">Yes</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}