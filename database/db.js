import { AppState } from 'react-native'
import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fvthigtmdooeiovgfkfe.supabase.co'
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2dGhpZ3RtZG9vZWlvdmdma2ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4NzU2NzYsImV4cCI6MjA1NjQ1MTY3Nn0.dZpy1Is_vZ2KD_KkmebUoTukHc3WhyDCeYTiiYDhkWY"

const db = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Tells Supabase Auth to continuously refresh the session automatically
// if the app is in the foreground. When this is added, you will continue
// to receive `onAuthStateChange` events with the `TOKEN_REFRESHED` or
// `SIGNED_OUT` event if the user's session is terminated. This should
// only be registered once.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    db.auth.startAutoRefresh()
  } else {
    db.auth.stopAutoRefresh()
  }
});

export default db;