import { useState } from "react";
import { StyleSheet, Text, View, TextInput } from "react-native";

import Theme from "@/assets/theme";

export default function NewPost() {
  const [username, setUsername] = useState(null);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const submitPost = async () => {
    setIsLoading(true);
    // TODO
    setIsLoading(false);
  };

  const submitDisabled = isLoading || inputText.length === 0;

  return (
    <View style={styles.container}>
      <View style={styles.nameInputContainer}>
        <Text style={styles.nameInputPrompt}>Post as:</Text>
        <TextInput
          style={styles.nameInput}
          value={username}
          onChangeText={setUsername}
          placeholder={"Anonymous"}
          placeholderTextColor={Theme.colors.textTertiary}
        />
      </View>
      <TextInput
        style={styles.input}
        value={inputText}
        onChangeText={setInputText}
        placeholder={"What do you want to share?"}
        placeholderTextColor={Theme.colors.textSecondary}
        multiline
        textAlignVertical="top"
        autoFocus
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: Theme.colors.backgroundPrimary,
  },
  nameInputContainer: {
    width: "100%",
    padding: 16,
    gap: 8,
  },
  nameInputPrompt: {
    color: Theme.colors.textPrimary,
  },
  nameInput: {
    color: Theme.colors.textSecondary,
  },
  headerButtonTextPrimary: {
    fontSize: 18,
    color: Theme.colors.textHighlighted,
  },
  input: {
    color: Theme.colors.textPrimary,
    backgroundColor: Theme.colors.backgroundSecondary,
    flex: 1,
    width: "100%",
    padding: 16,
  },
});
