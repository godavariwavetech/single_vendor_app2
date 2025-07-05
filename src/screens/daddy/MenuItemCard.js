import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, Pressable } from 'react-native';
// import HeaderPick2 from './HeaderPick2'; // Make sure this import path is correct
// import { AntDesign } from '@expo/vector-icons'; // Or your icon import
import AntDesign from 'react-native-vector-icons/AntDesign'
import commonStyles from '../../commonstyles/CommonStyles';
import HeaderPick2 from './tabassets/HeaderPick2';
import { colors } from '../../config/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_GAP = 10; // gap between cards and screen
const CARD_WIDTH = (SCREEN_WIDTH - CARD_GAP * 3) / 2; // 2 cards, 3 gaps (left, middle, right)

const MenuItemCard = ({ item, cartItems, handleAddToCart, decreaseItem, onPress }) => {
  const cartIndex = cartItems.findIndex(value => value.id === item.id);
  const inCart = cartIndex !== -1;
  const quantity = inCart ? cartItems[cartIndex].quantity : 0;

  return (
    <Pressable onPress={onPress} style={styles.itemContainer}>
      <View 
        style={[styles.card, item.active_status === "1" && styles.unavailableCard]}
      >
        {item.active_status === "1" && (
          <View style={styles.unavailableOverlay}>
            <Text style={styles.unavailableText}>Currently Unavailable</Text>
          </View>
        )}
        <Image 
          source={{uri: item.item_image}} 
          style={[styles.image, item.active_status === "1" && styles.unavailableImage]}
        />
        <View style={styles.itemHeader}>
          <Text style={styles.itemName} numberOfLines={1} ellipsizeMode="tail">{item.item_name}</Text>
          {(item.filter_one === "Veg" || item.filter_one === "Non-Veg") && (
            <View style={styles.itemIcon}>
              <HeaderPick2 color={item.filter_one === "Veg" ? "#0EAF50" : "#CD2A2A"} />
            </View>
          )}
        </View>
        <View style={styles.itemFooter}>
          <View>
            <View style={{flexDirection: 'row',justifyContent:"flex-start"}}>
              {item.actual_price !== item.selling_price && (
                <Text style={[styles.price, {textDecorationLine: 'line-through', color: '#888',fontSize:10,textAlign:"left"}]}>₹{item.actual_price}</Text>
              )}
            </View>
            <Text style={styles.price}>₹{item.selling_price}</Text>
          </View>
          {inCart ? (
            <View style={styles.counterContainer}>
              <TouchableOpacity onPress={() => decreaseItem(item)}>
                <AntDesign name="minus" size={18} color={colors.appgreen} />
              </TouchableOpacity>
              <Text style={styles.counterText}>{quantity}</Text>
              <TouchableOpacity onPress={() => handleAddToCart(item)}>
                <AntDesign name="plus" size={18} color={colors.appgreen} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => handleAddToCart(item)}
              disabled={item.active_status === "1"}
            >
              <Text style={styles.addButtonText}>ADD</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    width: CARD_WIDTH,
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2,
    width: '100%',
    // height: 220,
  },
  unavailableCard: {
    opacity: 0.6,
    backgroundColor: '#f0f0f0',
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
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  unavailableText: {
    color: '#D9534F',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 12,
  },
  image: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  unavailableImage: {
    opacity: 0.5,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // padding: 10,
    paddingHorizontal:10,
    paddingTop:9
    // minHeight: 48,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  itemIcon: {
    marginLeft: 8,
  },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal:10,
    paddingBottom:8,
    paddingTop:6
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.maintheme,
  },
  addButton: {
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 6,
    borderWidth:1,
    borderColor:colors.appgreen
  },
  addButtonText: {
    color: colors.appgreen,
    fontWeight: '700',
    fontSize: 14,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.appgreen,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 70,
    justifyContent: 'space-between',
  },
  counterText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.appgreen,
    marginHorizontal: 8,
  },
});

export default MenuItemCard; 