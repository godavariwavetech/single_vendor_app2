import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import api from '../../utils/api';
import {endpoints} from '../../config/config';
import { getToken } from '../../services/NotificationsService';

const initialState = {
  message: null,
  loading: {
    categories: false,
    subCategories: false,
    banners: false,
    restaurants: false,
    itemsList: false,
    addressCheck: false,
  },
  token: null,
  userRole: 1,
  customerId:null,
  optCode: '',
  mobileNumber: '',
  isLogged:false,
  categories:null,
  subCategories:null,
  banners:null,
  restaurants:null,
  restaurantItems:null,
  itemsFilter:null,
  cartItems:[],
  activeCategoryIndex:1,
  activeSubCategory:0,
  totalPrice:0,
  cartRestaurant:null,
  orders:null,
  allCategories:null,
  addressList:null,
  userAddress:null,
  serviceLocations: null,
  selectedServiceLocation: null,
  appliedCoupon: null,
  services:null,
  serviceAvailable: null,
  products: [],        
  total: 0,           
  checkoutStatus: null,
  homeRestaurnats : null,
  categoryItems:[]
};


export const getServicesList = createAsyncThunk(
  "getServicesList",
  async(
      {latitude,longitude},
      {getState, rejectWithValue, fulfillWithValue}
  ) =>{
    const data={
      "location_latitude": latitude,
      "location_longitude": longitude
  }
      const response = await api.post(endpoints.CHECK_ADDRESS_EXISTENCE,data);
      if (response) {
          if (response.data) {
            return fulfillWithValue(response.data);
          } else {
            return rejectWithValue('Something went wrong!');
          }
        }
  }
)

export const getServices = createAsyncThunk(
  "getServices",
  async(
      _,
      {getState, rejectWithValue, fulfillWithValue}
  ) =>{
      const response = await api.get(endpoints.GET_SERVICES_LIST);
      if (response) {
          if (response.data) {
            return fulfillWithValue(response.data);
          } else {
            return rejectWithValue('Something went wrong!');
          }
        }
  }
)

export const getCategories = createAsyncThunk(
    "getCategories",
    async(
        _,
        {getState, rejectWithValue, fulfillWithValue}
    ) =>{
      try {
        const response = await api.get(endpoints.DADDY_GET_CATEGORIES);
        if (response) {
            if (response.data) {
              return fulfillWithValue(response.data);
            } else {
              return rejectWithValue('Something went wrong!');
            }
          }
      } catch (error) {
        console.log(error,">>>>>>>>>>>>>>>>>>ERROR")
      }
    }
)

export const getCategoryItems = createAsyncThunk(
  "getCategoryItems",
  async(
    {categoryId},
      {getState, rejectWithValue, fulfillWithValue}
  ) =>{
    try {
      const data={
        "category_id": categoryId
    }
      const response = await api.post(endpoints.GET_CATEGORY_ITEMS,data);
      if (response) {
          if (response.data) {
            return fulfillWithValue(response.data);
          } else {
            return rejectWithValue('Something went wrong!');
          }
        }
    } catch (error) {
      console.log(error,">>>>>>>>>>>>>>>>>>ERROR")
    }
  }
)

