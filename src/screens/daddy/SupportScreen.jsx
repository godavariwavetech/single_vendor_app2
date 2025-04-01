import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Linking } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const SupportScreen = ({ navigation }) => {
  const faqs = [
    {
      question: "How do I track my order?",
      answer: "You can track your order in real-time through the 'Orders' section of the app."
    },
    {
      question: "What payment methods are accepted?",
      answer: "We accept all major credit/debit cards, UPI, and cash on delivery."
    },
    {
      question: "How can I cancel my order?",
      answer: "You can cancel your order within 5 minutes of placing it through the 'Orders' section."
    }
  ];

  const handleCall = () => {
    Linking.openURL('tel:+1234567890');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:support@escapye.com');
  };

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/1234567890');
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={"transparent"} barStyle={'light-content'} />
      <LinearGradient colors={['#065E2C', '#F7F2F2']} style={styles.gradientContainer}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <FontAwesome6 name="arrow-left-long" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Support</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <View style={styles.contactOptions}>
            <TouchableOpacity style={styles.contactOption} onPress={handleCall}>
              <MaterialIcons name="phone" size={24} color="#065E2C" />
              <Text style={styles.contactText}>Call Support</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactOption} onPress={handleEmail}>
              <MaterialIcons name="email" size={24} color="#065E2C" />
              <Text style={styles.contactText}>Email Us</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactOption} onPress={handleWhatsApp}>
              <MaterialIcons name="chat" size={24} color="#065E2C" />
              <Text style={styles.contactText}>WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {faqs.map((faq, index) => (
            <View key={index} style={styles.faqItem}>
              <Text style={styles.question}>{faq.question}</Text>
              <Text style={styles.answer}>{faq.answer}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  gradientContainer: {
    // paddingTop: 10,
    paddingVertical: responsiveHeight(5),
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: responsiveWidth(5),
    // paddingBottom: responsiveHeight(3),
  },
  backButton: {
    marginRight: responsiveWidth(5),
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: responsiveWidth(5),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: responsiveHeight(2),
  },
  contactSection: {
    marginBottom: responsiveHeight(4),
  },
  contactOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: responsiveHeight(2),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contactOption: {
    alignItems: 'center',
    flex: 1,
  },
  contactText: {
    marginTop: 8,
    fontSize: 14,
    color: '#065E2C',
    fontWeight: '600',
  },
  faqSection: {
    marginBottom: responsiveHeight(4),
  },
  faqItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: responsiveHeight(2),
    marginBottom: responsiveHeight(2),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  answer: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default SupportScreen; 