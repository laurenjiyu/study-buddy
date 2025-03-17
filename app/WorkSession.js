import React, { useState, useEffect, useRef } from "react";
import {
    Image,
    Text,
    View,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Modal,
    FlatList,
} from "react-native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import WorkingAvatar from "@/components/WorkingAvatar";
import TextBubble from "@/components/TextBubble";
import { getCompletion } from "./OpenAI";
import { workingImages } from "@/assets/imgPaths";
import { Audio } from "expo-av";
import BreakCountdownModal from "@/components/BreakCountdownModal";
import theme from "@/assets/theme";

const musicTracks = [
    { name: "Cozy", file: require("@/assets/music/cozy.mp3") },
    { name: "Hip Hop", file: require("@/assets/music/hiphop.mp3") },
    { name: "Spring", file: require("@/assets/music/spring.mp3") },
    { name: "Rain", file: require("@/assets/music/rain.mp3") },
    { name: "LofiGirl1", file: require("@/assets/music/lofigirl1.mp3") },
    { name: "LofiGirl2", file: require("@/assets/music/lofigirl2.mp3") },
];

export default function WorkSession({ sessionDuration, avatarName, onSessionEnd, mode }) {
    // Session state
    const [accumulatedWorking, setAccumulatedWorking] = useState(0);
    const [accumulatedBreak, setAccumulatedBreak] = useState(0);
    const [currentElapsed, setCurrentElapsed] = useState(0);
    const [curMode, setCurMode] = useState(mode);
    const [timerPaused, setTimerPaused] = useState(false);

    // UI state for modals & animations
    const [showEndModal, setShowEndModal] = useState(false);
    const [showPauseModal, setShowPauseModal] = useState(false);
    const [showBreakModal, setShowBreakModal] = useState(false);
    const [showAnimation, setShowAnimation] = useState(true);
    const [showMotivation, setShowMotivation] = useState(false);
    const [motivationText, setMotivationText] = useState("");

    // Music state
    const [showMusicModal, setShowMusicModal] = useState(false);
    const [musicPlaying, setMusicPlaying] = useState(false);
    const [currentTrack, setCurrentTrack] = useState(null);
    const soundRef = useRef(null);

    const timerRef = useRef(null);
    const progressAnim = useRef(new Animated.Value(0)).current;
    const [lastMotivationIndex, setLastMotivationIndex] = useState(0);
    const modeStartRef = useRef(Date.now());
    const [pauseStartTime, setPauseStartTime] = useState(null);

    // Calculate remaining seconds/minutes
    const remainingSeconds =
        curMode === "working"
            ? sessionDuration - (accumulatedWorking + currentElapsed)
            : sessionDuration - accumulatedWorking;
    const remainingMinutes = Math.floor(remainingSeconds / 60);

    // Helper: enable audio mode
    const enableAudio = async () => {
        await Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
            shouldDuckAndroid: false,
            playsInSilentModeIOS: true,  // Ensures audio plays even when silent mode is on
        });
    };

    // Play work end sound
    const playWorkEndSound = async () => {
        try {
            await stopMusic();
            await enableAudio();
            for (let i = 0; i < 3; i++) {
                const _sound = new Audio.Sound();
                await _sound.loadAsync(require("@/assets/sounds/work_end.m4a"), { shouldPlay: true });
                await _sound.setPositionAsync(0);
                await _sound.playAsync();
                await new Promise((resolve) => setTimeout(resolve, 2000));
                await _sound.unloadAsync();
            }
        } catch (error) {
            console.error("Error playing work end sound:", error);
        }
    };

    // --- Music Functions ---
    const toggleMusic = async () => {
        if (musicPlaying) {
            await stopMusic();
        } else {
            setShowMusicModal(true);
        }
    };

    const playMusic = async (track) => {
        try {
            enableAudio();
            if (soundRef.current) {
                await soundRef.current.unloadAsync();
            }
            const { sound } = await Audio.Sound.createAsync(track.file, {
                shouldPlay: true,
                isLooping: true,
            });
            soundRef.current = sound;
            setCurrentTrack(track);
            setMusicPlaying(true);
            setShowMusicModal(false);
        } catch (error) {
            console.error("Error playing music:", error);
        }
    };

    const stopMusic = async () => {
        if (soundRef.current) {
            await soundRef.current.stopAsync();
            await soundRef.current.unloadAsync();
        }
        setMusicPlaying(false);
        setCurrentTrack(null);
    };

    // --- Timer Effect ---
    useEffect(() => {
        modeStartRef.current = Date.now();
        setCurrentElapsed(0);
        timerRef.current = setInterval(() => {
            const elapsed = Math.floor((Date.now() - modeStartRef.current) / 1000);
            setCurrentElapsed(elapsed);

            if (curMode === "working" && (accumulatedWorking + elapsed) >= sessionDuration) {
                clearInterval(timerRef.current);
                playWorkEndSound();
                onSessionEnd({ workingSeconds: sessionDuration, breakSeconds: accumulatedBreak });
            }
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [timerPaused, curMode, accumulatedWorking, accumulatedBreak, sessionDuration, onSessionEnd]);

    // --- Progress Bar Effect ---
    useEffect(() => {
        const progress =
            curMode === "working"
                ? (accumulatedWorking + currentElapsed) / sessionDuration
                : accumulatedWorking / sessionDuration;
        Animated.timing(progressAnim, {
            toValue: Math.min(progress, 1),
            duration: 250,
            useNativeDriver: false,
        }).start();
    }, [accumulatedWorking, currentElapsed, sessionDuration, curMode]);

    // --- Motivation Effect ---
    useEffect(() => {
        if (curMode === "working") {
            const totalWorking = accumulatedWorking + currentElapsed;
            const currentIndex = Math.floor(totalWorking / 300);
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

    // --- Pause Handler ---
    const handlePause = async () => {
        clearInterval(timerRef.current);
        timerRef.current = null;
        if (curMode === "working") {
            setAccumulatedWorking(prev => prev + currentElapsed);
            setCurMode("break");
        }
        if (musicPlaying) {
            await stopMusic();
        }
        setTimerPaused(true);
        setShowMotivation(false);
        setShowPauseModal(true);
        setShowAnimation(false);
        setPauseStartTime(Date.now());
    };

    // --- Start Break: Show Break Modal ---
    const startBreak = () => {
        setShowBreakModal(true);
        setShowEndModal(false);
        setShowPauseModal(false);
        setShowMotivation(false);
    };

    // --- Resume Handler ---
    const handlePauseModalResume = async () => {
        setShowPauseModal(false);
        setShowEndModal(false);
        setShowBreakModal(false);
        setShowAnimation(true);
        setCurMode("working");
        setTimerPaused(false);
        if (pauseStartTime) {
            const pausedFor = Math.floor((Date.now() - pauseStartTime) / 1000);
            setAccumulatedBreak(prev => prev + pausedFor);
            setPauseStartTime(null);
        }
        try {
            const message = await getCompletion(`Persona: ${avatarName}. Provide a motivational message for resuming work.`);
            setMotivationText(message);
            setShowMotivation(true);
            setTimeout(() => setShowMotivation(false), 12000);
        } catch (error) {
            console.error("Error fetching AI message:", error);
        }
    };

    // --- Quit Handler ---
    const handleQuit = async () => {
        clearInterval(timerRef.current);
        if (musicPlaying) {
            await stopMusic();
        }
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

    // Format time as HH:MM:SS
    const formatTime = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    };

    return (
        <>
<TouchableOpacity
  style={[
    styles.controlButton,
    { position: "absolute", top: 97, left: 40 }
  ]}
  onPress={toggleMusic}
>                        <FontAwesome6 name="music" size={20} color={musicPlaying ? "#1DC0A5" : "black"} />
                    </TouchableOpacity>
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
                        {`${remainingMinutes} min remaining`}
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
                    {/* Music Button */}
                    
                    <TouchableOpacity
                        style={styles.controlButton}
                        onPress={
                            timerPaused
                                ? handlePauseModalResume
                                : () => {
                                    handlePause();
                                    setShowPauseModal(true);
                                }
                        }
                    >
                        <FontAwesome6 name={timerPaused ? "play" : "pause"} size={20} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.motivationButton} onPress={handleAvatarPress}>
                    <Text style={styles.motivationButtonText}>{`Nudge ${avatarName.split(" ").slice(1).join(" ")}`}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.controlButton}
                        onPress={
                            timerPaused
                                ? handlePauseModalResume
                                : () => {
                                    handlePause();
                                    setShowEndModal(true);
                                }
                        }
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
                            <TouchableOpacity style={styles.modalButton} onPress={handlePauseModalResume}>
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
                        onCountdownFinish={handlePauseModalResume}
                        onTick={(sec) => {
                            setAccumulatedBreak(prev => prev + sec);
                        }}
                    />
                )}

                {/* Music Selection Modal */}
                <Modal visible={showMusicModal} transparent animationType="slide">
                    <View style={musicStyles.modalOverlay}>
                        <View style={musicStyles.modalContainer}>
                            <Text style={musicStyles.modalTitle}>Select Lofi Music</Text>
                            <FlatList
                                data={musicTracks}
                                keyExtractor={(item) => item.name}
                                numColumns={2}
                                contentContainerStyle={musicStyles.modalButtonContainer}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={musicStyles.modalButton}
                                        onPress={() => playMusic(item)}
                                    >
                                        {/* Single-line text with smaller font */}
                                        <Text style={musicStyles.modalButtonText} numberOfLines={1} ellipsizeMode="tail">
                                            {item.name}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            />
                            <TouchableOpacity style={[musicStyles.modalButton, { width: "90%", backgroundColor: "#94B2A7" }]} onPress={() => setShowMusicModal(false)}>
                                <Text style={musicStyles.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

            </View>
        </>
    );
}

/** Music-specific styles, for a 2-column layout with consistent button sizes. */
const musicStyles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        width: "90%",
        maxHeight: "80%",
        backgroundColor: "white",
        borderRadius: 15,
        padding: 30,
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 20,
    },
    modalButtonContainer: {
        justifyContent: "space-evenly",
        alignItems: "center",
        paddingVertical: 10,
    },
    modalButton: {
        backgroundColor: "#D9D9D9",
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderRadius: 50,
        marginVertical: 10,
        marginHorizontal: 10,
        width: "40%", // Enough width for 2 columns with spacing
        alignItems: "center",
        justifyContent: "center",
    },
    modalButtonText: {
        fontSize: 14, // Smaller font to fit longer names on one line
        fontWeight: "bold",
        color: "black",
        textAlign: "center",
    },
});

/** General session styles. */
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
        bottom: 130,
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
        bottom: 60,
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        paddingHorizontal: 20,
        justifyContent: "space-evenly", // center horizontally with even spacing
    },
    controlButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#D9D9D9",
        justifyContent: "center",
        alignItems: "center",
    },
    motivationButton: {
        width: 170,
        height: 50,
        backgroundColor: "#D9D9D9",
        borderRadius: 50,
        fontSize: 18,
        color: "black",
        justifyContent: "center",
        alignItems: "center"
    },
    motivationButtonText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "black",

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
        alignItems: "center",
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
        height: 800,
        width: 400,
        position: "absolute",
        bottom: -250,
    },
});
