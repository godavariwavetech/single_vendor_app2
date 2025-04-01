import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';

const TermsConditionsScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <FontAwesome6 name="arrow-left-long" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Terms and Conditions</Text>
      </View>
      <ScrollView style={{padding:20}}>
        <Text style={styles.content}>
          These terms and conditions outline the rules and regulations for the use of our app.
        </Text>
        <Text style={styles.subtitle}>Acceptance of Terms</Text>
        <Text style={styles.content}>
          By using our app, you accept these terms and conditions in full. If you disagree with any part of these terms, you must not use our app.
        </Text>
        <Text style={styles.subtitle}>User Responsibilities</Text>
        <Text style={styles.content}>
          You are responsible for maintaining the confidentiality of your account and password and for restricting access to your device.
        </Text>
        <Text style={styles.subtitle}>Payment Terms</Text>
        <Text style={styles.content}>
          All payments made through the app are processed securely via Razorpay. We do not store your payment information.
        </Text>
        <Text style={styles.subtitle}>Changes to Terms</Text>
        <Text style={styles.content}>
          We may update these terms and conditions from time to time. We will notify you of any changes by posting the new terms in the app.
        </Text>
        <Text style={styles.subtitle}>Contact Us</Text>
        <Text style={styles.content}>
          If you have any questions about these terms and conditions, please contact us at support@example.com.
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
    width: responsiveWidth(7)
  },
  title: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#fff',
    textAlign: "left" 
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

export default TermsConditionsScreen;