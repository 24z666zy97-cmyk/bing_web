const DEG = Math.PI / 180;
export const glassesConfig = Object.freeze({
  id: 'glasses', label: '\u773c\u955c', rootRotation: Object.freeze([0, 0, 0]),
  focusPoint: Object.freeze([0, 0, -2.4]), defaultState: 'open',
  supportedStates: Object.freeze(['open', 'folded']),
  hinges: Object.freeze({
    left: Object.freeze({ position: Object.freeze([-3.542175, 0.218075, -1.365511]), openAngle: 0, foldedAngle: -88 * DEG }),
    right: Object.freeze({ position: Object.freeze([3.542174, 0.218075, -1.360409]), openAngle: 0, foldedAngle: 88 * DEG }),
  }),
  animation: Object.freeze({ duration: 0.86, easing: 'smoothstep' }),
});
// @ts-nocheck -- source configuration is shared with the procedural model project.
