# Real-time Collaboration Technology Template

## Purpose

This template provides comprehensive patterns for implementing real-time collaboration features including multi-user editing, live cursors, presence awareness, conflict resolution, and synchronized state management. It covers WebSocket connections, operational transforms, CRDTs (Conflict-free Replicated Data Types), and distributed collaboration architectures for building collaborative applications like document editors, whiteboards, and team workspaces.

## Context

Real-time collaboration has become essential for modern applications, enabling teams to work together seamlessly across distributed environments. This template addresses the complexity of implementing collaborative features including conflict resolution, presence management, real-time synchronization, and offline support while ensuring data consistency and optimal user experience.

## Examples

### Example 1: Real-time Document Collaboration
```typescript
// Collaborative document editor with operational transforms
interface DocumentOperation {
  type: 'insert' | 'delete' | 'retain';
  position: number;
  content?: string;
  length?: number;
  userId: string;
  timestamp: number;
}

class CollaborativeDocument {
  private content: string = '';
  private operations: DocumentOperation[] = [];
  private websocket: WebSocket;
  private userId: string;

  constructor(documentId: string, userId: string) {
    this.userId = userId;
    this.websocket = new WebSocket(`ws://localhost:8080/documents/${documentId}`);
    this.setupWebSocketHandlers();
  }

  // Apply local operation and broadcast to other users
  applyOperation(operation: DocumentOperation): void {
    this.content = this.transformContent(this.content, operation);
    this.operations.push(operation);
    this.broadcastOperation(operation);
  }

  // Transform operations for conflict resolution
  private transformContent(content: string, operation: DocumentOperation): string {
    switch (operation.type) {
      case 'insert':
        return content.slice(0, operation.position) + 
               operation.content + 
               content.slice(operation.position);
      case 'delete':
        return content.slice(0, operation.position) + 
               content.slice(operation.position + operation.length!);
      default:
        return content;
    }
  }
}
```

### Example 2: Multi-user Presence System
```typescript
// Real-time presence awareness with live cursors
interface UserPresence {
  userId: string;
  username: string;
  cursor: { line: number; column: number };
  selection?: { start: number; end: number };
  color: string;
  lastSeen: number;
  isActive: boolean;
}

class PresenceManager {
  private presences: Map<string, UserPresence> = new Map();
  private eventEmitter = new EventTarget();
  private heartbeatInterval: number;

  constructor(private websocket: WebSocket, private currentUser: string) {
    this.setupPresenceHandlers();
    this.startHeartbeat();
  }

  updateCursor(line: number, column: number): void {
    const presence = this.presences.get(this.currentUser);
    if (presence) {
      presence.cursor = { line, column };
      presence.lastSeen = Date.now();
      this.broadcastPresence(presence);
    }
  }

  updateSelection(start: number, end: number): void {
    const presence = this.presences.get(this.currentUser);
    if (presence) {
      presence.selection = { start, end };
      presence.lastSeen = Date.now();
      this.broadcastPresence(presence);
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.cleanupInactiveUsers();
      this.sendHeartbeat();
    }, 5000);
  }

  private cleanupInactiveUsers(): void {
    const now = Date.now();
    const timeout = 30000; // 30 seconds

    for (const [userId, presence] of this.presences) {
      if (now - presence.lastSeen > timeout) {
        this.presences.delete(userId);
        this.emitPresenceUpdate();
      }
    }
  }
}
```

### Example 3: Conflict-free Replicated Data Types (CRDT)
```typescript
// CRDT implementation for distributed collaboration
interface CRDTOperation {
  id: string;
  userId: string;
  timestamp: number;
  type: 'insert' | 'delete';
  position: number;
  content?: string;
  vectorClock: Map<string, number>;
}

class YjsCollaborativeText {
  private yDoc: Y.Doc;
  private yText: Y.Text;
  private provider: WebsocketProvider;
  private awareness: Awareness;

