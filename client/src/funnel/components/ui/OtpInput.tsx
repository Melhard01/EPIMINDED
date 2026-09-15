import { useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { clsx } from "@/funnel/lib/clsx";

export const OTP_LENGTH = 6;

/**
 * One box per digit. Typing moves forward, Backspace on an empty box moves
 * back, and a pasted or autofilled code is spread across the boxes.
 */
export function OtpInput({
  onChange,
  onBlur,
  invalid = false,
  labelledBy,
}: {
  onChange: (code: string) => void;
  onBlur?: () => void;
  invalid?: boolean;
  labelledBy?: string;
}) {
  const [digits, setDigits] = useState<string[]>(() => Array<string>(OTP_LENGTH).fill(""));
  const boxes = useRef<(HTMLInputElement | null)[]>([]);

  const focusBox = (index: number) => {
    const box = boxes.current[Math.min(Math.max(index, 0), OTP_LENGTH - 1)];
    box?.focus();
    box?.select();
  };

  const commit = (next: string[]) => {
    setDigits(next);
    onChange(next.join(""));
  };

  const spread = (index: number, incoming: string) => {
    // Autofill can land on top of a typed digit; the code is the trailing digits.
    const code = incoming.slice(-OTP_LENGTH);
    // A whole code always starts at the first box, wherever it was pasted.
    const start = code.length === OTP_LENGTH ? 0 : index;
    const next = [...digits];
    for (let i = 0; i < code.length && start + i < OTP_LENGTH; i++) {
      next[start + i] = code[i];
    }
    commit(next);
    focusBox(start + code.length);
  };

  const handleChange = (index: number, raw: string) => {
    const typed = raw.replace(/\D/g, "");
    const current = digits[index];
    if (typed.length > 2 || (typed.length === 2 && !current)) {
      spread(index, typed);
      return;
    }
    const next = [...digits];
    // A box that already held a digit now holds two; keep the new one.
    next[index] = typed.length === 2 ? (typed[0] === current ? typed[1] : typed[0]) : typed;
    commit(next);
    if (next[index] && index < OTP_LENGTH - 1) focusBox(index + 1);
  };

  const handlePaste = (index: number, event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "");
    if (pasted) spread(index, pasted);
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      event.preventDefault();
      const next = [...digits];
      next[index - 1] = "";
      commit(next);
      focusBox(index - 1);
    } else if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      focusBox(index - 1);
    } else if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      event.preventDefault();
      focusBox(index + 1);
    }
  };

  return (
    <div
      role="group"
      aria-labelledby={labelledBy}
      className="grid w-full max-w-[420px] grid-cols-6 gap-2 sm:gap-3"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) onBlur?.();
      }}
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            boxes.current[index] = element;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
          aria-invalid={invalid || undefined}
          value={digit}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={(event) => handlePaste(index, event)}
          onFocus={(event) => event.target.select()}
          className={clsx(
            "h-12 w-full min-w-0 rounded-xl border bg-card text-center font-display text-[22px] text-body outline-none transition focus:border-gold sm:h-14 sm:text-[26px]",
            invalid ? "border-[#6b3d3d]" : "border-line",
          )}
        />
      ))}
    </div>
  );
}
