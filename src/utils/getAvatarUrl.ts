export function getAvatarUrl(seed: string, opts?: {
  width?: number;
  height?: number;
  radius?: number;
  backgroundType?: string;
  output?: 'png' | 'jpg';
}) {
  const width = opts?.width ?? 240;
  const height = opts?.height ?? 320;
  const radius = opts?.radius ?? 12;
  const backgroundType = opts?.backgroundType ?? 'gradient';
  const output = opts?.output ?? 'png';

  const dicebearBase = 'https://api.dicebear.com/8.x/initials/svg';
  const diceParams = new URLSearchParams({
    seed: seed,
    backgroundType: backgroundType,
    radius: String(radius),
  });
  const diceUrl = `${dicebearBase}?${diceParams.toString()}`;

  // images.weserv expects the `url` parameter to be the (full) Dicebear URL encoded
  const imagesParams = new URLSearchParams({
    url: diceUrl,
    output: output,
    w: String(width),
    h: String(height),
    fit: 'contain',
  });

  return `https://images.weserv.nl/?${imagesParams.toString()}`;
}

export default getAvatarUrl;
