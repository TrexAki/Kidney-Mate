import React from 'react';
import { View, Text, ScrollView, StyleSheet, Linking, TouchableOpacity } from 'react-native';

export default function HealthcareSchemes() {
  const openLink = (url) => {
    Linking.openURL(url).catch((err) => console.error('Error opening link:', err));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Government Healthcare Schemes for Dialysis Patients (India)</Text>

      <View style={styles.schemeCard}>
        <Text style={styles.schemeTitle}>1. Pradhan Mantri National Dialysis Programme (PMNDP)</Text>
        <Text style={styles.schemeText}>
          This scheme provides free dialysis services to Below Poverty Line (BPL) patients at government hospitals.
        </Text>
        <TouchableOpacity onPress={() => openLink('https://nhm.gov.in/index1.php?lang=1&level=2&sublinkid=830&lid=220')}>
          <Text style={styles.linkText}>Visit NHM Site</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.schemeCard}>
        <Text style={styles.schemeTitle}>2. Ayushman Bharat – PMJAY</Text>
        <Text style={styles.schemeText}>
          Under this scheme, eligible patients can get cashless dialysis sessions at empanelled hospitals.
        </Text>
        <TouchableOpacity onPress={() => openLink('https://pmjay.gov.in')}>
          <Text style={styles.linkText}>Visit PMJAY Site</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.schemeCard}>
        <Text style={styles.schemeTitle}>3. State-level Dialysis Schemes</Text>
        <Text style={styles.schemeText}>
          Many Indian states like Maharashtra, Tamil Nadu, Karnataka, etc., run their own free or subsidized dialysis programs for state residents.
        </Text>
        <Text style={styles.schemeText}>
          Contact your nearest district hospital or health department for local schemes.
        </Text>
      </View>

      <View style={styles.schemeCard}>
        <Text style={styles.schemeTitle}>4. Central Government Health Scheme (CGHS)</Text>
        <Text style={styles.schemeText}>
          CGHS beneficiaries (government employees & pensioners) can avail dialysis services at approved CGHS centers.
        </Text>
        <TouchableOpacity onPress={() => openLink('https://cghs.gov.in')}>
          <Text style={styles.linkText}>Visit CGHS Site</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.note}>
        *Note: Eligibility and benefits vary by state and income level. Please consult your doctor or nearest government hospital for assistance.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#e6f2ff',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#1a237e',
  },
  schemeCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3,
  },
  schemeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 8,
  },
  schemeText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 6,
  },
  linkText: {
    color: '#1565c0',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  note: {
    marginTop: 20,
    fontSize: 14,
    color: '#555',
    fontStyle: 'italic',
  },
});
