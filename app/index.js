import { useEffect, useState } from "react";
import { StyleSheet, Text, View, LogBox } from "react-native";
import { useFonts } from "expo-font";
import * as Notifications from "expo-notifications";
import { Redirect } from "expo-router";

import ChooseAvatar from "@/app/ChooseAvatar";
import ChooseLocation from "@/app/ChooseLocation";
import SetupSession from "@/app/SetupSession";

import db from "@/database/db";
import Loading from "@/app/Loading";

// Hides all console warnings
LogBox.ignoreAllLogs(true);

// Configure notification display behavior for foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false, // optional: do not set app icon badge
  }),
});

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
    requestPermissions(); // Call the async function inside useEffect
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

  if (session) {
    return <Redirect href="/TODO/fill/in/route" />;
  } else if (isLoading) {
    return <Loading />;
  } else {
    return <SetupSession />;
  }
}

// Apply default font style safely using StyleSheet
const styles = StyleSheet.create({
  text: {
    fontFamily: "Nunito",
  },
});
