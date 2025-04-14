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
  PermissionsAndroid,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import Octicons from 'react-native-vector-icons/Octicons';
import {
  responsiveWidth,
} from 'react-native-responsive-dimensions';
import ReviewStar from './tabassets/ReviewStar';
import Clock from './tabassets/Clock';
import {Shadow} from 'react-native-shadow-2';
import ShopSection from './builder/ShopSection';
import {useDispatch, useSelector} from 'react-redux';
import {
  getBanners,
  getCategories,
  getSubCategories,
  setActiveCategoryIndex,
  setsubCategory,
  getAddressList,
  updateUserAddress,
  checkAddressExistence,
  getRestaurantsHome,
} from '../../redux/reducers/daddy';
import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import Geolocation from '@react-native-community/geolocation';
import { setLocation, setLocationId, setLocationName, setOrderOfferAmount } from '../../redux/reducers/auth';
import ServiceUnavailableScreen from './ServiceUnavailableScreen';
import NetInfo from '@react-native-community/netinfo';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Skeleton from './Skeleton';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';

export default function UserHome({navigation}) {
  const {categories, subCategories, banners, restaurants, activeCategoryIndex, loading, addressList,userAddress, 
    serviceAvailable, homeRestaurnats} = useSelector(state => state.Dashboard);
    const {customerId,locationName,orderOfferAmount} =
    useSelector(state => state.Auth);
  const {isNetworkConnected,onloadComponents} = useSelector(state => state.address);
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dispatch = useDispatch();
  const authLocation = useSelector(state => state.Auth.location);
  const [isUpdating, setIsUpdating] = useState(false);
  const [mounted, setMounted] = useState(true);
  const isFocused = useIsFocused();
  const [initialNetLoad, setInitialNetLoad] = useState(false);
  const [serviceCheckFailed, setServiceCheckFailed] = useState(false);
  const [errorOccured, setErrorOccured] = useState(false);
  const networkStatusRef = useRef(isNetworkConnected);

useEffect(() => {
  networkStatusRef.current = isNetworkConnected;
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
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${"AIzaSyCjIVYSyhXOFfT7nQ4UoV85c-UB5FXzY2c"}`,
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

        dispatch(updateUserAddress(currentLocationAddress));
        setSelectedAddress(currentLocationAddress);
        setIsLoadingLocation(false);
      },
      error => {
        console.error('Error getting location:', error);
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 20000,
        maximumAge: 1000,
      }
    );
  }, [dispatch, userAddress]);


  const requestLocationPermission = useCallback(async () => {
    if (Platform.OS === 'ios') {
      try {
        const status = await Geolocation.requestAuthorization('whenInUse');
        if (status !== 'granted') {
          networkStatusRef.current && navigation.replace('ServicesAvailable',{permissionDenied:true});
        } else {
          getCurrentLocation();
        }
      } catch (err) {
        networkStatusRef.current && navigation.replace('ServicesAvailable',{permissionDenied:true});
      }
    } else {
      try {
        const startTime = Date.now();
        const testUrl = 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png';
        
        const response = await fetch(testUrl);
        const blob = await response.blob();
        
        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000; // in seconds
        const bitsLoaded = blob.size * 8;
        const speedMbps = (bitsLoaded / (1024 * 1024)) / duration;
        console.log("SPEED",speedMbps)
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location to provide delivery services.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          networkStatusRef.current && speedMbps > 0.05 && navigation.replace('ServicesAvailable',{permissionDenied:true});
        } else {
          getCurrentLocation();
        }
      } catch (err) {
        networkStatusRef.current && speedMbps > 0.05 && navigation.replace('ServicesAvailable',{permissionDenied:true});
      }
    }
  }, [getCurrentLocation, navigation,isNetworkConnected]);

  const getCategoreis = async () => {
    try {
      setErrorOccured(false)
      dispatch(getCategories());
      dispatch(getSubCategories({categoryId: activeCategoryIndex}));
      dispatch(getBanners());
    if (!restaurants || restaurants.length === 0) {
      dispatch(getRestaurantsHome({categoryId: activeCategoryIndex}));
      // dispatch(getRestaurants({categoryId: activeCategoryIndex}));
    }
    } catch (error) {
      setErrorOccured(true)
      console.log("ERRORIN INITIAL LOAD",error)
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

  useFocusEffect(
    useCallback(() => {
      dispatch(getAddressList());
    }, [activeCategoryIndex]),
  );

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
    dispatch(getSubCategories({categoryId: category.id}));
    dispatch(getRestaurantsHome({categoryId: category.id}));
    dispatch(setOrderOfferAmount(category.order_offer_amount));
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
    getCategoreis();
    setRefreshing(false);
  }, []);

  const handleSearch = (text) => {
    setSearchQuery(text);
    navigation.navigate('CategoriesScreen');
  };

  const checkServiceAvailability = async () => {
    const abortController = new AbortController();
    
    const checkAvailability = async () => {
      if (!authLocation || !mounted) return;
      
      try {
        setErrorOccured(false)
        const response = await dispatch(checkAddressExistence({
          latitude: authLocation.latitude,
          longitude: authLocation.longitude
        })).unwrap();

        if (mounted) {
          await dispatch(setLocationName(response.data[0].location_name));
          await dispatch(setLocationId(response.data[0].id));
          if (response.data.length > 0) {
            // Load essential data after service check
            const result = await dispatch(getCategories());
            dispatch(setOrderOfferAmount(result.payload?.data[0]?.order_offer_amount));
            dispatch(getBanners());
            if (!restaurants || restaurants.length === 0) {
              dispatch(getRestaurantsHome({categoryId: activeCategoryIndex}));
            }
            dispatch(getSubCategories({categoryId: activeCategoryIndex}));
          }
        }
      } catch (error) {
        setErrorOccured(true)
        if (error.name !== 'AbortError' && mounted) {
          // console.error('Service check failed:', error);
        }
      }
    };

    checkAvailability();
    return () => {
      abortController.abort();
      setMounted(false);
    };
  };

  useEffect(() => {
    if (authLocation) {
      checkServiceAvailability();
    }
  }, [authLocation,serviceAvailable]);

  const calculateDeliveryTime = (distance) => {
    if (distance < 3) {
      return '15-20 mins';
    } else if (distance < 5) {
      return '20-30 mins';
    } else {
      return '30-45 mins';
    }
  };

  const updateRestaurantsData = async () => {
    setIsUpdating(true);
    // await dispatch(getRestaurants({ categoryId: activeCategoryIndex }));
    setIsUpdating(false);
  };

  useFocusEffect(
    useCallback(() => {
      updateRestaurantsData();
    }, [activeCategoryIndex])
  );

  const updateOrderOfferAmount =  (amount) => {
    dispatch(setOrderOfferAmount(amount));
  };

  const handleBannerPress = (banner) => {
    console.log(banner,"+++++++++++++++ITEMMMM")
     navigation.navigate('BannerRestaurantScreen', {
       shopId: banner.shop_id,
       shopItem: banner.shop_items_tb_nm,
       highlightItemId:1
     });
  };

  // Handle network connection changes
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(async state => {
      if (state.isConnected && !isNetworkConnected) {
        // Connection restored - show loading state
        // setRefreshing(true);
        setInitialNetLoad(true)
        
        await checkServiceAvailability()
        // Refresh all data
        await Promise.all([
          dispatch(getCategories()),
          dispatch(getBanners()),
          dispatch(getRestaurantsHome({categoryId: activeCategoryIndex})),
          dispatch(getSubCategories({categoryId: activeCategoryIndex}))
        ]);
        
        
        // Small delay to ensure smooth transition
        await new Promise(resolve => setTimeout(resolve, 500));
        // setRefreshing(false);
        setInitialNetLoad(false)
      }
    });
    return () => unsubscribe();
  }, [isNetworkConnected, activeCategoryIndex, dispatch]);


  return (
    <View style={styles.mainContainer}>
      <StatusBar backgroundColor={'transparent'} translucent />
      
      {isNetworkConnected === null ? (
          <Skeleton/>
      ) : !isNetworkConnected && !categories ? (
        <View style={styles.offlineContainer}>
          <MaterialCommunityIcons name="wifi-off" size={40} color="#666" />
          <Text style={styles.offlineText}>No internet connection available</Text>
          <Text style={styles.offlineSubText}>Please check your network settings</Text>
        </View>
      ) : serviceCheckFailed && !isLoading ? (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={40} color="#FF4444" />
          <Text style={styles.errorText}>Network Error</Text>
          <Text style={styles.errorSubText}>Failed to connect to the server</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={checkServiceAvailability}
          >
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : isLoading || initialNetLoad ? (
        <Skeleton/>
      ) : serviceAvailable ? (
        <>
          <LinearGradient colors={['#065E2C', '#F7F2F2']} style={styles.gradientContainer}>
            <View style={styles.headerContainer}>
              <View>
                  <TouchableOpacity 
                    onPress={() => navigation.navigate("SelectServiceFromLocation",{selectedAddress})} 
                    style={styles.locationContainer}
                  >
                    <Octicons name="location" color="#fff" size={25} />
                    <View>
                      <Text style={styles.locationTitle}>
                        {locationName ? ( locationName || 'Current Location') : 'Select Location'}
                      </Text>
                      <Text style={styles.locationAddress} numberOfLines={1}>
                        {selectedAddress?.full_address || 'Tap to choose delivery location'}
                      </Text>
                    </View>
                  </TouchableOpacity>
              </View>
              <TouchableOpacity 
                onPress={() => navigation.navigate('Notifications')} 
                style={styles.supportButton}
              >
                <FontAwesome6 name="bell" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

              <>
                <TouchableOpacity onPress={() => navigation.navigate('CategoriesScreen',{isFromHome:true})} style={styles.searchContainer}>
                  <TextInput
                    placeholderTextColor={'#666666'}
                    placeholder="Search for your favorites"
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={handleSearch}
                    editable={false}
                  />
                  <Icon name="search" size={24} color="gray" />
                </TouchableOpacity>

                { categories && (
                  <FlatList
                    showsHorizontalScrollIndicator={false}
                    data={categories}
                    style={styles.categoriesList}
                    horizontal
                    key={item => item.id}
                    renderItem={({item}) => {
                      return item.id == activeCategoryIndex ? (
                        <LinearGradient
                          style={styles.activeItemTab}
                          colors={[
                            'rgba(255, 204, 0, 0.5)',
                            'rgba(255, 255, 255, 0.5)',
                          ]}>
                          <TouchableOpacity
                            style={styles.activeItemTab}
                            onPress={() => handleSubCategories(item)}>
                            <Image
                              source={{uri: item.category_image}}
                              resizeMode="contain"
                              style={styles.categoryImage}
                            />
                            <Text numberOfLines={1} style={styles.activeCategoryText}>
                              {item.category_name}
                            </Text>
                          </TouchableOpacity>
                        </LinearGradient>
                      ) : (
                        <TouchableOpacity onPress={() => handleSubCategories(item)}>
                          <View style={styles.activeItemTab}>
                            <Image
                              source={{uri: item.category_image}}
                              resizeMode="contain"
                              style={styles.categoryImage}
                            />
                            <Text numberOfLines={1} style={styles.inactiveCategoryText}>
                              {item.category_name}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    }}
                  />
                )}
              </>
          </LinearGradient>
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#065E2C']}
              />
            }
            style={styles.container}
          >
            <View>
                <FlatList
                  data={subCategories}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={item => item.id}
                  contentContainerStyle={styles.listContainer}
                  renderItem={({item}) => (
                    <Shadow
                      distance={15}
                      offset={[15, 17]}
                      startColor="rgba(128, 128, 128, 0.07)"
                      style={styles.subCategoryShadow}>
                      <TouchableOpacity
                        onPress={() => {
                          dispatch(setsubCategory(item));
                          navigation.navigate('CategorieItems');
                        }}
                        style={styles.subCategoryButton}>
                        <Shadow
                          distance={15}
                          shadowOpacity={0.2}
                          offset={[0, 0]}
                          startColor="rgba(246, 195, 174, 0.3)">
                          <View style={styles.subCategoryImageContainer}>
                            <Image
                              source={{uri: item.sub_category_image}}
                              style={styles.subCategoryImage}
                            />
                          </View>
                        </Shadow>
                        <Text style={styles.categoryText}>
                          {item.sub_category_name}
                        </Text>
                      </TouchableOpacity>
                    </Shadow>
                  )}
                />
            </View>

              <FlatList
                ref={flatListRef}
                data={banners}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => item.id}
                renderItem={({item}) => (
                  <TouchableOpacity onPress={() => handleBannerPress(item)} style={styles.bannerContainer}>
                    <Image
                      source={{uri: item.banner_image}}
                      style={styles.bannerImage}
                    />
                  </TouchableOpacity>
                )}
              />

            {activeCategoryIndex === 1 ? (
              <View>
                <Text style={styles.sectionTitle}>Restaurants Near You</Text>
                
                {homeRestaurnats?.length > 0 ? (
                  <FlatList
                    showsVerticalScrollIndicator={false}
                    data={homeRestaurnats}
                    keyExtractor={item => item.shop_id}
                    renderItem={({item}) => {
                      const isUnavailable = item.shop_active_status === "1";
                      const distance = item.distance;
                      
                      return (
                        <TouchableOpacity
                          style={[styles.restaurantCard, isUnavailable && styles.unavailableCard]}
                          onPress={() => {
                            if (!isUnavailable) {
                              navigation.navigate('RestaurantScreen', {
                                shopId: item.shop_id,
                                shopItem: item.shop_items_tb_nm,
                                item,
                                highlightItemId: 15
                              });
                            }
                          }}
                          disabled={isUnavailable}
                        >
                          {isUnavailable && (
                            <View style={styles.unavailableOverlay}>
                              <Text style={styles.unavailableText}>Currently Unavailable</Text>
                            </View>
                          )}
                          
                          <Image
                            source={{uri: item.shop_image}}
                            style={[styles.restaurantImage, isUnavailable && styles.grayImage]}
                          />
                          <View style={styles.restaurantInfo}>
                            <Text style={styles.restaurantName}>
                              {item.shop_name}
                            </Text>
                            <Text style={styles.restaurantType}>
                              {item.shop_address}
                            </Text>
                            <View style={styles.restaurantStats}>
                              <View style={styles.statItem}>
                                <ReviewStar />
                                <Text style={styles.statText}>{item.shop_rating}</Text>
                              </View>

                              {/* <View style={styles.statItem}>
                                <DeliveryVehicle />
                                <Text style={styles.statText}>{item?.distance?.toFixed(2)} km</Text>
                              </View> */}

                              <View style={styles.statItem}>
                                <Clock />
                                <Text style={styles.statText}>{calculateDeliveryTime(distance)}</Text>
                              </View>
                            </View>
                          </View>
                        </TouchableOpacity>
                      );
                    }}
                  />
                ) : (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No restaurants found in your area</Text>
                  </View>
                )}
              </View>
            ) : <ShopSection shops={restaurants} />
            }
          </ScrollView>
        </>
      ) : serviceAvailable===false ?(
        <ServiceUnavailableScreen />
      ) 
      : !categories && !errorOccured ? <Skeleton /> :
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Something went wrong</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={() => {
            checkServiceAvailability();
            getCategoreis();
          }}
        >
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
      }
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: Platform.OS === 'ios' ? 85 : 60,
  },
  gradientContainer: {
    paddingTop: 40,
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
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  locationAddress: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
    width: responsiveWidth(50),
  },
  supportButton: {
    width: 44,
    height: 44,
    backgroundColor: '#065E2C20',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    marginTop: 15,
    backgroundColor: '#fff',
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 10,
    marginHorizontal: responsiveWidth(3),
  },
  searchInput: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    flex: 1,
  },
  categoriesList: {
    marginTop: 20,
  },
  activeItemTab: {
    width: responsiveWidth(25),
    height: 69,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryImage: {
    width: 49,
    height: 48,
  },
  activeCategoryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#065E2C',
  },
  inactiveCategoryText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#525252',
  },
  subCategoryShadow: {
    marginHorizontal: 5,
    marginVertical: 10,
  },
  subCategoryButton: {
    backgroundColor: '#fff',
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
    width: responsiveWidth(100),
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
    color: '#065E2C',
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
    paddingBottom: 20,
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
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    borderRadius: 15,
  },
  unavailableText: {
    color: '#ff4444',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
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
    backgroundColor: '#065E2C',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
