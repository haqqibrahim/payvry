import { AlertProps, FormatInputText, OtpHashMap, InfoProps } from './interfaces';

export const formatInputText = ({
  text,
  regex,
  allowedChars,
  disallowedChars,
}: FormatInputText): string => {
  let newValue: string = text;
  const characters: string[] = text.split('');

  if (allowedChars) {
    newValue = characters.map(char => (allowedChars.includes(char) ? char : '')).join('');
  } else if (disallowedChars) {
    newValue = characters.map(char => (disallowedChars.includes(char) ? '' : char)).join('');
  } else if (regex) {
    // this tests each individual character and not the string as a whole
    newValue = characters.map(char => (regex.test(char) ? char : '')).join('');
  }

  return newValue;
};

const getRndInteger = (min: number, max: number): number => {
  // returns a random integer from min to (max - 1)
  return Math.floor(Math.random() * (max - min)) + min;
};

export const getOtp = (digits: number) => {
  let otp = '';

  for (let i = 0; i < digits; i++) otp += getRndInteger(0, 10).toString();

  return otp;
};

export const togglePassword = (element: React.RefObject<HTMLInputElement>) => {
  const inputElement = element.current;

  if (!inputElement) return;

  const oldType: string = inputElement.type;
  inputElement.type = oldType === 'password' ? 'text' : 'password';
};

export const showAlert = ({
  msg,
  zIndex = '0',
  duration = 4000,
  textColor = '#fff',
  bgColor = '#181818',
}: AlertProps) => {
  const alert = document.querySelector('#alert') as HTMLDivElement;

  // show alert only when alert box is initially hidden
  if (alert.style.bottom === '-100px') {
    alert.style.background = bgColor;
    alert.style.color = textColor;
    alert.innerHTML = msg;
    alert.style.bottom = '0px';

    if (zIndex !== '0') alert.style.zIndex = zIndex;

    setTimeout(() => {
      alert.style.bottom = '-100px';
    }, duration);
  }
};

export const toggleClass = (el: Element, ...classes: string[]) => {
  classes.forEach(className => el.classList.toggle(className));
};

export const addClass = (el: Element, ...classes: string[]) => {
  classes.forEach(className => el.classList.add(className));
};

export const removeClass = (el: Element, ...classes: string[]) => {
  classes.forEach(className => el.classList.remove(className));
};

export const showInfo = ({ classTarget, xPos, yPos }: InfoProps) => {
  // when this function is called without a classTarget, it closes all open info-bubbles

  const infoBubbles = document.querySelectorAll('.info-bubble');
  const infoBubblesContainer = document.querySelector('.info-bubbles-container') as HTMLDivElement;

  // close all info bubbles...
  infoBubbles.forEach(infoBubble => {
    addClass(infoBubble, 'hidden');
  });
  addClass(infoBubblesContainer, 'hidden');

  if (!classTarget) return;

  const currentInfoBubble = document.querySelector(classTarget) as HTMLDivElement;
  if (!currentInfoBubble) return;

  // ...then reveal chosen info bubble...
  toggleClass(currentInfoBubble, 'hidden');

  if (xPos) {
    currentInfoBubble.style.left = `${xPos}px`;
  }

  if (yPos) {
    currentInfoBubble.style.top = `${yPos}px`;
  }

  // ...afterwards block-off interaction with other elements
  removeClass(infoBubblesContainer, 'hidden');
};

const hashMap: OtpHashMap = {
  '0': '?',
  '1': '@',
  '2': '#',
  '3': '&',
  '4': '$',
  '5': '%',
  '6': '^',
  '7': '!',
  '8': '~',
  '9': '+',
};

export const encryptOtp = (otp: string): string => {
  let encryptedOtp = '';

  for (let i = 0; i < otp.length; i++) {
    const char = otp.charAt(i);
    encryptedOtp += char in hashMap ? hashMap[otp.charAt(i)] : '';
  }

  return encryptedOtp;
};

export const decryptOtp = (otp: string): string => {
  let decryptedOtp = '';
  let values: string[] = Object.values(hashMap);

  for (let i = 0; i < otp.length; i++) {
    const char = otp.charAt(i);
    decryptedOtp += values.findIndex(c => c === char).toString();
  }

  return decryptedOtp;
};
