# CLAUDE.md — Myutruvian NFT DApp

This file provides guidance for AI assistants working on this codebase.

## Project Overview

**Myutruvian** is a Web3 NFT minting DApp built on the Base blockchain. It functions as both a standard web app and a **Farcaster MiniApp** (frame-embedded experience). Users can mint NFTs using ETH, MYU, or DEGEN tokens.

- **Live URL:** https://myu.schmidtiest.xyz
- **Chain:** Base (chainId 8453)
- **NFT Contract:** `0xC80577C2C0e860fC2935c809609Fa46456cECC51`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS 4 + CSS variables |
| Web3 | wagmi 2 + viem 2 |
| Wallet | OnchainKit, WalletConnect (Reown AppKit), Farcaster MiniApp connector |
| State | React Query (@tanstack/react-query) |
| Cache | Upstash Redis |
| Farcaster | @farcaster/miniapp-sdk, @farcaster/miniapp-node |

---

## Commands

```bash
npm run dev      # Start dev server on port 6969
npm run build    # Production build
npm run start    # Start production server (0.0.0.0:6969)
npm run lint     # Run ESLint
```

> Note: `dev` hardcodes a specific IP (`84.32.129.52`). When running locally, you may need to override with `next dev`.

---

## Directory Structure

```
app/
  api/              # API route handlers (REST endpoints)
  layout.tsx        # Root layout with metadata
  page.tsx          # Entry point (dynamically imports MiniKitApp)
  providers.tsx     # Wagmi, OnchainKit, MiniKit, QueryClient providers
  ClientRoot.tsx    # Client wrapper (theme, toast, MiniAppProvider)
  miniapp/          # MiniApp-specific routes
  mint/             # Mint-specific routes

components/         # React UI components (PascalCase filenames)
hooks/              # Custom React hooks
lib/
  constants.ts      # Contract address, ABI, token configs
  wagmi.ts          # Wagmi config and connectors
  redis.ts          # Upstash Redis client
  theme.css         # CSS custom properties (cyberpunk theme)
  contract.ts       # Contract utilities
  notification.ts   # Notification helpers

types/              # Shared TypeScript types
contracts/          # Smart contract files
public/             # Static assets
```

---

## Architecture Patterns

### Provider Stack
Providers are nested in this order (outer to inner):
```
WagmiProvider > QueryClientProvider > OnchainKitProvider > MiniKitProvider
```
Defined in `app/providers.tsx`. Client-side wrappers (theme, toast) are in `app/ClientRoot.tsx`.

### SSR Safety
`MiniKitApp` is dynamically imported with `ssr: false` in `app/page.tsx` to prevent hydration errors with wallet/Farcaster state.

### Web3 Interaction Pattern
1. Read contract state with `useReadContract` or viem's `readContract` (via custom hooks)
2. Write with `useWriteContract` → wait with `useWaitForTransactionReceipt`
3. Decode events from receipt logs with `decodeEventLog`
4. For ERC20 tokens: check allowance with `useAllowances` → approve if needed → then mint

### Data Caching
- React Query `staleTime`: 120 seconds for mint info
- Split info: 5-minute manual cache in `useSplitInfo`
- Redis keys (see `lib/redis.ts` for TTLs):
  - `notification:{userId}` — 24h expiry
  - `fid:{fid}:address` — 30d expiry
  - `tx:{txHash}` — 7d expiry
  - `user:{address}:txs` — list of last 100 tx hashes
  - `mints:{address}` / `mints:fid:{fid}` — mint counts

---

## Key Files

| File | Purpose |
|------|---------|
| `lib/constants.ts` | **Start here for contract info.** Contract address, full ABI, token configs (MYU, DEGEN), vault addresses |
| `lib/wagmi.ts` | Wagmi config, chain setup, all wallet connectors |
| `components/MintWidget.tsx` | Core minting UI — handles ETH/ERC20 approval + mint flow |
| `components/MiniKitApp.tsx` | Top-level app with tab navigation |
| `hooks/useMintInfo.ts` | Reads on-chain mint data (prices, supply, user mints) |
| `hooks/useSplitInfo.ts` | Gets payment split percentages from `/api/split-info` |
| `hooks/useAllowances.ts` | Checks ERC20 approvals for MYU/DEGEN tokens |
| `hooks/useTokenBalances.ts` | Gets user's MYU and DEGEN balances |
| `hooks/useChainGuard.ts` | Validates wallet is connected and on Base |
| `app/api/leaderboard/` | Fetches top 100 minters from on-chain events |
| `app/api/split-info/` | Returns vault addresses and split percentages |
| `.well-known/farcaster.json` | Farcaster MiniApp manifest + account association |

---

## Tokens & Contracts

**Supported payment tokens:**

| Token | Address |
|-------|---------|
| MYU | `0x24c91E5E9eb13E72Db41EBC5816Af7f259647B07` |
| DEGEN | `0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed` |

