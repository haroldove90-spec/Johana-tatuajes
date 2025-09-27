
import React from 'react';

export const LogoIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
        <path d="M12 2a10 10 0 1 0 10 10" />
        <path d="M12 2a10 10 0 0 1 10 10" />
        <path d="M12 2v20" />
        <path d="M22 12A10 10 0 0 1 12 22" />
        <path d="m15 6-3.5 3.5" />
        <path d="m15 18-3.5-3.5" />
        <path d="m6 9 3.5 3.5" />
        <path d="m6 15 3.5-3.5" />
    </svg>
);

export const OutlineIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15.6c.33-.33.33-.86 0-1.2l-2-2c-.33-.33-.86-.33-1.2 0L13 17l-1.5-1.5c-2-2-5-2-7 0l-1.5 1.5c-2 2-2 5 0 7l1.5 1.5c2 2 5 2 7 0l7-7Z"/>
        <path d="M15 6v.01"/>
        <path d="M12 9v.01"/>
        <path d="M9 12v.01"/>
        <path d="M6 15v.01"/>
        <path d="M3 18v.01"/>
    </svg>
);

export const PreviewIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
        <circle cx="12" cy="12" r="3"/>
        <path d="M9.52 4.19a9.52 9.52 0 0 1 4.96-.2"/>
        <path d="M14.48 19.81a9.52 9.52 0 0 1-4.96.2"/>
    </svg>
);

export const GenerateIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
        <polyline points="14 2 14 8 20 8"/>
        <path d="m10.4 12.6 2.8 4.2 2.8-4.2"/>
        <path d="M13.2 16.8h-3.2"/>
    </svg>
);

export const BackIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
);

export const DownloadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
);

export const Spinner: React.FC = () => (
    <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);
