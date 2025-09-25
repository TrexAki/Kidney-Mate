import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { firestore } from './firebaseConfig';

export default function DialysisScheduling() {
  const [technicians, setTechnicians] = useState([]);

  useEffect(() => {
    const unsubscribe = firestore
      .collection('dialysis_technicians')
      .onSnapshot(snapshot => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTechnicians(data);
      });

    return () => unsubscribe();
  }, []);

  const handleCall = (number) => {
    Linking.openURL(`tel:${number}`);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.hospital}>🏥 {item.hospital}</Text>
      <Text>Contact: {item.contact}</Text>
      <Text>On-call Charges: ₹{item.charges}</Text>

      <TouchableOpacity style={styles.callButton} onPress={() => handleCall(item.contact)}>
        <Text style={styles.callButtonText}>📞 Call Technician</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Dialysis Scheduling</Text>
      <FlatList
        data={technicians}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={{ textAlign: 'center' }}>No technicians available.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#e3f2fd',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1565c0',
    marginBottom: 12,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  hospital: {
    color: '#333',
    marginBottom: 4,
  },
  callButton: {
    marginTop: 10,
    backgroundColor: '#1e88e5',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  callButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