  constructor(documentId: string, websocketUrl: string) {
    this.yDoc = new Y.Doc();
    this.yText = this.yDoc.getText('content');
    
    // Set up WebSocket provider for synchronization
    this.provider = new WebsocketProvider(websocketUrl, documentId, this.yDoc);
    this.awareness = new Awareness(this.yDoc);
    
    this.setupEventHandlers();
  }

  // Insert text at position
  insert(position: number, text: string): void {
    this.yText.insert(position, text);
  }

  // Delete text range
  delete(position: number, length: number): void {
    this.yText.delete(position, length);
  }

  // Get current document content
  getContent(): string {
    return this.yText.toString();
  }

  // Set user awareness information
  setAwareness(user: { name: string; color: string; cursor?: number }): void {
    this.awareness.setLocalStateField('user', user);
  }

  // Listen for remote changes
  private setupEventHandlers(): void {
    this.yText.observe((event) => {
      event.changes.delta.forEach((change) => {
        if (change.retain) {
          // Position retained
        } else if (change.insert) {
          this.onRemoteInsert(change.insert);
        } else if (change.delete) {
          this.onRemoteDelete(change.delete);
        }
      });
    });

    this.awareness.on('change', (changes) => {
      this.onAwarenessChange(changes);
    });
  }
}
```

## Instructions

### Real-time Collaboration Architecture

Essential components for collaborative applications:

| Component | Priority | Implementation | Use Case |
|-----------|----------|----------------|----------|
| **WebSocket Server** | Critical | Socket.io, native WebSocket | Real-time communication |
| **Operational Transform** | Critical | Custom OT, ShareJS | Conflict resolution |
| **CRDT Implementation** | High | Yjs, Automerge | Distributed consistency |
| **Presence System** | High | Custom awareness | User presence tracking |
| **State Synchronization** | High | Redux, Zustand | Client state management |
| **Offline Support** | Medium | IndexedDB, Service Workers | Offline collaboration |
| **Version Control** | Medium | Git-like versioning | Change history |
| **Access Control** | Low | Role-based permissions | Collaboration security |

### WebSocket Server Implementation

```typescript
// server/collaboration-server.ts
import { Server } from 'socket.io';
import { createServer } from 'http';
import express from 'express';
import Redis from 'ioredis';

interface CollaborationRoom {
  id: string;
  users: Map<string, UserSession>;
  document: DocumentState;
  operations: Operation[];
}

interface UserSession {
  userId: string;
  username: string;
  socketId: string;
  presence: UserPresence;
  permissions: string[];
}

class CollaborationServer {
  private io: Server;
  private redis: Redis;
  private rooms: Map<string, CollaborationRoom> = new Map();

