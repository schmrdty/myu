// Location: /myu/components/Docs.tsx

import { Button } from "@/components/DemoComponents";

type DocsProps = {
  setActiveTab: (tab: string) => void;
};

export function Docs({ setActiveTab }: DocsProps) {
  return (
    <div className="card flex flex-col items-center" style={{ maxWidth: 500, margin: "0 auto" }}>
      <h2 className="cyberpunk text-2xl mb-6">Docs & Socials</h2>
      <div className="flex flex-col gap-4 w-full items-center">
        <a
          href="https://bafybeiaypnytrldfh6ks7qhz2s4dtoafisk5knz2zagt4oot7q45h3edve.ipfs.w3s.link/myceliyou.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="tab-btn w-full"
        >
          White Paper
        </a>
        <a
          href="https://github.com/schmrdty"
          target="_blank"
          rel="noopener noreferrer"
          className="tab-btn w-full"
        >
          GitHub
        </a>
        <a
          href="https://basescan.org/address/0xC80577C2C0e860fC2935c809609Fa46456cECC51"
          target="_blank"
          rel="noopener noreferrer"
          className="tab-btn w-full"
        >
          Contract Address
        </a>
        <a
          href="https://farcaster.xyz/~/channel/shenanigans"
          target="_blank"
          rel="noopener noreferrer"
          className="tab-btn w-full"
        >
          Farcaster Channel
        </a>
        <a
          href="https://www.empirebuilder.world/empire/0x24c91E5E9eb13E72Db41EBC5816Af7f259647B07"
          target="_blank"
          rel="noopener noreferrer"
          className="tab-btn w-full"
        >
          Empire Builder
        </a>
        <a
          href="https://farcaster.xyz/schmidtiest.eth"
          target="_blank"
          rel="noopener noreferrer"
          className="tab-btn w-full"
        >
          Schmidtiest Profile
        </a>
      </div>
      <Button variant="outline" onClick={() => setActiveTab("Main")} className="mt-8">
        Back to Main
      </Button>
    </div>
  );
}
