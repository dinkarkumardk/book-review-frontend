import React, { useState, useMemo } from 'react';

interface Props extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
  src?: string | null;
  alt: string;
}

function stripProtocol(u: string) {
  return u.replace(/^https?:\/\//i, '');
}

const ImageWithFallback: React.FC<Props> = ({ src, alt, ...rest }) => {
  const [attempt, setAttempt] = useState(0);

  const sources = useMemo(() => {
    const list: string[] = [];
    if (src) {
      // Use original URL first
      list.push(src);
      // If it's an http(s) URL, include a proxy fallback
      if (/^https?:\/\//i.test(src)) {
        const hostless = stripProtocol(src);
        list.push(`https://images.weserv.nl/?url=${encodeURIComponent(hostless)}`);
      }
    }

    // If we have no source so far, include a generated placeholder (DiceBear) or final default
    if (!src) {
      list.push(`/default-cover.svg`);
    }

    // Ensure final fallback
    if (!list.includes('/default-cover.svg')) list.push('/default-cover.svg');
    return list;
  }, [src]);

  const current = sources[Math.min(attempt, sources.length - 1)];

  // Debugging: show which URL is currently used when rendering
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.debug('[ImageWithFallback] sources:', sources, 'currentAttempt:', attempt, 'current:', current);
  }

  return (
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore allow spread of img props
    <img
      src={current}
      alt={alt}
      {...rest}
      onError={(e) => {
        // Debug log the failed src
        if (process.env.NODE_ENV !== 'production') {
          // eslint-disable-next-line no-console
          const errAny: any = e;
          console.debug('[ImageWithFallback] failed to load', current, 'error:', errAny?.message || errAny);
        }
        if (attempt < sources.length - 1) {
          setAttempt(attempt + 1);
        }
        // call any passed onError as well
        if (rest.onError) rest.onError(e as any);
      }}
    />
  );
};

export default ImageWithFallback;
