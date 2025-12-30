// Contract addresses on Stacks Mainnet
export const CONTRACTS = {
  TASK_MANAGER: 'SP1JWWHAQQ359EBKV4X77KM716AVSFCQ1AH56RVFX.task-manager',
  TASK_ESCROW: 'SP1JWWHAQQ359EBKV4X77KM716AVSFCQ1AH56RVFX.task-escrow',
  REPUTATION_TRACKER: 'SP1JWWHAQQ359EBKV4X77KM716AVSFCQ1AH56RVFX.reputation-tracker',
} as const;

// Platform configuration
export const PLATFORM_CONFIG = {
  PLATFORM_FEE_RATE: 250, // 2.5% (250/10000)
  MIN_TASK_REWARD: 100000, // 0.1 STX in microSTX
  MAX_TASK_REWARD: 100000000000, // 100k STX in microSTX
  DISPUTE_WINDOW_BLOCKS: 432, // 72 hours
} as const;

// Task statuses
export const TASK_STATUS = {
  OPEN: 0,
  ASSIGNED: 1,
  SUBMITTED: 2,
  COMPLETED: 3,
  CANCELLED: 4,
  DISPUTED: 5,
  RESOLVED: 6,
} as const;

export const TASK_STATUS_LABELS: Record<number, string> = {
  [TASK_STATUS.OPEN]: 'Open',
  [TASK_STATUS.ASSIGNED]: 'Assigned',
  [TASK_STATUS.SUBMITTED]: 'Submitted',
  [TASK_STATUS.COMPLETED]: 'Completed',
  [TASK_STATUS.CANCELLED]: 'Cancelled',
  [TASK_STATUS.DISPUTED]: 'Disputed',
  [TASK_STATUS.RESOLVED]: 'Resolved',
};

// Task categories
export const TASK_CATEGORIES = [
  'Design',
  'Development',
  'Writing',
  'Marketing',
  'Data Entry',
  'Research',
  'Testing',
  'Translation',
  'Social Media',
  'Video Editing',
  'Audio',
  'Other',
] as const;

export type TaskCategory = typeof TASK_CATEGORIES[number];
