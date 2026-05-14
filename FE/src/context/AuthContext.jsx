import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('auth_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  function persist(updated) {
    localStorage.setItem('auth_user', JSON.stringify(updated))
    return updated
  }

  function login(userData) {
    setUser(userData)
    localStorage.setItem('auth_user', JSON.stringify(userData))
  }

  function updateUser(partial) {
    setUser((prev) => persist({ ...prev, ...partial }))
  }

  // readHistory: { [storyId]: lastChapterNum }
  function updateReadHistory(storyId, chapterNum) {
    setUser((prev) => {
      if (!prev) return prev
      const readHistory = prev.readHistory ?? {}
      if (readHistory[storyId] === chapterNum) return prev
      return persist({ ...prev, readHistory: { ...readHistory, [storyId]: chapterNum } })
    })
  }

  function removeFromRead(storyId) {
    setUser((prev) => {
      if (!prev) return prev
      const { [storyId]: _, ...rest } = prev.readHistory ?? {}
      return persist({ ...prev, readHistory: rest })
    })
  }

  function toggleBookmark(storyId) {
    setUser((prev) => {
      if (!prev) return prev
      const bookmark = prev.bookmark ?? []
      return persist({
        ...prev,
        bookmark: bookmark.includes(storyId)
          ? bookmark.filter((id) => id !== storyId)
          : [...bookmark, storyId],
      })
    })
  }

  function logout() {
    setUser(null)
    localStorage.removeItem('auth_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, updateUser, updateReadHistory, removeFromRead, toggleBookmark, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
