import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  StatusBar,
  Animated,
  PanResponder,
  ActivityIndicator,
  Modal,
} from 'react-native';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HeaderPick2 from './tabassets/HeaderPick2';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';

import { useDispatch, useSelector } from 'react-redux';
import { addToCart, getItemsList, removeFromCart, setCartRestaurant } from '../../redux/reducers/daddy';
import { setRestaurnatDetails } from '../../redux/reducers/auth';


const RestaurantScreen = ({navigation,route}) => {
  const [visible,setVisible] = useState(false)
  const [translateY] = useState(new Animated.Value(100));
  const [cart, setCart] = useState({});
  const dispatch = useDispatch();
  const {restaurantItems,itemsFilter,cartItems,cartRestaurant,subCategories} = useSelector(state=>state.Dashboard) 
  const [filterType,setFilterType] = useState("")
  const [filteredData , setFilterData] = useState([])
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const pan = useRef(new Animated.ValueXY({ x: responsiveWidth(100) - 88, y: responsiveHeight(100) - 138 })).current;
  const [menuVisible, setMenuVisible] = useState(false);
  const [draggableMenuVisible, setDraggableMenuVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showPopularItems, setShowPopularItems] = useState(false);
  const [showOffers, setShowOffers] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  console.log(">>>>>>>>>>>>>>>>>ROUTE.PARAMS",route.params)

  const getItems = async() =>{
    try {
      setIsLoading(true);
      const response = await dispatch(getItemsList({shopId:route.params.shopId,shopItem:route.params.shopItem}))
      setFilterData(response.payload.data)
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setFilterData(restaurantItems);
      return;
    }
    const query = text.toLowerCase().trim();
    const filtered = restaurantItems.filter(item => 
      item.item_name.toLowerCase().includes(query) ||
      item.item_description?.toLowerCase().includes(query)
    );
    setFilterData(filtered);
  };

  const handleMenuAction = (action) => {
    switch(action) {
      case 'favorites':
        // Add to favorites functionality
        break;
      case 'share':
        // Share restaurant functionality
        break;
      case 'report':
        // Report issue functionality
        break;
      case 'info':
        // Show restaurant info
        break;
      default:
        break;
    }
    setMenuVisible(false);
  };

  const handleFilter = (selected) =>{
    if(selected.filter_name===filterType){
      setFilterType("");
      setFilterData(restaurantItems)
      return
    }
  setFilterType(selected.filter_name)
  const updatedData = restaurantItems.filter((item)=>{
    return item.filter_one===selected.filter_name})
  setFilterData(updatedData)
  }

  useEffect(()=>{
    route.params &&  getItems()
  },[route.params])

  const handleAddToCart = (item) => {
    if (cartItems.length === 0 || cartRestaurant == route.params.shopId) {
      addItem(item);
      dispatch(setRestaurnatDetails(route.params.item))
    } else {
      // If different restaurant, show replace modal
      setSelectedItem(item);
      setShowReplaceModal(true);
    }
  };

  const handleReplaceCart = () => {
    // Clear existing cart and add new item
    dispatch(setCartRestaurant(route.params.shopId));
    dispatch(addToCart(selectedItem));
    setShowReplaceModal(false);
    setSelectedItem(null);
  };

  const handleCancelReplace = () => {
    setShowReplaceModal(false);
    setSelectedItem(null);
  };

  const handleIncrease = (itemId) => {
    setCart((prevCart) => ({
      ...prevCart,
      [itemId]: prevCart[itemId] + 1, 
    }));
  };

  const handleDecrease = (itemId) => {
    setCart((prevCart) => {
      const updatedCart = { ...prevCart };
      if (updatedCart[itemId] > 1) {
        updatedCart[itemId] -= 1; 
      } else {
        delete updatedCart[itemId];
      }
      return updatedCart;
    });
  };

  const startAnim = () =>{
    setVisible(true)
    Animated.timing(translateY, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(()=>{

    });
  }

  const stopAnim = () =>{
    
    Animated.timing(translateY, {
      toValue: 100,
      duration: 500,
      useNativeDriver: true,
    }).start(()=>{
      setVisible(false)
    });
  }

  const checkCartRestaurant = () =>{
    if(cartItems.length>0){

      console.log("+++++++++++++>>>>>>",cartItems)
      // if(cartItems)
    }
  }


  const addItem = (item) =>{
    // dispatch(setCartRestaurant())
    dispatch(addToCart(item))
  }

  const decreaseItem = (item) =>{
    dispatch(removeFromCart(item))
  }

  useEffect(()=>{
    Object.keys(cartItems).length>0 ? startAnim() :stopAnim()
  },[Object.keys(cartItems).length])

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        console.log('PanResponder Grant:', pan.x._value, pan.y._value);
        pan.setOffset({ x: pan.x._value, y: pan.y._value });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([
        null,
        { dx: pan.x, dy: pan.y }
      ], { useNativeDriver: false }),
      onPanResponderRelease: () => {
        console.log('PanResponder Release:', pan.x._value, pan.y._value);
        pan.flattenOffset();
      }
    })
  ).current;

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleDraggableMenuAction = (subCategory) => {
    if (subCategory === 'clear') {
      setFilterType("");
      setFilterData(restaurantItems);
    } else {
      setFilterType(subCategory.sub_category_name);
      const filteredItems = restaurantItems.filter(item => 
        item.sub_category_id === subCategory.sub_category_id
      );
      setFilterData(filteredItems);
    }
    setDraggableMenuVisible(false);
  };


  // console.log(subCategories,"route.?.item")

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="transparent" translucent />
      <ImageBackground
        source={{ uri: route.params?.item?.shop_image }}
        style={styles.imageBackground}>
        <View style={styles.imageOverlay}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <MaterialCommunityIcons
                name="keyboard-backspace"
                size={30}
                color="#fff"
                style={styles.backIcon}
              />
            </TouchableOpacity>
            <View style={styles.header}>
              <Text style={styles.title}>{route.params?.item?.shop_name}</Text>
              <Text style={styles.subtitle}>{route.params?.item?.shop_address}</Text>
              <View style={styles.ratingContainer}>
                <Icon name="star" size={18} color="gold" />
                <Text style={styles.rating}>{route.params?.item?.shop_rating}</Text>
              </View>
            </View>
            <View style={styles.headerIcons}>
              {/* <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => handleMenuAction('favorites')}
              >
                <EvilIcons name="heart" color={'#000'} size={15} />
              </TouchableOpacity> */}
              {/* <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => setMenuVisible(!menuVisible)}
              >
                <Entypo name="dots-three-vertical" color="#313131" size={7} />
              </TouchableOpacity> */}
            </View>
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              placeholder="Search items..."
              style={styles.searchInput}
              placeholderTextColor={'#A3A3A3'}
              value={searchQuery}
              onChangeText={handleSearch}
            />
            <Icon
              name="search"
              size={24}
              color="#A3A3A3"
              style={styles.searchIcon}
            />
          </View>
        </View>
      </ImageBackground>

      {/* {menuVisible && (
        <View style={styles.menuOverlay}>
          <TouchableOpacity 
            style={styles.menuOption}
            onPress={() => handleMenuAction('favorites')}
          >
            <Icon name="favorite" size={24} color="#065E2C" />
            <Text style={styles.menuOptionText}>Add to Favorites</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuOption}
            onPress={() => handleMenuAction('share')}
          >
            <Icon name="share" size={24} color="#065E2C" />
            <Text style={styles.menuOptionText}>Share Restaurant</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuOption}
            onPress={() => handleMenuAction('report')}
          >
            <Icon name="report-problem" size={24} color="#065E2C" />
            <Text style={styles.menuOptionText}>Report an Issue</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuOption}
            onPress={() => handleMenuAction('info')}
          >
            <Icon name="info" size={24} color="#065E2C" />
            <Text style={styles.menuOptionText}>Restaurant Info</Text>
          </TouchableOpacity>
        </View>
      )} */}

      <View>
        <FlatList
          data={itemsFilter}
          horizontal
          keyExtractor={item => item.id}
          style={styles.filterList}
          renderItem={({item, index}) => {
            return (
              <TouchableOpacity
                onPress={() => handleFilter(item)}
                style={[styles.filterButton, {
                  borderColor: filterType === item.filter_name ? "#0EAF50" : '#8F8F8F',
                  backgroundColor: filterType === item.filter_name ? "#0EAF50" : '#fff',
                }]}
              >
                <HeaderPick2 color={item.filter_name === "Veg" ? (filterType === item.filter_name ? "#fff" : "#0EAF50") : item.filter_name === "Non Veg" && "#CD2A2A"} />
                <Text style={[styles.filterText, { color: filterType === item.filter_name ? "#fff" : '#313131' }]}>
                  {item.filter_name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#065E2C" />
        </View>
      ) : filteredData.length === 0 ? (
        <View style={styles.noItemsContainer}>
          <MaterialCommunityIcons name="food-off" size={50} color="#A3A3A3" />
          <Text style={styles.noItemsText}>No items found</Text>
          <Text style={styles.noItemsSubText}>We couldn't find any items matching your search</Text>
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={item => item.id}
          numColumns={2}
          style={styles.itemList}
          columnWrapperStyle={styles.columnWrapper}
          renderItem={({item}) => {
            const indexValue = cartItems.findIndex(value => value.id === item.id);
            return (
              <View style={styles.card}>
                <Image source={{uri: item.item_image}} style={styles.image} />
                <View style={styles.itemHeader}>
                  <Text style={styles.itemName}>{item.item_name}</Text>
                  <View style={styles.itemIcon}>
                    <HeaderPick2 color={item.filter_one === "Veg" ? "#0EAF50" : "#CD2A2A"} />
                  </View>
                </View>

                <View style={styles.itemRatingContainer}>
                  <Icon name="star" size={17} color="#D0A50F" />
                  <Text style={styles.itemRating}>4.7</Text>
                  <Text style={styles.itemReviewCount}>(12)</Text>
                </View>

                <View style={styles.itemFooter}>
                  <Text style={styles.price}>₹{item.selling_price}</Text>
                  {indexValue !== -1 ? (
                    <View style={styles.counterContainer}>
                      <TouchableOpacity onPress={() => decreaseItem(item)}>
                        <AntDesign name="minus" size={18} color="#065E2C" />
                      </TouchableOpacity>
                      <Text style={styles.counterText}>{cartItems[indexValue].quantity}</Text>
                      <TouchableOpacity onPress={() => handleAddToCart(item)}>
                        <AntDesign name="plus" size={18} color="#065E2C" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => {
                        handleAddToCart(item);
                      }}
                    >
                      <Text style={styles.addButtonText}>ADD</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          }}
        />
      )}

      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.draggableMenu, pan.getLayout()]}
      >
        <TouchableOpacity 
          style={styles.menuButton} 
          onPress={() => setDraggableMenuVisible(!draggableMenuVisible)}
        >
          <Text style={styles.menuText}>Menu</Text>
          <FontAwesome6 name="book-bookmark" color="#065E2C" size={30} />
        </TouchableOpacity>
        {draggableMenuVisible && (
          <View style={[styles.menuContainer, { left: -205 }]}>
            {subCategories?.map((category) => (
              <TouchableOpacity 
                key={category.id}
                style={styles.menuItemContainer}
                onPress={() => handleDraggableMenuAction(category)}
              >
                <Image 
                  source={{ uri: category.sub_category_image }} 
                  style={styles.categoryImage}
                />
                <Text style={styles.menuItemText}>{category.sub_category_name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity 
              style={[styles.menuItemContainer, styles.clearFilterContainer]}
              onPress={() => handleDraggableMenuAction('clear')}
            >
              <Icon name="clear" size={20} color="#666" />
              <Text style={[styles.menuItemText, styles.clearFilterText]}>Clear Filters</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>

      {true && <Animated.View
        style={styles.cartSummary(translateY)}
      >
        <TouchableOpacity onPress={() => navigation.navigate("CartScreen",{isFromRestaurant:true})}>          
          <Text style={styles.cartSummaryText}>{Object.keys(cartItems).length} Items added to cart <AntDesign name="right" color="green" size={17} /> </Text>
          <Text style={styles.cartSummarySubText}>
            Add items worth ₹199 more to get free delivery
          </Text>
        </TouchableOpacity>
      </Animated.View>}

      <Modal
        visible={showReplaceModal}
        transparent
        animationType="fade"
        onRequestClose={handleCancelReplace}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Replace Cart Items?</Text>
            <Text style={styles.modalText}>
              Your cart contains items from a different restaurant. Would you like to replace them with items from {route.params?.item?.shop_name}?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={handleCancelReplace}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]} 
                onPress={handleReplaceCart}
              >
                <Text style={styles.confirmButtonText}>Replace</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  imageBackground: { width: responsiveWidth(100), height: responsiveHeight(30) },
  imageOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: responsiveHeight(1),
  },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start' },
  backIcon: { marginTop: 5 },
  header: { width: responsiveWidth(70), paddingVertical: 10, paddingHorizontal: responsiveWidth(1), alignSelf: 'flex-start' },
  title: { fontSize: responsiveFontSize(2.2), fontWeight: '700', color: '#fff', width: responsiveWidth(35) },
  subtitle: { fontSize: 14, color: '#F5F5F5', fontWeight: '500' },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  rating: { fontSize: 12, fontWeight: '700', color: '#fff' },
  headerIcons: { flexDirection: 'row', gap: 5, alignItems: 'center', marginTop: 10 },
  iconButton: { width: 18, height: 18, backgroundColor: '#fff', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 5,
    marginVertical: 10,
    height: 48,
    marginHorizontal: responsiveWidth(5),
  },
  searchInput: { flex: 1, padding: 5, color: '#000', fontSize: 16, fontWeight: 500 },
  searchIcon: { marginRight: 5 },
  filterList: { marginVertical: 5, paddingHorizontal: 15 },
  filterButton: {
    padding: 5,
    borderWidth: 1,
    borderRadius: 6,
    marginHorizontal: 3,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  filterText: { fontSize: 16, fontWeight: '500' },
  itemList: { paddingHorizontal: responsiveWidth(5), paddingVertical: responsiveHeight(2), flex: 1 },
  columnWrapper: { gap: responsiveWidth(3.5), justifyContent: 'space-between' },
  card: {
    backgroundColor: '#fff',
    marginBottom: responsiveHeight(1),
    padding: 7,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    width: responsiveWidth(45),
  },
  image: { 
    width: responsiveWidth(40), 
    height: responsiveHeight(15), 
    borderRadius: 12,
    resizeMode: 'cover'
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 5,
    paddingHorizontal: 5,
  },
  itemName: { 
    fontSize: 14, 
    fontWeight: '500', 
    textAlign: 'left', 
    flex: 1,
    color: '#000',
    marginRight: 5,
  },
  itemIcon: { 
    marginTop: 3,
    marginLeft: 5,
  },
  itemRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    paddingHorizontal: 5,
    marginTop: 2,
  },
  itemRating: { color: '#000' },
  itemReviewCount: { color: '#3D3D3D', fontWeight: '400', fontSize: 12 },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 5,
    marginTop: 5,
  },
  price: { fontSize: 17, fontWeight: '700', color: '#065E2C' },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#065E2C",
  },
  counterText: { color: '#065E2C', fontSize: 16, fontWeight: '700', marginHorizontal: 10 },
  addButton: {
    backgroundColor: '#fff',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#065E2C',
  },
  addButtonText: { color: '#065E2C', fontWeight: '700', fontSize: 14 },
  draggableMenu: {
    width: 68,
    height: 68,
    borderRadius: 16,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 7,
    position: "absolute",
    bottom: 70,
    right: 20
  },
  menuText: { fontSize: 12, fontWeight: 700, color: "#065E2C" },
  menuButton: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    justifyContent: "center"
  },
  categoryImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    left: 70,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    elevation: 5,
    width: 200,
    maxHeight: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    overflow: 'scroll'
  },
  menuItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#313131',
    fontWeight: '500',
  },
  clearFilterContainer: {
    borderBottomWidth: 0,
    marginTop: 4,
  },
  clearFilterText: {
    color: '#666',
  },
  cartSummary: (translateY) => ({
    position: "absolute",
    width: "100%",
    height: 75,
    bottom: 0,
    backgroundColor: "#FFF8CF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: "center",
    elevation: 5,
    zIndex: 10,
    transform: [{ translateY: translateY }],
  }),
  cartSummaryText: { fontSize: 18, fontWeight: "bold" },
  cartSummarySubText: { fontSize: 14, color: "gray", marginVertical: 5 },
  menuOverlay: {
    position: 'absolute',
    top: responsiveHeight(15),
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    elevation: 5,
    zIndex: 1000,
    width: 200,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuOptionText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#313131',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  noItemsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
    padding: 20,
  },
  noItemsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#313131',
    marginTop: 15,
    marginBottom: 5,
  },
  noItemsSubText: {
    fontSize: 14,
    color: '#A3A3A3',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  confirmButton: {
    backgroundColor: '#065E2C',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RestaurantScreen;
