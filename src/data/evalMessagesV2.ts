import { evalMessages as evalMessagesV1, type EvalMessage } from './evalMessages';
import { evalV2Core } from './evalV2Core';
import { safeStressMessages } from './safeStressMessages';

/**
 * v2 benchmark: the original 160-message v1 set plus 240 new core messages.
 * The hard-safe stress set is reported separately so it does not change the
 * balanced category/language composition.
 */
export const EVAL_V2_VERSION = '2026-11-v2';
export const EVAL_V2_CORE_SIZE = 400;
export const EVAL_V2_STRESS_SIZE = 100;

const enrichedV1: EvalMessage[] = evalMessagesV1.map((message, index) => ({
  ...message,
  id: `v1-${String(index + 1).padStart(3, '0')}`,
  tags: ['legacy-v1', `v1-${message.label}`, `v1-${message.language}`],
  difficulty: 'legacy',
  scriptVariant: message.language === 'ps' ? 'arabic' : undefined,
}));

export const evalMessages: EvalMessage[] = [...enrichedV1, ...evalV2Core];

export { safeStressMessages };
export type { EvalMessage };
