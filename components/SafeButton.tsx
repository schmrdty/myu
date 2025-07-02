// Location: /components/SafeButton.tsx

import { ButtonHTMLAttributes, ReactNode } from "react";

interface SafeButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function SafeButton({ type = "button", ...props }: SafeButtonProps) {
  return <button type={type} {...props} />;
}
