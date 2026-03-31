# GenInfinity Frontend

A beautiful social media platform UI built with React + Vite, styled with a dreamy purple/pink aesthetic.

## Prerequisites

- Node.js 18+
- Backend running on `http://localhost:8081`

## Getting Started

```bash
# Install dependencies
npm install

# Start development server (runs on port 3000)
npm run dev
```

## Backend API Endpoints Expected

The frontend connects to `http://localhost:8081` and expects these endpoints:

### Auth
- `POST /auth/login` — `{ username, password }` → `{ token, username, email, ... }`
- `POST /auth/register` — `{ username, email, password }` → `{ token, username, email, ... }`
- `POST /auth/logout`
- `GET  /auth/me` — returns current user

### Users
- `GET    /users/:username` — get profile
- `PUT    /users/:username` — update profile
- `GET    /users/search?q=` — search users
- `POST   /users/:username/follow`
- `DELETE /users/:username/follow`
- `GET    /users/suggestions`

### Posts
- `GET    /posts/feed?page=0&size=10`
- `GET    /posts/user/:username?page=0&size=10`
- `GET    /posts/:id`
- `POST   /posts` — `{ title, content, imageUrl }`
- `PUT    /posts/:id`
- `DELETE /posts/:id`
- `POST   /posts/:id/like`
- `DELETE /posts/:id/like`
- `GET    /posts/:id/comments`
- `POST   /posts/:id/comments` — `{ content }`
- `DELETE /posts/:id/comments/:commentId`

## Build for Production

```bash
npm run build
```

Output goes to the `dist/` folder.

## Project Structure

```
src/
├── components/     # Navbar, PostCard, CommentBox, UserProfile
├── pages/          # Login, Register, Home, Profile, CreatePost
├── services/       # api.js, userService.js, postService.js
├── context/        # AuthContext.jsx
├── hooks/          # useAuth.js
├── App.jsx
└── main.jsx
```