export const getItemsList = createAsyncThunk(
  "getItemsList",
  async(
      {shopId,shopItem},
      {getState, rejectWithValue, fulfillWithValue}
  ) =>{
    console.log("shopId",shopId,"shopItem",shopItem)
      const response = await api.post(endpoints.GET_ITEMS_LIST,{
       "shop_id": shopId,
       "shop_items_tb_nm":shopItem
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

export const getOrders = createAsyncThunk(
  "getOrders",
  async(
      {orderId},
      {getState, rejectWithValue, fulfillWithValue}
  ) =>{
    const {customerId} = getState().Auth;
      const response = await api.post(endpoints.GET_ORDERS,{
       "customer_id": customerId,
       "order_id":orderId
      })
      console.log(response,"ORDER RESPONSE")
      if (response) {
          if (response.data) {
            return fulfillWithValue(response.data);
          } else {
            return rejectWithValue('Something went wrong!');
          }
        }
  }
)

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


export const getAddressList = createAsyncThunk(
  "getAddressList",
  async(
      _,
      {getState, rejectWithValue, fulfillWithValue}
  ) =>{
    const {customerId} = getState().Auth;
      const response = await api.post(endpoints.GET_ADDRESS_LIST,{
        "customer_id": customerId
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

export const setAddressList = createAsyncThunk(
  "setAddressList",
  async(
      {addressType,address,customer_latitude,customer_longitude,customer_name,customer_mobile_number,location_id},
      {getState, rejectWithValue, fulfillWithValue}
  ) =>{
    const {customerId} = getState().Auth;
    const data={
        "address_type":addressType,
        "full_address": address,
        "customer_latitude": customer_latitude,
        "customer_longitude": customer_longitude,
        "location_id": location_id,
        "customer_id": customerId,
         "customer_name":customer_name,
        "customer_mobile_number": customer_mobile_number
    }
      const response = await api.post(endpoints.SET_ADDRESS_LIST,data)
      if (response) {
          if (response.data) {
            return fulfillWithValue(response.data);
          } else {
            return rejectWithValue('Something went wrong!');
          }
        }
  }
)
export const getBanners = createAsyncThunk(
  "getBanners",
  async(
      _,
      {getState, rejectWithValue, fulfillWithValue}
  ) =>{

    console.log("++++++++++++++++++>>>>>>>>>>>>>responseBanner",endpoints.GET_BANNER)
      const response = await api.get(endpoints.GET_BANNER);
      if (response) {
          if (response.data) {
            return fulfillWithValue(response.data);
          } else {
            return rejectWithValue('Something went wrong!');
          }
        }
  }
)

export const deleteAddress = createAsyncThunk(
  "deleteAddress",
  async(
      {addressId},
      {getState, rejectWithValue, fulfillWithValue}
  ) =>{

    const data={
      "id": addressId
  }
      const response = await api.post(endpoints.DELETE_ADDRESS_LIST,data)
      if (response) {
          if (response.data) {
            return fulfillWithValue(response.data);
          } else {
            return rejectWithValue('Something went wrong!');
          }
        }
  }
)


export const placeOrder = createAsyncThunk(
  "placeOrder",
  async(
      {orderDetails},
      {getState, rejectWithValue, fulfillWithValue}
  ) =>{
      const response = await api.post(endpoints.PLACE_ORDER,orderDetails)
      if (response) {
          if (response.data) {
            return fulfillWithValue(response.data);
          } else {
            return rejectWithValue('Something went wrong!');
          }
        }
  }
)

export const generateOrderId = createAsyncThunk(
  "generateOrderId",
  async(
      {orderAmount},
      {getState, rejectWithValue, fulfillWithValue}
  ) =>{
      const response = await api.post(endpoints.GENERATE_ORDER_ID,{
        "order_amount": Number(orderAmount)*100
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

export const updateOrderStatus = createAsyncThunk(
  "updateOrderStatus",
  async(
      {paymentId,rzpId,orderId},
      {getState, rejectWithValue, fulfillWithValue}
  ) =>{
      const response = await api.post(endpoints.UPDATE_ORDER_STATUS, {
        "payment_id":paymentId,
        "razorpay_order_id": rzpId,
        "id":orderId
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


export const checkServiceAvailability = createAsyncThunk(
  'dashboard/checkServiceAvailability',
  async (coordinates, { rejectWithValue }) => {
    try {
      const response = await api.post('/check-service', coordinates);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getAvailableAreas = createAsyncThunk(
  'dashboard/getAvailableAreas',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/service-areas');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateUserLocation = createAsyncThunk(
  'dashboard/updateUserLocation',
  async (area, { rejectWithValue }) => {
    try {
      const response = await api.post('/update-location', area);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);


export const postPlayer = createAsyncThunk(
  "postPlayer",
  async(
      _,
      {getState, rejectWithValue, fulfillWithValue}
  ) =>{
    console.log(">>>>>>>>>>>>>CALALALALAALL");
    const {customerId,availableLocations} = await getState().Auth;
    if(!availableLocations || !customerId) return
    const token = await getToken()
    const payload = {
      player_id: token,
      user_id: customerId,
      user_type: 0,
      location_id: availableLocations[0]?.id,
    }
    console.log("+++++++LoactionID PLayerID",payload)
    try {
      const response = await api.post(endpoints.POST_PLAYER_ID,payload)
      console.log(response,"++++++PLAYERRESPONSE")
      if (response) {
          if (response.data) {
            return fulfillWithValue(response.data);
          } else {
            return rejectWithValue('Something went wrong!');
          }
        }
    } catch (error) {
      console.log(error,">>>>>>>>>>>>>>>>ERROR");
    }

  }
)

export const Dashboard = createSlice({
  name: 'Dashboard',
  initialState,
  reducers: {
    updatecartItems:(state,action) =>{
      
    },
    setActiveCategoryIndex :(state,action) =>{
      state.activeCategoryIndex = action.payload
    },
    addToCart: (state, action) => {      
      if (state.cartItems.length === 0) {
        state.cartRestaurant = action.payload.shop_id;
      }

      const itemIndex = state.cartItems.findIndex(item => item.id === action.payload.id);

      if (itemIndex >= 0) {
        state.cartItems[itemIndex].quantity += 1;
      } else {
        state.cartItems.push({ ...action.payload, quantity: 1 });
      }
      
      state.totalPrice = state.cartItems.reduce((total, item) => 
        total + (Number(item.selling_price || item.actualitem_price) * Number(item.quantity)), 0
      );
    },
    removeFromCart: (state, action) => {
      const itemIndex = state.cartItems.findIndex(item => item.id === action.payload.id);
      if (itemIndex >= 0) {
        if (state.cartItems[itemIndex].quantity > 1) {
          state.cartItems[itemIndex].quantity -= 1;
        } else {
          state.cartItems.splice(itemIndex, 1);
        }
      }
       state.totalPrice = state.cartItems.reduce((total, item) => total + (item.selling_price||item.actualitem_price) * item.quantity, 0)
    },

    setCartRestaurant:(state,action)=>{
      state.cartItems = [];
      state.cartRestaurant = action.payload;
      state.totalPrice = 0;
    },

    clearCart:(state,action) =>{
      state.cartItems = [];
    },
    setsubCategory:(state,action)=>{
      state.activeSubCategory = action.payload
    },
    updateUserAddress:(state,action)=>{
      state.userAddress=action.payload
    },
    setServiceLocations: (state, action) => {
      state.serviceLocations = action.payload;
    },
    setSelectedServiceLocation: (state, action) => {
      state.selectedServiceLocation = action.payload;
    },
    applyCoupon: (state, action) => {
      state.appliedCoupon = action.payload;
    },
    removeCoupon: (state) => {
      state.appliedCoupon = null;
    },
  
  },
  extraReducers: builder => {

    builder.addCase(getCategories.pending, (state, action) => {
      state.loading.categories = true;
      state.message = null;
    });
    builder.addCase(getCategories.fulfilled, (state, action) => {
      state.loading.categories = false;
      state.message = null;
      state.categories = action.payload.data;
    });
    builder.addCase(getCategories.rejected, (state, action) => {
      state.loading.categories = false;
      state.message = 'Please try again!';
    });


    builder.addCase(getCategoryItems.pending, (state, action) => {
      state.message = null;
    });
    builder.addCase(getCategoryItems.fulfilled, (state, action) => {
      state.message = null;
      state.categoryItems = action.payload.data;
    });
    builder.addCase(getCategoryItems.rejected, (state, action) => {
      state.message = 'Please try again!';
    });




    builder.addCase(getItemsList.pending, (state, action) => {
      state.loading.itemsList = true;
      state.message = null;
      state.restaurants = [];
    });
    builder.addCase(getItemsList.fulfilled, (state, action) => {
      state.loading.itemsList = false;
      state.message = null;
      state.restaurantItems = action.payload.data;
    });
    builder.addCase(getItemsList.rejected, (state, action) => {
      state.loading.itemsList = false;
      state.message = 'Please try again!';
    });


    builder.addCase(getOrders.pending, (state, action) => {
      state.loading.itemsList = true;
      state.message = null;
      // state.restaurants = [];
    });
    builder.addCase(getOrders.fulfilled, (state, action) => {
      state.loading.itemsList = false;
      state.message = null;
      state.orders = action.payload.data;
    });
    builder.addCase(getOrders.rejected, (state, action) => {
      state.loading.itemsList = false;
      state.message = 'Please try again!';
    });

    builder.addCase(getOrderDetails.pending, (state, action) => {
      state.loading.itemsList = true;
      state.message = null;
      // state.restaurants = [];
    });
    builder.addCase(getOrderDetails.fulfilled, (state, action) => {
      state.loading.itemsList = false;
      state.message = null;

    });
    builder.addCase(getOrderDetails.rejected, (state, action) => {
      state.loading.itemsList = false;
      state.message = 'Please try again!';
    });


    builder.addCase(getAddressList.pending, (state, action) => {
      state.loading = true;
      state.message = null;
    });
    builder.addCase(getAddressList.fulfilled, (state, action) => {
      state.loading = false;
      state.message = null;
      state.addressList=action.payload.data
    });
    builder.addCase(getAddressList.rejected, (state, action) => {
      state.loading= false;
      state.message = 'Please try again!';
    });

    builder.addCase(setAddressList.pending, (state, action) => {
      state.loading = true;
      state.message = null;
    });
    builder.addCase(setAddressList.fulfilled, (state, action) => {
      state.loading = false;  
      state.message = null;
    });
    builder.addCase(setAddressList.rejected, (state, action) => {
      state.loading = false;
      state.message = 'Please try again!';
    });

    builder.addCase(placeOrder.pending, (state, action) => {
      state.loading = true;
      state.message = null;
    });
    builder.addCase(placeOrder.fulfilled, (state, action) => {
      state.loading = false;
      state.message = null;
    });
    builder.addCase(placeOrder.rejected, (state, action) => {
      state.loading= false;
      state.message = 'Please try again!';
    });

    builder.addCase(getBanners.pending, (state, action) => {
      state.message = null;
    });
    builder.addCase(getBanners.fulfilled, (state, action) => {
      console.log(">>>>>>>>>>>>>>>>>>>ACOION",action.payload)
      state.message = null;
      state.banners = action.payload.data;
    });
    builder.addCase(getBanners.rejected, (state, action) => {
      state.message = 'Please try again!';
    });

  },
});



export const {
  updatecartItems,
  setActiveCategoryIndex,
  addToCart,
  removeFromCart,
  setCartRestaurant,
  clearCart,
  setsubCategory,
  updateUserAddress,
  setServiceLocations,
  setSelectedServiceLocation,
  applyCoupon,
  removeCoupon
} = Dashboard.actions;

export default Dashboard.reducer;


