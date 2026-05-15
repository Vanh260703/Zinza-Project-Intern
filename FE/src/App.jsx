import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import HomePage from './pages/HomePage'
import ProfilePage from './pages/ProfilePage'
import StoryDetailPage from './pages/StoryDetailPage'
import ChapterReadPage from './pages/ChapterReadPage'
import LibraryPage from './pages/LibraryPage'
import MyStoriesPage from './pages/MyStoriesPage'
import MyStoryDetailPage from './pages/MyStoryDetailPage'
import RankPage from './pages/RankPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/story/:id" element={<StoryDetailPage />} />
          <Route path="/story/:id/read/:chapterNum" element={<ChapterReadPage />} />
          <Route path="/tu-truyen" element={<LibraryPage />} />
          <Route path="/truyen-cua-toi" element={<MyStoriesPage />} />
          <Route path="/truyen-cua-toi/:id" element={<MyStoryDetailPage />} />
          <Route path="/bang-xep-hang" element={<RankPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
