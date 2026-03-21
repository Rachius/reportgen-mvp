import { createContext, useContext, useEffect, useState } from 'react'
import { auth, googleProvider } from '../lib/firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  updatePassword,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth'
import { loginToBackend } from '../lib/reportApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await loginToBackend()
        setUser(firebaseUser)
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const register = async (email, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await sendEmailVerification(cred.user)
    return cred
  }

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password)

  const loginWithGoogle = () =>
    signInWithPopup(auth, googleProvider)

  const logout = () => signOut(auth)

  const resetPassword = (email) =>
    sendPasswordResetEmail(auth, email)

  const changePassword = async (currentPassword, newPassword) => {
    const credential = EmailAuthProvider.credential(
      auth.currentUser.email,
      currentPassword
    )
    await reauthenticateWithCredential(auth.currentUser, credential)
    await updatePassword(auth.currentUser, newPassword)
  }

  const deleteAccount = async (currentPassword) => {
    const credential = EmailAuthProvider.credential(
      auth.currentUser.email,
      currentPassword
    )
    await reauthenticateWithCredential(auth.currentUser, credential)
    await deleteUser(auth.currentUser)
  }

  const resendVerification = () =>
    sendEmailVerification(auth.currentUser)

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      register,
      login,
      loginWithGoogle,
      logout,
      resetPassword,
      changePassword,
      deleteAccount,
      resendVerification,
    }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}