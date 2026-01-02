# Stage 04 - Features: Mobile Platform Implementation

## Purpose
Define mobile-specific feature implementations, native UI components, and mobile user experience patterns that build upon the platform-agnostic feature specifications.

## Instructions
Use this stage to specify how the platform-agnostic features will be implemented on mobile platforms. Focus on mobile-specific UI patterns, device capabilities, and native mobile technologies.

## Examples
```markdown
## Example Mobile Feature Implementation

### Feature: Task Management Mobile Interface
**Framework**: React Native with TypeScript
**Navigation**: React Navigation 6 with stack and tab navigators
**Key Components**: TaskList, TaskCard, TaskForm, SwipeActions
**Mobile-Specific Features**: 
- Pull-to-refresh for task lists
- Swipe gestures for task actions
- Push notifications for due tasks
- Offline task creation with background sync
- Biometric authentication

### Implementation
```typescript
// TaskList component with mobile-specific features
function TaskList() {
  const { data: tasks, mutate } = useQuery(['tasks'], fetchTasks);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await mutate();
    setRefreshing(false);
  }, [mutate]);

  return (
    <FlatList
      data={tasks}
      renderItem={({ item }) => <TaskCard task={item} />}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      keyExtractor={(item) => item.id}
    />
  );
}
```
```

## Mobile Feature Implementation

### Native Mobile UI Components

#### Task Management Interface
```typescript
// React Native Task List with Mobile-Specific Features
import React, { useState, useCallback, useRef } from 'react';
import {
  FlatList,
  RefreshControl,
  View,
  Text,
  TouchableOpacity,
  Animated,
  PanGestureHandler,
  State,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { showMessage } from 'react-native-flash-message';

interface TaskListProps {
  projectId?: string;
  filter?: TaskFilter;
}

function TaskList({ projectId, filter }: TaskListProps) {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks', projectId, filter],
    queryFn: () => fetchTasks({ projectId, filter }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const updateTaskMutation = useMutation({
    mutationFn: updateTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      showMessage({
        message: 'Task updated successfully',
        type: 'success',
      });
    },
    onError: () => {
      showMessage({
        message: 'Failed to update task',
        type: 'danger',
      });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      showMessage({
        message: 'Task deleted',
        type: 'info',
      });
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['tasks'] });
    setRefreshing(false);
  }, [queryClient]);

  const renderTask = useCallback(({ item: task }: { item: Task }) => (
    <TaskCard
      task={task}
      onUpdate={(updates) => updateTaskMutation.mutate({ id: task.id, ...updates })}
      onDelete={() => deleteTaskMutation.mutate(task.id)}
    />
  ), [updateTaskMutation, deleteTaskMutation]);

  const keyExtractor = useCallback((item: Task) => item.id, []);

  if (isLoading && !tasks) {
    return <TaskListSkeleton />;
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={keyExtractor}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#007AFF"
            colors={['#007AFF']}
          />
        }
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#E5E5E7' }} />}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
      />
    </View>
  );
}

// Task Card with Swipe Actions
interface TaskCardProps {
  task: Task;
  onUpdate: (updates: Partial<Task>) => void;
  onDelete: () => void;
}

function TaskCard({ task, onUpdate, onDelete }: TaskCardProps) {
  const swipeableRef = useRef<Swipeable>(null);

  const renderRightActions = useCallback(() => (
    <View style={{ flexDirection: 'row' }}>
      {/* Complete Action */}
      <TouchableOpacity
        style={{
          backgroundColor: '#34C759',
          justifyContent: 'center',
          alignItems: 'center',
          width: 80,
        }}
        onPress={() => {
          onUpdate({ status: task.status === 'completed' ? 'todo' : 'completed' });
          swipeableRef.current?.close();
        }}
      >
        <Text style={{ color: 'white', fontWeight: '600' }}>
          {task.status === 'completed' ? 'Undo' : 'Done'}
        </Text>
      </TouchableOpacity>

      {/* Delete Action */}
      <TouchableOpacity
        style={{
          backgroundColor: '#FF3B30',
          justifyContent: 'center',
          alignItems: 'center',
          width: 80,
        }}
        onPress={() => {
          onDelete();
          swipeableRef.current?.close();
        }}
      >
        <Text style={{ color: 'white', fontWeight: '600' }}>Delete</Text>
      </TouchableOpacity>
    </View>
  ), [task.status, onUpdate, onDelete]);

  const renderLeftActions = useCallback(() => (
    <TouchableOpacity
      style={{
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
      }}
      onPress={() => {
        // Open task details
        swipeableRef.current?.close();
      }}
    >
      <Text style={{ color: 'white', fontWeight: '600' }}>Edit</Text>
    </TouchableOpacity>
  ), []);

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      renderLeftActions={renderLeftActions}
      rightThreshold={40}
      leftThreshold={40}
    >
      <TouchableOpacity
        style={{
          backgroundColor: 'white',
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
        }}
        onPress={() => {
          // Navigate to task details
        }}
        activeOpacity={0.7}
      >
        {/* Task Status Indicator */}
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: task.status === 'completed' ? '#34C759' : '#E5E5E7',
            marginRight: 12,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {task.status === 'completed' && (
            <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>✓</Text>
          )}
        </View>

        {/* Task Content */}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '500',
              color: task.status === 'completed' ? '#8E8E93' : '#000',
              textDecorationLine: task.status === 'completed' ? 'line-through' : 'none',
            }}
            numberOfLines={1}
          >
            {task.title}
          </Text>
          
          {task.description && (
            <Text
              style={{
                fontSize: 14,
                color: '#8E8E93',
                marginTop: 2,
              }}
              numberOfLines={2}
            >
              {task.description}
            </Text>
          )}

          {/* Task Metadata */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            {task.priority && (
              <TaskPriorityBadge priority={task.priority} />
            )}
            
            {task.dueDate && (
              <Text
                style={{
                  fontSize: 12,
                  color: isOverdue(task.dueDate) ? '#FF3B30' : '#8E8E93',
                  marginLeft: 8,
                }}
              >
                Due {formatRelativeDate(task.dueDate)}
              </Text>
            )}
            
            {task.assignee && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
                <UserAvatar user={task.assignee} size={16} />
                <Text style={{ fontSize: 12, color: '#8E8E93', marginLeft: 4 }}>
                  {task.assignee.name}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Chevron */}
        <Text style={{ color: '#C7C7CC', fontSize: 16 }}>›</Text>
      </TouchableOpacity>
    </Swipeable>
  );
}
```

