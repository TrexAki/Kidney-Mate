import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { firestore, auth } from './firebaseConfig';

export default function MedicationReminders() {
  const [medName, setMedName] = useState('');
  const [dose, setDose] = useState('');
  const [time, setTime] = useState('');
  const [medications, setMedications] = useState([]);

  const userId = auth.currentUser.uid;

  // Fetch medications from Firestore
  useEffect(() => {
    const unsubscribe = firestore
      .collection('users')
      .doc(userId)
      .collection('medications')
      .onSnapshot(snapshot => {
        const meds = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMedications(meds);
      });

    return () => unsubscribe();
  }, []);

  const addMedication = () => {
    if (!medName || !dose || !time) {
      Alert.alert('Please fill all fields');
      return;
    }
    firestore
      .collection('users')
      .doc(userId)
      .collection('medications')
      .add({ medName, dose, time })
      .then(() => {
        setMedName('');
        setDose('');
        setTime('');
      })
      .catch(error => {
        Alert.alert('Error adding medication:', error.message);
      });
  };

  const deleteMedication = (id) => {
    firestore
      .collection('users')
      .doc(userId)
      .collection('medications')
      .doc(id)
      .delete()
      .catch(error => {
        Alert.alert('Error deleting medication:', error.message);
      });
  };

  const renderItem = ({ item }) => (
    <View style={styles.medItem}>
      <View>
        <Text style={styles.medName}>{item.medName}</Text>
        <Text>Dose: {item.dose}</Text>
        <Text>Time: {item.time}</Text>
      </View>
      <TouchableOpacity onPress={() => deleteMedication(item.id)}>
        <Text style={styles.deleteBtn}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Medication Reminders</Text>

      <TextInput
        style={styles.input}
        placeholder="Medication Name"
        value={medName}
        onChangeText={setMedName}
      />
      <TextInput
        style={styles.input}
        placeholder="Dose"
        value={dose}
        onChangeText={setDose}
      />
      <TextInput
        style={styles.input}
        placeholder="Time (e.g. 8:00 AM)"
        value={time}
        onChangeText={setTime}
      />

      <TouchableOpacity style={styles.addButton} onPress={addMedication}>
        <Text style={styles.addButtonText}>Add Medication</Text>
      </TouchableOpacity>

      <FlatList
        data={medications}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        style={{ width: '100%' }}
        ListEmptyComponent={<Text>No medications added yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e6f2ff',
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderColor: '#1a237e',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  addButton: {
    backgroundColor: '#1a237e',
    padding: 14,
    borderRadius: 30,
    marginBottom: 20,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  medItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  medName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  deleteBtn: {
    color: '#b71c1c',
    fontWeight: 'bold',
  },
});
