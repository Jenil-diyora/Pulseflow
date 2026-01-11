import React from 'react';
import Svg, { Path, Circle, Polygon, G, Defs, LinearGradient, Stop } from 'react-native-svg';

// Trophy Icon - Leaderboard
export const TrophyIcon = ({ size = 24, color = '#fbbf24' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Defs>
            <LinearGradient id="trophyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor="#fbbf24" stopOpacity="1" />
                <Stop offset="100%" stopColor="#f59e0b" stopOpacity="1" />
            </LinearGradient>
        </Defs>
        <Path
            d="M7 4h10v5c0 2.76-2.24 5-5 5s-5-2.24-5-5V4z"
            fill="url(#trophyGrad)"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M7 4H5c-1.1 0-2 .9-2 2v1c0 1.66 1.34 3 3 3h1"
            fill="url(#trophyGrad)"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M17 4h2c1.1 0 2 .9 2 2v1c0 1.66-1.34 3-3 3h-1"
            fill="url(#trophyGrad)"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M9 20h6"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
        />
        <Path
            d="M12 14v6"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
        />
        <Circle cx="12" cy="7" r="1.5" fill="#fff" opacity="0.7" />
    </Svg>
);

// Target/Quest Icon
export const TargetIcon = ({ size = 24, color = '#22d3ee' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Defs>
            <LinearGradient id="targetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#22d3ee" stopOpacity="1" />
                <Stop offset="100%" stopColor="#06b6d4" stopOpacity="1" />
            </LinearGradient>
        </Defs>
        <Circle
            cx="12"
            cy="12"
            r="9"
            stroke={color}
            strokeWidth="2"
            fill="none"
        />
        <Circle
            cx="12"
            cy="12"
            r="6"
            stroke={color}
            strokeWidth="2"
            fill="none"
        />
        <Circle
            cx="12"
            cy="12"
            r="3"
            fill="url(#targetGrad)"
        />
        <Circle
            cx="12"
            cy="12"
            r="1"
            fill="#fff"
        />
    </Svg>
);

// Fire Icon
export const FireIcon = ({ size = 24, color = '#f97316' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Defs>
            <LinearGradient id="fireGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor="#fbbf24" stopOpacity="1" />
                <Stop offset="50%" stopColor="#f97316" stopOpacity="1" />
                <Stop offset="100%" stopColor="#ef4444" stopOpacity="1" />
            </LinearGradient>
        </Defs>
        <Path
            d="M12 2C8 2 6 6 6 9c0 1.5 1 3 2 4 0-2 1-3 3-3 0 1 1 2 2 3 1-2.5 3-4 5-4-1 3 0 5 2 6-1-4 2-8 2-11-4 0-6 3-8 5V2z"
            fill="url(#fireGrad)"
            stroke={color}
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M12 18c-3 0-5-2-5-5 0 0 1 1 2 1 0-1.5 1.5-2.5 3-2.5 0 1 1 2 2 3 1-1.5 2-2.5 3-2.5-1 2.5 0 4 1 5-1-1-2-1.5-3-1.5-2 0-3 1.5-3 2.5z"
            fill="#fbbf24"
            opacity="0.6"
        />
    </Svg>
);

// Diamond Icon
export const DiamondIcon = ({ size = 24, color = '#a855f7' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Defs>
            <LinearGradient id="diamondGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#c084fc" stopOpacity="1" />
                <Stop offset="50%" stopColor="#a855f7" stopOpacity="1" />
                <Stop offset="100%" stopColor="#7e22ce" stopOpacity="1" />
            </LinearGradient>
        </Defs>
        <Path
            d="M6 3h12l4 6-10 12L2 9l4-6z"
            fill="url(#diamondGrad)"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M6 3l6 6 6-6M12 21V9M2 9h20"
            stroke="#fff"
            strokeWidth="1.5"
            strokeOpacity="0.4"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M8 6l4 3 4-3"
            stroke="#fff"
            strokeWidth="1"
            strokeOpacity="0.6"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

// Star Icon
export const StarIcon = ({ size = 24, color = '#fbbf24', filled = true }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Defs>
            <LinearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#fde047" stopOpacity="1" />
                <Stop offset="100%" stopColor="#fbbf24" stopOpacity="1" />
            </LinearGradient>
        </Defs>
        <Path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill={filled ? "url(#starGrad)" : "none"}
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        {filled && (
            <Path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87"
                stroke="#fff"
                strokeWidth="1.5"
                strokeOpacity="0.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        )}
    </Svg>
);

// Controller/Gamepad Icon
export const GamepadIcon = ({ size = 24, color = '#22d3ee' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Defs>
            <LinearGradient id="gamepadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#22d3ee" stopOpacity="1" />
                <Stop offset="100%" stopColor="#06b6d4" stopOpacity="1" />
            </LinearGradient>
        </Defs>
        <Path
            d="M6 9h12c2.21 0 4 1.79 4 4 0 1.5-.83 2.81-2.05 3.5L18 20c-.55 1.66-2 3-4 3s-3.45-1.34-4-3l-1.95-3.5C6.83 15.81 6 14.5 6 13c0-2.21-1.79-4-4-4h0c0-2.21 1.79-4 4-4h12c2.21 0 4 1.79 4 4h0c-2.21 0-4 1.79-4 4"
            fill="url(#gamepadGrad)"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Circle cx="8" cy="12" r="1" fill="#fff" />
        <Circle cx="16" cy="12" r="1" fill="#fff" />
        <Path
            d="M7 12h2M8 11v2"
            stroke="#fff"
            strokeWidth="1.5"
            strokeLinecap="round"
        />
    </Svg>
);

// Medal Icon
export const MedalIcon = ({ size = 24, color = '#fbbf24' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Defs>
            <LinearGradient id="medalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor="#fbbf24" stopOpacity="1" />
                <Stop offset="100%" stopColor="#f59e0b" stopOpacity="1" />
            </LinearGradient>
        </Defs>
        <Circle
            cx="12"
            cy="14"
            r="6"
            fill="url(#medalGrad)"
            stroke={color}
            strokeWidth="1.5"
        />
        <Path
            d="M15 8V3l-3 2-3-2v5"
            fill={color}
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Circle cx="12" cy="14" r="3" fill="none" stroke="#fff" strokeWidth="1.5" />
        <Path d="M12 12v2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
);

// Sparkles Icon
export const SparklesIcon = ({ size = 24, color = '#c084fc' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z"
            fill={color}
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M19 12l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z"
            fill={color}
            stroke={color}
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M6 18l.5 1.5L8 20l-1.5.5L6 22l-.5-1.5L4 20l1.5-.5L6 18z"
            fill={color}
            stroke={color}
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

// Clock/Timer Icon
export const TimerIcon = ({ size = 24, color = '#22d3ee' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle
            cx="12"
            cy="13"
            r="8"
            stroke={color}
            strokeWidth="2"
            fill="none"
        />
        <Path
            d="M12 9v4l3 2"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M9 2h6"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
        />
        <Path
            d="M12 5V2"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
        />
    </Svg>
);

// Snowflake/Ice Icon
export const SnowflakeIcon = ({ size = 24, color = '#22d3ee' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M12 2v20M4.93 4.93l14.14 14.14M2 12h20M4.93 19.07l14.14-14.14"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M12 2l-2 2m2-2l2 2M12 22l-2-2m2 2l2-2M2 12l2-2m-2 2l2 2M22 12l-2-2m2 2l-2 2"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

// Play Icon
export const PlayIcon = ({ size = 24, color = '#22d3ee' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M8 5v14l11-7L8 5z"
            fill={color}
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

// Crown Icon
export const CrownIcon = ({ size = 24, color = '#fbbf24' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Defs>
            <LinearGradient id="crownGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor="#fde047" stopOpacity="1" />
                <Stop offset="100%" stopColor="#fbbf24" stopOpacity="1" />
            </LinearGradient>
        </Defs>
        <Path
            d="M2 8l3 3 5-5 4 5 5-3 3-3v11H2V8z"
            fill="url(#crownGrad)"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M2 19h20"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
        />
        <Circle cx="5" cy="8" r="1.5" fill="#fff" />
        <Circle cx="12" cy="6" r="1.5" fill="#fff" />
        <Circle cx="19" cy="8" r="1.5" fill="#fff" />
    </Svg>
);

// Celebration/Confetti Icon
export const CelebrationIcon = ({ size = 24, color = '#ec4899' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M4 4l2 2" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
        <Path d="M20 4l-2 2" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" />
        <Path d="M4 20l2-2" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" />
        <Path d="M20 20l-2-2" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
        <Path d="M12 2v4" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" />
        <Path d="M12 18v4" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
        <Path d="M2 12h4" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" />
        <Path d="M18 12h4" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" />
        <Circle cx="12" cy="12" r="4" fill={color} stroke={color} strokeWidth="1.5" />
        <Circle cx="8" cy="8" r="1" fill="#fbbf24" />
        <Circle cx="16" cy="8" r="1" fill="#22d3ee" />
        <Circle cx="8" cy="16" r="1" fill="#a855f7" />
        <Circle cx="16" cy="16" r="1" fill="#f97316" />
    </Svg>
);

// Quest scroll icon
export const QuestIcon = ({ size = 24, color = '#22d3ee' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Defs>
            <LinearGradient id="questGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
                <Stop offset="100%" stopColor="#06b6d4" stopOpacity="1" />
            </LinearGradient>
        </Defs>
        <Path
            d="M6 2h12c1.1 0 2 .9 2 2v16c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2z"
            fill="url(#questGrad)"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path d="M8 8h8M8 12h8M8 16h4" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        <Circle cx="17" cy="16" r="1.5" fill="#fbbf24" />
    </Svg>
);

export default {
    TrophyIcon,
    TargetIcon,
    FireIcon,
    DiamondIcon,
    StarIcon,
    GamepadIcon,
    MedalIcon,
    SparklesIcon,
    TimerIcon,
    SnowflakeIcon,
    PlayIcon,
    CrownIcon,
    CelebrationIcon,
    QuestIcon,
};