#### Project Dashboard Mobile Interface
```typescript
// Mobile Project Dashboard with Native Navigation
import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { useNavigation } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

function ProjectDashboard({ route }: { route: any }) {
  const { projectId } = route.params;
  const navigation = useNavigation();
  
  const { data: project } = useQuery(['project', projectId], () => fetchProject(projectId));
  const { data: tasks } = useQuery(['tasks', projectId], () => fetchTasks({ projectId }));
  const { data: members } = useQuery(['members', projectId], () => fetchProjectMembers(projectId));

  const stats = useMemo(() => {
    if (!tasks) return null;
    
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      overdue: tasks.filter(t => isOverdue(t.dueDate)).length,
    };
  }, [tasks]);

  const chartData = useMemo(() => {
    if (!stats) return null;
    
    return {
      labels: ['Completed', 'In Progress', 'Todo', 'Overdue'],
      datasets: [{
        data: [
          stats.completed,
          stats.inProgress,
          stats.total - stats.completed - stats.inProgress,
          stats.overdue,
        ],
      }],
    };
  }, [stats]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F2F2F7' }}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        {/* Project Header */}
        <View style={{ backgroundColor: 'white', padding: 20, marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 12,
                backgroundColor: project?.color || '#007AFF',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 16,
              }}
            >
              <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>
                {project?.name?.charAt(0)}
              </Text>
            </View>
            
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#000' }}>
                {project?.name}
              </Text>
              <Text style={{ fontSize: 16, color: '#8E8E93', marginTop: 2 }}>
                {project?.description}
              </Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <TouchableOpacity
              style={{ alignItems: 'center', padding: 12 }}
              onPress={() => navigation.navigate('NewTask', { projectId })}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#007AFF',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <Text style={{ color: 'white', fontSize: 20 }}>+</Text>
              </View>
              <Text style={{ fontSize: 12, color: '#8E8E93' }}>New Task</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ alignItems: 'center', padding: 12 }}
              onPress={() => navigation.navigate('ProjectMembers', { projectId })}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#34C759',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <Text style={{ color: 'white', fontSize: 16 }}>👥</Text>
              </View>
              <Text style={{ fontSize: 12, color: '#8E8E93' }}>Team</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ alignItems: 'center', padding: 12 }}
              onPress={() => navigation.navigate('ProjectSettings', { projectId })}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#8E8E93',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <Text style={{ color: 'white', fontSize: 16 }}>⚙️</Text>
              </View>
              <Text style={{ fontSize: 12, color: '#8E8E93' }}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 20, marginBottom: 20 }}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <StatCard
              title="Total"
              value={stats?.total || 0}
              color="#007AFF"
              icon="📋"
            />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <StatCard
              title="Completed"
              value={stats?.completed || 0}
              color="#34C759"
              icon="✅"
            />
          </View>
        </View>

        <View style={{ flexDirection: 'row', paddingHorizontal: 20, marginBottom: 20 }}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <StatCard
              title="In Progress"
              value={stats?.inProgress || 0}
              color="#FF9500"
              icon="🔄"
            />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <StatCard
              title="Overdue"
              value={stats?.overdue || 0}
              color="#FF3B30"
              icon="⚠️"
            />
          </View>
        </View>

        {/* Progress Chart */}
        {chartData && (
          <View style={{ backgroundColor: 'white', marginHorizontal: 20, borderRadius: 12, padding: 20, marginBottom: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 16 }}>
              Task Distribution
            </Text>
            <PieChart
              data={[
                { name: 'Completed', population: stats.completed, color: '#34C759', legendFontColor: '#7F7F7F' },
                { name: 'In Progress', population: stats.inProgress, color: '#FF9500', legendFontColor: '#7F7F7F' },
                { name: 'Todo', population: stats.total - stats.completed - stats.inProgress, color: '#007AFF', legendFontColor: '#7F7F7F' },
                { name: 'Overdue', population: stats.overdue, color: '#FF3B30', legendFontColor: '#7F7F7F' },
              ]}
              width={screenWidth - 80}
              height={200}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
            />
          </View>
        )}

        {/* Recent Tasks */}
        <View style={{ backgroundColor: 'white', marginHorizontal: 20, borderRadius: 12, marginBottom: 20 }}>
          <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: '#E5E5E7' }}>
            <Text style={{ fontSize: 18, fontWeight: '600' }}>Recent Tasks</Text>
          </View>
          
          {tasks?.slice(0, 5).map((task, index) => (
            <TouchableOpacity
              key={task.id}
              style={{
                padding: 16,
                borderBottomWidth: index < 4 ? 1 : 0,
                borderBottomColor: '#E5E5E7',
              }}
              onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: task.status === 'completed' ? '#34C759' : '#E5E5E7',
                    marginRight: 12,
                  }}
                />
                <Text
                  style={{
                    flex: 1,
                    fontSize: 16,
                    color: task.status === 'completed' ? '#8E8E93' : '#000',
                    textDecorationLine: task.status === 'completed' ? 'line-through' : 'none',
                  }}
                  numberOfLines={1}
                >
                  {task.title}
                </Text>
                <Text style={{ color: '#C7C7CC', fontSize: 16 }}>›</Text>
              </View>
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity
            style={{ padding: 16, alignItems: 'center' }}
            onPress={() => navigation.navigate('TaskList', { projectId })}
          >
            <Text style={{ color: '#007AFF', fontSize: 16, fontWeight: '500' }}>
              View All Tasks
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Stat Card Component
function StatCard({ title, value, color, icon }: {
  title: string;
  value: number;
  color: string;
  icon: string;
}) {
  return (
    <View
      style={{
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
      }}
    >
      <Text style={{ fontSize: 24, marginBottom: 8 }}>{icon}</Text>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color, marginBottom: 4 }}>
        {value}
      </Text>
      <Text style={{ fontSize: 14, color: '#8E8E93' }}>{title}</Text>
    </View>
  );
}
```

