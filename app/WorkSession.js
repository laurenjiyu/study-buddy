import React, { useState, useEffect, useRef } from "react";
import { Image, Text, View, StyleSheet, TouchableOpacity, Animated } from "react-native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import WorkingAvatar from "@/components/WorkingAvatar";
import TextBubble from "@/components/TextBubble";
import { getCompletion } from "./OpenAI";
import { workingImages } from "@/assets/imgPaths";
import { Audio } from "expo-av";
import BreakCountdownModal from "@/components/BreakCountdownModal";
import theme from "@/assets/theme";


export default function WorkSession({ sessionDuration, avatarName, onSessionEnd, mode }) {
    const [accumulatedWorking, setAccumulatedWorking] = useState(0);
    const [accumulatedBreak, setAccumulatedBreak] = useState(0);

    // currentElapsed tracks seconds elapsed since the current period began.
    const [currentElapsed, setCurrentElapsed] = useState(0);

    const [curMode, setCurMode] = useState(mode);
    const [timerPaused, setTimerPaused] = useState(false);

    // UI state for modals and animations.
    const [showEndModal, setShowEndModal] = useState(false);
    const [showPauseModal, setShowPauseModal] = useState(false);
    const [showBreakModal, setShowBreakModal] = useState(false);
    const [showAnimation, setShowAnimation] = useState(true);
    const [showMotivation, setShowMotivation] = useState(false);
    const [motivationText, setMotivationText] = useState("");

    const timerRef = useRef(null);
    const progressAnim = useRef(new Animated.Value(0)).current;

    const [lastMotivationIndex, setLastMotivationIndex] = useState(0);


    // modeStartRef holds the timestamp when the current period began.
    const modeStartRef = useRef(Date.now());
    const [pauseStartTime, setPauseStartTime] = useState(null);
    const enableAudio = async () => {
        await Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
            shouldDuckAndroid: false,
        })
    };
    const playWorkEndSound = async () => {
        try {
            await enableAudio();
            for (let i = 0; i < 3; i++) {
                const _sound = new Audio.Sound();
                await _sound.loadAsync(require("@/assets/sounds/work_end.m4a"), { shouldPlay: true });
                await _sound.setPositionAsync(0);
                await _sound.playAsync();

                // Wait for 1 second before playing the next sound
                await new Promise((resolve) => setTimeout(resolve, 2000));

                await _sound.unloadAsync();
            }
        } catch (error) {
            console.error("Error playing work end sound:", error);
        }
    };

    // Timer effect updates currentElapsed every 1000ms when not paused.
    useEffect(() => {
        modeStartRef.current = Date.now();
        setCurrentElapsed(0);
        timerRef.current = setInterval(() => {
            const elapsed = Math.floor((Date.now() - modeStartRef.current) / 1000);
            setCurrentElapsed(elapsed);

            // End the session if the working time reaches sessionDuration.
            if (curMode === "working" && (accumulatedWorking + elapsed) >= sessionDuration) {
                clearInterval(timerRef.current);
                playWorkEndSound();
                onSessionEnd({ workingSeconds: sessionDuration, breakSeconds: accumulatedBreak });
            };
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [timerPaused, curMode, accumulatedWorking, accumulatedBreak, sessionDuration, onSessionEnd]);

    // Update the progress bar.
    useEffect(() => {
        const progress =
            curMode === "working"
                ? (accumulatedWorking + currentElapsed) / sessionDuration
                : accumulatedWorking / sessionDuration; // Freeze progress in break mode
        Animated.timing(progressAnim, {
            toValue: Math.min(progress, 1),
            duration: 250,
            useNativeDriver: false,
        }).start();
    }, [accumulatedWorking, currentElapsed, sessionDuration, curMode]);

    useEffect(() => {
        if (curMode === "working") {
            // Total working seconds is the banked working time plus the current elapsed seconds.
            const totalWorking = accumulatedWorking + currentElapsed;
            // Calculate the current block (each block is 5 minutes = 300 seconds).
            const currentIndex = Math.floor(totalWorking / 300);
            // Only trigger if we have advanced into a new block.
            if (currentIndex > lastMotivationIndex) {
                setLastMotivationIndex(currentIndex);
                getCompletion(`Persona: ${avatarName}. Provide a brief motivational message for the user.`)
                    .then(message => {
                        setMotivationText(message);
                        setShowMotivation(true);
                        setTimeout(() => setShowMotivation(false), 30000);
                    })
                    .catch(err => console.error("Error fetching motivation:", err));
            }
        }
    }, [accumulatedWorking, currentElapsed, curMode, lastMotivationIndex, avatarName]);

    // When the user presses pause:
    //  - If in working mode, bank the working time and switch to break.
    //  - Record the pause start so that paused time is later added as break seconds.
    const handlePause = () => {
        clearInterval(timerRef.current);
        timerRef.current = null;
        if (curMode === "working") {
            setAccumulatedWorking((prev) => prev + currentElapsed);
            setCurMode("break");
        }
        setTimerPaused(true);
        setShowMotivation(false);
        setShowPauseModal(true);
        setShowAnimation(false);
        setPauseStartTime(Date.now());
    };

    // Instead of immediately resetting the timer to break mode,
    // we show the break modal that counts down from 5 minutes.
    const startBreak = () => {
        setShowBreakModal(true);
        setShowEndModal(false);
        setShowPauseModal(false);
        setShowMotivation(false);
    };

    const handlePauseModalResume = async () => {
        setShowPauseModal(false);
        setShowEndModal(false);
        setShowBreakModal(false);
        setShowAnimation(true);
        setCurMode("working");
        setTimerPaused(false);
        if (pauseStartTime) {
            const pausedFor = Math.floor((Date.now() - pauseStartTime) / 1000);
            setAccumulatedBreak((prev) => prev + pausedFor);
            setPauseStartTime(null);
        }
        // Fetch and display an AI message when resuming.
        try {
            const message = await getCompletion(
                `Persona: ${avatarName}. Provide a motivational message for resuming work.`
            );
            setMotivationText(message);
            setShowMotivation(true);
            setTimeout(() => setShowMotivation(false), 12000);
        } catch (error) {
            console.error("Error fetching AI message:", error);
        }
    };



    // Quit early, combining any in-progress elapsed time.
    const handleQuit = () => {
        clearInterval(timerRef.current);
        onSessionEnd({
            workingSeconds: accumulatedWorking + (curMode === "working" ? currentElapsed : 0),
            breakSeconds: accumulatedBreak + (curMode === "break" ? currentElapsed : 0),
        });
    };

    const handleAvatarPress = async () => {
        try {
            setShowMotivation(false);
            const message = await getCompletion(
                `Persona: ${avatarName}. Provide a brief sentence of motivation/nudging for the user based on the persona.`
            );
            setMotivationText(message);
            setShowMotivation(true);
            setTimeout(() => setShowMotivation(false), 12000);
        } catch (error) {
            console.error("Error fetching motivation:", error);
        }
    };

    const formatTime = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    };

    return (
        <>
            {showAnimation ? (
                <TouchableOpacity onPress={handleAvatarPress} activeOpacity={0.8}>
                    <WorkingAvatar avatarName={avatarName} />
                </TouchableOpacity>
            ) : (
                <Image source={workingImages[`${avatarName}1`]} style={styles.avatarImg} />
            )}

            {showMotivation && (
                <TextBubble moreStyle={styles.motivationBubble} text={motivationText} />
            )}

            <View style={styles.container}>
                {/* Display Timer */}
                <View style={styles.timerContainer}>
                    <Text style={styles.timerText}>
                        {curMode === "working"
                            ? formatTime(sessionDuration - (accumulatedWorking + currentElapsed))
                            : formatTime(sessionDuration - accumulatedWorking)}
                    </Text>
                </View>

                {/* Progress Bar & Info */}
                <View style={styles.progressContainer}>
                    <Text style={styles.progressTitle}>
                        {curMode === "working"
                            ? `Working - ${Math.floor(sessionDuration / 60)} min`
                            : "Break"}
                    </Text>
                    <Text style={styles.progressSubtitle}>
                        {`${Math.floor((sessionDuration - accumulatedWorking) / 60)} min remaining`}
                    </Text>
                    <View style={styles.progressBackground}>
                        <Animated.View
                            style={[
                                styles.progressFill,
                                {
                                    width: progressAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: ["0%", "100%"],
                                    }),
                                },
                            ]}
                        />
                    </View>
                </View>

                {/* Controls */}
                <View style={styles.controls}>
                    <TouchableOpacity
                        style={styles.controlButton}
                        onPress={timerPaused ? handlePauseModalResume : () => { handlePause(); setShowPauseModal(true); }}
                    >
                        <FontAwesome6 name={timerPaused ? "play" : "pause"} size={20} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.controlButton}
                        onPress={timerPaused ? handlePauseModalResume : () => { handlePause(); setShowEndModal(true); }}
                    >
                        <FontAwesome6 name="xmark" size={20} color="black" />
                    </TouchableOpacity>
                </View>

                {/* Paused Modal */}
                {showPauseModal && (
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>Paused</Text>
                            <Text style={styles.modalSubtitle}>Ok, but don’t take too long! Come back soon!</Text>
                            <TouchableOpacity style={styles.resumeButton} onPress={handlePauseModalResume}>
                                <Text style={styles.resumeButtonText}>Resume</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* End Modal */}
                {showEndModal && (
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>End session?</Text>
                            <Text style={styles.modalSubtitle}>
                                Would you like to continue working, or end the session?
                            </Text>
                            <TouchableOpacity style={styles.modalButton} onPress={handleQuit}>
                                <Text style={styles.modalButtonText}>End Session</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, styles.activeButton]} onPress={handlePauseModalResume}>
                                <Text style={styles.modalButtonText}>Continue Working</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Break Countdown Modal */}
                {showBreakModal && (
                    <BreakCountdownModal
                        visible={showBreakModal}
                        onCountdownFinish={handlePauseModalResume}  // Resume only when user clicks the button.
                        onTick={(sec) => {
                            setAccumulatedBreak(prev => prev + sec);
                        }}
                    />
                )}

            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    timerContainer: {
        position: "absolute",
        top: 90,
        transform: [{ translateX: 85 }],
        backgroundColor: "#94B2A7",
        paddingVertical: 10,
        paddingHorizontal: 25,
        borderRadius: 10,
    },
    timerText: {
        fontSize: 28,
        color: "black",
        fontWeight: "bold",
    },
    progressContainer: {
        position: "absolute",
        bottom: 100,
        width: "85%",
        backgroundColor: "#94B2A7",
        padding: 15,
        borderRadius: 12,
    },
    progressTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "black",
    },
    progressSubtitle: {
        fontSize: 14,
        color: "black",
        marginBottom: 5,
    },
    progressBackground: {
        height: 8,
        borderRadius: 5,
        backgroundColor: "#fff",
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        backgroundColor: "black",
        borderRadius: 5,
    },
    controls: {
        position: "absolute",
        bottom: 30,
        flexDirection: "row",
        justifyContent: "space-around",
        width: "30%",
    },
    controlButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: "black",
        justifyContent: "center",
        alignItems: "center",
    },
    motivationBubble: {
        position: "absolute",
        top: 250,
        alignSelf: "center",
        zIndex: 2,
    },
    modalOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        width: "75%",
        backgroundColor: "white",
        borderRadius: 15,
        padding: 20,
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
    },
    modalSubtitle: {
        fontSize: 14,
        textAlign: "center",
        color: "#555",
        marginBottom: 20,
    },
    resumeButton: {
        backgroundColor: "#D9D9D9",
        paddingVertical: 10,
        paddingHorizontal: 25,
        borderRadius: 8,
    },
    resumeButtonText: {
        fontSize: 16,
        fontWeight: "bold",
    },
    modalButton: {
        backgroundColor: theme.colors.lightGray,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 50,
        marginVertical: 5,
        width: "80%",
        alignItems: "center"
    },
    activeButton: {
        backgroundColor: theme.colors.darkGray,
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "black",
    },
    avatarImg: {
        height: 800,             // Fixed height
        width: 400,              // Fixed width
        position: "absolute",  
        bottom: -250 
      },
    breakModalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
    },
    breakModalContainer: {
        width: "75%",
        backgroundColor: "white",
        borderRadius: 15,
        padding: 20,
        alignItems: "center",
    },
    breakModalTitle: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
    },
    breakModalCountdown: {
        fontSize: 48,
        fontWeight: "bold",
        marginVertical: 10,
    },
    breakModalSubtitle: {
        fontSize: 16,
        color: "#555",
    },
});