  constructor(port: number) {
    const app = express();
    const server = createServer(app);
    
    this.io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
      },
      transports: ['websocket', 'polling']
    });

    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    this.setupSocketHandlers();
    
    server.listen(port, () => {
      console.log(`Collaboration server running on port ${port}`);
    });
  }

  private setupSocketHandlers(): void {
    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.id}`);

      socket.on('join-room', async (data: { roomId: string; userId: string; username: string }) => {
        await this.handleJoinRoom(socket, data);
      });

      socket.on('operation', async (data: { roomId: string; operation: Operation }) => {
        await this.handleOperation(socket, data);
      });

      socket.on('presence-update', async (data: { roomId: string; presence: UserPresence }) => {
        await this.handlePresenceUpdate(socket, data);
      });

      socket.on('cursor-move', async (data: { roomId: string; cursor: CursorPosition }) => {
        await this.handleCursorMove(socket, data);
      });

      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });
    });
  }

  private async handleJoinRoom(socket: any, data: { roomId: string; userId: string; username: string }): Promise<void> {
    const { roomId, userId, username } = data;
    
    // Join socket room
    await socket.join(roomId);
    
    // Get or create collaboration room
    let room = this.rooms.get(roomId);
    if (!room) {
      room = await this.createRoom(roomId);
    }

    // Add user to room
    const userSession: UserSession = {
      userId,
      username,
      socketId: socket.id,
      presence: {
        userId,
        username,
        cursor: { line: 0, column: 0 },
        color: this.generateUserColor(userId),
        lastSeen: Date.now(),
        isActive: true
      },
      permissions: await this.getUserPermissions(userId, roomId)
    };

    room.users.set(userId, userSession);
    this.rooms.set(roomId, room);

    // Send current document state to new user
    socket.emit('document-state', {
      content: room.document.content,
      operations: room.operations,
      users: Array.from(room.users.values()).map(u => u.presence)
    });

    // Notify other users of new participant
    socket.to(roomId).emit('user-joined', userSession.presence);

    // Persist room state to Redis
    await this.persistRoomState(roomId, room);
  }

  private async handleOperation(socket: any, data: { roomId: string; operation: Operation }): Promise<void> {
    const { roomId, operation } = data;
    const room = this.rooms.get(roomId);
    
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    // Validate operation
    if (!this.validateOperation(operation, room)) {
      socket.emit('error', { message: 'Invalid operation' });
      return;
    }

    // Transform operation against concurrent operations
    const transformedOperation = this.transformOperation(operation, room.operations);
    
    // Apply operation to document
    room.document = this.applyOperation(room.document, transformedOperation);
    room.operations.push(transformedOperation);

    // Broadcast operation to all users in room except sender
    socket.to(roomId).emit('operation', transformedOperation);

    // Persist changes
    await this.persistRoomState(roomId, room);
    await this.persistOperation(roomId, transformedOperation);
  }

  private async handlePresenceUpdate(socket: any, data: { roomId: string; presence: UserPresence }): Promise<void> {
    const { roomId, presence } = data;
    const room = this.rooms.get(roomId);
    
    if (!room) return;

    const userSession = room.users.get(presence.userId);
    if (userSession) {
      userSession.presence = { ...userSession.presence, ...presence, lastSeen: Date.now() };
      
      // Broadcast presence update to other users
      socket.to(roomId).emit('presence-update', userSession.presence);
    }
  }

  private transformOperation(operation: Operation, existingOperations: Operation[]): Operation {
    // Implement operational transform algorithm
    let transformedOp = { ...operation };
    
    for (const existingOp of existingOperations) {
      if (existingOp.timestamp > operation.timestamp) {
        transformedOp = this.operationalTransform(transformedOp, existingOp);
      }
    }
    
    return transformedOp;
  }

  private operationalTransform(op1: Operation, op2: Operation): Operation {
    // Simplified OT implementation
    if (op1.type === 'insert' && op2.type === 'insert') {
      if (op1.position <= op2.position) {
        return op1;
      } else {
        return { ...op1, position: op1.position + (op2.content?.length || 0) };
      }
    }
    
    if (op1.type === 'delete' && op2.type === 'insert') {
      if (op1.position < op2.position) {
        return op1;
      } else {
        return { ...op1, position: op1.position + (op2.content?.length || 0) };
      }
    }
    
    // Add more transformation rules as needed
    return op1;
  }

  private applyOperation(document: DocumentState, operation: Operation): DocumentState {
    let newContent = document.content;
    
    switch (operation.type) {
      case 'insert':
        newContent = newContent.slice(0, operation.position) + 
                    operation.content + 
                    newContent.slice(operation.position);
        break;
      case 'delete':
        newContent = newContent.slice(0, operation.position) + 
                    newContent.slice(operation.position + (operation.length || 0));
        break;
    }
    
    return {
      ...document,
      content: newContent,
      version: document.version + 1,
      lastModified: Date.now()
    };
  }

  private generateUserColor(userId: string): string {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    const hash = userId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  }
}

// Start server
const server = new CollaborationServer(8080);
```

### Client-side Collaboration Manager

