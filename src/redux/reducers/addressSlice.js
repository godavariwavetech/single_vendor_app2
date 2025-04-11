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


export const globalSearch = createAsyncThunk(
  "globalSearch",
  async(
      {searchText},
      {getState, rejectWithValue, fulfillWithValue}
  ) =>{
      const response = await api.post(endpoints.GLOBAL_SEARCH,{
          searchterm: searchText
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


export const indiviadualShop = createAsyncThunk(
  "indiviadualShop",
  async(
    {shopId},
    {getState, rejectWithValue, fulfillWithValue}
  ) => {
    console.log("shopId individual shop",shopId,locationId,location)
    const {location,locationId} = getState().Auth;
    const response = await api.post(endpoints.GET_SHOPS,{
      "shop_latitude":  17.0005,
      "shop_longitude": 81.8040,
      "location_id": 1,
      "category_id": 1,
      "sub_category_id":0,
      "shop_id": shopId
    })
    console.log("response>>>>>>>>>>>",response)
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
    globalSearchResults: null,
    isNetworkConnected: null,
    onloadComponents: false,
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
    setIsNetworkConnected: (state, action) => {
      state.isNetworkConnected = action.payload;
      if(action.payload){
        state.onloadComponents = true;
      }else{
        state.onloadComponents = false;
      }
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


    builder.addCase(globalSearch.pending, (state, action) => {
      state.loading = true;
      state.message = null;
    });
    builder.addCase(globalSearch.fulfilled, (state, action) => {
      state.loading = false;
      state.message = null;
      state.globalSearchResults = action.payload.data;
    });
    builder.addCase(globalSearch.rejected, (state, action) => {
      state.loading= false;
      state.message = 'Please try again!';
    });
    
  },
});

export const { setSelectedAddress, clearSelectedAddress, setUserDetails, setIsNetworkConnected } = addressSlice.actions;
export default addressSlice.reducer;