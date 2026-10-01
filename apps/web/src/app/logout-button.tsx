'use client'

export function LogoutButton() {
  return (
    <button
      onClick={async () => {
        await fetch('/api/auth/logout', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' })
        window.location.href = '/'
      }}
    >
      Çıkış yap
    </button>
  )
}
