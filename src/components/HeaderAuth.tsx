import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { AuthUser } from '../types/auth'

type Mode = 'login' | 'signup'

interface HeaderAuthProps {
  user: AuthUser | null
  isLoading: boolean
  onSignIn: (email: string, password: string) => Promise<void>
  onSignUp: (email: string, password: string) => Promise<void>
  onSignOut: () => Promise<void>
  openSignal?: number
}

export function HeaderAuth({
  user,
  isLoading,
  onSignIn,
  onSignUp,
  onSignOut,
  openSignal = 0,
}: HeaderAuthProps) {
  const [isFormOpen, setIsFormOpen] = useState(false)

  useEffect(() => {
    if (openSignal > 0) setIsFormOpen(true)
  }, [openSignal])
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isLoading) return null

  if (user) {
    return (
      <div className="header-auth">
        <span className="header-auth-email">{user.email}</span>
        <button type="button" className="btn-ghost" onClick={() => void onSignOut()}>
          로그아웃
        </button>
      </div>
    )
  }

  function selectMode(nextMode: Mode) {
    setMode(nextMode)
    setError(null)
    setInfoMessage(null)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setInfoMessage(null)
    setIsSubmitting(true)

    try {
      if (mode === 'login') {
        await onSignIn(email, password)
        setIsFormOpen(false)
        setPassword('')
      } else {
        await onSignUp(email, password)
        setInfoMessage('회원가입 요청을 보냈습니다. 이메일 인증이 켜져 있다면 확인 메일을 확인해주세요.')
        setPassword('')
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="header-auth">
      <button type="button" className="btn-primary" onClick={() => setIsFormOpen((prev) => !prev)}>
        로그인
      </button>

      {isFormOpen && (
        <div className="auth-popover">
          <div className="auth-mode-toggle">
            <button
              type="button"
              className={mode === 'login' ? 'active' : ''}
              onClick={() => selectMode('login')}
            >
              로그인
            </button>
            <button
              type="button"
              className={mode === 'signup' ? 'active' : ''}
              onClick={() => selectMode('signup')}
            >
              회원가입
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label>
              이메일
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </label>
            <label>
              비밀번호
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                minLength={6}
                required
              />
            </label>

            {error && <p className="auth-error">{error}</p>}
            {infoMessage && <p className="auth-info">{infoMessage}</p>}

            <button type="submit" disabled={isSubmitting}>
              {mode === 'login' ? '로그인' : '회원가입'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
