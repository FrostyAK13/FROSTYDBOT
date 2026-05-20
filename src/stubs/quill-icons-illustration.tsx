import React from 'react';

const PlaceholderIcon = ({ height = '24px', width = '24px', ...props }: { height?: string; width?: string; [key: string]: unknown }) => (
    <svg height={height} width={width} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
        <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='2' />
    </svg>
);

export const DerivLightUserErrorIcon = PlaceholderIcon;
export const DerivLightEmptyCardboardBoxIcon = PlaceholderIcon;
export const DerivLightGoogleDriveIcon = PlaceholderIcon;
export const DerivLightLocalDeviceIcon = PlaceholderIcon;
export const DerivLightMyComputerIcon = PlaceholderIcon;
export const DerivLightBotBuilderIcon = PlaceholderIcon;
export const DerivLightQuickStrategyIcon = PlaceholderIcon;
export const DerivLightDeclinedPoaIcon = PlaceholderIcon;
