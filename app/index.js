import { useEffect, useState } from "react";
import { StyleSheet, Text, View, LogBox } from "react-native";
import { useFonts } from "expo-font";
import * as Notifications from "expo-notifications";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import ChooseAvatar from "@/app/ChooseAvatar";
import ChooseLocation from "@/app/ChooseLocation";
import WorkSession from "@/app/WorkSession";
import SetupSession from "@/app/SetupSession";
import StartPage from "@/app/Onboarding/StartPage";
import FeedbackQ from "@/app/Onboarding/FeedbackQ";
import TimeQ from "@/app/Onboarding/TimeQ";
import ChooseSesh from "@/app/Onboarding/ChooseSesh";
import AboutAvatar from "@/app/AboutAvatar";
import Loading from "@/app/Loading";

import db from "@/database/db";

// Hides all console warnings
LogBox.ignoreAllLogs(true);

// Configure notification display behavior for foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const Stack = createStackNavigator();

export default function App() {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load fonts before rendering
  const [fontsLoaded] = useFonts({
    Nunito: require("../assets/fonts/Nunito-VariableFont_wght.ttf"),
  });

  useEffect(() => {
    async function requestPermissions() {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        await Notifications.requestPermissionsAsync();
      }
    }
    requestPermissions();
  }, []);

  useEffect(() => {
    setIsLoading(true);

    db.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = db.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!fontsLoaded) {
    return <Loading />;
  }

  // Override default Text styles so all fonts are Nunito
  const defaultTextStyle = { fontFamily: "Nunito" };

  const originalTextRender = Text.render;
  Text.render = function render(props, ref) {
    return originalTextRender.call(this, {
      ...props,
      style: [defaultTextStyle, props.style],
      ref,
    });
  };

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="StartPage" component={StartPage} />
        <Stack.Screen name="ChooseAvatar" component={ChooseAvatar} />
        <Stack.Screen name="FeedbackQ" component={FeedbackQ} />
        <Stack.Screen name="TimeQ" component={TimeQ} />
        <Stack.Screen name="AboutAvatar" component={AboutAvatar} />
        <Stack.Screen name="ChooseLocation" component={ChooseLocation} />
        <Stack.Screen name="SetupSession" component={SetupSession} />
        <Stack.Screen name="WorkSession" component={WorkSession} />
        <Stack.Screen name="ChooseSesh" component={ChooseSesh} />        
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Apply default font style safely using StyleSheet
const styles = StyleSheet.create({
  text: {
    fontFamily: "Nunito",
  },
});
