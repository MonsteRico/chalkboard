# WebSocket & Users Implementation Review

## Executive Summary

This document provides a comprehensive analysis of the WebSocket and users implementation, identifying non-standard patterns, type safety issues, inefficiencies, and areas for improvement.

---

## 🔴 Critical Issues

### 1. **No Shared Type Definitions**
**Problem:** Backend and frontend have completely separate type definitions with no guarantee of consistency.

**Current State:**
- Backend: `ClientData` type defined in `server.ts`
- Frontend: `SocketMessage` and `User` types defined separately
- Backend uses `any` for shapes: `const shapes = new Map<string, Set<any>>();`
- No compile-time guarantee that message structures match

**Impact:**
- Runtime errors when types don't match
- No IntelliSense/autocomplete for backend developers
- Difficult to refactor safely
- Type mismatches only discovered at runtime

**Recommendation:**
Create a shared types package or use a monorepo structure with shared types.

---

### 2. **No Message Validation**
**Problem:** Backend blindly broadcasts all messages without validation.

**Current State:**
```typescript
message(ws, message) {
  // Broadcast everything received to the room, excluding the sender
  ws.publish(ws.data.roomId, message);
}
```

**Issues:**
- No validation of message structure
- No type checking
- Malicious or malformed messages can crash clients
- No schema validation (e.g., using Zod)
- Client can send any message type, even ones that don't exist

**Recommendation:**
Implement message validation with schema checking before broadcasting.

---

### 3. **Inconsistent Field Naming**
**Problem:** Field names differ between backend and frontend.

**Examples:**
- Backend sends: `displayName` (camelCase)
- Frontend expects: `displayname` (lowercase) in `UPDATE_DISPLAY_NAME`
- Backend sends: `displayName` in `USER_JOINED`
- Frontend decodes: `decodeURIComponent(data.payload.displayName)`

**Impact:**
- Confusion and potential bugs
- Inconsistent API surface
- Harder to maintain

---

## 🟡 Non-Standard Patterns

### 4. **Double Room Management**
**Problem:** Using both Bun's pub/sub AND manual Map for room management.

**Current State:**
```typescript
const rooms = new Map<string, Set<ServerWebSocket<ClientData>>>();
// ... but also using ws.subscribe(roomId) and ws.publish(roomId, message)
```

**Issues:**
- Redundant data structures
- Potential for inconsistency
- More memory usage
- More complex code

**Why it exists:**
- Need to send `USER_JOINED` to others but not sender (Bun pub/sub includes sender)
- Need to track all users for `INITIAL_STATE`

**Recommendation:**
Use Bun's pub/sub as primary, maintain minimal tracking for user lists.

---

### 5. **URL Query Parameters for WebSocket Connection**
**Problem:** Using query parameters to pass connection data.

