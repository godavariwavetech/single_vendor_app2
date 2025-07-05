// ItemModal.js
import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';

import {
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';
import {colors} from '../config/theme';
import AntDesign from "react-native-vector-icons/AntDesign"
import HeaderPick2 from '../screens/daddy/tabassets/HeaderPick2';

const ItemModal = ({visible, item, onClose,cartItems,handleAddToCart,decreaseItem}) => {
  const cartIndex = cartItems.findIndex(value => value.id === item?.id);
  const inCart = cartIndex !== -1;
  const quantity = inCart ? cartItems[cartIndex].quantity : 0;
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {item && (
            <>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeIcon}>×</Text>
              </TouchableOpacity>
              <Image
                source={{uri: item.item_image}}
                style={styles.modalImage}
                resizeMode="cover"
              />
              <View style={styles.modalContent}>
                <View style={styles.itemFooter} >
                  <View  style={{flexDirection:"row",alignItems:"center",gap:3}}>
                  <Text style={styles.modalTitle}>
                    {item.item_name || 'Ghee Button Idli Sambar'}
                  </Text>
                  </View>
                  <View>
                  {inCart ? (
                    <View style={styles.counterContainer}>
                      <TouchableOpacity onPress={() => decreaseItem(item)}>
                        <AntDesign
                          name="minus"
                          size={18}
                          color={colors.appgreen}
                        />
                      </TouchableOpacity>
                      <Text style={styles.counterText}>{quantity}</Text>
                      <TouchableOpacity onPress={() => handleAddToCart(item)}>
                        <AntDesign
                          name="plus"
                          size={18}
                          color={colors.appgreen}
                        />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => handleAddToCart(item)}
                      disabled={item.active_status === '1'}>
                      <Text style={styles.addButtonText}>ADD</Text>
                    </TouchableOpacity>
                  )}
                  </View>
                </View>
                <View style={styles.modalPriceRating}>
                  <View style={styles.priceContainer}>
                    {item.actual_price !== item.selling_price && (
                      <Text style={styles.originalPrice}>₹{item.actual_price}</Text>
                    )}
                    <Text style={styles.modalPrice}>₹{item.selling_price || item.price || 99}</Text>
                  </View>
                  {/* <View style={styles.ratingContainer}>
                    <Text style={styles.ratingText}>
                      ★ {item.rating || 4.7} ({item.reviews || 547})
                    </Text>
                  </View> */}
                </View>
                <Text style={styles.modalDescription}>
                  {item.item_description || ""}
                </Text>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: responsiveWidth(100),
    padding: 12,
    elevation: 5,
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: responsiveHeight(3),
    zIndex: 1,
    backgroundColor: colors.white,
    paddingVertical: 1,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  closeIcon: {
    fontSize: 24,
    color: colors.black,
    fontWeight: 'bold',
  },
  modalImage: {
    width: '100%',
    height: responsiveHeight(20),
    borderRadius: 20,
    alignSlef: 'center',
  },
  modalContent: {
    padding: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 5,
  },
  modalRestaurant: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 10,
  },
  modalPriceRating: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.maintheme,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: colors.gray,
  },
  modalDescription: {
    fontSize: 12,
    color: colors.gray,
    marginBottom: 15,
    lineHeight: 18,
  },
  addButton: {
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 6,
    borderWidth:1,
    borderColor:colors.appgreen,
    alignSelf: 'flex-start',
    marginRight:10,
    // width:100,
    // alignSelf:"center",
    // textAlign:"center"
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
    marginRight:10,
    
    // width:10,
    justifyContent: 'space-between',
    width:70
  },
  counterText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.appgreen,
    marginHorizontal: 8,
    alignSelf: 'flex-start',
    flexWrap:"nowrap"
  },

  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width:responsiveWidth(90)
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  originalPrice: {
    fontSize: 14,
    color: colors.gray,
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
});

export default ItemModal;
