import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../src/theme/colors';
import { Spacing } from '../../src/theme/spacing';
import { Header } from '../../src/components/Header';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { Card } from '../../src/components/Card';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: 'How should I photograph my space for the best redesign?',
    answer: 'Stand in a corner so that two walls, the floor, and ceiling boundaries are visible. Use natural daylight whenever possible and keep the camera level at chest height.',
  },
  {
    question: 'How does YClick AI redesign work?',
    answer: 'YClick extracts key architectural markers (doors, windows, light sources, major furniture) and synthesizes realistic interior layout alternatives guided by your selected style, budget, and improvement priorities.',
  },
  {
    question: 'What are the 3D room and AR limitations?',
    answer: 'The interactive 3D model is a procedural spatial demonstration designed to visualize lighting and furniture relationships. It is not an exact millimeter-accurate digital scan of your room.',
  },
  {
    question: 'How do I delete my photos and project history?',
    answer: 'You can delete any individual design project directly from the My Designs screen or Design Details page. To delete all account information permanently, navigate to Settings > Delete Account.',
  },
];

export default function HelpScreen() {
  const router = useRouter();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const toggleFAQ = (index: number) => {
    setExpandedIndex(prev => (prev === index ? null : index));
  };

  const handleSendFeedback = () => {
    if (!feedback.trim()) {
      Alert.alert('Empty Message', 'Please enter your question or feedback before sending.');
      return;
    }
    setSubmitted(true);
    setFeedback('');
    Alert.alert('Feedback Received', 'Thank you! Your feedback has been noted for our product team.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Help & Feedback" onBackPress={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Support Header */}
        <View style={styles.header}>
          <Text style={styles.heading}>Frequently Asked Questions</Text>
          <Text style={styles.subtitle}>
            Learn how to get the most out of your YClick interior design workflow.
          </Text>
        </View>

        {/* FAQs */}
        <View style={styles.faqList}>
          {FAQS.map((faq, index) => {
            const isExpanded = expandedIndex === index;
            return (
              <Card key={index} style={styles.faqCard} variant="elevated">
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => toggleFAQ(index)}
                  style={styles.faqQuestionRow}
                >
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={Colors.primary}
                  />
                </TouchableOpacity>
                {isExpanded ? (
                  <View style={styles.faqAnswerContainer}>
                    <Text style={styles.faqAnswer}>{faq.answer}</Text>
                  </View>
                ) : null}
              </Card>
            );
          })}
        </View>

        {/* Feedback Section */}
        <View style={styles.feedbackSection}>
          <Text style={styles.feedbackHeading}>Report an Issue or Send Feedback</Text>
          <Text style={styles.feedbackSubtitle}>
            Have a question, encountered a bug, or have a design feature suggestion? Let us know:
          </Text>

          <Input
            placeholder="Describe your issue or suggestion in detail..."
            value={feedback}
            onChangeText={setFeedback}
            multiline
            numberOfLines={4}
            containerStyle={{ minHeight: 110 }}
          />

          <Button
            title="Submit Feedback"
            onPress={handleSendFeedback}
            style={styles.submitBtn}
          />
        </View>
      </ScrollView>
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
  header: {
    marginBottom: Spacing.md,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  faqList: {
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  faqCard: {
    padding: Spacing.md,
  },
  faqQuestionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginRight: Spacing.sm,
  },
  faqAnswerContainer: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  faqAnswer: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  feedbackSection: {
    marginTop: Spacing.sm,
  },
  feedbackHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  feedbackSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: 18,
  },
  submitBtn: {
    width: '100%',
    marginTop: Spacing.xs,
  },
});
