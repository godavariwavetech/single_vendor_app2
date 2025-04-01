import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';
import CategoryInactive from './tabassets/CategoryInactive';
import { getAllCategories, setActiveCategoryIndex, setsubCategory } from '../../redux/reducers/daddy';
import { useDispatch, useSelector } from 'react-redux';

const CategoriesScreen = ({navigation}) => {
  const {allCategories} = useSelector(state => state.Dashboard);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchCategories = async () => {
      await dispatch(getAllCategories());
      setLoading(false);
    };
    fetchCategories();
  }, [dispatch]);

  useEffect(() => {
    if(!allCategories) return;

    const groupedData = allCategories.reduce((acc, item) => {
      const { category_id, category_name, ...subCategory } = item;
      if (!acc[category_id]) {
         acc[category_id] = { 
            category_id, 
            category_name, 
            sub_categories: [] 
         };
      }
      acc[category_id].sub_categories.push(subCategory);
      return acc;
   }, {});
   const result = Object.values(groupedData);
    setCategories(result);
    setFilteredCategories(result);
  }, [allCategories]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCategories(categories);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = categories.map(category => {
      const categoryMatches = category.category_name.toLowerCase().includes(query);
      const filteredSubCategories = category.sub_categories.filter(subCategory =>
        subCategory.sub_category_name.toLowerCase().includes(query)
      );

      if (categoryMatches || filteredSubCategories.length > 0) {
        return {
          ...category,
          sub_categories: categoryMatches ? category.sub_categories : filteredSubCategories
        };
      }
      return null;
    }).filter(Boolean);

    setFilteredCategories(filtered);
  }, [searchQuery, categories]);

  const handleNavigation = async(item,subItem) => {
    await dispatch(setActiveCategoryIndex(item.category_id));
    dispatch(setsubCategory(subItem));
    navigation.navigate('CategorieItems');
  }

  const renderItem = (item,subItem) => {
    return (
      <TouchableOpacity onPress={() => handleNavigation(item,subItem)} style={styles.itemContainer}>
        <Text numberOfLines={1} style={styles.itemName}>
          {subItem.sub_category_name}
        </Text>
        <View style={styles.itemCard}>
          <Image source={{uri: subItem.sub_category_image}} resizeMode='stretch' style={styles.itemImage} />
        </View>
      </TouchableOpacity>
    );
  };

  const renderCategory = ({item}) => (
    <View style={styles.categorySection}>
      <Text style={styles.categoryTitle}>{item.category_name}</Text>
      <FlatList
        data={item.sub_categories}
        renderItem={({item:subItem})=>renderItem(item,subItem)}
        keyExtractor={item => item.id}
        numColumns={3}
        columnWrapperStyle={styles.itemsGrid}
        scrollEnabled={false}
      />
    </View>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <StatusBar backgroundColor="transparent" barStyle="light-content" />
      <LinearGradient
        colors={['#065E2C', '#F7F2F2']}
        style={styles.gradientContainer}>
        <View style={styles.headerContainer}>
          <CategoryInactive color="#fff" />
          <Text style={styles.headerTitle}>Categories</Text>
        </View>
        <View style={styles.searchContainer}>
          <TextInput
            placeholderTextColor="#666666"
            placeholder="Search for your favorites"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Icon name="search" size={24} color="gray" />
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#065E2C" />
        </View>
      ) : (
        <FlatList
          data={filteredCategories}
          renderItem={renderCategory}
          keyExtractor={item => item.category_id}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No categories found</Text>
            </View>
          )}
        />
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  gradientContainer: {
    paddingTop: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: responsiveHeight(5),
    marginLeft: responsiveWidth(5),
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
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
    marginVertical: responsiveHeight(3),
  },
  searchInput: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: responsiveWidth(4),
    paddingBottom: responsiveHeight(15),
    paddingTop: responsiveHeight(2)
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  itemsGrid: {
    justifyContent: 'flex-start',
    gap: responsiveWidth(4),
  },
  itemContainer: {
    width: responsiveWidth(28),
    height: responsiveHeight(17),
    backgroundColor: '#fff',
    elevation: 2,
    marginVertical: responsiveHeight(1),
    borderRadius: 8,
    justifyContent: 'center',
  },
  itemCard: {
    backgroundColor: '#FAE3AF',
    width: responsiveWidth(28),
    height: responsiveHeight(13),
    borderRadius: 8,
    alignSelf: 'flex-end',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemImage: {
    width: responsiveWidth(22),
    height: responsiveHeight(9),
    marginBottom: 8,
    borderRadius: 8,
  },
  itemName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#313131',
    textAlign: 'left',
    marginTop: responsiveHeight(1),
    flex: 1,
    marginHorizontal: responsiveWidth(2),
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: responsiveHeight(10),
    paddingBottom: responsiveHeight(15),
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CategoriesScreen;
