import { useState, useRef, KeyboardEvent, ClipboardEvent } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface OTPInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  error?: boolean;
}

const OTPInput = ({ length = 6, onComplete, error = false }: OTPInputProps) => {
  const [values, setValues] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newValues = [...values];
    newValues[index] = value.slice(-1);
    setValues(newValues);

    // Auto-focus next input
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if complete
    const otp = newValues.join("");
    if (otp.length === length && !newValues.includes("")) {
      onComplete(otp);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !values[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, length);
    
    if (!/^\d+$/.test(pastedData)) return;

    const newValues = [...values];
    pastedData.split("").forEach((char, i) => {
      if (i < length) newValues[i] = char;
    });
    setValues(newValues);

    // Focus last filled or next empty
    const lastIndex = Math.min(pastedData.length, length) - 1;
    inputRefs.current[lastIndex]?.focus();

    if (pastedData.length === length) {
      onComplete(pastedData);
    }
  };

  return (
    <motion.div
      animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
      transition={{ duration: 0.4 }}
      className="flex gap-3 justify-center"
    >
      {values.map((value, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className={cn(
            "w-12 h-14 text-center text-xl font-bold rounded-xl bg-muted border-2 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50",
            error ? "border-destructive" : value ? "border-primary" : "border-border"
          )}
        />
      ))}
    </motion.div>
  );
};

export default OTPInput;
