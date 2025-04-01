import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  Linking,
  BackHandler,
  RefreshControl,
} from 'react-native';
import {
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import HeaderPick2 from './tabassets/HeaderPick2';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
// import { getOrderDetails } from '../../redux/reducers/addressSlice';
import { useDispatch } from 'react-redux';
import { getOrderDetails, getOrders } from '../../redux/reducers/daddy';

const OrderDetailsScreen = ({ navigation, route }) => {
  // const { orderDetails } = route.params;
  const dispatch = useDispatch()
  const [subOrderData, setSubOrderData] = useState([])
  const [refreshing, setRefreshing] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  const getOrderData = async () => {
    const response = await dispatch(getOrders({orderId:route.params?.orderDetails?.id}));
    if(response.payload?.data) {
      setOrderDetails(response.payload.data[0]);
    }
  }

  useEffect(() => {
    getOrderData();  
  }, []);

  
  const orderData = {
    restaurant: {
      name: orderDetails?.shop_name, 
      orderTime: orderDetails?.order_time,
      image: orderDetails?.shop_image,
    },
    status: orderDetails?.order_status === 0 ? 'Order is being prepared' : 'Order delivered', // Update based on order status
    estimatedTime: orderDetails?.slot_timings, // Use slot timings for estimated delivery
    deliveryAgent: {
      
      name: orderDetails?.delivery_boy_array ? orderDetails?.delivery_boy_array[0]?.delivery_boy_name: 'N/A',
      status: 'On the way to pick order', // You can update this based on your logic
      phone: orderDetails?.delivery_boy_array ? orderDetails?.delivery_boy_array[0]?.delivery_boy_mobile_number : 'N/A',
    },
    delivery: {
      type: 'Home', // You can update this if needed
      address: orderDetails?.delivery_address, // Updated delivery address
      addressDetails: '', // You can update this if needed
      name: 'Rajesh', // You can update this if needed
      phone: orderDetails?.shop_phone_number, // Use shop phone number for contact
    },
    billing: {
      amount: orderDetails?.grand_total, // Updated total amount
      savings: orderDetails?.total_saving_amount, // Updated savings
      couponDiscount: orderDetails?.coupon_amount, // Updated coupon discount
      couponCode: '', // You can update this if needed
      subtotal: (orderDetails?.grand_total - orderDetails?.delivery_charges) || 0, // Calculate subtotal if needed
      gst: 0, // You can update this if needed
      deliveryCharge: orderDetails?.delivery_charges, // Updated delivery charge
      total: orderDetails?.grand_total, // Updated grand total
    },
    tracking: {
      restaurant: {
        latitude: parseFloat(orderDetails?.shop_latitude), // Updated restaurant latitude
        longitude: parseFloat(orderDetails?.shop_longitude), // Updated restaurant longitude
      },
      delivery: {
        latitude: parseFloat(orderDetails?.order_latitude), // Updated delivery latitude
        longitude: parseFloat(orderDetails?.order_longitude), // Updated delivery longitude
      },
      current: {
        latitude: parseFloat(orderDetails?.order_latitude), // Use order latitude for current location
        longitude: parseFloat(orderDetails?.order_longitude), // Use order longitude for current location
      },
    },
  };

  // Safely parse delivery_boy_array
  try {
    // Log the delivery_boy_array to see its content
    console.log("Delivery Boy Array:", orderDetails?.delivery_boy_array);

    // Check if the delivery_boy_array is a valid string
    let deliveryBoys = orderDetails?.delivery_boy_array;

    // Handle the case where delivery_boy_array is improperly formatted
    if (deliveryBoys === "'0'" || deliveryBoys === "'[]'" || !deliveryBoys) {
        deliveryBoys = '[]'; // Set to an empty array
    }

    // Parse the delivery_boy_array
    deliveryBoys = deliveryBoys && typeof deliveryBoys === 'string' 
        ? JSON.parse(deliveryBoys.replace(/'/g, '"')) // Replace single quotes with double quotes
        : [];

    // Update orderData with parsed delivery boys
    if (Array.isArray(deliveryBoys) && deliveryBoys.length > 0) {
        orderData.deliveryAgent.name = deliveryBoys[0]?.delivery_boy_name || 'N/A';
        orderData.deliveryAgent.phone = deliveryBoys[0]?.delivery_boy_mobile_number || 'N/A';
    } else {
        orderData.deliveryAgent.name = 'N/A';
        orderData.deliveryAgent.phone = 'N/A';
    }
  } catch (error) {
    console.error("Error parsing delivery_boy_array:", error);
    // Keep default values for delivery agent
    orderData.deliveryAgent.name = 'N/A';
    orderData.deliveryAgent.phone = 'N/A';
  }

  const handleCallDriver = () => {
    Linking.openURL(`tel:${orderData.deliveryAgent.phone}`);
  };

  const handleCallRestaurant = () => {
    Linking.openURL(`tel:${orderData.shop_phone_number}`);
  };
  

  

  const handleBackPress = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'BottomNavigation' }],
    });
  };

  useEffect(() => {
    const backAction = () => {
      handleBackPress();
      return true; // Prevent default back action
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove(); // Cleanup the event listener
  }, []);

  const fetchOrderItems = async () => {
    // console.log("+++++++++++++>>>>",orderDetails)
    if(!orderDetails?.id) return;
    const response = await dispatch(getOrderDetails({ orderId: orderDetails.id }));

    console.log("+++++++++++++>>>>",response.payload)
    if(response.payload?.data) {
      setSubOrderData(response.payload.data);
    }
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await getOrderData();
    await fetchOrderItems();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchOrderItems();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#065E2C" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={()=>navigation.goBack()}
        >
          <FontAwesome6 name="arrow-left-long" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Order Details</Text>
      </View>

      <ScrollView style={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {/* Map View */}
        {/* <View style={styles.mapContainer}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              latitude: orderData.tracking.restaurant.latitude,
              longitude: orderData.tracking.restaurant.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker
              coordinate={orderData.tracking.restaurant}
              title="Restaurant"
            >
              <MaterialIcons name="restaurant" size={30} color="#065E2C" />
            </Marker>
            <Marker
              coordinate={orderData.tracking.delivery}
              title="Delivery Location"
            >
              <MaterialIcons name="location-on" size={30} color="#065E2C" />
            </Marker>
            <Marker
              coordinate={orderData.tracking.current}
              title="Delivery Agent"
            >
              <MaterialIcons name="delivery-dining" size={30} color="#065E2C" />
            </Marker>
            <Polyline
              coordinates={[
                orderData.tracking.restaurant,
                orderData.tracking.current,
                orderData.tracking.delivery,
              ]}
              strokeColor="#065E2C"
              strokeWidth={3}
              lineDashPattern={[5, 5]}
            />
          </MapView>
        </View> */}

        {/* Restaurant Info */}
        <View style={styles.restaurantInfo}>
          <Image
            source={{ uri: orderData.restaurant.image }}
            style={styles.restaurantImage}
          />
          <View style={styles.restaurantDetails}>
            <Text style={styles.restaurantName}>{orderData.restaurant.name}</Text>
            <Text style={styles.orderTime}>Ordered At {orderData.restaurant.orderTime}</Text>
          </View>
          <TouchableOpacity onPress={handleCallRestaurant} style={styles.callButton}>
            <MaterialIcons name="call" size={24} color="#065E2C" />
          </TouchableOpacity>
        </View>

        {/* Order Status */}
        <View style={styles.statusContainer}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusText}>{orderData.status}</Text>
            <View style={styles.estimatedTime}>
              <Text style={styles.estimatedTimeValue}>{orderData.estimatedTime}</Text>
              <Text style={styles.estimatedTimeLabel}>ESTIMATED{'\n'}DELIVERY TIME</Text>
            </View>
          </View>
        </View>

        {/* Delivery Agent */}
        <View style={styles.agentContainer}>
          <View style={styles.agentHeader}>
            <Text style={styles.sectionTitle}>Delivery Agent</Text>
            <TouchableOpacity onPress={handleCallDriver} style={styles.callAgentButton}>
              <MaterialIcons name="call" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.agentInfo}>
            <View style={styles.agentDetails}>
              <Text style={styles.agentName}>{orderData.deliveryAgent.name}</Text>
              <Text style={styles.agentStatus}>{orderData.deliveryAgent.status}</Text>
            </View>
          </View>
        </View>

        {/* Cart Items */}
        <View style={styles.cartSection}>
          <Text style={styles.sectionTitle}>Cart Items</Text>
          {subOrderData?.map((item) => (
            <View key={item.id}>
              <View style={styles.cartItem}>
                <View style={styles.itemDetails}>
                  <HeaderPick2 />
                  <Text style={styles.itemName}>{item.item_name}</Text>
                  <Text style={styles.itemPrice}>₹{item.item_price}</Text>
                </View>
                <View style={styles.quantityInfo}>
                  <Text style={styles.quantity}>x{item.sub_item_count}</Text>
                  <Text style={styles.itemTotal}>₹{item.item_total_amount}</Text>
                </View>
              </View>
              <View style={styles.dottedLineContainer}>
                {Array(20).fill(0).map((_, index) => (
                  <View key={index} style={styles.dot} />
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Delivery Details */}
        <View style={styles.deliveryDetails}>
          <Text style={styles.sectionTitle}>Delivery Details</Text>
          <View style={styles.addressCard}>
            <View style={styles.addressSection}>
              <MaterialIcons name="home" size={24} color="#666" />
              <View style={styles.addressInfo}>
                <Text style={styles.addressType}>Home</Text>
                <Text style={styles.addressText}>
                  {orderData.delivery.address}
                  {'\n'}
                  {orderData.delivery.addressDetails}
                </Text>
              </View>
            </View>
            <View style={styles.dottedLineContainer}>
              {Array(20).fill(0).map((_, index) => (
                <View key={index} style={styles.dot} />
              ))}
            </View>
            <View style={styles.contactSection}>
              <MaterialIcons name="person" size={24} color="#666" />
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{orderData.delivery.name}</Text>
                <Text style={styles.contactPhone}>{orderData.delivery.phone}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Billing */}
        <View style={styles.billingSection}>
          <Text style={styles.sectionTitle}>Billing</Text>
          <View style={styles.billingCard}>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Amount</Text>
              <Text style={styles.billValue}>₹{orderData.billing.amount}</Text>
            </View>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Savings</Text>
              <Text style={styles.savingsValue}>₹{orderData.billing.savings}</Text>
            </View>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Coupon Discount</Text>
              <Text style={styles.savingsValue}>₹{orderData.billing.couponDiscount}</Text>
            </View>
            <Text style={styles.couponCode}>"{orderData.billing.couponCode}"</Text>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Total</Text>
              <Text style={styles.savingsValue}>₹{orderData.billing.total}</Text>
            </View>
            <View style={styles.dottedLineContainer}>
              {Array(20).fill(0).map((_, index) => (
                <View key={index} style={styles.dot} />
              ))}
            </View>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Delivery Charge</Text>
              <Text style={styles.billValue}>₹{orderData.billing.deliveryCharge}</Text>
            </View>
            <Text style={styles.gstNote}>(GST Included)</Text>
            <View style={styles.dottedLineContainer}>
              {Array(20).fill(0).map((_, index) => (
                <View key={index} style={styles.dot} />
              ))}
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL</Text>
              <Text style={styles.totalValue}>₹{orderData.billing.total}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#065E2C',
    height: responsiveHeight(15),
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: responsiveHeight(3),
    paddingLeft: responsiveWidth(5),
  },
  backButton: {
    width: responsiveWidth(7),
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: responsiveWidth(3),
  },
  content: {
    flex: 1,
  },
  mapContainer: {
    height: responsiveHeight(30),
    width: '100%',
  },
  map: {
    flex: 1,
  },
  restaurantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: responsiveWidth(5),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  restaurantImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F0F0',
  },
  restaurantDetails: {
    flex: 1,
    marginLeft: responsiveWidth(3),
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  orderTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  callButton: {
    padding: responsiveWidth(2),
  },
  statusContainer: {
    padding: responsiveWidth(5),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    flex: 1,
  },
  estimatedTime: {
    alignItems: 'center',
  },
  estimatedTimeValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#065E2C',
  },
  estimatedTimeLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  agentContainer: {
    padding: responsiveWidth(5),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  agentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsiveHeight(2),
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  callAgentButton: {
    backgroundColor: '#065E2C',
    padding: responsiveWidth(2),
    borderRadius: 20,
  },
  agentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  agentDetails: {
    flex: 1,
  },
  agentName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  agentStatus: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  cartSection: {
    padding: responsiveWidth(5),
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: responsiveHeight(1),
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  itemPrice: {
    fontSize: 14,
    color: '#065E2C',
    fontWeight: '600',
    marginTop: 4,
  },
  quantityInfo: {
    alignItems: 'flex-end',
  },
  quantity: {
    fontSize: 14,
    color: '#666',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginTop: 4,
  },
  deliveryDetails: {
    padding: responsiveWidth(5),
  },
  addressCard: {
    borderWidth: 1,
    borderColor: '#065E2C',
    borderRadius: 8,
    padding: responsiveWidth(4),
    marginTop: responsiveHeight(1),
  },
  addressSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: responsiveHeight(2),
  },
  addressInfo: {
    flex: 1,
    marginLeft: responsiveWidth(3),
  },
  addressType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    lineHeight: 20,
  },
  contactSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactInfo: {
    flex: 1,
    marginLeft: responsiveWidth(3),
  },
  contactName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  contactPhone: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  billingSection: {
    padding: responsiveWidth(5),
  },
  billingCard: {
    borderWidth: 1,
    borderColor: '#065E2C',
    borderRadius: 8,
    padding: responsiveWidth(4),
    marginTop: responsiveHeight(1),
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: responsiveHeight(1),
  },
  billLabel: {
    fontSize: 14,
    color: '#525252',
  },
  billValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  savingsValue: {
    fontSize: 14,
    color: '#525252',
    fontWeight: '500',
  },
  gstValue: {
    fontSize: 14,
    color: '#FFCB18',
    fontWeight: '500',
  },
  couponCode: {
    fontSize: 12,
    color: '#065E2C',
    marginLeft: responsiveWidth(2),
    marginBottom: responsiveHeight(1),
  },
  gstNote: {
    fontSize: 12,
    color: '#666',
    marginBottom: responsiveHeight(1),
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: responsiveHeight(1),
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  dottedLineContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: responsiveHeight(1),
    width: responsiveWidth(80),
    overflow: 'hidden',
    alignSelf: 'center',
  },
  dot: {
    width: 7,
    height: 2,
    backgroundColor: '#D8D8D8',
    borderRadius: 5,
    marginHorizontal: 5,
  },
});

export default OrderDetailsScreen; 