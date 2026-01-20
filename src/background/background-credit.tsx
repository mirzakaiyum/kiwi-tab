interface BackgroundCreditProps {
  credit: {
    name: string;
    link: string;
    caption?: string;
    url?: string; // link to the media source page
    type: "Photo" | "Video";
  };
}

export function BackgroundCredit({ credit }: BackgroundCreditProps) {
  return (
    <div className="fixed bottom-4 left-4 z-10 flex items-center gap-1.5 text-[10px] sm:text-xs">
      <a
        href={credit.url || credit.link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-white/50 hover:text-white transition-colors cursor-pointer no-underline"
      >
        {credit.type} by
      </a>
      <a
        href={credit.link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-white/50 hover:text-white transition-colors cursor-pointer no-underline font-medium"
      >
        {credit.name}
      </a>
    </div>
  );
}
