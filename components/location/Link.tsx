'use client';

import NextLink, { LinkProps } from 'next/link';
import React from 'react';
import { useLocationPrefix } from './LocationProvider';

type Props = LinkProps & React.AnchorHTMLAttributes<HTMLAnchorElement>;

function buildHrefWithPrefix(prefix: string | undefined, href: string): string {
  if (!prefix) return href;

  // If already a locations path, don't re-prefix
  if (href.startsWith('/locations/')) return href;

  // Root path should map to the location root
  if (href === '/') return prefix;

  // Ensure we don't end up with duplicate slashes
  if (href.startsWith('/')) {
    return `${prefix}${href}`;
  }

  return `${prefix}/${href}`;
}

export default function Link({ href, ...rest }: Props) {
  const locationPrefix = useLocationPrefix();
  const finalHref =
    typeof href === 'string'
      ? buildHrefWithPrefix(locationPrefix, href)
      : href;

  return <NextLink href={finalHref} {...rest} />;
}


