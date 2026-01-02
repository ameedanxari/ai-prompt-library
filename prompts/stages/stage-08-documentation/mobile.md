# Stage 08 - Documentation: Mobile Platform Documentation

## Purpose
Define mobile-specific documentation requirements, in-app help systems, and mobile-optimized user guidance for mobile applications.

This stage covers iOS and Android platform-specific documentation, app store guidelines, device-specific features, and native mobile documentation patterns while building upon the platform-agnostic documentation architecture.

## Instructions
Use this stage to establish mobile-specific documentation practices including in-app tutorials, contextual help, and mobile-optimized documentation experiences.

## Examples
```markdown
## Example Mobile Documentation

### Project: Task Management Mobile App Documentation
**In-App Help**: Contextual tooltips and guided tours
**External Docs**: Mobile-optimized documentation site
**Onboarding**: Interactive app tutorials and walkthroughs
**Support**: In-app chat and FAQ system

### Mobile-Specific Features
- Interactive onboarding flows
- Contextual help overlays
- Gesture-based tutorials
- Offline help content
- In-app feedback system
```

## Mobile Documentation Strategy

### In-App Help System
```typescript
// React Native in-app help system
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface HelpOverlayProps {
  feature: string;
  children: React.ReactNode;
  helpContent: {
    title: string;
    description: string;
    steps?: string[];
    tips?: string[];
  };
}

function HelpOverlay({ feature, children, helpContent }: HelpOverlayProps) {
  const [showHelp, setShowHelp] = useState(false);
  const [hasSeenHelp, setHasSeenHelp] = useState(false);

  useEffect(() => {
    checkIfHelpSeen();
  }, []);

  const checkIfHelpSeen = async () => {
    const seen = await AsyncStorage.getItem(`help_seen_${feature}`);
    setHasSeenHelp(seen === 'true');
  };

  const markHelpAsSeen = async () => {
    await AsyncStorage.setItem(`help_seen_${feature}`, 'true');
    setHasSeenHelp(true);
    setShowHelp(false);
  };

  return (
    <View style={{ position: 'relative' }}>
      {children}
      
      {!hasSeenHelp && (
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: -5,
            right: -5,
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: '#007AFF',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => setShowHelp(true)}
        >
          <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>?</Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={showHelp}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={{ flex: 1, backgroundColor: 'white' }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 20,
            borderBottomWidth: 1,
            borderBottomColor: '#E5E5E7',
          }}>
            <Text style={{ fontSize: 18, fontWeight: '600' }}>
              {helpContent.title}
            </Text>
            <TouchableOpacity onPress={() => setShowHelp(false)}>
              <Text style={{ color: '#007AFF', fontSize: 16 }}>Done</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1, padding: 20 }}>
            <Text style={{ fontSize: 16, lineHeight: 24, marginBottom: 20 }}>
              {helpContent.description}
            </Text>

            {helpContent.steps && (
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 10 }}>
                  How to use:
                </Text>
                {helpContent.steps.map((step, index) => (
                  <View key={index} style={{ flexDirection: 'row', marginBottom: 8 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', marginRight: 8 }}>
                      {index + 1}.
                    </Text>
                    <Text style={{ fontSize: 16, flex: 1, lineHeight: 22 }}>
                      {step}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {helpContent.tips && (
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 10 }}>
                  Tips:
                </Text>
                {helpContent.tips.map((tip, index) => (
                  <View key={index} style={{ flexDirection: 'row', marginBottom: 8 }}>
                    <Text style={{ fontSize: 16, marginRight: 8 }}>💡</Text>
                    <Text style={{ fontSize: 16, flex: 1, lineHeight: 22 }}>
                      {tip}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          <View style={{ padding: 20 }}>
            <TouchableOpacity
              style={{
                backgroundColor: '#007AFF',
                borderRadius: 8,
                padding: 16,
                alignItems: 'center',
              }}
              onPress={markHelpAsSeen}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                Got it!
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Usage example
function TaskCreationScreen() {
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <HelpOverlay
        feature="task_creation"
        helpContent={{
          title: "Creating Tasks",
          description: "Tasks help you organize your work and track progress. You can add details, set due dates, and assign them to team members.",
          steps: [
            "Tap the 'New Task' button",
            "Enter a descriptive title",
            "Add details and set a due date",
            "Assign to a team member if needed",
            "Tap 'Save' to create the task"
          ],
          tips: [
            "Use clear, actionable titles for better organization",
            "Set realistic due dates to avoid stress",
            "Add relevant tags to make tasks easier to find"
          ]
        }}
      >
        <TouchableOpacity style={styles.newTaskButton}>
          <Text>New Task</Text>
        </TouchableOpacity>
      </HelpOverlay>
    </View>
  );
}
```