**NFT Tiers:** 0–8. Price and split ratios change as supply grows. Tier 0: 50/50 send/vault → Tier 8: 10/90.

**Max supply:** 20,000 | **Max per address:** 500

---

## Code Conventions

### Naming
- **Components:** PascalCase files (`MintWidget.tsx`)
- **Hooks:** camelCase with `use` prefix (`useMintInfo.ts`)
- **Constants:** `UPPER_SNAKE_CASE` (`CONTRACT_ADDRESS`)
- **Types/Interfaces:** PascalCase (`MintInfo`, `TokenConfig`)
- **CSS classes:** kebab-case with `cyber-` prefix for theme vars

### File Headers
Most files have a location comment at the top:
```ts
// Location: /components/MintWidget.tsx
```
Keep this when editing existing files.

### TypeScript
- Strict mode is enabled — avoid `any` (it's a lint warning)
- Use `interface` for object shapes, `type` for unions/primitives
- Path alias `@/*` maps to the project root

### React Patterns
- Use `"use client"` directive for any component using hooks, browser APIs, or wagmi hooks
- Prefer wagmi hooks over direct viem calls in components
- Use React Query for any data that benefits from caching/refetching

### Styling
Theme uses CSS custom properties defined in `lib/theme.css`. Use these variables rather than hardcoding colors:
- `cyber-primary`, `cyber-accent`, `cyber-danger`
- `cyber-bg`, `cyber-bg-secondary`, `cyber-border`
- `cyber-text`, `cyber-text-muted`

---

## Environment Variables

Required in `.env.local`:

```bash
# Critical
NEXT_PUBLIC_ONCHAINKIT_API_KEY=      # OnchainKit API key
NEXT_PUBLIC_URL=                      # App base URL (or NEXT_PUBLIC_HOST)

# Farcaster frame association
FARCASTER_HEADER=
FARCASTER_PAYLOAD=
FARCASTER_SIGNATURE=

# Redis (for notifications and analytics)
REDIS_URL=                            # Upstash Redis REST URL
REDIS_TOKEN=                          # Upstash Redis token

# Optional
NEXT_PUBLIC_BASE_RPC_URL=             # Defaults to https://base.llamarpc.com
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
NEXT_PUBLIC_FRAME_URL=                # Defaults to /api/minidapp

# MiniApp metadata (used in .well-known/farcaster.json and OG tags)
NEXT_PUBLIC_APP_ICON=
NEXT_PUBLIC_APP_SUBTITLE=
NEXT_PUBLIC_APP_DESCRIPTION=
NEXT_PUBLIC_APP_SPLASH_IMAGE=
NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR=
NEXT_PUBLIC_APP_PRIMARY_CATEGORY=
NEXT_PUBLIC_APP_HERO_IMAGE=
NEXT_PUBLIC_APP_TAGLINE=
NEXT_PUBLIC_APP_OG_TITLE=
NEXT_PUBLIC_APP_OG_DESCRIPTION=
NEXT_PUBLIC_APP_OG_IMAGE=
```

---

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/notify` | POST/GET | Store/retrieve user notifications (Redis) |
| `/api/webhook` | POST | MiniKit webhook events |
| `/api/send-notification` | POST | Push notifications to users |
| `/api/me` | GET | Current user info |
| `/api/split-info` | GET | Vault addresses + split percentages |
| `/api/leaderboard` | GET | Top 100 minters (on-chain events) |
| `/api/lucky-winners` | GET | Lucky draw winners |
| `/api/minidapp` | GET | MiniApp frame metadata |
| `/api/minidapp/og` | GET | Dynamic OG image generation |
| `/api/minidapp/tx/[token]/[amount]` | GET | Transaction calldata for frame actions |

---

## Testing

No test suite is currently configured. The `.gitignore` excludes `/test` directories. If adding tests, use Vitest (compatible with Next.js) and place test files alongside source files as `*.test.ts(x)`.

---

## Deployment

- Hosted on Vercel (`.vercel/` config present)
- Production URL: https://myu.schmidtiest.xyz
- No CI/CD pipelines configured — deployments are manual

---

## Common Gotchas

1. **Chain check:** Always verify `chainId === base.id (8453)` before contract writes. Use `useChainGuard`.
2. **ERC20 flow:** Must check allowance and request approval before calling mint with MYU/DEGEN.
3. **SSR:** Wallet state is client-only — don't attempt to read wagmi hooks in server components. Use dynamic imports with `ssr: false` for components that need wallet access.
4. **Redis:** Redis is optional but required for notifications and mint history. Functions should gracefully degrade when Redis is unavailable.
5. **Split info fallback:** `useSplitInfo` / `/api/split-info` has a 3-tier fallback (on-chain read → hardcoded defaults) to remain functional without the API.
6. **Dev port:** Dev server runs on port 6969, not the Next.js default 3000.
