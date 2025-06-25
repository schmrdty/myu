// Location: /components/DemoComponents.tsx

"use client";

import { type ReactNode, useState } from "react";

// Theme toggle icons
export function MushroomIcon({ size = 24, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <ellipse cx="16" cy="16" rx="13" ry="6" fill="#ff2c8f" />
      <ellipse cx="16" cy="12" rx="14" ry="9" fill="#ffdc46" />
      <ellipse cx="16" cy="12" rx="13" ry="8" fill="#46f4ff" />
      <ellipse cx="16" cy="13.2" rx="8" ry="4.2" fill="#fff" opacity="0.8" />
      <rect x="12" y="16" width="8" height="10" rx="4" fill="#fff" />
      <ellipse cx="16" cy="28" rx="3" ry="1.5" fill="#d1d5db" />
    </svg>
  );
}
export function CyberSunIcon({ size = 24, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle cx="16" cy="16" r="8" fill="#ffdc46" />
      <circle cx="16" cy="16" r="6" fill="#46f4ff" />
      <g stroke="#ff2c8f" strokeWidth="2">
        <line x1="16" y1="2" x2="16" y2="8" />
        <line x1="16" y1="24" x2="16" y2="30" />
        <line x1="2" y1="16" x2="8" y2="16" />
        <line x1="24" y1="16" x2="30" y2="16" />
        <line x1="6" y1="6" x2="11" y2="11" />
        <line x1="21" y1="21" x2="26" y2="26" />
        <line x1="21" y1="11" x2="26" y2="6" />
        <line x1="6" y1="26" x2="11" y2="21" />
      </g>
    </svg>
  );
}

type ButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  icon?: ReactNode;
};

export function Button({
  children,
  size = "md",
  className = "",
  onClick,
  disabled = false,
  type = "button",
  icon,
}: ButtonProps) {
  const sizeClasses = {
    sm: "text-xs px-2.5 py-1.5",
    md: "text-sm px-4 py-2",
    lg: "text-base px-6 py-3",
  };
  return (
    <button
      type={type}
      className={`btn-cyber ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className="flex items-center mr-2">{icon}</span>}
      {children}
    </button>
  );
}

type CardProps = {
  title?: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
};

function Card({
  title,
  children,
  className = "",
  onClick,
}: CardProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick();
    }
  };
  return (
    <div
      className={`card ${className} ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
      onKeyDown={onClick ? handleKeyDown : undefined}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? "button" : undefined}
    >
      {title && (
        <h3 className="cyberpunk text-xl mb-3">{title}</h3>
      )}
      {children}
    </div>
  );
}

type IconProps = {
  name: "heart" | "star" | "check" | "plus" | "arrow-right";
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function Icon({ name, size = "md", className = "" }: IconProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };
  const icons = {
    heart: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <title>Heart</title>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    star: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <title>Star</title>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    check: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <title>Check</title>
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    plus: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <title>Plus</title>
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
    "arrow-right": (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <title>Arrow Right</title>
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    ),
  };
  return (
    <span className={`inline-block ${sizeClasses[size]} ${className}`}>
      {icons[name]}
    </span>
  );
}

type DocsProps = {
  setActiveTab: (tab: string) => void;
};