### Mobile-Specific Features

#### Push Notifications
```typescript
// Push Notification Service
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class PushNotificationService {
  async initialize() {
    // Request permission
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
      await this.setupNotificationHandlers();
      await this.getFCMToken();
    }
  }

  async getFCMToken() {
    try {
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
      
      // Send token to server
      await this.sendTokenToServer(token);
      
      // Store token locally
      await AsyncStorage.setItem('fcm_token', token);
      
      return token;
    } catch (error) {
      console.error('Failed to get FCM token:', error);
    }
  }

  async setupNotificationHandlers() {
    // Handle background messages
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Message handled in the background!', remoteMessage);
      await this.displayNotification(remoteMessage);
    });

    // Handle foreground messages
    messaging().onMessage(async (remoteMessage) => {
      console.log('Message handled in the foreground!', remoteMessage);
      await this.displayNotification(remoteMessage);
    });

    // Handle notification opened app
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('Notification caused app to open from background state:', remoteMessage);
      this.handleNotificationAction(remoteMessage);
    });

    // Check whether an initial notification is available
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log('Notification caused app to open from quit state:', remoteMessage);
          this.handleNotificationAction(remoteMessage);
        }
      });
  }

  async displayNotification(remoteMessage: any) {
    // Create a channel (required for Android)
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
      importance: AndroidImportance.HIGH,
    });

    // Display a notification
    await notifee.displayNotification({
      title: remoteMessage.notification?.title,
      body: remoteMessage.notification?.body,
      data: remoteMessage.data,
      android: {
        channelId,
        smallIcon: 'ic_launcher',
        pressAction: {
          id: 'default',
        },
        actions: [
          {
            title: 'Mark Complete',
            pressAction: {
              id: 'complete',
            },
          },
          {
            title: 'View Task',
            pressAction: {
              id: 'view',
            },
          },
        ],
      },
      ios: {
        categoryId: 'task',
        attachments: [
          {
            url: 'https://example.com/icon.png',
            id: 'icon',
          },
        ],
      },
    });
  }

  handleNotificationAction(remoteMessage: any) {
    const { data } = remoteMessage;
    
    if (data?.taskId) {
      // Navigate to task detail
      NavigationService.navigate('TaskDetail', { taskId: data.taskId });
    } else if (data?.projectId) {
      // Navigate to project
      NavigationService.navigate('ProjectDashboard', { projectId: data.projectId });
    }
  }

  async sendTokenToServer(token: string) {
    try {
      await api.post('/api/push-tokens', { token });
    } catch (error) {
      console.error('Failed to send token to server:', error);
    }
  }

  // Schedule local notifications
  async scheduleTaskReminder(task: Task) {
    if (!task.dueDate) return;

    const reminderTime = new Date(task.dueDate);
    reminderTime.setHours(reminderTime.getHours() - 1); // 1 hour before due

    if (reminderTime > new Date()) {
      await notifee.createTriggerNotification(
        {
          title: 'Task Due Soon',
          body: `"${task.title}" is due in 1 hour`,
          data: { taskId: task.id },
          android: {
            channelId: 'reminders',
          },
        },
        {
          type: notifee.TriggerType.TIMESTAMP,
          timestamp: reminderTime.getTime(),
        }
      );
    }
  }
}

// Usage in React component
function useNotifications() {
  const [notificationService] = useState(() => new PushNotificationService());
  
  useEffect(() => {
    notificationService.initialize();
  }, []);
  
  return {
    scheduleTaskReminder: notificationService.scheduleTaskReminder.bind(notificationService),
  };
}
```

