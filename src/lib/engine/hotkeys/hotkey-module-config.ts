export type TriggerType = 'KEY_DOWN' | 'KEY_UP';

export type EngineHotkeysConfig = {
	mode: TriggerType;
	buttonRapidFireCooldownMs: number;
	buttonClickPressedCssDurationMs: number;
};

export const engineHotkeysConfig: EngineHotkeysConfig = {
	mode: 'KEY_DOWN',
	buttonRapidFireCooldownMs: 20,
	buttonClickPressedCssDurationMs: 50
};