```typescript
// client/collaboration-manager.ts
import { io, Socket } from 'socket.io-client';

interface CollaborationConfig {
  serverUrl: string;
  roomId: string;
  userId: string;
  username: string;
}

class CollaborationManager {
  private socket: Socket;
  private config: CollaborationConfig;
  private eventHandlers: Map<string, Function[]> = new Map();
  private operationQueue: Operation[] = [];
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  constructor(config: CollaborationConfig) {
    this.config = config;
    this.socket = io(config.serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      forceNew: true
    });
    
    this.setupSocketHandlers();
    this.connect();
  }

  private setupSocketHandlers(): void {
    this.socket.on('connect', () => {
      console.log('Connected to collaboration server');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.joinRoom();
      this.flushOperationQueue();
      this.emit('connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from collaboration server:', reason);
      this.isConnected = false;
      this.emit('disconnected', reason);
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        this.attemptReconnect();
      }
    });

    this.socket.on('document-state', (data) => {
      this.emit('document-state', data);
    });

    this.socket.on('operation', (operation) => {
      this.emit('remote-operation', operation);
    });

    this.socket.on('user-joined', (presence) => {
      this.emit('user-joined', presence);
    });

    this.socket.on('user-left', (userId) => {
      this.emit('user-left', userId);
    });

    this.socket.on('presence-update', (presence) => {
      this.emit('presence-update', presence);
    });

    this.socket.on('error', (error) => {
      console.error('Collaboration error:', error);
      this.emit('error', error);
    });
  }

  private connect(): void {
    this.socket.connect();
  }

  private joinRoom(): void {
    this.socket.emit('join-room', {
      roomId: this.config.roomId,
      userId: this.config.userId,
      username: this.config.username
    });
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
      this.emit('reconnect-failed');
    }
  }

  // Send operation to server
  sendOperation(operation: Omit<Operation, 'userId' | 'timestamp'>): void {
    const fullOperation: Operation = {
      ...operation,
      userId: this.config.userId,
      timestamp: Date.now(),
      id: this.generateOperationId()
    };

    if (this.isConnected) {
      this.socket.emit('operation', {
        roomId: this.config.roomId,
        operation: fullOperation
      });
    } else {
      // Queue operation for when connection is restored
      this.operationQueue.push(fullOperation);
    }
  }

  // Update user presence
  updatePresence(presence: Partial<UserPresence>): void {
    if (this.isConnected) {
      this.socket.emit('presence-update', {
        roomId: this.config.roomId,
        presence: {
          userId: this.config.userId,
          username: this.config.username,
          ...presence,
          lastSeen: Date.now()
        }
      });
    }
  }

  // Update cursor position
  updateCursor(line: number, column: number): void {
    this.updatePresence({ cursor: { line, column } });
  }

  // Update text selection
  updateSelection(start: number, end: number): void {
    this.updatePresence({ selection: { start, end } });
  }

  private flushOperationQueue(): void {
    while (this.operationQueue.length > 0) {
      const operation = this.operationQueue.shift()!;
      this.socket.emit('operation', {
        roomId: this.config.roomId,
        operation
      });
    }
  }

  private generateOperationId(): string {
    return `${this.config.userId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Event system
  on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  off(event: string, handler: Function): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emit(event: string, ...args: any[]): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(...args));
    }
  }

  // Cleanup
  disconnect(): void {
    this.socket.disconnect();
    this.eventHandlers.clear();
  }
}

// Usage example
const collaborationManager = new CollaborationManager({
  serverUrl: 'ws://localhost:8080',
  roomId: 'document-123',
  userId: 'user-456',
  username: 'John Doe'
});

collaborationManager.on('document-state', (state) => {
  console.log('Received document state:', state);
});

collaborationManager.on('remote-operation', (operation) => {
  console.log('Received remote operation:', operation);
  // Apply operation to local document
});
```

### React Integration with Collaborative Editor

```typescript
// components/CollaborativeEditor.tsx
import React, { useEffect, useRef, useState } from 'react';
import { CollaborationManager } from '../services/collaboration-manager';

interface CollaborativeEditorProps {
  documentId: string;
  userId: string;
  username: string;
  onContentChange?: (content: string) => void;
}

