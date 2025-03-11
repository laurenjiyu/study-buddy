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
} from "react-native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

export default function ChatSection({
  visible,
  onClose,
  placeholder = "Type your task for this session...",
  keyboardType = "default",
}) {
  const inputRef = useRef(null);
  const [inputText, setInputText] = useState("");
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showListener = Keyboard.addListener("keyboardDidShow", () => setKeyboardVisible(true));
    const hideListener = Keyboard.addListener("keyboardDidHide", () => setKeyboardVisible(false));
    
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
              keyboardType === "default" && isKeyboardVisible ? { minHeight: "50%" } : {}, 
            ]}
          >
            <View style={styles.inputWrapper}>
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
    minHeight: "45%",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 25,
    overflow: "hidden",
    backgroundColor: "white",
  },
  input: {
    flex: 1,
    fontSize: 18,
    paddingVertical: 12,
    paddingHorizontal: 15,
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
});
