import React from "react";
import { View, StyleSheet } from "react-native";
import AITextBubble from "@/components/AITextBubble";
import AnimatedAvatar from "@/components/AvatarAnimation"; 
import Button from "@/components/Button";

export default function Intro({ avatarName, setSessionStage }) {
  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <AnimatedAvatar avatarName={avatarName} />
        <AITextBubble
          prompt={`Persona: ${avatarName}. Greet the user and tell them you'll start working soon.`}
          moreStyle={styles.textBubble}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          style={styles.button}
          clickable={true}
          text="Next"
          onPress={() => setSessionStage("workTopic")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
  },
  avatarContainer: {
    flex: 1,
    alignItems: "center",
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 30,
  },
  button: {
    width: "80%",
  },
  textBubble: {
    marginTop: 20,
  },
});
