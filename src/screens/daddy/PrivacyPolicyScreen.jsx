import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import AntDesign from 'react-native-vector-icons/AntDesign';

const PrivacyPolicyScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <AntDesign name="arrowleft" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Privacy Policy</Text>
      </View>
      <ScrollView style={{padding:20}}>
        <Text style={styles.content}>
          Your privacy is important to us. This privacy policy explains how we collect, use, and share information about you when you use our app.
        </Text>
        <Text style={styles.subtitle}>Information We Collect</Text>
        <Text style={styles.content}>
          We collect information about you when you use our app, including your location and address for delivery purposes, and payment information when you make a purchase.
        </Text>
        <Text style={styles.subtitle}>How We Use Your Information</Text>
        <Text style={styles.content}>
          We use your information to provide and improve our services, process payments, and communicate with you about your orders.
        </Text>
        <Text style={styles.subtitle}>Sharing Your Information</Text>
        <Text style={styles.content}>
          We do not share your personal information with third parties except as necessary to provide our services or as required by law.
        </Text>
        <Text style={styles.subtitle}>Changes to This Privacy Policy</Text>
        <Text style={styles.content}>
          We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy in the app.
        </Text>
        <Text style={styles.subtitle}>Contact Us</Text>
        <Text style={styles.content}>
          If you have any questions about this privacy policy, please contact us at support@example.com.
        </Text>
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
    flexDirection: "row",
    alignItems: "flex-end",
    paddingBottom: responsiveHeight(3),
    paddingLeft: responsiveWidth(5)
  },
  backButton: {
    width: responsiveWidth(7),
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 10,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
  },
  content: {
    fontSize: 16,
    marginTop: 5,
    lineHeight: 24,
  },
});

export default PrivacyPolicyScreen;