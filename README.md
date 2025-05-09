# Smart AutoShop - Learning Management System

## Project Overview
Smart AutoShop is a comprehensive learning management system designed for automotive education and training. The application provides a platform for managing educational content, quizzes, certificates, and user progress tracking.

## Features

### 1. User Authentication
- Email/Password authentication
- Google OAuth integration
- User role management (Educators, Students)
- Secure session management
- Password recovery system

### 2. Learning Management
- Course materials upload and management
- Video content integration
- Interactive quizzes and assessments
- Progress tracking
- Certificate generation and management

### 3. Content Management
- Learning materials organization
- Video content hosting
- Quiz creation and management
- Certificate generation
- File upload and storage

### 4. User Dashboard
- Progress tracking
- Course completion status
- Certificate management
- Profile customization

## Technical Architecture

### Frontend
- React.js with Vite
- TailwindCSS for styling
- React Router for navigation
- React Toastify for notifications
- HTML2Canvas and jsPDF for certificate generation

### Backend
- Firebase Authentication
- Firebase Firestore (NoSQL Database)
- Firebase Storage

### Database Schema

#### Collections

1. users
```javascript
{
  uid: string,
  name: string,
  email: string,
  role: string,
  department: string,
  timestamp: timestamp
}
```

2. learningMaterials
```javascript
{
  id: string,
  title: string,
  description: string,
  url: string,
  uploadedBy: string,
  createdAt: timestamp,
  rating: number,
  read: boolean
}
```

3. quizzes
```javascript
{
  id: string,
  title: string,
  description: string,
  difficulty: string,
  category: string,
  questions: Array<{
    text: string,
    options: string[],
    correctAnswer: number
  }>
}
```

4. certificates
```javascript
{
  id: string,
  title: string,
  description: string,
  url: string,
  uploadedBy: string,
  userName: string,
  createdAt: timestamp,
  downloaded: boolean
}
```

## Installation and Setup

1. Clone the repository
```bash
git clone [repository-url]
```

2. Install dependencies
```bash
npm install
```

3. Configure Firebase
- Create a Firebase project
- Enable Authentication (Email/Password and Google)
- Set up Firestore Database
- Configure Firebase Storage
- Add your Firebase configuration to `src/config/firebase.js`

4. Start the development server
```bash
npm run dev
```

## Development Guidelines

### Code Structure
- `/src/components`: Reusable UI components
- `/src/pages`: Main application pages
- `/src/config`: Configuration files
- `/src/hooks`: Custom React hooks
- `/src/assets`: Static assets (images, icons)

### Best Practices
1. Use functional components with hooks
2. Implement proper error handling
3. Follow Firebase security rules
4. Maintain consistent code formatting
5. Write meaningful commit messages

## Security Considerations
1. Implement proper authentication checks
2. Secure Firebase rules
3. Validate user inputs
4. Protect sensitive routes
5. Implement proper error handling

## Deployment
The application is configured for deployment on Firebase Hosting:

1. Build the application
```bash
npm run build
```

2. Deploy to Firebase
```bash
firebase deploy
```

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
[Specify your license here]

## Contact
[Add contact information]
