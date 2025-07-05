import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  FlatList,
  StyleSheet,
  Platform,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';
import {useDispatch, useSelector} from 'react-redux';
import {
  getBanners,
  getCategories,
  setActiveCategoryIndex,
  addToCart,
  removeFromCart,
  getCategoryItems
} from '../../redux/reducers/daddy';
import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import Geolocation from '@react-native-community/geolocation';
import { getAvailableLocations, setLocation, setLocationId, setLocationName, setOrderOfferAmount } from '../../redux/reducers/auth';
import NetInfo from '@react-native-community/netinfo';
import Skeleton from './Skeleton';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import  { PERMISSIONS, RESULTS, check, request } from 'react-native-permissions';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import StarIcon from './svg/StarIcon';
import commonStyles from '../../commonstyles/CommonStyles';
import { colors } from '../../config/theme';
import { staticMenuItems } from '../../assets/staticjsons';
import MenuItemCard from './MenuItemCard';
import ItemModal from '../../components/ItemModal';

export default function UserHome({navigation}) {
  const {categories, banners, activeCategoryIndex, loading,userAddress, 
     cartItems,categoryItems} = useSelector(state => state.Dashboard);
    const {locationName,customerId,availableLocations} = useSelector(state => state.Auth);
  const {isNetworkConnected} = useSelector(state => state.address);
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const dispatch = useDispatch();
  const authLocation = useSelector(state => state.Auth.location);
  const isFocused = useIsFocused();
  const [initialNetLoad, setInitialNetLoad] = useState(false);
  const [errorOccured, setErrorOccured] = useState(false);
  const networkStatusRef = useRef(isNetworkConnected);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState();

useEffect(() => {
  networkStatusRef.current = isNetworkConnected;
  dispatch(getAvailableLocations())
}, [isNetworkConnected]);
  // Calculate isLoading from Redux loading states
  const isLoading = (
    loading.addressCheck || 
    isLoadingLocation || 
    loading.categories || 
    loading.banners 
  );
  const getAddressFromCoordinates = async (latitude, longitude) => {
    try {
      setErrorOccured(false)
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyD7VY9uECYSahSptZZefCl-NUm45Injb5o`,
      );
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return data.results[0].formatted_address;
      }
      return 'Address not found';
    } catch (error) {
      console.error('Error getting address:', error);
      setErrorOccured(true);
      return 'Error getting address';
    }
  };



  const getCurrentLocation = useCallback(() => {
    setIsLoadingLocation(true);
    Geolocation.setRNConfiguration({
      enableHighAccuracy: false,
      timeout: 2000,
      maximumAge: 1000,
    });

    Geolocation.getCurrentPosition(
      async position => {
        const { latitude, longitude } = position.coords;
        const address = await getAddressFromCoordinates(latitude, longitude);
        
        // Update both auth and address list
        dispatch(setLocation({ latitude, longitude }));
        
        const currentLocationAddress = {
          address_type: userAddress?.address_type || 'Home',
          full_address: address,
          customer_latitude: latitude.toString(),
          customer_longitude: longitude.toString(),
          name: userAddress?.name || '',
          contact: userAddress?.contact || '',
        };

        if(!isNetworkConnected) return

        setSelectedAddress(currentLocationAddress);
        setIsLoadingLocation(false);
      },
      error => {
        console.error('Error getting location:', error);
        setIsLoadingLocation(false);
        networkStatusRef.current && navigation.replace('ServicesAvailable', { permissionDenied: true });
      },
      {
        enableHighAccuracy: false,
        timeout: 20000,
        maximumAge: 1000,
      }
    );
  }, [dispatch, userAddress]);

  console.log(banners,"++++++++++++BANNERS")

  const requestLocationPermission = useCallback(async () => {
    try {
      let permission;
      if (Platform.OS === 'ios') {
        permission = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
      } else if (Platform.OS === 'android') {
        permission = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
      }
      if (!permission) return;
      const status = await check(permission);
      if (status === RESULTS.GRANTED) {
        getCurrentLocation();
      } else {
        const reqStatus = await request(permission);
        if (reqStatus === RESULTS.GRANTED) {
          getCurrentLocation();
        } else {
          networkStatusRef.current && navigation.replace('ServicesAvailable', { permissionDenied: true });
        }
      }
    } catch (err) {
      networkStatusRef.current && navigation.replace('ServicesAvailable', { permissionDenied: true });
    }
  }, [getCurrentLocation, navigation, isNetworkConnected]);

  const getCategoriesAndItems = async () => {
    try {
      setErrorOccured(false)
      dispatch(getBanners());
      const categoriesResponse = await dispatch(getCategories());
      if (categoriesResponse?.payload?.data?.length > 0) {
        dispatch(setActiveCategoryIndex(categoriesResponse.payload.data[0].id))
        dispatch(getCategoryItems({categoryId:categoriesResponse.payload.data[0].id}))
      }
    } catch (error) {
      setErrorOccured(true)
      console.log("ERROR IN INITIAL LOAD", error)
    }
  };

  useEffect(() => {
    const initializeLocation = async () => {
      if (authLocation) {
        const address = await getAddressFromCoordinates(authLocation.latitude, authLocation.longitude);
        const currentAddress = {
          address_type:locationName ,
          full_address: address,
          customer_latitude: authLocation.latitude.toString(),
          customer_longitude: authLocation.longitude.toString(),
        };
        if(!isNetworkConnected) return
        setSelectedAddress(currentAddress);
      } else if (userAddress) {
        setSelectedAddress(userAddress);
      } else {
        requestLocationPermission();
      }
    };
    
    initializeLocation();
  }, [userAddress, authLocation, requestLocationPermission]);

  useEffect(() => {
    if (isNetworkConnected && (selectedAddress || authLocation)) {
      getCategoriesAndItems();
    }
  }, [isNetworkConnected, selectedAddress, authLocation]);

  useFocusEffect(
    useCallback(() => {
      const checkOnFocus = async () => {
        if (authLocation) {
          await checkServiceAvailability();
        }
      };
      checkOnFocus();
    }, [authLocation])
  );

  const handleSubCategories = category => {
    dispatch(setActiveCategoryIndex(category.id));
    dispatch(getCategoryItems({categoryId:category.id}))
    setSelectedCategory(category.category_name);
    // Clear search when switching categories
    setSearchQuery('');
    setFilteredItems([]); // This will be updated when new categoryItems load
  };

  useFocusEffect(
    useCallback(() => {
      let intervalId;
      if (isFocused && banners?.length > 0) {
        intervalId = setInterval(() => {
          const newIndex = currentIndex < banners.length - 1 ? currentIndex + 1 : 0;
          flatListRef.current?.scrollToIndex({ index: newIndex, animated: true });
          setCurrentIndex(newIndex);
        }, 3000);
      }
      return () => {
        clearInterval(intervalId);
      };
    }, [currentIndex, banners, isFocused])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getCategoriesAndItems();
    setRefreshing(false);
  }, []);

  const handleSearch = (text) => {
    setSearchQuery(text);
    
    if (text.trim() === '') {
      setFilteredItems(categoryItems);
    } else {
      const filtered = categoryItems.filter(item => 
        item.item_name?.toLowerCase().includes(text.toLowerCase()) ||
        item.description?.toLowerCase().includes(text.toLowerCase()) ||
        item.category_name?.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredItems(filtered);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFilteredItems(categoryItems);
  };

  // Update filtered items when categoryItems change
  useEffect(() => {
    setFilteredItems(categoryItems);
  }, [categoryItems]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(async state => {
      if (state.isConnected && !isNetworkConnected) {
        setInitialNetLoad(true)
        getCategoriesAndItems()
        await new Promise(resolve => setTimeout(resolve, 500));
        setInitialNetLoad(false)
      }
    });
    return () => unsubscribe();
  }, [isNetworkConnected, activeCategoryIndex, dispatch]);

  // Cart handlers
  const handleAddToCart = (item) => {
    dispatch(addToCart(item));
  };
  const decreaseItem = (item) => {
    dispatch(removeFromCart(item));
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar backgroundColor={'transparent'} translucent />

      {isNetworkConnected === null ? (
        <Skeleton />
      ) 
      : !isNetworkConnected && !categories ? (
        <View style={styles.offlineContainer}>
          <MaterialCommunityIcons
            name="wifi-off"
            size={40}
            color={colors.gray}
          />
          <Text style={styles.offlineText}>
            No internet connection available
          </Text>
          <Text style={styles.offlineSubText}>
            Please check your network settings
          </Text>
        </View>
      ) 
      // : serviceCheckFailed && !isLoading ? (
      //   <View style={styles.errorContainer}>
      //     <MaterialIcons name="error-outline" size={40} color={colors.red} />
      //     <Text style={styles.errorText}>Network Error</Text>
      //     <Text style={styles.errorSubText}>
      //       Failed to connect to the server
      //     </Text>
      //     <TouchableOpacity
      //       style={styles.retryButton}
      //       onPress={checkServiceAvailability}>
      //       <Text style={styles.retryText}>Try Again</Text>
      //     </TouchableOpacity>
      //   </View>
      // )
       : isLoading || initialNetLoad ? (
        <Skeleton />
      )
       : true ? (
        <>
          <LinearGradient
            colors={[colors.maintheme, colors.maintheme]}
            style={styles.gradientContainer}>
            <View style={styles.headerContainer}>
              <View>
                <TouchableOpacity
                disabled={true}
                  onPress={() =>
                    navigation.navigate('SelectServiceFromLocation', {
                      selectedAddress,
                    })
                  }
                  style={styles.locationContainer}>
                  <SimpleLineIcons
                    name="location-pin"
                    color={colors.white}
                    size={22}
                  />
                  <View>
                    <Text style={styles.locationTitle}>
                      {/* {locationName
                        ? locationName || 'Current Location'
                        : 'Select Location'} */}
                        {availableLocations[0]?.location_name||""}
                    </Text>
                    <Text style={{color:"rgba(255, 255, 255, 0.85)",fontSize:12,fontWeight:"600"}}>123, Main Bazaar, Tirupati, Andhra Pradesh 517501</Text>
                    {/* <Text style={styles.locationAddress} numberOfLines={1}>
                      {selectedAddress?.full_address ||
                        'Tap to choose delivery location'}
                    </Text> */}
                  </View>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('Notifications')}
                style={styles.supportButton}>
                <FontAwesome6 name="bell" size={20} color={colors.white} />
              </TouchableOpacity>
            </View>

            <>
              <TouchableOpacity
                // onPress={() =>
                //   navigation.navigate('CategoriesScreen', {isFromHome: true})
                // }
                style={styles.searchContainer}>
                <TextInput
                  placeholderTextColor={colors.gray}
                  placeholder="Search for your favorites"
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={handleSearch}
                  // editable={false}
                />
                {searchQuery.length > 0 ? (
                  <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                    <Icon name="close" size={20} color={colors.gray} />
                  </TouchableOpacity>
                ) : (
                  <Icon name="search" size={24} color={colors.gray} />
                )}
              </TouchableOpacity>
            </>
          </LinearGradient>
          <View style={{backgroundColor:colors.white,elevation:10,paddingBottom:3}}>

          {categories && (
              <FlatList
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{paddingRight:responsiveWidth(6)}}
                data={categories}
                style={styles.categoriesList}
                horizontal
                key={item => item.id}
                renderItem={({item}) => {
                  const isActive = item.id == activeCategoryIndex;
                  
                  return isActive ? (
                    <LinearGradient
                      style={[styles.activeItemTab]}
                      colors={[colors.transparentWhite, colors.maintheme]}>
                      <TouchableOpacity
                        style={styles.activeItemTab}
                        onPress={() => handleSubCategories(item)}>
                        <Image
                          source={{uri:item.category_image}}
                          resizeMode="cover"

                          style={styles.categoryImage}
                        />
                        <Text
                          numberOfLines={1}
                          style={styles.activeCategoryText}>
                          {item.category_name}
                        </Text>
                      </TouchableOpacity>
                    </LinearGradient>
                  ) : (
                    <TouchableOpacity onPress={() => handleSubCategories(item)}>
                      <View style={styles.activeItemTab}>
                        <Image
                          source={{uri:item.category_image}}
                          resizeMode="contain"
                          style={styles.categoryImage}
                        />
                        <Text
                          numberOfLines={1}
                          style={styles.inactiveCategoryText}>
                          {item.category_name}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                }}
              />
            )}

          </View>

        

          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[commonStyles.btn2Color]}
              />
            }
            style={styles.container}>

          {/* Render static menu items below categories */}
          
          <View style={{marginTop: 0}}>
          <FlatList
                ref={flatListRef}
                data={banners}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => item.id}
                renderItem={({item}) => (
                  <View style={styles.bannerContainer}>
                    <Image
                      source={{uri: item.banner_image}}
                      style={styles.bannerImage}
                    />
                   </View>
                )}
              />
              
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionAccentBar} />
              <Text style={styles.sectionHeaderText}>Recommended For You</Text>
              <View style={styles.sectionHeaderLine} />
            </View>
            {filteredItems.length > 0 ? (
              <FlatList
                data={filteredItems}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                  <MenuItemCard
                    item={item}
                    cartItems={cartItems}
                    handleAddToCart={handleAddToCart}
                    decreaseItem={decreaseItem}
                    onPress={() => handleItemClick(item)}
                  />
                )}
                numColumns={2}
                contentContainerStyle={{paddingHorizontal: 10, paddingBottom: 20}}
                columnWrapperStyle={{justifyContent: 'space-between'}}
              />
            ) : searchQuery.trim() !== '' ? (
              <View style={styles.noItemsContainer}>
                <MaterialIcons name="search" size={60} color={colors.gray} />
                <Text style={styles.noItemsText}>No items found</Text>
                <Text style={styles.noItemsSubText}>
                  No items match your search "{searchQuery}"
                </Text>
              </View>
            ) : (
              <View style={styles.noItemsContainer}>
                <MaterialIcons name="restaurant-menu" size={60} color={colors.gray} />
                <Text style={styles.noItemsText}>No items found</Text>
                <Text style={styles.noItemsSubText}>
                  No {selectedCategory} items available at the moment
                </Text>
              </View>
            )}
          </View>
         {modalVisible && <ItemModal
           cartItems={cartItems}
           handleAddToCart={handleAddToCart}
           decreaseItem={decreaseItem}
            visible={modalVisible}
            item={selectedItem}
            onAddToCart={handleAddToCart}
            onClose={() => setModalVisible(false)}
          />}
  
          </ScrollView>
        </>
      ) 
      // : serviceAvailable === false ? (
      //   <ServiceUnavailableScreen />
      // ) 
      // : !categories && !errorOccured ? (
      //   <Skeleton />
      // )
       : (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Something went wrong</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={getCategoriesAndItems}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.white,
    paddingBottom: Platform.OS === 'ios' ? 85 : 60,
  },
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingBottom: 10,
  },
  gradientContainer: {
    paddingTop: 35,
    paddingBottom:responsiveHeight(2),
    borderBottomLeftRadius:responsiveWidth(5),
    borderBottomRightRadius:responsiveWidth(5)
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: responsiveWidth(3),
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  locationTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  locationAddress: {
    color: colors.white,
    fontWeight: '500',
    fontSize: 14,
    width: responsiveWidth(50),
  },
  supportButton: {
    width: 44,
    height: 44,
    backgroundColor:colors.mainthene,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    marginTop: 15,
    backgroundColor: colors.white,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    paddingHorizontal: 10,
    marginHorizontal: responsiveWidth(4),
  },
  searchInput: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    flex: 1,
    color: colors.black,
    // fontSize: responsiveFontSize(2),
    // paddingVertical: 6,
    // paddingHorizontal: 8,
  },
  clearButton: {
    padding: 5,
  },
  categoriesList: {
    marginTop: 7,
    paddingHorizontal:responsiveWidth(2.8),
  },
  activeItemTab: {
    width: responsiveHeight(10),
    height: responsiveHeight(9),
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryImage: {
    width: "90%",
    height: responsiveHeight(6),
  },
  activeCategoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
    textTransform: 'capitalize',
  },
  inactiveCategoryText: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.gray,
    textTransform: 'capitalize',
  },
  subCategoryShadow: {
    marginHorizontal: 5,
    marginVertical: 10,
  },
  subCategoryButton: {
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    paddingRight: 15,
    borderRadius: 50,
  },
  subCategoryImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 30,
    backgroundColor: '#F6C3AE',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subCategoryImage: {
    width: 38,
    height: 38,
    borderRadius: 100,
  },
  bannerContainer: {
    width: responsiveWidth(95),
    alignItems: 'center',
    marginVertical: 10,
  },
  bannerImage: {
    width: responsiveWidth(90),
    height: 123,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 15,
    color: '#2B2B2B',
  },
  restaurantCard: {
    margin: 15,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  restaurantImage: {
    width: '100%',
    height: 137,
    borderRadius: 15,
  },
  restaurantInfo: {
    padding: 10,
  },
  restaurantName: {
    fontSize: 20,
    fontWeight: '400',
    color: '#3D3D3D',
  },
  restaurantType: {
    color: '#7A7A7A',
    fontSize: 14,
    fontWeight: '400',
  },
  restaurantStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    gap: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 4,
  },
  statText: {
    color: '#3D3D3D',
    fontSize: 14,
    fontWeight: '500',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 100,
  },
  listContainer: {
    paddingHorizontal: 15,
  },
  categoryText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  container: {
    flex: 1,
  },
  fullScreenLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginHorizontal: 20,
  },
  unavailableCard: {
    opacity: 0.6,
    backgroundColor: '#f0f0f0',
  },
  grayImage: {
    opacity: 0.5,
  },
  unavailableOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    borderRadius: 15,
  },
  unavailableText: {
    color: '#D9534F',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 12,
  },
  offlineContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  offlineText: {
    fontSize: 18,
    color: '#333',
    marginTop: 10,
    textAlign: 'center',
  },
  offlineSubText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationFallback: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 20,
    alignItems: 'center',
  },
  locationWarning: {
    fontSize: 16,
    color: '#FF4444',
    marginBottom: 15,
    textAlign: 'center',
  },
  locationButton: {
    backgroundColor: '#065E2C',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginVertical: 5,
  },
  locationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  locationOr: {
    color: '#666',
    marginVertical: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  errorText: {
    fontSize: 20,
    fontWeight: '600',
    color: 'grey',
    marginBottom: 20,
  },
  errorSubText: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.maintheme,
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  unavailableRestaurant: {
    opacity: 0.7,
  },
  unavailableImage: {
    opacity: 0.5,
  },
  unavailableIcon: {
    marginBottom: 8,
  },
  patternOverlay: {
    position: 'absolute',
    width: '200%',
    height: '200%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    transform: [{ rotate: '-45deg' }],
    zIndex: -1,
  },

  popularCard: { width:212,height:277,borderRadius: 8, marginRight: 16,
    // shadowColor: '#000',
    // shadowOpacity: 0.3,
    // shadowRadius: 10,
    // elevation: 3,
    flex:1,
    // borderWidth:1
  },
  popularImgContainer:{
    height:'100%',
    borderTopLeftRadius:8,
    borderTopRightRadius:8
  },
  popularFoodsBottomContainer:{
    flex:1,
    backgroundColor:'#F5F5F5',
    borderBottomLeftRadius:8,
    borderBottomRightRadius:8,
    justifyContent:'center',
    padding:16,height:80
  },
  foodImage: { width: '100%', height: 197,borderTopLeftRadius:8,borderTopRightRadius:8},
  moreText:{
    fontSize:14,
    fontWeight:'700',
    color:'rgba(101, 101, 101, 0.50)',
    // marginTop:8,
  },
  noItemsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noItemsText: {
    fontSize: 18,
    color: '#333',
    marginTop: 10,
    textAlign: 'center',
  },
  noItemsSubText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 13,
    marginBottom: 15,
    marginTop: 2,
  },
  sectionAccentBar: {
    width: 5,
    height: 20,
    backgroundColor: colors.maintheme,
    borderRadius: 3,
    marginRight: 10,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.maintheme,
    marginRight: 10,
    letterSpacing: 0.5,
  },
  sectionHeaderLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.maintheme,
    borderRadius: 1,
  },
});