#### Biometric Authentication
```typescript
// Biometric Authentication Service
import TouchID from 'react-native-touch-id';
import AsyncStorage from '@react-native-async-storage/async-storage';

class BiometricAuthService {
  async isBiometricAvailable(): Promise<boolean> {
    try {
      const biometryType = await TouchID.isSupported();
      return biometryType !== false;
    } catch (error) {
      return false;
    }
  }

  async getBiometryType(): Promise<string | null> {
    try {
      const biometryType = await TouchID.isSupported();
      return biometryType;
    } catch (error) {
      return null;
    }
  }

  async authenticateWithBiometric(reason: string = 'Authenticate to continue'): Promise<boolean> {
    try {
      await TouchID.authenticate(reason, {
        title: 'Authentication Required',
        subtitle: 'Use your biometric to unlock',
        description: 'Place your finger on the sensor or look at the camera',
        fallbackLabel: 'Use Passcode',
        cancelLabel: 'Cancel',
        passcodeFallback: true,
        showErrorMessage: true,
      });
      return true;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  }

  async enableBiometricLogin(): Promise<boolean> {
    const isAvailable = await this.isBiometricAvailable();
    if (!isAvailable) {
      throw new Error('Biometric authentication is not available');
    }

    const success = await this.authenticateWithBiometric('Enable biometric login');
    if (success) {
      await AsyncStorage.setItem('biometric_enabled', 'true');
    }
    
    return success;
  }

  async disableBiometricLogin(): Promise<void> {
    await AsyncStorage.removeItem('biometric_enabled');
  }

  async isBiometricLoginEnabled(): Promise<boolean> {
    const enabled = await AsyncStorage.getItem('biometric_enabled');
    return enabled === 'true';
  }
}

// Login Screen with Biometric Support
function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showBiometric, setShowBiometric] = useState(false);
  const [biometryType, setBiometryType] = useState<string | null>(null);
  
  const biometricAuth = useMemo(() => new BiometricAuthService(), []);
  const navigation = useNavigation();

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    const isAvailable = await biometricAuth.isBiometricAvailable();
    const isEnabled = await biometricAuth.isBiometricLoginEnabled();
    const type = await biometricAuth.getBiometryType();
    
    setShowBiometric(isAvailable && isEnabled);
    setBiometryType(type);
  };

  const handleBiometricLogin = async () => {
    try {
      const success = await biometricAuth.authenticateWithBiometric(
        'Login with your biometric'
      );
      
      if (success) {
        // Get stored credentials or token
        const storedToken = await AsyncStorage.getItem('auth_token');
        if (storedToken) {
          // Validate token and login
          await validateAndLogin(storedToken);
          navigation.navigate('Main');
        } else {
          // Fallback to regular login
          setShowBiometric(false);
        }
      }
    } catch (error) {
      console.error('Biometric login failed:', error);
      Alert.alert('Authentication Failed', 'Please try again or use your password.');
    }
  };

  const handleRegularLogin = async () => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      
      // Store token
      await AsyncStorage.setItem('auth_token', token);
      
      // Ask to enable biometric login
      if (await biometricAuth.isBiometricAvailable()) {
        Alert.alert(
          'Enable Biometric Login',
          `Would you like to enable ${biometryType} login for faster access?`,
          [
            { text: 'Not Now', style: 'cancel' },
            {
              text: 'Enable',
              onPress: async () => {
                await biometricAuth.enableBiometricLogin();
                setShowBiometric(true);
              },
            },
          ]
        );
      }
      
      navigation.navigate('Main');
    } catch (error) {
      Alert.alert('Login Failed', 'Please check your credentials and try again.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
        <Text style={{ fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 40 }}>
          Welcome Back
        </Text>

        {showBiometric && (
          <TouchableOpacity
            style={{
              backgroundColor: '#007AFF',
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
              marginBottom: 20,
            }}
            onPress={handleBiometricLogin}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
              Login with {biometryType}
            </Text>
          </TouchableOpacity>
        )}

        <TextInput
          style={{
            borderWidth: 1,
            borderColor: '#E5E5E7',
            borderRadius: 12,
            padding: 16,
            fontSize: 16,
            marginBottom: 16,
          }}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={{
            borderWidth: 1,
            borderColor: '#E5E5E7',
            borderRadius: 12,
            padding: 16,
            fontSize: 16,
            marginBottom: 20,
          }}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={{
            backgroundColor: '#007AFF',
            borderRadius: 12,
            padding: 16,
            alignItems: 'center',
          }}
          onPress={handleRegularLogin}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
            Login
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
```