interface UserCursor {
  userId: string;
  username: string;
  line: number;
  column: number;
  color: string;
}

export const CollaborativeEditor: React.FC<CollaborativeEditorProps> = ({
  documentId,
  userId,
  username,
  onContentChange
}) => {
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const collaborationRef = useRef<CollaborationManager | null>(null);
  const [content, setContent] = useState('');
  const [users, setUsers] = useState<UserPresence[]>([]);
  const [cursors, setCursors] = useState<UserCursor[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  useEffect(() => {
    // Initialize collaboration manager
    collaborationRef.current = new CollaborationManager({
      serverUrl: process.env.REACT_APP_COLLABORATION_SERVER || 'ws://localhost:8080',
      roomId: documentId,
      userId,
      username
    });

    const collaboration = collaborationRef.current;

    // Set up event handlers
    collaboration.on('connected', () => {
      setIsConnected(true);
      setConnectionStatus('connected');
    });

    collaboration.on('disconnected', () => {
      setIsConnected(false);
      setConnectionStatus('disconnected');
    });

    collaboration.on('document-state', (state: any) => {
      setContent(state.content);
      setUsers(state.users);
      onContentChange?.(state.content);
    });

    collaboration.on('remote-operation', (operation: Operation) => {
      applyRemoteOperation(operation);
    });

    collaboration.on('user-joined', (presence: UserPresence) => {
      setUsers(prev => [...prev.filter(u => u.userId !== presence.userId), presence]);
    });

    collaboration.on('user-left', (userId: string) => {
      setUsers(prev => prev.filter(u => u.userId !== userId));
      setCursors(prev => prev.filter(c => c.userId !== userId));
    });

    collaboration.on('presence-update', (presence: UserPresence) => {
      setUsers(prev => prev.map(u => u.userId === presence.userId ? presence : u));
      
      if (presence.cursor) {
        setCursors(prev => [
          ...prev.filter(c => c.userId !== presence.userId),
          {
            userId: presence.userId,
            username: presence.username,
            line: presence.cursor.line,
            column: presence.cursor.column,
            color: presence.color
          }
        ]);
      }
    });

    return () => {
      collaboration.disconnect();
    };
  }, [documentId, userId, username]);

  const applyRemoteOperation = (operation: Operation) => {
    setContent(prevContent => {
      let newContent = prevContent;
      
      switch (operation.type) {
        case 'insert':
          newContent = prevContent.slice(0, operation.position) + 
                      operation.content + 
                      prevContent.slice(operation.position);
          break;
        case 'delete':
          newContent = prevContent.slice(0, operation.position) + 
                      prevContent.slice(operation.position + (operation.length || 0));
          break;
      }
      
      onContentChange?.(newContent);
      return newContent;
    });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    const oldContent = content;
    
    // Calculate diff and create operation
    const operation = calculateOperation(oldContent, newContent);
    
    if (operation && collaborationRef.current) {
      // Apply locally first
      setContent(newContent);
      onContentChange?.(newContent);
      
      // Send to server
      collaborationRef.current.sendOperation(operation);
    }
  };

  const handleCursorMove = () => {
    if (editorRef.current && collaborationRef.current) {
      const textarea = editorRef.current;
      const cursorPosition = textarea.selectionStart;
      const textBeforeCursor = content.substring(0, cursorPosition);
      const lines = textBeforeCursor.split('\n');
      const line = lines.length - 1;
      const column = lines[lines.length - 1].length;
      
      collaborationRef.current.updateCursor(line, column);
    }
  };

  const calculateOperation = (oldContent: string, newContent: string): Omit<Operation, 'userId' | 'timestamp' | 'id'> | null => {
    // Simple diff algorithm - in production, use a more sophisticated approach
    if (newContent.length > oldContent.length) {
      // Insertion
      for (let i = 0; i < Math.min(oldContent.length, newContent.length); i++) {
        if (oldContent[i] !== newContent[i]) {
          return {
            type: 'insert',
            position: i,
            content: newContent.substring(i, i + (newContent.length - oldContent.length))
          };
        }
      }
      // Insertion at end
      return {
        type: 'insert',
        position: oldContent.length,
        content: newContent.substring(oldContent.length)
      };
    } else if (newContent.length < oldContent.length) {
      // Deletion
      for (let i = 0; i < Math.min(oldContent.length, newContent.length); i++) {
        if (oldContent[i] !== newContent[i]) {
          return {
            type: 'delete',
            position: i,
            length: oldContent.length - newContent.length
          };
        }
      }
      // Deletion at end
      return {
        type: 'delete',
        position: newContent.length,
        length: oldContent.length - newContent.length
      };
    }
    
    return null;
  };

  return (
    <div className="collaborative-editor">
      {/* Connection status */}
      <div className={`connection-status ${connectionStatus}`}>
        <span className="status-indicator"></span>
        {connectionStatus === 'connected' && `Connected (${users.length} users)`}
        {connectionStatus === 'connecting' && 'Connecting...'}
        {connectionStatus === 'disconnected' && 'Disconnected'}
      </div>

      {/* Active users */}
      <div className="active-users">
        {users.map(user => (
          <div key={user.userId} className="user-avatar" style={{ backgroundColor: user.color }}>
            {user.username.charAt(0).toUpperCase()}
          </div>
        ))}
      </div>

      {/* Editor with cursors */}
      <div className="editor-container">
        <textarea
          ref={editorRef}
          value={content}
          onChange={handleContentChange}
          onSelect={handleCursorMove}
          onKeyUp={handleCursorMove}
          onClick={handleCursorMove}
          className="collaborative-textarea"
          placeholder="Start typing to collaborate..."
        />
        
        {/* Render other users' cursors */}
        {cursors.map(cursor => (
          <div
            key={cursor.userId}
            className="user-cursor"
            style={{
              borderColor: cursor.color,
              // Position calculation would be more complex in a real implementation
            }}
          >
            <div className="cursor-label" style={{ backgroundColor: cursor.color }}>
              {cursor.username}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### Offline Support and Conflict Resolution

```typescript
// services/offline-collaboration.ts
interface OfflineOperation extends Operation {
  localId: string;
  synced: boolean;
  conflictResolved: boolean;
}

class OfflineCollaborationManager {
  private indexedDB: IDBDatabase | null = null;
  private pendingOperations: OfflineOperation[] = [];
  private isOnline: boolean = navigator.onLine;

  constructor(private collaborationManager: CollaborationManager) {
    this.initializeIndexedDB();
    this.setupOnlineOfflineHandlers();
    this.setupCollaborationHandlers();
  }

  private async initializeIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('CollaborationDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.indexedDB = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('operations')) {
          const operationStore = db.createObjectStore('operations', { keyPath: 'localId' });
          operationStore.createIndex('timestamp', 'timestamp', { unique: false });
          operationStore.createIndex('synced', 'synced', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('documents')) {
          db.createObjectStore('documents', { keyPath: 'id' });
        }
      };
    });
  }

  private setupOnlineOfflineHandlers(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingOperations();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  private setupCollaborationHandlers(): void {
    this.collaborationManager.on('connected', () => {
      if (this.isOnline) {
        this.syncPendingOperations();
      }
    });

    this.collaborationManager.on('remote-operation', (operation: Operation) => {
      this.handleRemoteOperation(operation);
    });
  }

  // Store operation locally and sync when online
  async storeOperation(operation: Omit<Operation, 'id'>): Promise<void> {
    const offlineOperation: OfflineOperation = {
      ...operation,
      id: this.generateLocalId(),
      localId: this.generateLocalId(),
      synced: false,
      conflictResolved: false
    };

    // Store in IndexedDB
    await this.storeOperationInDB(offlineOperation);
    
    // Add to pending operations
    this.pendingOperations.push(offlineOperation);

    // Try to sync if online
    if (this.isOnline) {
      this.syncOperation(offlineOperation);
    }
  }

  private async storeOperationInDB(operation: OfflineOperation): Promise<void> {
    if (!this.indexedDB) return;

    return new Promise((resolve, reject) => {
      const transaction = this.indexedDB!.transaction(['operations'], 'readwrite');
      const store = transaction.objectStore('operations');
      const request = store.add(operation);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async syncPendingOperations(): Promise<void> {
    const unsyncedOperations = this.pendingOperations.filter(op => !op.synced);
    
    for (const operation of unsyncedOperations) {
      await this.syncOperation(operation);
    }
  }

  private async syncOperation(operation: OfflineOperation): Promise<void> {
    try {
      // Send operation to server
      this.collaborationManager.sendOperation(operation);
      
      // Mark as synced
      operation.synced = true;
      await this.updateOperationInDB(operation);
      
    } catch (error) {
      console.error('Failed to sync operation:', error);
    }
  }

  private async handleRemoteOperation(remoteOperation: Operation): Promise<void> {
    // Check for conflicts with pending local operations
    const conflictingOperations = this.pendingOperations.filter(localOp => 
      !localOp.synced && this.operationsConflict(localOp, remoteOperation)
    );

    if (conflictingOperations.length > 0) {
      await this.resolveConflicts(conflictingOperations, remoteOperation);
    }
  }

  private operationsConflict(op1: Operation, op2: Operation): boolean {
    // Simple conflict detection - operations affecting the same position
    if (op1.type === 'insert' && op2.type === 'insert') {
      return Math.abs(op1.position - op2.position) < 10; // Within 10 characters
    }
    
    if (op1.type === 'delete' && op2.type === 'delete') {
      return op1.position < op2.position + (op2.length || 0) && 
             op2.position < op1.position + (op1.length || 0);
    }
    
    return false;
  }

  private async resolveConflicts(localOperations: OfflineOperation[], remoteOperation: Operation): Promise<void> {
    // Implement conflict resolution strategy
    // This is a simplified version - in production, use more sophisticated algorithms
    
    for (const localOp of localOperations) {
      if (remoteOperation.timestamp < localOp.timestamp) {
        // Remote operation happened first, transform local operation
        const transformedLocalOp = this.transformOperation(localOp, remoteOperation);
        
        // Update local operation
        Object.assign(localOp, transformedLocalOp);
        localOp.conflictResolved = true;
        
        await this.updateOperationInDB(localOp);
      } else {
        // Local operation happened first, keep as is but mark as resolved
        localOp.conflictResolved = true;
        await this.updateOperationInDB(localOp);
      }
    }
  }

  private transformOperation(localOp: Operation, remoteOp: Operation): Operation {
    // Simplified operational transform
    if (localOp.type === 'insert' && remoteOp.type === 'insert') {
      if (localOp.position >= remoteOp.position) {
        return {
          ...localOp,
          position: localOp.position + (remoteOp.content?.length || 0)
        };
      }
    }
    
    if (localOp.type === 'delete' && remoteOp.type === 'insert') {
      if (localOp.position >= remoteOp.position) {
        return {
          ...localOp,
          position: localOp.position + (remoteOp.content?.length || 0)
        };
      }
    }
    
    return localOp;
  }

  private async updateOperationInDB(operation: OfflineOperation): Promise<void> {
    if (!this.indexedDB) return;

    return new Promise((resolve, reject) => {
      const transaction = this.indexedDB!.transaction(['operations'], 'readwrite');
      const store = transaction.objectStore('operations');
      const request = store.put(operation);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private generateLocalId(): string {
    return `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get operation history for debugging/auditing
  async getOperationHistory(): Promise<OfflineOperation[]> {
    if (!this.indexedDB) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.indexedDB!.transaction(['operations'], 'readonly');
      const store = transaction.objectStore('operations');
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Clean up old synced operations
  async cleanupOldOperations(olderThanDays: number = 7): Promise<void> {
    if (!this.indexedDB) return;

    const cutoffDate = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);

    return new Promise((resolve, reject) => {
      const transaction = this.indexedDB!.transaction(['operations'], 'readwrite');
      const store = transaction.objectStore('operations');
      const index = store.index('timestamp');
      const range = IDBKeyRange.upperBound(cutoffDate);
      const request = index.openCursor(range);
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const operation = cursor.value as OfflineOperation;
          if (operation.synced) {
            cursor.delete();
          }
          cursor.continue();
        } else {
          resolve();
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }
}
```

## Implementation Patterns

### 1. Operational Transform Pattern
Implement conflict resolution for concurrent editing:
- Transform operations based on document state
- Handle insertion, deletion, and retention operations
- Maintain operation ordering with vector clocks
- Resolve conflicts deterministically

### 2. Event-Driven Architecture Pattern
Use events for real-time communication:
- WebSocket events for operation broadcasting
- Custom event system for client-side handling
- Event queuing for offline operation storage
- Event replay for synchronization

### 3. State Management Pattern
Centralized state management for collaboration:
- Document state synchronization across clients
- User presence and cursor tracking
- Operation history and version control
- Conflict-free replicated data types (CRDTs)

### 4. Observer Pattern
Implement reactive updates for collaboration features:
- Document change observers for real-time updates
- Presence change observers for user awareness
- Connection state observers for offline handling
- Operation observers for conflict resolution

### 5. Command Pattern
Encapsulate operations for undo/redo functionality:
- Operation objects with execute/undo methods
- Command history for version control
- Batch operations for performance optimization
- Operation validation and sanitization

### 6. Adapter Pattern
Abstract different collaboration backends:
- WebSocket adapter for real-time communication
- IndexedDB adapter for offline storage
- CRDT adapter for conflict-free operations
- REST adapter for initial synchronization

### 7. Strategy Pattern
Pluggable algorithms for different collaboration needs:
- Conflict resolution strategies (OT vs CRDT)
- Synchronization strategies (real-time vs batch)
- Presence strategies (cursor vs selection)
- Offline strategies (queue vs merge)

### 8. Proxy Pattern
Manage network communication and caching:
- Connection proxy for WebSocket management
- Operation proxy for batching and optimization
- Presence proxy for efficient updates
- Cache proxy for offline data access

## Expected Output

This template will produce:

- **Real-time Collaboration Server**: WebSocket-based server with operational transforms and conflict resolution
- **Client Collaboration Manager**: Robust client-side collaboration with offline support and reconnection
- **React Integration**: Ready-to-use collaborative editor components with presence awareness
- **Conflict Resolution**: Operational transform and CRDT implementations for distributed consistency
- **Offline Support**: IndexedDB-based local storage with automatic synchronization
- **Presence System**: Live cursors, user awareness, and activity tracking
- **Performance Optimization**: Efficient diff algorithms and operation batching
- **Testing Framework**: Comprehensive tests for collaboration features and edge cases

## Integration Points

- Connects with real-time communication modules for WebSocket management
- Integrates with security modules for authentication and authorization
- Works with performance modules for optimization and monitoring
- Supports analytics modules for collaboration metrics and insights
- Compatible with testing frameworks for collaborative feature validation

## Security Considerations

- Authentication and authorization for collaboration rooms
- Rate limiting for operation broadcasting to prevent abuse
- Input validation and sanitization for all collaborative operations
- Secure WebSocket connections with proper CORS configuration
- Access control for document permissions and user roles

## Performance Features

- Operation batching and debouncing for reduced network traffic
- Efficient diff algorithms for minimal operation size
- Connection pooling and WebSocket optimization
- Memory management for large documents and operation history
- Lazy loading and pagination for user presence and history

## Scalability Patterns

- Horizontal scaling with Redis for session management
- Load balancing for WebSocket connections
- Database sharding for large-scale document storage
- CDN integration for global collaboration performance
- Microservices architecture for collaboration components

This template provides a comprehensive foundation for building real-time collaborative applications with robust conflict resolution, offline support, and scalable architecture patterns.