import Image from "next/image";
import { cn } from "@/lib/utils";

type DigitonLogoProps = {
  orientation?: "horizontal" | "vertical";
  className?: string;
  priority?: boolean;
};

const LOGO_CONFIG = {
  horizontal: {
    src: "/brand/digiton-logo-gold-horizontal.png",
    alt: "Digiton Music Agency",
    width: 220,
    height: 56,
  },
  vertical: {
    src: "/brand/digiton-logo-gold-vertical.png",
    alt: "Digiton Music Agency",
    width: 120,
    height: 120,
  },
} as const;

export function DigitonLogo({
  orientation = "horizontal",
  className,
  priority = false,
}: DigitonLogoProps) {
  const logo = LOGO_CONFIG[orientation];

  return (
    <Image
      alt={logo.alt}
      className={cn("h-auto w-auto object-contain", className)}
      height={logo.height}
      priority={priority}
      src={logo.src}
      width={logo.width}
    />
  );
}
