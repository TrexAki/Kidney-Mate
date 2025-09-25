KidneyMate is a mobile application designed to support kidney transplant patients in managing their health journey. It provides tools for medication reminders, doctor appointments, health logs, and lifestyle tracking to make recovery and long-term care easier.

✨ Features

📅 Medication Reminders – Get notified for every dose on time.
🩺 Doctor Appointments – Track upcoming consultations and follow-ups.
📊 Health Logs – Record vitals like blood pressure, sugar levels, and weight.
🍎 Diet & Lifestyle Tips – Guidance to support recovery and wellness.
🔐 Secure Login – Phone number OTP authentication via Firebase.
☁️ Cloud Sync – Store data securely and access across devices.
🛠️ Tech Stack

Frontend: React Native / Expo
Backend: Firebase (Authentication, Firestore, Storage)
Notifications: Firebase Cloud Messaging (FCM)
Platform: Android & iOS

🚀 Getting Started
Prerequisites
Node.js and npm installed
Expo CLI installed (npm install -g expo-cli)
Firebase project set up

Installation
Clone the repository:
git clone https://github.com/your-username/kidneymate.git
cd kidneymate


Install dependencies:
npm install
Start the project:
expo start


🔑 Authentication Setup
Phone number-based OTP login is powered by Firebase.
Add your SHA-1 fingerprint in the Firebase Console under your Android app settings.
Update the google-services.json and GoogleService-Info.plist files for Android/iOS.

