// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDqQDsXpviTweUGeWtJ2YlOyzc1hFi1hxQ",
  authDomain: "lytelode.firebaseapp.com",
  projectId: "lytelode",
  storageBucket: "lytelode.firebasestorage.app",
  messagingSenderId: "322258810725",
  appId: "1:322258810725:web:cfa24a47810cf76e5d138c",
  measurementId: "G-PF5ZDZ6SJH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);