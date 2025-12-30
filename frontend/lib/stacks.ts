import {
  makeContractCall,
  AnchorMode,
  PostConditionMode,
  stringUtf8CV,
  uintCV,
} from '@stacks/transactions';
import { CONTRACTS } from './constants';

export interface CreateTaskParams {
  title: string;
  description: string;
  category: string;
  reward: number; // in microSTX
  deadline: number; // block height
  senderAddress: string;
}

export interface AssignTaskParams {
  taskId: number;
  senderAddress: string;
}

export interface SubmitWorkParams {
  taskId: number;
  submissionUrl: string;
  senderAddress: string;
}

export interface ApproveTaskParams {
  taskId: number;
  rating: number; // 1-5
  senderAddress: string;
}

/**
 * Create a new task
 */
export async function createTask(params: CreateTaskParams) {
  const { title, description, category, reward, deadline, senderAddress } = params;

  const [contractAddress, contractName] = CONTRACTS.TASK_MANAGER.split('.');

  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'create-task',
    functionArgs: [
      stringUtf8CV(title),
      stringUtf8CV(description),
      stringUtf8CV(category),
      uintCV(reward),
      uintCV(deadline),
    ],
    senderKey: '', // Will be signed by wallet
    validateWithAbi: false,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
  };

  return makeContractCall(txOptions);
}

/**
 * Assign a task to yourself (worker)
 */
export async function assignTask(params: AssignTaskParams) {
  const { taskId, senderAddress } = params;

  const [contractAddress, contractName] = CONTRACTS.TASK_MANAGER.split('.');

  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'assign-task',
    functionArgs: [uintCV(taskId)],
    senderKey: '',
    validateWithAbi: true,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Deny,
  };

  return makeContractCall(txOptions);
}

/**
 * Submit work for a task
 */
export async function submitWork(params: SubmitWorkParams) {
  const { taskId, submissionUrl, senderAddress } = params;

  const [contractAddress, contractName] = CONTRACTS.TASK_MANAGER.split('.');

  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'submit-work',
    functionArgs: [uintCV(taskId), stringUtf8CV(submissionUrl)],
    senderKey: '',
    validateWithAbi: true,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Deny,
  };

  return makeContractCall(txOptions);
}

/**
 * Approve task and release payment
 */
export async function approveTask(params: ApproveTaskParams) {
  const { taskId, rating, senderAddress } = params;

  const [contractAddress, contractName] = CONTRACTS.TASK_MANAGER.split('.');

  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'approve-task',
    functionArgs: [uintCV(taskId), uintCV(rating)],
    senderKey: '',
    validateWithAbi: true,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Deny,
  };

  return makeContractCall(txOptions);
}

/**
 * Reject task submission
 */
export async function rejectTask(taskId: number, reason: string, senderAddress: string) {
  const [contractAddress, contractName] = CONTRACTS.TASK_MANAGER.split('.');

  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'reject-task',
    functionArgs: [uintCV(taskId), stringUtf8CV(reason)],
    senderKey: '',
    validateWithAbi: true,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Deny,
  };

  return makeContractCall(txOptions);
}

/**
 * Cancel a task
 */
export async function cancelTask(taskId: number, senderAddress: string) {
  const [contractAddress, contractName] = CONTRACTS.TASK_MANAGER.split('.');

  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'cancel-task',
    functionArgs: [uintCV(taskId)],
    senderKey: '',
    validateWithAbi: true,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Deny,
  };

  return makeContractCall(txOptions);
}

/**
 * Open a dispute
 */
export async function openDispute(taskId: number, reason: string, senderAddress: string) {
  const [contractAddress, contractName] = CONTRACTS.TASK_MANAGER.split('.');

  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'open-dispute',
    functionArgs: [uintCV(taskId), stringUtf8CV(reason)],
    senderKey: '',
    validateWithAbi: true,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Deny,
  };

  return makeContractCall(txOptions);
}

/**
 * Format microSTX to STX
 */
export function microStxToStx(microStx: number): number {
  return microStx / 1000000;
}

/**
 * Format STX to microSTX
 */
export function stxToMicroStx(stx: number): number {
  return Math.floor(stx * 1000000);
}

/**
 * Truncate address for display
 */
export function truncateAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}