**Current State:**
```typescript
const ws = new WebSocket(`ws://localhost:3000/ws?roomId=${roomId}&displayName=${encodeURIComponent(...)}&...`);
```

**Issues:**
- URL length limitations
- Security concerns (sensitive data in URL)
- Not standard practice (usually use headers or initial message)
- Hard to extend

**Standard Approach:**
- Use WebSocket subprotocols
- Send connection data in initial message after connection
- Use headers for authentication

---

### 6. **No Message Acknowledgment or Retry Logic**
**Problem:** No way to know if messages were received or handle failures.

**Issues:**
- No retry mechanism for failed sends
- No acknowledgment system
- No way to detect message loss
- No sequence numbers for ordering

**Recommendation:**
Implement message IDs and acknowledgment system for critical messages.

---

### 7. **Complex useEffect Hook**
**Problem:** `useWebSocket` hook has too many responsibilities.

**Current Issues:**
- Handles connection lifecycle
- Manages user ID generation
- Handles all message types
- Manages connection status
- Shows toast notifications
- Updates multiple atoms
- Complex dependency array

**Impact:**
- Hard to test
- Hard to maintain
- Difficult to reason about
- Potential for bugs

**Recommendation:**
Split into smaller, focused hooks:
- `useWebSocketConnection` - connection management
- `useWebSocketMessages` - message handling
- `useUserPresence` - user join/leave logic

---

## 🟠 Type Safety Issues

### 8. **Backend Uses `any` for Shapes**
```typescript
const shapes = new Map<string, Set<any>>();
```

**Problem:**
- No type safety
- Can store anything
- No validation

**Recommendation:**
Import or define Shape types on backend.

---

### 9. **No Type Guards or Runtime Validation**
**Problem:** Frontend assumes all messages are valid.

**Current State:**
```typescript
const data: SocketMessage = JSON.parse(event.data);
switch(data.type) {
  // No validation that data actually matches SocketMessage
}
```

**Issues:**
- `JSON.parse` can throw
- No validation that `data.type` exists
- No validation that payload structure matches
- Type assertion without runtime check

**Recommendation:**
Use Zod or similar for runtime validation with TypeScript types.

---

### 10. **Missing Message Handlers**
**Problem:** Frontend defines message types but doesn't handle them all.

**Defined but not handled:**
- `ADD_SHAPE`
- `REMOVE_SHAPE`
- `UPDATE_SHAPE`
- `CLEAR_CANVAS`
- `DRAW_UPDATE` (empty handler)

**Impact:**
- Dead code
- Confusion about what's supported
- Potential for bugs if backend sends these

---

## 🟢 Inefficiencies

### 11. **Inefficient Shape Storage**
**Problem:** Shapes stored as `Set` but converted to `Array` on every send.

```typescript
const shapes = new Map<string, Set<any>>();
// ...
shapes: Array.from(shapes.get(roomId) || [])
```

**Recommendation:**
Use `Array` if order matters, or keep as `Set` and only convert when needed.

---

### 12. **No Message Batching or Throttling**
**Problem:** Every message is sent individually.

**Issues:**
- High network overhead for rapid updates
- No batching for multiple shape updates
- No throttling for cursor position updates

**Recommendation:**
Implement batching for rapid updates (e.g., drawing strokes).

---

### 13. **Redundant URL Decoding**
**Problem:** Values decoded multiple times.

**Current:**
- Backend: `decodeURIComponent(url.searchParams.get("displayName") || "Anonymous")`
- Frontend: `decodeURIComponent(data.payload.displayName)`

**Note:** `url.searchParams.get()` already decodes, so backend decoding is redundant.

---

### 14. **No Connection Pooling or Rate Limiting**
**Problem:** No protection against abuse.

**Issues:**
- No rate limiting per connection
- No max connections per IP
- No message rate limiting
- Vulnerable to DoS

---

## 🔵 Code Quality & Maintainability

### 15. **Inconsistent Error Handling**
**Problem:** Different error handling strategies throughout.

**Issues:**
- Some errors show toasts, others don't
- No centralized error handling
- Inconsistent error recovery
- No error logging

---

### 16. **No Reconnection Logic**
**Problem:** If connection drops, user must refresh page.

**Current State:**
- Connection closes → shows toast
- No automatic reconnection
- No exponential backoff
- No reconnection state management

**Recommendation:**
Implement automatic reconnection with exponential backoff.

---

### 17. **Manual User ID Management**
**Problem:** Complex logic for generating and storing user IDs.

**Current State:**
- Check if ID exists
- Generate if missing
- Store in ref
- Update atom
- Re-run effect

**Issues:**
- Complex flow
- Potential race conditions
- Hard to reason about

**Recommendation:**
Use a simpler approach or move ID generation to a separate hook.

---

### 18. **No Testing Infrastructure**
**Problem:** No tests for WebSocket logic.

**Issues:**
- Hard to verify correctness
- Difficult to refactor safely
- No regression testing

---

## 📋 Recommendations Summary

### High Priority

1. **Create Shared Types Package**
   - Move all WebSocket message types to shared location
   - Use in both backend and frontend
   - Ensure compile-time type safety

2. **Implement Message Validation**
   - Use Zod or similar for runtime validation
   - Validate all incoming messages on backend
   - Validate on frontend before processing

3. **Fix Inconsistent Naming**
   - Standardize on camelCase for all fields
   - Update all message types consistently

4. **Simplify Room Management**
   - Use Bun pub/sub as primary mechanism
   - Maintain minimal user tracking separately

5. **Add Message Handlers**
   - Implement all defined message types
   - Remove unused message types
   - Document which messages are used

### Medium Priority

6. **Refactor useWebSocket Hook**
   - Split into smaller, focused hooks
   - Separate concerns (connection, messages, presence)
   - Improve testability

7. **Add Reconnection Logic**
   - Automatic reconnection with exponential backoff
   - Connection state management
   - Handle reconnection edge cases

8. **Improve Error Handling**
   - Centralized error handling
   - Consistent error recovery
   - Error logging

9. **Add Type Guards**
   - Runtime validation with TypeScript types
   - Type-safe message parsing
   - Better error messages

### Low Priority

10. **Optimize Shape Storage**
    - Choose appropriate data structure
    - Minimize conversions

11. **Add Message Batching**
    - Batch rapid updates
    - Reduce network overhead

12. **Add Rate Limiting**
    - Protect against abuse
    - Per-connection limits
    - Per-IP limits

13. **Improve Connection Setup**
    - Move from query params to initial message
    - Better authentication flow
    - More extensible

---

## 🎯 Proposed Architecture Improvements

### Shared Types Structure
```
shared/
  types/
    messages.ts      # All WebSocket message types
    user.ts          # User type definitions
    shape.ts         # Shape type definitions
    index.ts         # Exports
