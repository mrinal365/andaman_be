# 🌊 Andaman Backend - Feed API Guide

Welcome to the **Andaman Feed System**! This document explains everything about how the social feed, posts, and interactions work. 

Imagine it like a digital community where you can share stories (**Guides**), news (**News**), or quick thoughts (**Updates**). You can play with it by liking, saving, or voting!

---

## 🏗️ Architecture: How it fits together
Every action you take follows this simple flow:
`Route (The Door)` → `Controller (The Manager)` → `Service (The Worker)` → `Model (The Memory)`

---

## 📜 1. Feed System (Discovery)
These APIs let you see what's happening in the community. They support **Pagination** using a `cursor` (the `createdAt` time of the last post you saw).

### 📬 Get the Main Feed
- **Route:** `GET /api/feed`
- **Query Params:** `cursor` (Optional)
- **Example Response (Success - Logged In):**
```json
[
  {
    "_id": "65d8a1...",
    "authorId": "65d8a0...",
    "type": "guide",
    "createdAt": "2024-02-22T10:00:00.000Z",
    "feed": {
      "title": "Exploring Havelock",
      "previewText": "The beaches in Havelock are breathtaking...",
      "coverImage": "https://cdn.com/beach.jpg",
      "imageCount": 3
    },
    "stats": {
      "likeCount": 120,
      "commentCount": 15,
      "viewCount": 500
    },
    "viewerState": {
      "liked": true,
      "saved": false,
      "vote": 1
    }
  }
]
```
- **Case: Anonymous User**
  - Same structure, but `viewerState` will always be:
  ```json
  "viewerState": { "liked": false, "saved": false, "vote": 0 }
  ```

---

## 📝 2. Post Management
### ✍️ Create a New Post
- **Route:** `POST /api/posts`
- **Body Example (Guide):**
```json
{
  "type": "guide",
  "content": {
    "title": "A Day in Port Blair",
    "body": "This is a very long text with more than 50 characters to pass the validation check..."
  },
  "images": ["https://img.com/pb1.jpg"]
}
```
- **Body Example (Update):**
```json
{ "type": "update", "content": { "shortText": "Just arrived!" } }
```
- **Case: Validation Error (Content too short)**
  - **Status:** 400 Bad Request
  ```json
  { "success": false, "message": "Content too short" }
  ```

### 🔍 Get a Single Post
- **Route:** `GET /api/posts/:postId`
- **Example Response:**
```json
{
  "_id": "65d8a1...",
  "type": "news",
  "content": { "title": "New Ferry Service", "text": "Starting from tomorrow..." },
  "stats": { "likeCount": 5, "viewCount": 20 }
}
```
- **Case: Post Not Found**
  - **Status:** 404 Not Found
  ```json
  { "success": false, "message": "Post not found" }
  ```

### 🛠️ Update Your Post
- **Route:** `PATCH /api/posts/:postId`
- **Body:** `{ "content": { "title": "Updated Title" } }`
- **Response:**
```json
{
  "_id": "65d8a1...",
  "status": "published",
  "content": { "title": "Updated Title", "body": "..." },
  "updatedAt": "2024-02-22T12:00:00.000Z"
}
```

### 🗑️ Delete Your Post
- **Route:** `DELETE /api/posts/:postId`
- **Response:**
```json
{ "success": true }
```

---

## ❤️ 3. Interactions (Social Fun)
All interactions are **Toggles**.

### 👍 Like/Unlike Post
- **Route:** `POST /api/posts/:postId/like`
- **Response (First time):** `{ "liked": true }`
- **Response (Second time):** `{ "liked": false }`

### � Like/Unlike Comment
- **Route:** `POST /api/comments/:commentId/like`
- **Response:** `{ "liked": true }`

### �💾 Save/Unsave Post
- **Route:** `POST /api/posts/:postId/save`
- **Response:** `{ "saved": true }` (or `false` if untoggled)

### 🔼 Vote Post
- **Route:** `POST /api/posts/:postId/vote`
- **Body:** `{ "value": 1 }` (Upvote) or `{ "value": -1 }` (Downvote)
- **Response:** `{ "vote": 1 }`

### 📢 Reshare Post
- **Route:** `POST /api/posts/:postId/reshare`
- **Response:**
```json
{ "reshared": true }
```

---

## 💬 4. Comment System
### 🗨️ Add a Comment
- **Route:** `POST /api/posts/:postId/comments`
- **Body:** `{ "text": "This is so helpful!" }`
- **Response:**
```json
{
  "_id": "65d8b2...",
  "postId": "65d8a1...",
  "text": "This is so helpful!",
  "authorId": "65d8c3...",
  "createdAt": "..."
}
```

### ↩️ Reply to a Comment
- **Route:** `POST /api/comments/:commentId/reply`
- **Body:** `{ "text": "I agree!" }`
- **Response:**
```json
{
  "_id": "65d8b3...",
  "parentCommentId": "65d8b2...",
  "text": "I agree!",
  "authorId": "65d8c4..."
}
```

### 📜 List Comments (Nested)
- **Route:** `GET /api/posts/:postId/comments`
- **Example Response:**
```json
[
  {
    "_id": "C1",
    "text": "Great guide!",
    "replies": [
      { "_id": "R1", "text": "Thanks!", "parentCommentId": "C1", "replies": [] }
    ]
  }
]
```

### 🗑️ Delete Your Comment
- **Route:** `DELETE /api/comments/:commentId`
- **Response:**
```json
{ "success": true }
```

---

## 👁️ 5. Views & Analytics
### 📈 Record a View
- **Route:** `POST /api/posts/:postId/view`
- **Case: Counted (First time this hour)**
  ```json
  { "counted": true }
  ```
- **Case: Not Counted (Spam protection hit)**
  ```json
  { "counted": false }
  ```

---

## 🔐 Google Login Flow

The application implements a unified Google OAuth integration for a seamless onboarding experience.

### 📱 Frontend (Andaman FE)
1. **Google SDK**: Uses `@react-oauth/google` for authentication.
2. **Implicit Flow**: Retrieves an `access_token` directly from Google via `useGoogleLogin`.
3. **Backend Handshake**: Sends the `access_token` to the backend `POST /api/v1/auth/google` for verification.
4. **Onboarding UX**: 
   - If the user is **new** (`isNewUser: true`), a `GoogleProgressModal` is displayed to provide visual feedback during the automated account setup.
   - If the user is **returning**, they are redirected directly to the feed.

### ⚙️ Backend (Andaman BE)
1. **Endpoint**: `POST /api/v1/auth/google`
2. **Verification**: Validates the token using Google's UserInfo API (`https://www.googleapis.com/oauth2/v3/userinfo`).
3. **Account Linking**: 
   - Checks if a user with the Google email already exists in the database.
   - If found, it simply logs them in and returns a JWT.
4. **Auto-Registration (New Users)**:
   - **Unique Handle**: Automatically generates a unique handle by appending a random 10-digit number to the user's name (e.g., `johndoe7283940561`).
   - **Secure Password**: Generates a random 20-character secure password.
   - **Profile Sync**: Syncs the user's name and profile picture from their Google account.
5. **Response**: Returns the JWT token, user metadata, and an `isNewUser` flag to the frontend.

---

## 🛠️ Global Errors
| Case | Status | Response |
| :--- | :--- | :--- |
| **No Token** | 401 | `{ "success": false, "message": "Not authorized..." }` |
| **Wrong ID** | 400 | `{ "success": false, "message": "Invalid ID format" }` |
| **Server Boom** | 500 | `{ "success": false, "message": "Internal Server Error" }` |

Happy Coding! 🌴
