import { useAuth } from '../context/AuthContext.jsx'
import styles from './AccountStatusGate.module.css'

function StatusScreen({ title, description, tone, actionLabel, onAction }) {
  return (
    <div className={styles.screen}>
      <div className={`${styles.panel} corner-box`}>
        <span className={`${styles.badge} ${styles[tone]}`}>{tone === 'pending' ? 'Em analise' : 'Acesso bloqueado'}</span>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description}>{description}</p>
        {actionLabel ? (
          <button type="button" className={styles.action} onClick={onAction}>
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  )
}

export default function AccountStatusGate({ children }) {
  const {
    demoMode,
    hasFirebaseConfig,
    profileLoading,
    accountProfile,
    logout,
  } = useAuth()

  if (!hasFirebaseConfig || demoMode) {
    return children
  }

  if (profileLoading) {
    return (
      <div className={styles.loading}>
        Verificando status da conta...
      </div>
    )
  }

  const status = accountProfile?.status || 'active'

  if (status === 'pending') {
    return (
      <StatusScreen
        tone="pending"
        title="Cadastro em analise"
        description="Seu perfil foi recebido e aguarda liberacao do administrador. Assim que a conta for aprovada, o painel sera liberado automaticamente."
        actionLabel="Sair da conta"
        onAction={() => logout()}
      />
    )
  }

  if (status === 'suspended') {
    return (
      <StatusScreen
        tone="blocked"
        title="Conta recusada"
        description={accountProfile?.rejectionReason
          ? `O administrador recusou o cadastro. Motivo: ${accountProfile.rejectionReason}`
          : 'O administrador recusou o cadastro desta conta. Entre em contato com o suporte se precisar de mais informacoes.'}
        actionLabel="Voltar para o login"
        onAction={() => logout()}
      />
    )
  }

  return children
}
