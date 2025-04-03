import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import Octicons from 'react-native-vector-icons/Octicons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
// import { logout } from '../../redux/reducers/daddy';
import CustomModal from '../../components/CustomModal';
import { actionLogout } from '../../redux/reducers/auth';
import { clearCart, getOrders } from '../../redux/reducers/daddy';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {userDetails} = useSelector(state => state.address);
  const [orders, setOrders] = useState([]);
  const getOrdersData = async () => {
    const response = await dispatch(getOrders({orderId:0}));
    response?.payload?.data[0] && setOrders([response.payload.data[0]]);
  }

  useEffect(() => {
    getOrdersData();
  }, []);

    console.log(orders,'++++++++++++++++++++>>>ORDERS')


  const getOrderStatus = (status) => {
    switch(status) {
      case 0: return "Pending";
      case 1: return "Accepted";
      case 2: return "Preparing";
      case 3: return "Ready";
      case 4: return "Delivered";
      case 5: return "Cancelled";
      default: return "Unknown";
    }
  };

  const handleUpdate = () => {
    setUpdateModalVisible(true);
  };

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  const handleConfirmLogout = () => {
    setLogoutModalVisible(false);
    dispatch(actionLogout());
    dispatch(clearCart());
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const renderOrder = ({item}) => (
    <View style={styles.orderCard}>
      <View style={{flexDirection:"row", justifyContent:"space-between", marginBottom: responsiveHeight(0.5)}}>
        <Text style={styles.orderId}>Order ID: {item?.order_id}</Text>
        <Text style={[
          styles.orderStatus,
          {color: item?.order_status === 4 ? '#065E2C' : item?.order_status === 5 ? '#FF4B4B' : '#C3A710'}
        ]}>
          {getOrderStatus(item?.order_status)}
        </Text>
      </View>
      
      <Text style={styles.orderDetails} numberOfLines={1}>
        Delivered to: <Text style={{fontWeight:"400"}} numberOfLines={1}>{item?.delivery_address}</Text>
      </Text>
      
      <Text style={styles.orderDate}>
        {item?.order_date} at {item?.order_time}
      </Text>
     
      <View style={styles.restaurantInfo}>
        <View style={{flexDirection:"row", alignItems:"center", gap: 10, marginVertical: responsiveHeight(1)}}>
          <Image 
            source={{uri: item?.shop_image}}  
            style={{width: responsiveWidth(15), height: responsiveWidth(15), borderRadius: 10}}
          />
          <View style={{width: responsiveWidth(50)}}>
            <Text style={styles.restaurantName} numberOfLines={1}>{item?.shop_name}</Text>
            <Text style={styles.menuItem} numberOfLines={1}>
              {item?.item_count} item{Number(item?.item_count) > 1 ? 's' : ''} • {item?.slot_timings}
            </Text>
          </View>
          <Text style={styles.price}>₹{item?.grand_total}</Text>
        </View>
        
        {/* <View style={styles.buttonRow}>
          {item.order_status === 0 ? (
            <TouchableOpacity 
              style={[styles.reorderButton, { width: '100%' }]}
              onPress={() => navigation.navigate('OrderDetails', { orderId: item.order_id })}
            >
              <Text style={[styles.buttonText, { color: '#065E2C' }]}>ORDER DETAILS</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity 
                style={styles.reorderButton}
                onPress={() => navigation.navigate('Reorder', { orderId: item.order_id })}
              >
                <Text style={styles.buttonText}>REORDER</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.rateButton}>
                <Text style={[styles.buttonText, {color:"#fff"}]}>RATE ORDER</Text>
              </TouchableOpacity>
            </>
          )}
        </View> */}
      </View>
{/*       
      <View style={styles.dottedLineContainer}>
        {Array(20)
          .fill(0)
          .map((_, index) => (
            <View key={index} style={styles.dot} />
          ))}
      </View> */}
    </View>
  );

  const menuItems = [
    {
      id: '1',
      title: 'Address List',
      icon:  <Ionicons name="clipboard-outline" size={24} color="#065E2C" />,
      onPress: () => navigation.navigate('AddressList'),
    },
    {
      id: '2',
      title: 'Give Feedback',
      icon:  <MaterialCommunityIcons name="card-bulleted-outline" size={24} color="#065E2C" />,
      onPress: () => navigation.navigate('Feedback'),
    },
    {
      id: '3',
      title: 'Support',
      icon:  <Feather name="user" size={24} color="#065E2C" />,
      onPress: () => navigation.navigate('Support'),
    },
    {
      id: '4',
      title: 'About Us',
      icon: <MaterialCommunityIcons name="information-outline" size={24} color="#065E2C" />,
      onPress: () => navigation.navigate('AboutUs'),
    },
    {
      id: '5',
      title: 'Privacy Policy',
      icon:  <MaterialCommunityIcons name="shield-account" size={24} color="#065E2C" />,
      onPress: () => navigation.navigate('PrivacyPolicy'),
    },
    {
      id: '6',
      title: 'Terms and Conditions',
      icon:  <MaterialCommunityIcons name="file-document" size={24} color="#065E2C" />,
      onPress: () => navigation.navigate('TermsConditions'),
    },
    {
      id: '7',
      title: 'Refund Policy',
      icon:  <MaterialCommunityIcons name="credit-card-refund-outline" size={24} color="#065E2C" />,
      onPress: () => navigation.navigate('RefundPolicy'),
    },
    {
      id: '8',
      title: 'Logout',
      icon:  <Feather name="log-out" size={24} color="#065E2C"  />,
      onPress: handleLogout,
      // color: '#FF4B4B',
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={"transparent"} barStyle={'light-content'} />
      <LinearGradient
        colors={['#065E2C', '#F7F2F2']}
        style={styles.gradientContainer}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            marginTop: responsiveHeight(5),
            marginLeft: responsiveWidth(5),
          }}>
          <Image
            source={{
              uri: 'https://skiblue.co.uk/wp-content/uploads/2015/06/dummy-profile.png',
            }}
            style={{
              width: responsiveWidth(10),
              height: responsiveWidth(10),
              borderRadius: 100,
            }}
          />
          <Text style={styles.profileName}>{userDetails?.name  || "Hello User"}</Text>
        </View>
      </LinearGradient>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
        <View style={styles.ordersHeader}>
          <Text style={styles.ordersTitle}>Your Orders</Text>
          <TouchableOpacity onPress={()=>navigation.navigate("Reorder")}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#065E2C" />
          </View>
        ) : orders?.length === 0 ? (
          <View style={styles.noOrdersContainer}>
            <MaterialCommunityIcons name="package-variant" size={50} color="#A3A3A3" />
            <Text style={styles.noOrdersText}>No orders found</Text>
            <Text style={styles.noOrdersSubText}>Your order history will appear here</Text>
          </View>
        ) : (
          <FlatList
            scrollEnabled={false}
            data={orders}
            renderItem={renderOrder}
            style={{
              borderWidth: 1.5,
              marginHorizontal: responsiveWidth(5),
              borderRadius: 10,
              backgroundColor: '#fff',
              borderColor:"#A3A3A3"
            }}
            keyExtractor={item => item?.id?.toString()}
          />
        )}
        <View style={styles.menuOptions}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItemMain}
              onPress={item.onPress}>
              <View style={styles.menuItemLeft}>
                {item.icon}
                <Text style={[styles.menuText]}>
                  {item.title}
                </Text>
              </View>
              <Icon name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <CustomModal
        visible={updateModalVisible}
        title="App Update"
        message="You are using the latest version of Local Daddy"
        onConfirm={() => setUpdateModalVisible(false)}
        onCancel={() => setUpdateModalVisible(false)}
        confirmText="OK"
        cancelText={null}
      />

      <CustomModal
        visible={logoutModalVisible}
        title="Logout"
        message="Are you sure you want to logout?"
        onConfirm={handleConfirmLogout}
        onCancel={() => setLogoutModalVisible(false)}
        confirmText="Logout"
        cancelText="Cancel"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: Platform.OS === 'ios' ? 85 : 60, // Add padding for tab bar
  },
  header: {padding: 20, backgroundColor: '#065E2C', alignItems: 'center'},
  profileName: {fontSize: 24, fontWeight: 'bold', color: '#000'},
  ordersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  ordersTitle: {fontSize: 18, fontWeight: 'bold'},
  viewAll: {color: '#065E2C', fontWeight: 'bold'},
  orderCard: {
    backgroundColor: '#fff',
    margin: 10,
    paddingHorizontal: 5,
    borderRadius: 8,
    //  elevation: 3
  },
  orderId: {fontSize: 14, fontWeight: '500',color:"#3D3D3D"},
  orderStatus: {color: '#065E2C', fontWeight: '600',fontSize:14},
  orderDetails: {
    fontSize: 12, 
    color: '#3D3D3D',
    fontWeight:"600",
    width:responsiveWidth(65),
    marginBottom:responsiveHeight(0.3)

  },
  orderDate: {
    fontSize: 12,
     color: '#525252',
     fontWeight:"400",
     marginBottom:responsiveHeight(0.3)
    },
  restaurantInfo: {marginVertical: 0},
  restaurantName: {fontSize: 16, fontWeight: 'bold'},
  menuItem: {fontSize: 14, color: '#555'},
  price: {fontSize: 16, color: '#065E2C', fontWeight: 'bold',alignSelf:"flex-start"},
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // marginTop: 10,
  },
  reorderButton: {
    backgroundColor: '#fff', 
    // padding: 5,
     borderRadius: 5,
     borderWidth:1,
     borderColor:"#A3A3A3",
     alignItems:"center",
     justifyContent:"center",
     paddingVertical:5,
     width:responsiveWidth(38)
    //  paddingHorizontal:20

},
  rateButton: {
    backgroundColor: '#00773F', 
    // padding: 5,
     borderRadius: 5,
     width:responsiveWidth(38),
     alignItems:"center",
     justifyContent:"center"
},
  buttonText: {color: '#A3A3A3', fontWeight: 'bold'},
  menuOptions: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 85 : 60, // Add extra padding to menu options
  },
    menuItemMain: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#A3A3A3',flexDirection:"row",justifyContent:"space-between",alignItems:"center", },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: responsiveWidth(3),
  },
  menuText: {fontSize: 16, color: '#000',fontWeight:"600",textAlign:"left"},
  gradientContainer: {
    paddingVertical: 20,
  },
  dottedLineContainer: {
    flexDirection: 'row',
    marginTop: responsiveHeight(2),
    alignSelf: 'center',

  },
  dot: {
    width: 5, // Dot size
    height: 2,
    backgroundColor: '#D8D8D8', // Dot color
    borderRadius: 5, // Makes it circular
    marginHorizontal: 5, // Space between dots
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  noOrdersContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
    padding: 20,
  },
  noOrdersText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#313131',
    marginTop: 15,
    marginBottom: 5,
  },
  noOrdersSubText: {
    fontSize: 14,
    color: '#A3A3A3',
    textAlign: 'center',
  },
});

export default ProfileScreen;
