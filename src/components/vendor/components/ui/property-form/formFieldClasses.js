/**
 * Vendor form fields — aligned with website User Panel (userPanelStyles.js).
 */
import {
  upLabel,
  upInput,
  upInputDisabled,
  upTextarea,
  upBtnPrimary,
  upBtnSecondary,
  upBtnDanger,
} from '../../../../UserPanel/userPanelStyles';

export const PF_LABEL = upLabel;
export const PF_LABEL_BLOCK = `${upLabel} block`;
export const PF_LABEL_MB1 = `${upLabel} block mb-1`;
export const PF_INPUT = upInput;
export const PF_SELECT = `${upInput} appearance-none cursor-pointer pr-9`;
export const PF_PICKER_TRIGGER = `${upInput} text-left flex items-center justify-between gap-2 min-h-[38px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`;

export const BTN_PRIMARY = upBtnPrimary;
export const BTN_SECONDARY = upBtnSecondary;
export const BTN_GHOST = upBtnSecondary;
export const BTN_DARK = upBtnPrimary;
export const BTN_DANGER = upBtnDanger;

export { upInputDisabled as PF_INPUT_DISABLED, upTextarea as PF_TEXTAREA };
