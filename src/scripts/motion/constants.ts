export const MOTION = {
  HOVER_MS: 180,
  SECTION_REVEAL_MS: 550,
  ROUTE_TRANSITION_S: 0.5,
  INTRO_TOTAL_S: 4.2,
  INTRO_REPEAT_S: 0.8,
  INTRO_SKIP_FADE_S: 0.25,
  SIGNAL_TRAVEL_S: 0.55,
  SIGNAL_IMPACT_S: 0.35,
} as const;

export const EASE = {
  standard: 'power2.out',
  cinematic: 'power3.out',
  dramatic: 'power4.inOut',
  impact: 'back.out(1.4)',
} as const;
