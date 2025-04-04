import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const RestaurantScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterData, setFilterData] = useState([]);

  const handleSearch = (text) => {
    setSearchQuery(text);
    // Implement search logic here
  };

  return (
    <View style={styles.searchContainer}>
      <View style={styles.inputWrapper}>
        {searchQuery.length === 0 ? (
          <MaterialIcons 
            name="search" 
            size={24} 
            color="#666" 
            style={styles.searchIcon} 
          />
        ) : (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={() => {
              setSearchQuery('');
              setFilterData([]);
            }}
          >
            <MaterialIcons name="close" size={20} color="#666" />
          </TouchableOpacity>
        )}
        <TextInput
          style={styles.searchInput}
          placeholder="Search food items..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>
    </View>
  );
};

const styles = {
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  searchIcon: {
    position: 'absolute',
    left: 15,
    zIndex: 1,
  },
  clearButton: {
    position: 'absolute',
    left: 15,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    padding: 5,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 45,
    fontSize: 16,
    color: '#000',
  },
};

export default RestaurantScreen; 