```

### Backend Message Validation
```typescript
import { z } from 'zod';
import { SocketMessageSchema } from 'shared/types';

message(ws, rawMessage) {
  try {
    const message = SocketMessageSchema.parse(JSON.parse(rawMessage.toString()));
    // Validate and process
    ws.publish(ws.data.roomId, JSON.stringify(message));
  } catch (error) {
    // Handle validation error
  }
}
```

### Frontend Type-Safe Message Handling
```typescript
import { SocketMessage, SocketMessageSchema } from 'shared/types';
import { z } from 'zod';

ws.onmessage = (event) => {
  const result = SocketMessageSchema.safeParse(JSON.parse(event.data));
  if (!result.success) {
    console.error('Invalid message:', result.error);
    return;
  }
  const data: SocketMessage = result.data;
  // Type-safe handling
};
```

### Simplified Room Management
```typescript
// Use Bun's pub/sub primarily
// Only track user list separately for INITIAL_STATE
const userLists = new Map<string, Map<string, ClientData>>();

open(ws) {
  ws.subscribe(ws.data.roomId);
  
  // Track user for INITIAL_STATE only
  if (!userLists.has(ws.data.roomId)) {
    userLists.set(ws.data.roomId, new Map());
  }
  userLists.get(ws.data.roomId)!.set(ws.data.id, ws.data);
  
  // Send to others (Bun pub/sub excludes sender automatically)
  ws.publish(ws.data.roomId, JSON.stringify({
    type: "USER_JOINED",
    payload: ws.data
  }));
}
```

---

## 📊 Code Metrics

- **Type Safety:** 3/10 (no shared types, uses `any`)
- **Error Handling:** 4/10 (inconsistent, no recovery)
- **Maintainability:** 5/10 (complex hooks, mixed concerns)
- **Performance:** 6/10 (some inefficiencies, but functional)
- **Security:** 4/10 (no validation, no rate limiting)
- **Testability:** 2/10 (no tests, tightly coupled)

---

## 🔍 Specific Code Issues

### Backend (`server.ts`)

1. **Line 15:** `Set<any>` should be `Set<Shape>`
2. **Line 31:** `decodeURIComponent` is redundant (searchParams already decodes)
3. **Line 92-94:** No message validation before broadcast
4. **Line 67-77:** Manual user notification (could use pub/sub better)
5. **Line 80-81:** Inefficient array conversion

### Frontend (`useWebSocket.ts`)

1. **Line 156:** No error handling for `JSON.parse`
2. **Line 158-159:** Empty `DRAW_UPDATE` handler
3. **Line 19:** Typo: `displayname` should be `displayName`
4. **Line 33-203:** Hook is too complex, should be split
5. **Line 203:** Dependency array missing `localUser.displayName`, `localUser.cursorColor`, `localUser.currentTool`, `roomId`
6. **Line 164:** Double decoding (already decoded by backend)
7. **Line 177:** Typo: `displayname` should be `displayName`

### Frontend (`usersAtoms.ts`)

1. **Line 61:** Parameter name `displayname` should be `displayName` for consistency
2. **Line 24:** Using `getDefaultStore()` - ensure this is the correct pattern for your use case

---

## ✅ Quick Wins

1. Fix typo: `displayname` → `displayName` in `UPDATE_DISPLAY_NAME`
2. Remove redundant `decodeURIComponent` calls
3. Add error handling for `JSON.parse`
4. Remove empty `DRAW_UPDATE` handler or implement it
5. Fix dependency array in `useWebSocket` useEffect
6. Change `Set<any>` to `Set<Shape>` (after creating shared types)

---

## 🚀 Long-Term Improvements

1. **Monorepo with Shared Types**
   - Use Turborepo or Nx
   - Shared package for types
   - Single source of truth

2. **Message Protocol Versioning**
   - Version messages for backward compatibility
   - Handle version mismatches gracefully

3. **Connection State Machine**
   - Explicit state management
   - Better handling of edge cases
   - Easier to test

4. **Observability**
   - Logging for all messages
   - Metrics for connection health
   - Error tracking

5. **Documentation**
   - API documentation for messages
   - Connection flow diagrams
   - Error handling guide
