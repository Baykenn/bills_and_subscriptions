import { getLogo, type LogoKind } from "../lib/storage";

interface LogoAvatarProps {
  id: string;
  kind: LogoKind;
  name: string;
  colors: { bg: string; color: string };
  size?: "sm" | "md";
}

export function LogoAvatar({ id, kind, name, colors, size = "md" }: LogoAvatarProps) {
  const dim       = size === "sm" ? "w-7 h-7" : "w-9 h-9";
  const textSize  = size === "sm" ? "text-xs"  : "text-sm";
  const logo = getLogo(kind, id);

  if (logo) {
    return (
      <div className={`${dim} rounded-lg overflow-hidden shrink-0`}>
        <img src={logo} alt="" className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className={`${dim} rounded-lg flex items-center justify-center ${textSize} font-semibold shrink-0`}
      style={{ backgroundColor: colors.bg, color: colors.color }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