export function Docs({ setActiveTab }: DocsProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <Card title="Docs & Socials">
        <ul className="space-y-3 mb-4">
          <li className="flex items-start">
            <Icon name="check" className="text-cyber mt-1 mr-2" />
            <span>
              The Farcaster Channel:{" "}
              <a
                href="https://farcaster.xyz/~/channels/shenanigans"
                className="text-cyber hover:text-cyber-accent"
                target="_blank"
                rel="noopener noreferrer"
              >
                Make some noise!
              </a>
            </span>
          </li>
          <li className="flex items-start">
            <Icon name="check" className="text-cyber mt-1 mr-2" />
            <span>
              Contract:{" "}
              <a
                href="https://basescan.org/address/0xC80577C2C0e860fC2935c809609Fa46456cECC51"
                className="text-cyber hover:text-cyber-accent"
                target="_blank"
                rel="noopener noreferrer"
              >
                Myutruvian
              </a>
            </span>
          </li>
          <li className="flex items-start">
            <Icon name="check" className="text-cyber mt-1 mr-2" />
            <span>
              Contract:{" "}
              <a
                href="https://basescan.org/address/0x24c91E5E9eb13E72Db41EBC5816Af7f259647B07"
                className="text-cyber hover:text-cyber-accent"
                target="_blank"
                rel="noopener noreferrer"
              >
                Myceliyou
              </a>
            </span>
          </li>
          <li className="flex items-start">
            <Icon name="check" className="text-cyber mt-1 mr-2" />
            <span>
              White Paper:{" "}
              <a
                href="https://bafybeiaypnytrldfh6ks7qhz2s4dtoafisk5knz2zagt4oot7q45h3edve.ipfs.w3s.link/myceliyou.pdf"
                className="text-cyber hover:text-cyber-accent"
                target="_blank"
                rel="noopener noreferrer"
              >
                /Myceliyou
              </a>
            </span>
          </li>
        </ul>
        <Button onClick={() => setActiveTab("Main")}>Back to Main</Button>
      </Card>
    </div>
  );
}

type MainProps = {
  setActiveTab: (tab: string) => void;
};

export function Main({ setActiveTab }: MainProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <Card title="The Myceliyou Empire">
        <p className="mb-4">Built on base and expanding!</p>
        <Button
          onClick={() => setActiveTab("docs")}
          icon={<Icon name="arrow-right" size="sm" />}
        >
          Explore Docs
        </Button>
      </Card>
      <ChecklistCard />
      <TransactionCard />
    </div>
  );
}

// Minimal static checklist (no add, no input)
function ChecklistCard() {
  const [todos, setTodos] = useState([
    { id: 1, text: "Read about Myceliyou", completed: false },
    { id: 2, text: "Mint some NFTs", completed: false },
    { id: 3, text: "Buy $MYU", completed: false },
    { id: 4, text: "Share on Farcaster", completed: false },
  ]);
  const toggleTodo = (id: number) =>
    setTodos(todos =>
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  const deleteTodo = (id: number) =>
    setTodos(todos => todos.filter(todo => todo.id !== id));

  return (
    <Card title="Get started">
      <ul className="space-y-2">
        {todos.map((todo) => (
          <li key={todo.id} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                id={`todo-${todo.id}`}
                onClick={() => toggleTodo(todo.id)}
                className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  todo.completed
                    ? "bg-[var(--cyber-primary)] border-[var(--cyber-primary)]"
                    : "border-[var(--cyber-text-main)] bg-transparent"
                }`}
              >
                {todo.completed && (
                  <Icon
                    name="check"
                    size="sm"
                    className="text-[var(--cyber-bg)]"
                  />
                )}
              </button>
              <label
                htmlFor={`todo-${todo.id}`}
                className={`text-cyber cursor-pointer ${todo.completed ? "line-through opacity-70" : ""}`}
              >
                {todo.text}
              </label>
            </div>
            <button
              type="button"
              onClick={() => deleteTodo(todo.id)}
              className="text-cyber hover:text-cyber-accent text-xl"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}

// Share on Farcaster button (mobile aware)
function TransactionCard() {
  const isMobile =
    typeof window !== "undefined" &&
    /Mobi|Android/i.test(window.navigator.userAgent);

  const farcasterUrl =
    "https://warpcast.com/~/compose?text=" +
    encodeURIComponent("I just minted a Myutruvian NFT on Base! 🍄 myu.schmidtiest.xyz");

  function handleShare() {
    if (isMobile) {
      window.location.href = farcasterUrl;
    } else {
      window.open(farcasterUrl, "_blank");
    }
  }

  return (
    <div className="card">
      <div className="mb-2">
        The Myutruvian experience is brought to you by{" "}
        <a
          href="https://schmidtiest.eth"
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyber"
        >
          schmidtiest.eth
        </a>
        .
      </div>
      <Button size="lg" onClick={handleShare} className="w-full">
        Share on Farcaster
      </Button>
    </div>
  );
}

// Export TransactionCard for direct use
export { TransactionCard };