#### Offline Support and Background Sync
```typescript
// Offline Storage Service
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-netinfo/netinfo';
import BackgroundJob from 'react-native-background-job';

class OfflineStorageService {
  private offlineQueue: OfflineAction[] = [];
  private isOnline = true;

  async initialize() {
    // Load offline queue from storage
    const storedQueue = await AsyncStorage.getItem('offline_queue');
    if (storedQueue) {
      this.offlineQueue = JSON.parse(storedQueue);
    }

    // Listen for network changes
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;
      
      if (wasOffline && this.isOnline) {
        // Connection restored, sync offline actions
        this.syncOfflineActions();
      }
    });
  }

  async storeOfflineAction(action: OfflineAction) {
    this.offlineQueue.push(action);
    await AsyncStorage.setItem('offline_queue', JSON.stringify(this.offlineQueue));
  }

  async syncOfflineActions() {
    if (!this.isOnline || this.offlineQueue.length === 0) {
      return;
    }

    const actionsToSync = [...this.offlineQueue];
    this.offlineQueue = [];
    await AsyncStorage.setItem('offline_queue', JSON.stringify(this.offlineQueue));

    for (const action of actionsToSync) {
      try {
        await this.executeAction(action);
      } catch (error) {
        console.error('Failed to sync action:', error);
        // Re-add failed action to queue
        this.offlineQueue.push(action);
      }
    }

    if (this.offlineQueue.length > 0) {
      await AsyncStorage.setItem('offline_queue', JSON.stringify(this.offlineQueue));
    }
  }

  private async executeAction(action: OfflineAction) {
    switch (action.type) {
      case 'CREATE_TASK':
        await api.post('/api/tasks', action.data);
        break;
      case 'UPDATE_TASK':
        await api.put(`/api/tasks/${action.data.id}`, action.data);
        break;
      case 'DELETE_TASK':
        await api.delete(`/api/tasks/${action.data.id}`);
        break;
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  // Background sync when app is backgrounded
  startBackgroundSync() {
    BackgroundJob.start({
      jobKey: 'backgroundSync',
      period: 15000, // 15 seconds
    });

    BackgroundJob.on('backgroundSync', async () => {
      if (this.isOnline && this.offlineQueue.length > 0) {
        await this.syncOfflineActions();
      }
    });
  }

  stopBackgroundSync() {
    BackgroundJob.stop();
  }
}

// Offline-aware API hook
function useOfflineAPI() {
  const [offlineStorage] = useState(() => new OfflineStorageService());
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    offlineStorage.initialize();
    
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
    });

    return unsubscribe;
  }, []);

  const createTask = async (taskData: Partial<Task>) => {
    if (isOnline) {
      // Online: Create task immediately
      return await api.post('/api/tasks', taskData);
    } else {
      // Offline: Store for later sync
      const offlineTask = {
        ...taskData,
        id: generateOfflineId(),
        createdAt: new Date(),
        offline: true,
      };

      await offlineStorage.storeOfflineAction({
        type: 'CREATE_TASK',
        data: offlineTask,
        timestamp: Date.now(),
      });

      return offlineTask;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    if (isOnline) {
      return await api.put(`/api/tasks/${id}`, updates);
    } else {
      await offlineStorage.storeOfflineAction({
        type: 'UPDATE_TASK',
        data: { id, ...updates },
        timestamp: Date.now(),
      });

      return { id, ...updates };
    }
  };

  return {
    createTask,
    updateTask,
    isOnline,
  };
}

interface OfflineAction {
  type: 'CREATE_TASK' | 'UPDATE_TASK' | 'DELETE_TASK';
  data: any;
  timestamp: number;
}

function generateOfflineId(): string {
  return `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
```

This mobile-specific feature implementation provides a comprehensive foundation for building native-quality mobile applications with platform-specific optimizations, offline capabilities, and native device integrations.

## Next Steps
- **Stage 05 - Testing**: Mobile-specific testing strategies and device compatibility
- **Performance Optimization**: Mobile performance benchmarking and battery optimization
- **App Store Preparation**: App store requirements and submission planning
- **Device Integration**: Platform-specific feature integration and testing