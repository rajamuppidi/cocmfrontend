'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import {
  Button,
  TextField,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  IconButton,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function Clinics() {
  const [clinics, setClinics] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [newClinic, setNewClinic] = useState({
    id: null,
    name: '',
    address: '',
    phone_number: '',
    email: '',
    organization_id: null,
  });
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [confirmationPopup, setConfirmationPopup] = useState(false);
  const [clinicToDelete, setClinicToDelete] = useState(null);

  useEffect(() => {
    fetchClinics();
  }, []);

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

  const handleAddClinic = async (e) => {
    e.preventDefault();
    const url = editMode
      ? `http://localhost:4353/api/clinics/${newClinic.id}`
      : 'http://localhost:4353/api/clinics';
    const method = editMode ? 'PUT' : 'POST';
    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newClinic),
      });

      if (response.ok) {
        fetchClinics();
        setShowForm(false);
        setEditMode(false);
        setPopupMessage(
          editMode ? 'Clinic updated successfully' : 'Clinic added successfully'
        );
        setShowPopup(true);
      } else {
        console.error('Error adding/updating clinic:', response.statusText);
      }
    } catch (error) {
      console.error('Error adding/updating clinic:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewClinic({ ...newClinic, [name]: value });
  };

  const handleEditClinic = (clinic) => {
    setNewClinic(clinic);
    setShowForm(true);
    setEditMode(true);
  };

  const handleDeleteClinic = async () => {
    try {
      const response = await fetch(
        `http://localhost:4353/api/clinics/${clinicToDelete}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        fetchClinics();
        setPopupMessage('Clinic deleted successfully');
        setShowPopup(true);
        setConfirmationPopup(false);
      } else {
        console.error('Error deleting clinic:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting clinic:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const filteredClinics = clinics.filter(
    (clinic) =>
      (clinic.name &&
        clinic.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (clinic.address &&
        clinic.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (clinic.phone_number && clinic.phone_number.includes(searchTerm)) ||
      (clinic.email &&
        clinic.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredClinics.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredClinics.length / itemsPerPage);

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
          <CardTitle className="pb-30">Clinics</CardTitle>
          <div className="flex items-center gap-2 justify-end">
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setShowForm(true);
                setEditMode(false);
                setNewClinic({
                  id: null,
                  name: '',
                  address: '',
                  phone_number: '',
                  email: '',
                  organization_id: null,
                });
              }}
            >
              Add New Clinic
            </Button>
            <TextField
              type="search"
              placeholder="Search clinics..."
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
                  <TableCell>Clinic Name</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Phone Number</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell className="text-right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentItems.map((clinic) => (
                  <TableRow key={clinic.id}>
                    <TableCell>{clinic.name}</TableCell>
                    <TableCell>{clinic.address}</TableCell>
                    <TableCell>{clinic.phone_number}</TableCell>
                    <TableCell>{clinic.email}</TableCell>
                    <TableCell className="text-right">
                      <IconButton
                        size="small"
                        onClick={() => handleEditClinic(clinic)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setClinicToDelete(clinic.id);
                          setConfirmationPopup(true);
                        }}
                      >
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
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(e, page) => handlePageChange(page)}
            color="primary"
          />
        </CardFooter>
      </Card>
      <Dialog open={showForm} onClose={() => setShowForm(false)}>
        <DialogTitle>{editMode ? 'Edit Clinic' : 'Add New Clinic'}</DialogTitle>
        <DialogContent>
          <form onSubmit={handleAddClinic}>
            <TextField
              type="text"
              name="name"
              label="Name"
              value={newClinic.name}
              onChange={handleInputChange}
              required
              fullWidth
              margin="normal"
            />
            <TextField
              type="text"
              name="address"
              label="Address"
              value={newClinic.address}
              onChange={handleInputChange}
              required
              fullWidth
              margin="normal"
            />
            <TextField
              type="text"
              name="phone_number"
              label="Phone Number"
              value={newClinic.phone_number}
              onChange={handleInputChange}
              required
              fullWidth
              margin="normal"
              error={
                newClinic.phone_number &&
                !validatePhoneNumber(newClinic.phone_number)
              }
              helperText={
                newClinic.phone_number &&
                !validatePhoneNumber(newClinic.phone_number)
                  ? 'Phone number must be 10 digits'
                  : ''
              }
            />
            <TextField
              type="email"
              name="email"
              label="Email"
              value={newClinic.email}
              onChange={handleInputChange}
              required
              fullWidth
              margin="normal"
              error={newClinic.email && !validateEmail(newClinic.email)}
              helperText={
                newClinic.email && !validateEmail(newClinic.email)
                  ? 'Invalid email address'
                  : ''
              }
            />
            <DialogActions>
              <Button onClick={() => setShowForm(false)} color="secondary">
                Cancel
              </Button>
              <Button type="submit" color="primary">
                Submit
              </Button>
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
          <Button onClick={() => setShowPopup(false)} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={confirmationPopup} onClose={() => setConfirmationPopup(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Alert severity="warning">
            Are you sure you want to delete this clinic?
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmationPopup(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleDeleteClinic} color="primary">
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
