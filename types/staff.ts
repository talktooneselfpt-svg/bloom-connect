/**
 * 職員データの型定義
 */
export interface Staff {
  /** 組織ID */
  organizationId: string;
  /** Firebase Authentication の UID */
  uid: string;
  /** 個人番号（ログイン用・職員番号） */
  staffNumber: string;
  /** 氏名（漢字） */
  nameKanji: string;
  /** 氏名（ひらがな） */
  nameKana: string;
  /** 職種（複数選択可能） */
  jobTypes: string[];
  /** 役職 */
  position: string;
  /** 権限ロール */
  role: string;
  /** 所属部署（任意） */
  department?: string;
  /** 勤務形態（任意） */
  employmentType?: string;
  /** 会社用電話番号 */
  phoneCompany: string;
  /** 個人用電話番号（任意） */
  phonePersonal?: string;
  /** メールアドレス */
  email: string;
  /** 在職状態 */
  isActive: boolean;
  /** パスワード設定完了フラグ（初回ログイン時のパスワード設定が完了しているか） */
  passwordSetupCompleted: boolean;
  /** 入社日（任意） */
  hireDate?: string;
  /** 退職日（任意） */
  retireDate?: string;
  /** 資格番号（任意） */
  licenseNumber?: string;
  /** 緊急連絡先（任意） */
  emergencyContact?: string;
  /** プロフィール写真URL（任意） */
  photoUrl?: string;
  /** メモ（任意） */
  memo?: string;
  /** 作成日時 */
  createdAt: string;
  /** 更新日時 */
  updatedAt: string;
  /** 作成者 */
  createdBy: string;
  /** 更新者 */
  updatedBy: string;
}

/**
 * 職種のカテゴリー定義
 */
export const JOB_CATEGORIES = {
  '介護・福祉系': [
    '介護福祉士',
    '社会福祉士',
    '精神保健福祉士',
  ],
  '心理・保育系': [
    '公認心理師',
    '保育士',
    '臨床心理士',
  ],
  '医療・リハビリ系': [
    '医師',
    '歯科医師',
    '看護師',
    '准看護師',
    '保健師',
    '理学療法士（PT）',
    '作業療法士（OT）',
    '言語聴覚士（ST）',
    '視能訓練士',
    '義肢装具士',
    '歯科衛生士',
    '管理栄養士',
    '栄養士',
    '薬剤師',
    'あん摩マッサージ指圧師',
    'はり師',
    'きゅう師',
    '柔道整復師',
  ],
  '介護資格・研修': [
    '介護職員初任者研修',
    '介護職員実務者研修',
    '介護支援専門員（ケアマネジャー）',
    '主任介護支援専門員',
    '認知症介護実践者研修',
    '認知症介護リーダー研修',
    '認知症介護指導者研修',
  ],
  '医療的ケア・専門研修': [
    '喀痰吸引等研修（1号）',
    '喀痰吸引等研修（2号）',
    '喀痰吸引等研修（3号）',
    'サービス管理責任者（サビ管）',
    '児童発達支援管理責任者（児発管）',
    '相談支援専門員（初任）',
    '相談支援専門員（現任）',
    '強度行動障害支援者研修（基礎）',
    '強度行動障害支援者研修（実践）',
    '行動援護従業者研修',
    '同行援護従業者研修（一般）',
    '同行援護従業者研修（応用）',
    '重度訪問介護従業者研修',
    '移動支援従業者研修（ガイドヘルパー）',
    '福祉用具専門相談員',
    '医療的ケア児コーディネーター養成研修',
  ],
  '専門資格・その他': [
    '福祉住環境コーディネーター',
    '認知症ケア専門士',
    'レクリエーション介護士',
    '介護予防運動指導員',
    '介護食アドバイザー',
    '行動分析士（ABA）',
  ],
  '職種': [
    '生活相談員',
    '地域連携員',
    '機能訓練指導員',
    '介護職員',
    '生活支援員',
    'ホームヘルパー',
    '就労支援員',
    '職業指導員',
    '児童指導員',
    '心理担当職員',
    'ピアサポーター',
    '事務職員',
    '送迎ドライバー',
    '介護助手',
    '地域包括支援センター職員（社会福祉士）',
    '地域包括支援センター職員（保健師）',
    '地域包括支援センター職員（主任ケアマネ）',
    '生活困窮者自立支援員',
  ],
} as const;

/**
 * 全職種の一覧（フラット化）
 */
export const JOB_TYPES = Object.values(JOB_CATEGORIES).flat();

/**
 * 役職の選択肢
 */
export const POSITIONS = [
  '代表',
  '施設長',
  '管理者',
  '主任',
  'リーダー',
  'サブリーダー',
  'サービス提供責任者',
  'スタッフ',
  'パートスタッフ',
  '事務',
  'ビューアー',
] as const;

/**
 * 権限ロールの選択肢
 */
export const ROLES = [
  '管理者',
  'マネージャー',
  'リーダー',
  'スタッフ',
  'ビューアー',
] as const;

/**
 * 勤務形態の選択肢
 */
export const EMPLOYMENT_TYPES = [
  '常勤',
  '非常勤',
  'パート',
  'アルバイト',
  '契約社員',
  '派遣',
] as const;

export type JobType = typeof JOB_TYPES[number];
export type Position = typeof POSITIONS[number];
export type Role = typeof ROLES[number];
export type EmploymentType = typeof EMPLOYMENT_TYPES[number];
