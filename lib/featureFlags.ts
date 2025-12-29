// 機能フラグの定義
export interface FeatureFlag {
  id: string
  name: string
  description: string
  status: 'development' | 'testing' | 'staging' | 'production' | 'disabled'
  enabledForOrgs: string[] // 有効な事業所ID
  enabledForAll: boolean // 全事業所に公開
  createdAt: string
  updatedAt: string
  version: string
}

// 利用可能な機能フラグ
export const FEATURE_FLAGS: Record<string, FeatureFlag> = {
  'ai-care-plan': {
    id: 'ai-care-plan',
    name: 'AIケアプラン作成',
    description: 'AIを活用した自動ケアプラン作成機能',
    status: 'testing',
    enabledForOrgs: ['org-001', 'org-002'],
    enabledForAll: false,
    createdAt: '2025-12-20',
    updatedAt: '2025-12-25',
    version: 'v1.2.0'
  },
  'voice-input': {
    id: 'voice-input',
    name: '音声入力記録',
    description: '音声認識による記録入力機能',
    status: 'development',
    enabledForOrgs: [],
    enabledForAll: false,
    createdAt: '2025-12-15',
    updatedAt: '2025-12-20',
    version: 'v0.8.0'
  },
  'vital-sync': {
    id: 'vital-sync',
    name: 'バイタルデータ連携',
    description: 'ウェアラブルデバイスとのバイタルデータ連携',
    status: 'staging',
    enabledForOrgs: ['org-001', 'org-002', 'org-003', 'org-004', 'org-005'],
    enabledForAll: false,
    createdAt: '2025-11-01',
    updatedAt: '2025-12-28',
    version: 'v1.0.0'
  },
  'family-portal': {
    id: 'family-portal',
    name: '家族連絡機能',
    description: '利用者家族との連絡・情報共有機能',
    status: 'production',
    enabledForOrgs: [],
    enabledForAll: true,
    createdAt: '2025-09-01',
    updatedAt: '2025-11-15',
    version: 'v2.1.0'
  }
}

// 機能フラグをローカルストレージから取得
export function getFeatureFlags(): Record<string, FeatureFlag> {
  if (typeof window === 'undefined') return FEATURE_FLAGS

  const stored = localStorage.getItem('feature-flags')
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return FEATURE_FLAGS
    }
  }
  return FEATURE_FLAGS
}

// 機能フラグをローカルストレージに保存
export function saveFeatureFlags(flags: Record<string, FeatureFlag>) {
  if (typeof window === 'undefined') return
  localStorage.setItem('feature-flags', JSON.stringify(flags))
}

// 特定の機能が有効かチェック
export function isFeatureEnabled(
  featureId: string,
  organizationId?: string,
  isDeveloper: boolean = false
): boolean {
  const flags = getFeatureFlags()
  const feature = flags[featureId]

  if (!feature) return false

  // 開発者は常にアクセス可能
  if (isDeveloper) return true

  // 無効化されている機能
  if (feature.status === 'disabled') return false

  // 全事業所に公開されている
  if (feature.enabledForAll) return true

  // 特定の事業所に有効化されている
  if (organizationId && feature.enabledForOrgs.includes(organizationId)) {
    return true
  }

  return false
}

// 機能のステータスを更新
export function updateFeatureStatus(
  featureId: string,
  status: FeatureFlag['status']
) {
  const flags = getFeatureFlags()
  if (flags[featureId]) {
    flags[featureId].status = status
    flags[featureId].updatedAt = new Date().toISOString().split('T')[0]
    saveFeatureFlags(flags)
  }
}

// 事業所に機能を有効化
export function enableFeatureForOrg(featureId: string, orgId: string) {
  const flags = getFeatureFlags()
  if (flags[featureId]) {
    if (!flags[featureId].enabledForOrgs.includes(orgId)) {
      flags[featureId].enabledForOrgs.push(orgId)
      flags[featureId].updatedAt = new Date().toISOString().split('T')[0]
      saveFeatureFlags(flags)
    }
  }
}

// 事業所の機能を無効化
export function disableFeatureForOrg(featureId: string, orgId: string) {
  const flags = getFeatureFlags()
  if (flags[featureId]) {
    flags[featureId].enabledForOrgs = flags[featureId].enabledForOrgs.filter(
      id => id !== orgId
    )
    flags[featureId].updatedAt = new Date().toISOString().split('T')[0]
    saveFeatureFlags(flags)
  }
}

// 全事業所に公開
export function enableFeatureForAll(featureId: string) {
  const flags = getFeatureFlags()
  if (flags[featureId]) {
    flags[featureId].enabledForAll = true
    flags[featureId].status = 'production'
    flags[featureId].updatedAt = new Date().toISOString().split('T')[0]
    saveFeatureFlags(flags)
  }
}

// 全事業所から無効化
export function disableFeatureForAll(featureId: string) {
  const flags = getFeatureFlags()
  if (flags[featureId]) {
    flags[featureId].enabledForAll = false
    flags[featureId].updatedAt = new Date().toISOString().split('T')[0]
    saveFeatureFlags(flags)
  }
}
