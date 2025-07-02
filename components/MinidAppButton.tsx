// Location: /components/FrameButton.tsx
export function MinidAppButton() {
  return (
    <a
      href={process.env.NEXT_PUBLIC_FRAME_URL || "/api/minidapp"}
      className="btn-cyber"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Mint with Farcaster Minid App"
    >
      Mint with Farcaster Mini dApp
    </a>
  );
}
