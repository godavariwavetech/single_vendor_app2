import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { endpoints } from '../../config/config';
import api from '../../utils/api';


export const getOrderDetails = createAsyncThunk(
  "getOrderDetails",
  async(
      {orderId},
      {getState, rejectWithValue, fulfillWithValue}
  ) =>{
      const response = await api.post(endpoints.GET_ORDER_DETAILS,{
      "order_id": orderId
    })
      if (response) {
          if (response.data) {
            return fulfillWithValue(response.data);
          } else {
            return rejectWithValue('Something went wrong!');
          }
        }
  }
)


export const getChargesList = createAsyncThunk(
  "getChargesList",
  async(
      _,
      {getState, rejectWithValue, fulfillWithValue}
  ) =>{
      const response = await api.post(endpoints.GET_CHARGES_LIST)
      if (response) {
          if (response.data) {
            return fulfillWithValue(response.data);
          } else {
            return rejectWithValue('Something went wrong!');
          }
        }
  }
)



const addressSlice = createSlice({
  name: 'address',
  initialState: {
    selectedAddress: null,
    userDetails: null,
    chargesList: null,
  },
  reducers: {
    setSelectedAddress: (state, action) => {
      state.selectedAddress = action.payload;
    },
    clearSelectedAddress: (state) => {
      state.selectedAddress = null;
    },
    setUserDetails: (state, action) => {
      state.userDetails = action.payload;
    },
  },
  extraReducers: (builder) => {
  
    builder.addCase(getOrderDetails.pending, (state, action) => {
      state.loading = true;
      state.message = null;
    });
    builder.addCase(getOrderDetails.fulfilled, (state, action) => {
      state.loading = false;
      state.message = null;
    });
    builder.addCase(getOrderDetails.rejected, (state, action) => {
      state.loading= false;
      state.message = 'Please try again!';
    });


    builder.addCase(getChargesList.pending, (state, action) => {
      state.loading = true;
      state.message = null;
    });
    builder.addCase(getChargesList.fulfilled, (state, action) => {
      state.loading = false;
      state.message = null;
      state.chargesList = action.payload.data;
    });
    builder.addCase(getChargesList.rejected, (state, action) => {
      state.loading= false;
      state.message = 'Please try again!';
    });

    
  },
});

export const { setSelectedAddress, clearSelectedAddress, setUserDetails } = addressSlice.actions;
export default addressSlice.reducer;