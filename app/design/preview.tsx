import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useDesignProject } from '../../src/contexts/DesignProjectContext';
import { useAuth } from '../../src/contexts/AuthContext';
import { Colors } from '../../src/theme/colors';
import { Spacing } from '../../src/theme/spacing';
import { Header } from '../../src/components/Header';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { Badge } from '../../src/components/Badge';
import { analyzeImage, askDesignerChat } from '../../src/services/api';
import { RoomAnalysisData, DesignStyle } from '../../src/types';
import { auth } from '../../src/services/firebase';

export default function PhotoPreviewScreen() {
  const router = useRouter();
  const { preferences, setPhotoUri, updatePreferences } = useDesignProject();
  const { getIdToken } = useAuth();
  const [rotationDegree, setRotationDegree] = useState(0);

  // AI Vision & Diagnosis State
  const [analyzing, setAnalyzing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<RoomAnalysisData | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Chat Modal State
  const [chatVisible, setChatVisible] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: 'Hello! I am your AI Spatial Architect. Once your room photograph is scanned, ask me anything about lighting, layout improvements, or what items to remove.',
    },
  ]);

  const photoUri = preferences.photoUri;

  const runRoomScan = async (uri: string) => {
    if (!uri) return;
    setAnalyzing(true);
    setAnalysisError(null);
    setDiagnosis(null);

    let idToken: string | undefined = undefined;
    try {
      const tok = await getIdToken();
      if (tok) {
        idToken = tok;
      } else if (auth?.currentUser) {
        idToken = await auth.currentUser.getIdToken(false);
      }
    } catch (e) {
      console.warn('[Vision] Token retrieval note:', e);
    }

    const res = await analyzeImage(uri, idToken);
    setAnalyzing(false);

    if (res.success && res.data) {
      setDiagnosis(res.data);
      // Auto-update suggested style in preferences if user hasn't explicitly chosen one yet
      if (res.data.suggestedTemplate) {
        updatePreferences({ style: res.data.suggestedTemplate as DesignStyle });
      }
      setMessages([
        {
          role: 'assistant',
          text: `Hello! I have analyzed your ${res.data.roomType}. Ask me anything about the identified flaws, recommended lighting, or how to arrange your layout!`,
        },
      ]);
    } else {
      // Problem 2 Fix: Do not fake successful diagnosis! Display actual API error.
      setAnalysisError(res.error || 'AI spatial analysis could not be completed. Please check connection and try again.');
    }
  };

  useEffect(() => {
    if (photoUri) {
      runRoomScan(photoUri);
    }
  }, [photoUri]);

  const handleRetake = () => {
    router.replace('/design/camera');
  };

  const handleChooseAnother = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.85,
    });
    if (!res.canceled && res.assets && res.assets[0]) {
      setPhotoUri(res.assets[0].uri);
    }
  };

  const handleRotate = () => {
    setRotationDegree(prev => (prev + 90) % 360);
  };

  const handleContinueWithTemplate = () => {
    if (!photoUri) {
      Alert.alert('Photo Missing', 'Please select or take a photo first.');
      return;
    }
    if (diagnosis?.suggestedTemplate) {
      updatePreferences({ style: diagnosis.suggestedTemplate as DesignStyle });
    }
    router.push('/design/preferences');
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userText = chatInput.trim();
    setChatInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setChatLoading(true);

    const history = messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.text,
    }));
    history.push({ role: 'user', content: userText });

    const context = diagnosis 
      ? `Room: ${diagnosis.roomType}, Detected: ${diagnosis.detectedObjects.join(', ')}, Template: ${diagnosis.suggestedTemplate}`
      : 'User uploaded room photo';

    let idToken: string | undefined = undefined;
    try {
      const tok = await getIdToken();
      if (tok) {
        idToken = tok;
      } else if (auth?.currentUser) {
        idToken = await auth.currentUser.getIdToken(false);
      }
    } catch (e) {
      console.warn('[Chat] Token lookup note:', e);
    }

    try {
      const res = await askDesignerChat(history, context, idToken);
      setChatLoading(false);

      if (res.success && res.reply) {
        setMessages(prev => [...prev, { role: 'assistant', text: res.reply }]);
      } else {
        const errorMsg = res.error?.includes('401')
          ? 'Authentication required. Please sign in to chat with the AI Spatial Architect.'
          : (res.error || 'The AI Architect was temporarily unable to reply. Please check your connection and try again.');
        setMessages(prev => [...prev, { role: 'assistant', text: errorMsg }]);
      }
    } catch (err: any) {
      setChatLoading(false);
      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          text: `Connection error: ${err.message || 'Unable to reach the AI design assistant. Please check your network connection.'}` 
        }
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Room AI Diagnosis" onBackPress={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Photo Stage */}
        <View style={styles.previewContainer}>
          {photoUri ? (
            <Image
              source={{ uri: photoUri }}
              style={[
                styles.previewImage,
                { transform: [{ rotate: `${rotationDegree}deg` }] },
              ]}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.noPhoto}>
              <Text style={styles.noPhotoText}>No photo selected</Text>
            </View>
          )}

          {/* Quick Edit Overlay */}
          <View style={styles.photoTopBadges}>
            <View style={[styles.scanBadge, analysisError ? { backgroundColor: 'rgba(220, 38, 38, 0.85)' } : null]}>
              <Ionicons 
                name={analyzing ? "sync-outline" : analysisError ? "alert-circle-outline" : "sparkles"} 
                size={13} 
                color="#FFFFFF" 
              />
              <Text style={styles.scanBadgeText}>
                {analyzing 
                  ? "Scanning Space..." 
                  : analysisError 
                    ? "Analysis Failed" 
                    : diagnosis?.isDemo 
                      ? "Demo Vision Mode" 
                      : diagnosis 
                        ? "AI Vision Inspected" 
                        : "Ready for Inspection"}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.rotateOverlayBtn}
            onPress={handleRotate}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh-outline" size={18} color="#FFFFFF" />
            <Text style={styles.rotateText}>Rotate</Text>
          </TouchableOpacity>
        </View>

        {/* AI Scanning Indicator */}
        {analyzing ? (
          <Card style={styles.scanningCard} variant="elevated">
            <ActivityIndicator size="small" color={Colors.primary} />
            <View style={styles.scanningTextWrap}>
              <Text style={styles.scanningTitle}>Analyzing Your Room with AI Vision...</Text>
              <Text style={styles.scanningSub}>Detecting lighting, layout flaws, and items to declutter.</Text>
            </View>
          </Card>
        ) : null}

        {/* Problem 2 Fix: Display Real Analysis Error & Retry Button */}
        {analysisError && !analyzing ? (
          <Card style={[styles.card, { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' }]} variant="outlined">
            <View style={styles.cardTitleRow}>
              <Ionicons name="alert-circle" size={20} color="#DC2626" />
              <Text style={[styles.cardTitle, { color: '#991B1B' }]}>Room Analysis Error</Text>
            </View>
            <Text style={{ fontSize: 13, color: '#7F1D1D', marginBottom: 12, lineHeight: 18 }}>
              {analysisError}
            </Text>
            <Button
              title="Retry AI Room Scan"
              variant="outline"
              onPress={() => {
                if (photoUri) runRoomScan(photoUri);
              }}
            />
          </Card>
        ) : null}

        {/* Diagnosis Results Breakdown */}
        {diagnosis && !analyzing ? (
          <View style={styles.diagnosisSection}>
            {/* Header Card */}
            <View style={styles.diagnosisHeaderRow}>
              <View>
                <Text style={styles.diagnosisRoomType}>{diagnosis.roomType}</Text>
                <Text style={styles.diagnosisSub}>
                  {diagnosis.isDemo ? 'Sample Demo inspection of space' : 'Personalized AI inspection of your space'}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                {diagnosis.isDemo && <Badge label="Demo" variant="secondary" />}
                <Badge label={diagnosis.suggestedTemplate || 'Modern'} variant="primary" />
              </View>
            </View>

            {/* Room Potential Scores */}
            {diagnosis.scores ? (
              <View style={styles.scoresRow}>
                <View style={styles.scoreBox}>
                  <Text style={styles.scoreVal}>{diagnosis.scores.lighting}</Text>
                  <Text style={styles.scoreLabel}>Lighting</Text>
                </View>
                <View style={styles.scoreBox}>
                  <Text style={styles.scoreVal}>{diagnosis.scores.spaciousness}</Text>
                  <Text style={styles.scoreLabel}>Spaciousness</Text>
                </View>
                <View style={styles.scoreBox}>
                  <Text style={styles.scoreVal}>{diagnosis.scores.coziness}</Text>
                  <Text style={styles.scoreLabel}>Coziness</Text>
                </View>
              </View>
            ) : null}

            {/* 🔍 Detected in Room */}
            {diagnosis.detectedObjects && diagnosis.detectedObjects.length > 0 ? (
              <Card style={styles.card} variant="subtle">
                <View style={styles.cardTitleRow}>
                  <Ionicons name="eye-outline" size={18} color={Colors.primary} />
                  <Text style={styles.cardTitle}>Detected in Your Space</Text>
                </View>
                <View style={styles.chipsWrap}>
                  {diagnosis.detectedObjects.map((obj: string, i: number) => (
                    <View key={i} style={styles.objectChip}>
                      <Text style={styles.objectChipText}>{obj}</Text>
                    </View>
                  ))}
                </View>
              </Card>
            ) : null}

            {/* ⚠️ Corrections Needed */}
            {diagnosis.correctionsNeeded && diagnosis.correctionsNeeded.length > 0 ? (
              <Card style={styles.card} variant="elevated">
                <View style={styles.cardTitleRow}>
                  <Ionicons name="alert-circle-outline" size={19} color="#D97706" />
                  <Text style={styles.cardTitle}>Corrections & Flaws Identified</Text>
                </View>
                {diagnosis.correctionsNeeded.map((correction: string, i: number) => (
                  <View key={i} style={styles.itemRow}>
                    <View style={styles.warningDot} />
                    <Text style={styles.itemText}>{correction}</Text>
                  </View>
                ))}
              </Card>
            ) : null}

            {/* 🗑️ What to Remove / Declutter */}
            {diagnosis.itemsToRemove && diagnosis.itemsToRemove.length > 0 ? (
              <Card style={styles.card} variant="subtle">
                <View style={styles.cardTitleRow}>
                  <Ionicons name="trash-outline" size={18} color="#DC2626" />
                  <Text style={styles.cardTitle}>What to Remove / Declutter</Text>
                </View>
                <Text style={styles.cardDesc}>
                  Removing these items will immediately recover open space and visual calm:
                </Text>
                {diagnosis.itemsToRemove.map((item: string, i: number) => (
                  <View key={i} style={styles.itemRow}>
                    <Ionicons name="close-circle-outline" size={16} color="#DC2626" />
                    <Text style={[styles.itemText, { marginLeft: 8 }]}>{item}</Text>
                  </View>
                ))}
              </Card>
            ) : null}

            {/* 🛠️ DIY Self-Improvements */}
            {diagnosis.diySelfImprovements && diagnosis.diySelfImprovements.length > 0 ? (
              <Card style={styles.card} variant="elevated">
                <View style={styles.cardTitleRow}>
                  <Ionicons name="construct-outline" size={19} color={Colors.primary} />
                  <Text style={styles.cardTitle}>How to Change on Your Own (DIY)</Text>
                </View>
                <Text style={styles.cardDesc}>
                  High-impact adjustments you can make without hiring expensive contractors:
                </Text>
                {diagnosis.diySelfImprovements.map((diy: string, i: number) => (
                  <View key={i} style={styles.diyRow}>
                    <View style={styles.stepNumCircle}>
                      <Text style={styles.stepNumText}>{i + 1}</Text>
                    </View>
                    <Text style={styles.diyText}>{diy}</Text>
                  </View>
                ))}
              </Card>
            ) : null}
          </View>
        ) : null}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Button
            title={`Apply "${diagnosis?.suggestedTemplate || 'Modern'}" Template & Redesign →`}
            onPress={handleContinueWithTemplate}
            style={styles.primaryAction}
          />

          <Button
            title="💬 Ask AI Architect About My Room"
            variant="outline"
            onPress={() => setChatVisible(true)}
            style={styles.chatActionBtn}
          />

          <View style={styles.secondaryRow}>
            <Button
              title="Re-Analyze"
              variant="outline"
              onPress={() => photoUri && runRoomScan(photoUri)}
              icon={<Ionicons name="refresh-outline" size={16} color={Colors.primary} />}
              style={styles.thirdBtn}
            />
            <Button
              title="Retake"
              variant="outline"
              onPress={handleRetake}
              icon={<Ionicons name="camera-outline" size={16} color={Colors.primary} />}
              style={styles.thirdBtn}
            />
            <Button
              title="Change"
              variant="outline"
              onPress={handleChooseAnother}
              icon={<Ionicons name="images-outline" size={16} color={Colors.primary} />}
              style={styles.thirdBtn}
            />
          </View>
        </View>
      </ScrollView>

      {/* Interactive Chat Modal with AI Architect */}
      <Modal
        visible={chatVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setChatVisible(false)}
      >
        <SafeAreaView style={styles.modalArea}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>AI Spatial Architect</Text>
              <Text style={styles.modalSub}>Consultation for your uploaded room photo</Text>
            </View>
            <TouchableOpacity onPress={() => setChatVisible(false)} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.chatScroll} contentContainerStyle={styles.chatScrollContent}>
            {messages.map((m, idx) => (
              <View 
                key={idx} 
                style={[styles.chatBubble, m.role === 'user' ? styles.userBubble : styles.aiBubble]}
              >
                <Text style={[styles.bubbleText, m.role === 'user' ? styles.userText : styles.aiText]}>
                  {m.text}
                </Text>
              </View>
            ))}
            {chatLoading ? (
              <View style={[styles.chatBubble, styles.aiBubble, { flexDirection: 'row', alignItems: 'center' }]}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={[styles.aiText, { marginLeft: 8 }]}>Architect is thinking...</Text>
              </View>
            ) : null}
          </ScrollView>

          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.inputBar}>
              <TextInput
                style={styles.textInput}
                placeholder="Ask about furniture, lighting, colors..."
                placeholderTextColor={Colors.textSecondary}
                value={chatInput}
                onChangeText={setChatInput}
                onSubmitEditing={handleSendMessage}
              />
              <TouchableOpacity style={styles.sendBtn} onPress={handleSendMessage}>
                <Ionicons name="send" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.screenPadding,
    paddingBottom: Spacing.xxl,
  },
  previewContainer: {
    width: '100%',
    height: 300,
    borderRadius: Spacing.borderRadiusLg,
    overflow: 'hidden',
    backgroundColor: '#000',
    position: 'relative',
    marginBottom: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  noPhoto: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noPhotoText: {
    color: '#FFF',
    fontSize: 14,
  },
  photoTopBadges: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
  },
  scanBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(36, 76, 62, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  scanBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  rotateOverlayBtn: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: 'rgba(32, 54, 44, 0.85)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
    gap: 4,
  },
  rotateText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  scanningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.md,
    backgroundColor: '#FFFFFF',
  },
  scanningTextWrap: {
    flex: 1,
  },
  scanningTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  scanningSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  diagnosisSection: {
    marginBottom: Spacing.md,
  },
  diagnosisHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  diagnosisRoomType: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  diagnosisSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  scoresRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginVertical: Spacing.sm,
  },
  scoreBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: Spacing.borderRadiusMd,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scoreVal: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
  scoreLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  card: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: 6,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  cardDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    lineHeight: 17,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  objectChip: {
    backgroundColor: Colors.subtleBackground || '#EEF1EC',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  objectChipText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  warningDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D97706',
    marginTop: 6,
    marginRight: 8,
  },
  itemText: {
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 18,
    flex: 1,
  },
  diyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  stepNumCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stepNumText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  diyText: {
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 18,
    flex: 1,
  },
  actionsContainer: {
    marginTop: Spacing.sm,
  },
  primaryAction: {
    width: '100%',
    marginBottom: Spacing.sm,
  },
  chatActionBtn: {
    width: '100%',
    marginBottom: Spacing.md,
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  thirdBtn: {
    flex: 1,
  },
  modalArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: '#FFFFFF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  modalSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  chatScroll: {
    flex: 1,
  },
  chatScrollContent: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  chatBubble: {
    maxWidth: '85%',
    padding: Spacing.md,
    borderRadius: Spacing.borderRadiusMd,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 2,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    color: '#FFFFFF',
  },
  aiText: {
    color: Colors.textPrimary,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.sm,
  },
  textInput: {
    flex: 1,
    height: 44,
    backgroundColor: Colors.background,
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
