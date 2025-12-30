/**
 * ロールベースアクセス制御（RBAC）
 */

// ロール定義
export enum UserRole {
  ADMIN = '管理者',
  GENERAL = '一般',
  DEVELOPER = '開発者', // 開発者専用画面用
}

// パーミッション定義
export enum Permission {
  // スタッフ管理
  VIEW_STAFF = 'view_staff',
  CREATE_STAFF = 'create_staff',
  EDIT_STAFF = 'edit_staff',
  DELETE_STAFF = 'delete_staff',
  IMPORT_STAFF = 'import_staff',

  // 利用者管理
  VIEW_CLIENTS = 'view_clients',
  CREATE_CLIENTS = 'create_clients',
  EDIT_CLIENTS = 'edit_clients',
  DELETE_CLIENTS = 'delete_clients',
  IMPORT_CLIENTS = 'import_clients',

  // 事業所管理
  VIEW_ORGANIZATIONS = 'view_organizations',
  EDIT_ORGANIZATIONS = 'edit_organizations',

  // レポート
  VIEW_REPORTS = 'view_reports',
  EXPORT_REPORTS = 'export_reports',

  // マイページ
  VIEW_MYPAGE = 'view_mypage',
  MANAGE_BILLING = 'manage_billing',
  CHANGE_PLAN = 'change_plan',

  // 開発者機能
  ACCESS_DEV_TOOLS = 'access_dev_tools',
  VIEW_ALL_ORGANIZATIONS = 'view_all_organizations',
  MANAGE_SYSTEM = 'manage_system',
}

// 管理者のパーミッション
const adminPermissions: Permission[] = [
  Permission.VIEW_STAFF,
  Permission.CREATE_STAFF,
  Permission.EDIT_STAFF,
  Permission.DELETE_STAFF,
  Permission.IMPORT_STAFF,
  Permission.VIEW_CLIENTS,
  Permission.CREATE_CLIENTS,
  Permission.EDIT_CLIENTS,
  Permission.DELETE_CLIENTS,
  Permission.IMPORT_CLIENTS,
  Permission.VIEW_ORGANIZATIONS,
  Permission.EDIT_ORGANIZATIONS,
  Permission.VIEW_REPORTS,
  Permission.EXPORT_REPORTS,
  Permission.VIEW_MYPAGE,
  Permission.MANAGE_BILLING,
  Permission.CHANGE_PLAN,
];

// ロール別パーミッション
export const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: adminPermissions,
  [UserRole.GENERAL]: [
    // 一般ユーザーは閲覧のみ
    Permission.VIEW_STAFF,
    Permission.VIEW_CLIENTS,
    Permission.VIEW_ORGANIZATIONS,
    Permission.VIEW_REPORTS,
  ],
  [UserRole.DEVELOPER]: [
    // 開発者は管理者の全権限 + 開発者専用機能
    ...adminPermissions,
    Permission.ACCESS_DEV_TOOLS,
    Permission.VIEW_ALL_ORGANIZATIONS,
    Permission.MANAGE_SYSTEM,
  ],
};

/**
 * ロールが特定のパーミッションを持っているかチェック
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) || false;
}

/**
 * 複数のパーミッションをすべて持っているかチェック
 */
export function hasAllPermissions(
  role: UserRole,
  permissions: Permission[]
): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

/**
 * 複数のパーミッションのいずれかを持っているかチェック
 */
export function hasAnyPermission(
  role: UserRole,
  permissions: Permission[]
): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

/**
 * ロール文字列をUserRole enumに変換
 */
export function stringToRole(roleString: string): UserRole | null {
  switch (roleString) {
    case '管理者':
      return UserRole.ADMIN;
    case '一般':
      return UserRole.GENERAL;
    case '開発者':
      return UserRole.DEVELOPER;
    default:
      return null;
  }
}

/**
 * パス別に必要なパーミッション
 */
export const pathPermissions: Record<string, Permission[]> = {
  '/staff': [Permission.VIEW_STAFF],
  '/staff/new': [Permission.CREATE_STAFF],
  '/staff/import': [Permission.IMPORT_STAFF],
  '/clients': [Permission.VIEW_CLIENTS],
  '/clients/new': [Permission.CREATE_CLIENTS],
  '/clients/import': [Permission.IMPORT_CLIENTS],
  '/organizations': [Permission.VIEW_ORGANIZATIONS],
  '/reports': [Permission.VIEW_REPORTS],
  '/mypage': [Permission.VIEW_MYPAGE],
  '/dev': [Permission.ACCESS_DEV_TOOLS],
};

/**
 * パスにアクセス可能かチェック
 */
export function canAccessPath(role: UserRole, path: string): boolean {
  // パスが定義されていない場合は全員アクセス可能
  const requiredPermissions = pathPermissions[path];
  if (!requiredPermissions) {
    return true;
  }

  // 必要なパーミッションのいずれかを持っている必要がある
  return hasAnyPermission(role, requiredPermissions);
}
