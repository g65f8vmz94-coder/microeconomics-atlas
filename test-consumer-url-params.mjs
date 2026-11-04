import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const uiCode = readFileSync('./src/consumer-ui.js', 'utf-8');

// Verify that targetCase correctly defaults to requested or cases[0] when case parameter is absent
assert.ok(
  uiCode.includes('targetCase=params.get(\'case\')||requested||cases[0]'),
  'src/consumer-ui.js must determine targetCase fallback when ?case= is absent'
);

// Simulate the parameter extraction logic for all key permutations
function extractInitialStep(search, currentCase, consumerDefault, cases) {
  const params = new URLSearchParams(search);
  const requested = params.get('case') || consumerDefault;
  const targetCase = params.get('case') || requested || cases[0];
  const raw = targetCase === currentCase ? (params.get('filmStep') ?? params.get('step')) : null;
  const n = Number(raw);
  if (raw !== null && raw.trim() !== '' && Number.isFinite(n)) {
    return Math.max(0, Math.min(3, n)); // assuming 4 frames (0..3)
  }
  return 0;
}

const ch5Cases = ['curves', 'normal', 'slutsky', 'property', 'giffen'];

// Test 1: Standalone ch5-normal.html with filmStep=2 (no case param)
assert.equal(
  extractInitialStep('?filmStep=2', 'normal', 'normal', ch5Cases),
  2,
  'standalone ch5-normal with filmStep=2 should set step 2'
);

// Test 2: Standalone ch5-normal.html with legacy step=2 (no case param)
assert.equal(
  extractInitialStep('?step=2', 'normal', 'normal', ch5Cases),
  2,
  'standalone ch5-normal with step=2 should set step 2'
);

// Test 3: Standalone ch5-normal.html with case=normal&filmStep=2
assert.equal(
  extractInitialStep('?case=normal&filmStep=2', 'normal', 'normal', ch5Cases),
  2,
  'standalone ch5-normal with explicit case=normal&filmStep=2 should set step 2'
);

// Test 4: Standalone ch5-normal.html with no params
assert.equal(
  extractInitialStep('', 'normal', 'normal', ch5Cases),
  0,
  'standalone ch5-normal with no params should default to frame 0'
);

// Test 5: Multi-case lesson-5-6.html with filmStep=2 (defaults to cases[0] = curves)
assert.equal(
  extractInitialStep('?filmStep=2', 'curves', undefined, ch5Cases),
  2,
  'lesson-5-6 default case (curves) should receive filmStep=2 when case is omitted'
);
assert.equal(
  extractInitialStep('?filmStep=2', 'normal', undefined, ch5Cases),
  0,
  'lesson-5-6 non-default case (normal) should remain at frame 0 when case is omitted'
);

// Test 6: Multi-case lesson-5-6.html with explicit case=normal&filmStep=2
assert.equal(
  extractInitialStep('?case=normal&filmStep=2', 'normal', undefined, ch5Cases),
  2,
  'lesson-5-6 with explicit case=normal should set step 2 on normal'
);
assert.equal(
  extractInitialStep('?case=normal&filmStep=2', 'curves', undefined, ch5Cases),
  0,
  'lesson-5-6 with explicit case=normal should NOT set step 2 on curves'
);

console.log(JSON.stringify({ passed: true, testedScenarios: 7 }));
