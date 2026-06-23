import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export function AuthPage() {
  const { signIn, signUp, supabaseConfigured } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!supabaseConfigured) {
    return (
      <div className="min-h-full flex items-center justify-center p-6">
        <div className="bg-card rounded-[18px] shadow-sm border border-border p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-text mb-2">TraceDay</h1>
          <p className="text-text-weak text-sm mb-4">
            未检测到 Supabase 配置，将以本地模式运行（数据存浏览器）。
          </p>
          <p className="text-xs text-text-weak">
            复制 <code className="bg-bg px-1 rounded">.env.example</code> 为{' '}
            <code className="bg-bg px-1 rounded">.env</code> 并填入密钥即可接入云端。
          </p>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isRegister) await signUp(email, password)
      else await signIn(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-full flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-card rounded-[18px] shadow-sm border border-border p-8 max-w-sm w-full"
      >
        <h1 className="text-2xl font-bold text-text mb-1">TraceDay</h1>
        <p className="text-text-weak text-sm mb-6">每天的时间，都值得被看见</p>

        <label className="block text-sm text-text-weak mb-1">邮箱</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-border rounded-lg px-3 py-2 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />

        <label className="block text-sm text-text-weak mb-1">密码</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-border rounded-lg px-3 py-2 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
          minLength={6}
        />

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50"
        >
          {loading ? '请稍候…' : isRegister ? '注册' : '登录'}
        </button>

        <button
          type="button"
          onClick={() => setIsRegister(!isRegister)}
          className="w-full mt-3 text-sm text-text-weak hover:text-text"
        >
          {isRegister ? '已有账号？登录' : '没有账号？注册'}
        </button>
      </form>
    </div>
  )
}