### Interactive Onboarding
```typescript
// Interactive app onboarding system
import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: screenWidth } = Dimensions.get('window');

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
  action?: {
    text: string;
    onPress: () => void;
  };
}

function InteractiveOnboarding({ steps, onComplete }: {
  steps: OnboardingStep[];
  onComplete: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      const nextIndex = currentStep + 1;
      setCurrentStep(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    } else {
      onComplete();
    }
  };

  const skipOnboarding = () => {
    onComplete();
  };

  const renderStep = ({ item, index }: { item: OnboardingStep; index: number }) => (
    <View style={{ width: screenWidth, padding: 20 }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ marginBottom: 40 }}>
          {item.component}
        </View>
        
        <Text style={{
          fontSize: 24,
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: 16,
        }}>
          {item.title}
        </Text>
        
        <Text style={{
          fontSize: 16,
          textAlign: 'center',
          color: '#666',
          lineHeight: 24,
          paddingHorizontal: 20,
        }}>
          {item.description}
        </Text>
        
        {item.action && (
          <TouchableOpacity
            style={{
              backgroundColor: '#007AFF',
              borderRadius: 8,
              paddingHorizontal: 24,
              paddingVertical: 12,
              marginTop: 30,
            }}
            onPress={item.action.onPress}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
              {item.action.text}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
      }}>
        <TouchableOpacity onPress={skipOnboarding}>
          <Text style={{ color: '#666', fontSize: 16 }}>Skip</Text>
        </TouchableOpacity>
        
        <View style={{ flexDirection: 'row' }}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: index === currentStep ? '#007AFF' : '#E5E5E7',
                marginHorizontal: 4,
              }}
            />
          ))}
        </View>
        
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        ref={flatListRef}
        data={steps}
        renderItem={renderStep}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
          setCurrentStep(index);
        }}
      />

      <View style={{ padding: 20 }}>
        <TouchableOpacity
          style={{
            backgroundColor: '#007AFF',
            borderRadius: 8,
            padding: 16,
            alignItems: 'center',
          }}
          onPress={nextStep}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
            {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Onboarding steps definition
const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Task Manager',
    description: 'Organize your work, collaborate with your team, and get things done efficiently.',
    component: <WelcomeIllustration />,
  },
  {
    id: 'create_tasks',
    title: 'Create and Organize Tasks',
    description: 'Add tasks, set due dates, and organize them into projects for better productivity.',
    component: <TaskCreationDemo />,
    action: {
      text: 'Try Creating a Task',
      onPress: () => {
        // Navigate to task creation or show demo
      },
    },
  },
  {
    id: 'collaborate',
    title: 'Collaborate with Your Team',
    description: 'Invite team members, assign tasks, and track progress together.',
    component: <CollaborationDemo />,
  },
  {
    id: 'notifications',
    title: 'Stay Updated',
    description: 'Get notified about important updates and never miss a deadline.',
    component: <NotificationDemo />,
    action: {
      text: 'Enable Notifications',
      onPress: async () => {
        // Request notification permissions
        await requestNotificationPermissions();
      },
    },
  },
];
```

### Offline Help Content
```typescript
// Offline help content system
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';

class OfflineHelpSystem {
  private helpContent: Map<string, any> = new Map();
  private readonly HELP_STORAGE_KEY = 'offline_help_content';
  private readonly HELP_VERSION_KEY = 'help_content_version';

  async initialize() {
    await this.loadCachedContent();
    await this.checkForUpdates();
  }

  private async loadCachedContent() {
    try {
      const cachedContent = await AsyncStorage.getItem(this.HELP_STORAGE_KEY);
      if (cachedContent) {
        const content = JSON.parse(cachedContent);
        this.helpContent = new Map(Object.entries(content));
      }
    } catch (error) {
      console.error('Failed to load cached help content:', error);
    }
  }

  private async checkForUpdates() {
    try {
      const currentVersion = await AsyncStorage.getItem(this.HELP_VERSION_KEY);
      const latestVersion = await this.fetchLatestVersion();
      
      if (currentVersion !== latestVersion) {
        await this.downloadHelpContent();
        await AsyncStorage.setItem(this.HELP_VERSION_KEY, latestVersion);
      }
    } catch (error) {
      console.error('Failed to check for help content updates:', error);
    }
  }

  private async downloadHelpContent() {
    try {
      const helpData = await fetch('/api/help/mobile-content').then(r => r.json());
      
      // Store content locally
      const contentObject = Object.fromEntries(helpData);
      await AsyncStorage.setItem(this.HELP_STORAGE_KEY, JSON.stringify(contentObject));
      
      this.helpContent = new Map(Object.entries(helpData));
    } catch (error) {
      console.error('Failed to download help content:', error);
    }
  }

  getHelpContent(topic: string): any | null {
    return this.helpContent.get(topic) || null;
  }

  searchHelp(query: string): any[] {
    const results: any[] = [];
    
    for (const [topic, content] of this.helpContent) {
      if (
        content.title?.toLowerCase().includes(query.toLowerCase()) ||
        content.description?.toLowerCase().includes(query.toLowerCase()) ||
        content.keywords?.some((keyword: string) => 
          keyword.toLowerCase().includes(query.toLowerCase())
        )
      ) {
        results.push({ topic, ...content });
      }
    }
    
    return results;
  }
}

// Usage in help screen
function HelpScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [helpSystem] = useState(() => new OfflineHelpSystem());

  useEffect(() => {
    helpSystem.initialize();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = helpSystem.searchHelp(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ padding: 20 }}>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: '#E5E5E7',
            borderRadius: 8,
            padding: 12,
            fontSize: 16,
          }}
          placeholder="Search help topics..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      <ScrollView style={{ flex: 1 }}>
        {searchResults.length > 0 ? (
          searchResults.map((result, index) => (
            <TouchableOpacity
              key={index}
              style={{
                padding: 20,
                borderBottomWidth: 1,
                borderBottomColor: '#E5E5E7',
              }}
              onPress={() => {
                // Navigate to help detail
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
                {result.title}
              </Text>
              <Text style={{ fontSize: 14, color: '#666' }}>
                {result.description}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <HelpTopicsList helpSystem={helpSystem} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
```

## Next Steps
- **Stage 09 - Quality**: Mobile documentation quality assurance and user testing
- **In-App Integration**: Implement contextual help throughout the mobile app
- **User Testing**: Validate mobile documentation effectiveness with real users
- **Accessibility**: Ensure mobile help system meets accessibility standards