// Location: /components/FrameButton.tsx
export function FrameButton() {
  return (
    <a
      href={process.env.NEXT_PUBLIC_FRAME_URL || "/api/frame"}
      className="btn-cyber"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Mint with Farcaster Frame"
    >
      Mint with Farcaster Frame
    </a>
  );
}
