import React from 'react';
import Svg, { Path, Circle, Rect, G, Defs, LinearGradient, Stop, Polyline } from 'react-native-svg';

/**
 * Professional Icon Set for PulseTap
 * Minimalist, geometric, and high-precision.
 * Standard Stroke: 1.5px
 */

// Trophy: Abstract geometric cup
export const TrophyIcon = ({ size = 24, color = '#fbbf24' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M8 21h8M12 17v4M7 4h10c0 6-2.5 13-5 13S7 10 7 4z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M17 4v4c0 1.5 1 2 2 2h1a2 2 0 0 0 2-2V4h-5zM7 4v4c0 1.5-1 2-2 2H4a2 2 0 0 1-2-2V4h5z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

// Target: Precision scope
export const TargetIcon = ({ size = 24, color = '#22d3ee' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" />
        <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.5" />
        <Path d="M12 3v2M12 19v2M3 12h2M19 12h2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
);

// Fire: Stylized abstract flame
export const FireIcon = ({ size = 24, color = '#ef4444' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3 2.5.5 4.5 2 4.5 4.5A2.5 2.5 0 0 1 12 16a2.5 2.5 0 0 1-3.5-1.5z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M12 21c-4.4 0-8-3.6-8-8 0-4.4 6-11 8-11s8 6.6 8 11c0 4.4-3.6 8-8 8z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

// Diamond: Sharp geometric
export const DiamondIcon = ({ size = 24, color = '#a855f7' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M6 3h12l4 6-10 13L2 9l4-6z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M11 3v18M6 3l5 6M18 3l-5 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
    </Svg>
);

// Star: Minimalist 5-point
export const StarIcon = ({ size = 24, color = '#fbbf24', filled = false }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={filled ? color : "none"}
            fillOpacity={filled ? 0.2 : 0}
        />
    </Svg>
);

// Gamepad: Sleek controller outline
export const GamepadIcon = ({ size = 24, color = '#22d3ee' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x="2" y="6" width="20" height="12" rx="6" stroke={color} strokeWidth="1.5" />
        <Path d="M6 12h4M8 10v4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <Circle cx="15" cy="12" r="1" fill={color} />
        <Circle cx="17" cy="12" r="1" fill={color} />
    </Svg>
);

// Medal: Ribbon badge style
export const MedalIcon = ({ size = 24, color = '#fbbf24' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="10" r="5" stroke={color} strokeWidth="1.5" />
        <Path d="M12 15l-2 6 2 2 2-2-2-6z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M7 10h10" stroke={color} strokeWidth="1.5" opacity="0.3" />
    </Svg>
);

// Sparkles: Clean cross stars
export const SparklesIcon = ({ size = 24, color = '#c084fc' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M12 3l2 7 7 2-7 2-2 7-2-7-7-2 7-2z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

// Timer: Minimal stopwatch
export const TimerIcon = ({ size = 24, color = '#22d3ee' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="13" r="8" stroke={color} strokeWidth="1.5" />
        <Path d="M12 9v4l2 2M12 5V3" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
);

// Play: Triangle in circle option or just sleek triangle
export const PlayIcon = ({ size = 24, color = '#ffffff' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M5 4l14 8-14 8V4z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill={color} fillOpacity="0.1" />
    </Svg>
);

// Crown: Geometric 3-point
export const CrownIcon = ({ size = 24, color = '#fbbf24' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

// Celebration: Confetti burst
export const CelebrationIcon = ({ size = 24, color = '#ec4899' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M12 4v2M12 18v2M4 12h2M18 12h2M6 6l2 2M16 16l2 2M6 18l2-2M16 6l2-2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
);

// Quest: Clipboard style
export const QuestIcon = ({ size = 24, color = '#22d3ee' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x="4" y="4" width="16" height="18" rx="2" stroke={color} strokeWidth="1.5" />
        <Path d="M9 4v2h6V4M9 10h6M9 14h6M9 18h4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
);

// Snowflake: Geometric
export const SnowflakeIcon = ({ size = 24, color = '#22d3ee' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M12 2v20M2 12h20M5 5l14 14M5 19L19 5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
);

// Exit: Door arrow
export const ExitIcon = ({ size = 24, color = '#ef4444' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

// Reset: Circular arrow
export const RotateCcwIcon = ({ size = 24, color = '#fbbf24' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M3 3v5h5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

// Chevron Left
export const ChevronLeftIcon = ({ size = 24, color = '#fff' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M15 18l-6-6 6-6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

// User: Simple person icon
export const UserIcon = ({ size = 24, color = '#22d3ee' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

// Check: Standard checkmark
export const CheckIcon = ({ size = 24, color = '#10b981' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M20 6L9 17l-5-5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

// Alert: Triangle with exclamation
export const AlertIcon = ({ size = 24, color = '#ef4444' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);
// Badge: Shield/Star badge
export const BadgeIcon = ({ size = 24, color = '#a855f7' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx="12" cy="11" r="3" stroke={color} strokeWidth="1.5" />
    </Svg>
);

// Shield Check: Security/Premium icon
export const ShieldCheckIcon = ({ size = 24, color = '#10b981' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M9 12l2 2 4-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

// Copy: Stacked rectangles
export const CopyIcon = ({ size = 24, color = '#64748b' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

// External Link: Arrow out of square
export const ExternalLinkIcon = ({ size = 24, color = '#64748b' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);
