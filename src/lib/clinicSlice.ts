// lib/clinicSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Clinic {
  id: number;
  name: string;
}

interface ClinicState {
  selectedClinic: Clinic | null;
}

const initialState: ClinicState = {
  selectedClinic: null,
};

const clinicSlice = createSlice({
  name: 'clinic',
  initialState,
  reducers: {
    setClinic: (state, action: PayloadAction<Clinic | null>) => {
      state.selectedClinic = action.payload;
      if (action.payload) {
        localStorage.setItem('selectedClinic', JSON.stringify(action.payload));
      } else {
        localStorage.removeItem('selectedClinic');
      }
    },
    initializeClinic: (state) => {
      const storedClinic = localStorage.getItem('selectedClinic');
      if (storedClinic) {
        state.selectedClinic = JSON.parse(storedClinic);
      }
    },
  },
});

export const { setClinic, initializeClinic } = clinicSlice.actions;
export default clinicSlice.reducer;