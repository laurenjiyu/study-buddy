import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  TextInput,
  StyleSheet,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Keyboard,
  Text,
} from "react-native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Theme from "@/assets/theme";

export default function ChatSection({
  visible,
  onClose,
  placeholder = "Type your task for this session...",
  suggestions = [],
  keyboardType = "default",
}) {
  const inputRef = useRef(null);
  const [inputText, setInputText] = useState("");
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showListener = Keyboard.addListener("keyboardDidShow", () =>
      setKeyboardVisible(true)
    );
    const hideListener = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardVisible(false)
    );

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  const handleSubmit = () => {
    if (inputText.trim().length > 0) {
      onClose(inputText);
      setInputText("");
    }
  };

  const inputSuggestion = (suggestion) => {
    setInputText(suggestion);
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={() => onClose("")}
      hardwareAccelerated
    >
      <TouchableWithoutFeedback>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={[
              styles.modalContent,
              keyboardType === "default" && isKeyboardVisible
                ? { minHeight: "50%" }
                : {},
            ]}
          >
            <View style={styles.inputWrapper}>
              <View style={styles.inputLeft}>
                <TextInput
                  ref={inputRef}
                  style={styles.input}
                  placeholder={placeholder}
                  autoFocus
                  keyboardType={keyboardType}
                  value={inputText}
                  onChangeText={setInputText}
                  onSubmitEditing={handleSubmit}
                  blurOnSubmit={false}
                />
                <View style={styles.choicesRow}>
                  {suggestions.map((option, index) => (
                    <TouchableOpacity key={index} style={styles.singleChoice} onPress={() =>  setInputText(option)}>
                      <Text>{option}</Text>
                    </TouchableOpacity>
                  ))}{" "}
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  { backgroundColor: inputText.trim() ? "#1DC0A5" : "#ccc" },
                ]}
                onPress={handleSubmit}
                disabled={!inputText.trim()} // Disable button when input is empty
              >
                <FontAwesome6 name="arrow-right" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    width: "100%",
    backgroundColor: "white",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    elevation: 5,
    minHeight: "35%",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 25,
    overflow: "hidden",
    backgroundColor: "white",
    minHeight: 50,
  },
  input: {
    fontSize: 18,
    backgroundColor: "transparent",
  },
  submitButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 5,
  },
  inputLeft: {
    flexDirection: "column",
    flex: 1,
    paddingHorizontal: 15,
  },
  choicesRow: {
    flexDirection: "row",
    marginVertical: 10,
    gap: 10,
  },
  singleChoice: {
    backgroundColor: Theme.colors.lightGray,
    padding: 2,
    paddingHorizontal: 15,
    borderRadius: 15,
  }
});
