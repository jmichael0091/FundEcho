import React, { useEffect } from 'react';
import { SEOMetaData } from '../../types/seo';
import { applySEOMetadata } from '../../utils/seoUtils';

export interface SEOHeadProps {
  metadata?: SEOMetaData;
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogType?: 'website' | 'article';
  robots?: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: 'summary' | 'summary_large_image';
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  metadata,
  title,
  description,
  canonicalUrl,
  ogType,
  robots,
  keywords,
  ogTitle,
  ogDescription,
  ogImage,
  twitterCard,
}) => {
  const effectiveMetadata: SEOMetaData | null = metadata || (title ? {
    title,
    description: description || '',
    canonicalUrl: canonicalUrl || '',
    ogType,
    robots,
    keywords,
    ogTitle,
    ogDescription,
    ogImage,
    twitterCard,
  } : null);

  useEffect(() => {
    if (!effectiveMetadata) return;
    const cleanup = applySEOMetadata(effectiveMetadata);
    return cleanup;
  }, [
    effectiveMetadata?.title,
    effectiveMetadata?.description,
    effectiveMetadata?.canonicalUrl,
    effectiveMetadata?.robots,
    effectiveMetadata?.ogTitle,
    effectiveMetadata?.ogDescription,
    effectiveMetadata?.ogImage,
    effectiveMetadata?.twitterCard,
    JSON.stringify(effectiveMetadata?.jsonLdSchema || {})
  ]);

  return null;
};
