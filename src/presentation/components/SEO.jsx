import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * SEO 컴포넌트
 * @param {Object} props
 * @param {string} props.title - 페이지 제목
 * @param {string} props.description - 페이지 설명 (메타 태그)
 * @param {string} props.image - 대표 이미지 URL (Open Graph)
 * @param {string} props.url - 현재 페이지 URL
 * @param {string} props.type - 콘텐츠 타입 (article, website 등)
 */
export const SEO = ({ title, description, image, url, type = 'website' }) => {
    const siteTitle = 'Next Idea Lab';
    const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
    const defaultDescription = 'Future-focused AI & Web Development Lab. We archive innovation and record the process of creation.';
    const metaDescription = description || defaultDescription;
    const siteUrl = 'https://nextidealab.app'; // 실제 도메인으로 변경 완료
    const fullUrl = url ? `${siteUrl}/${url}` : siteUrl;
    const defaultImage = `${siteUrl}/default-og.png`; // 기본 OG 이미지 경로
    const metaImage = image || defaultImage;

    return (
        <Helmet>
            {/* 기본 메타 태그 */}
            <title>{fullTitle}</title>
            <meta name="description" content={metaDescription} />
            <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=2" />
            <link rel="shortcut icon" href="/favicon.svg?v=2" />
            <link rel="canonical" href={fullUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:image" content={metaImage} />
            <meta property="og:url" content={fullUrl} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={metaDescription} />
            <meta name="twitter:image" content={metaImage} />
        </Helmet>
    );
};
