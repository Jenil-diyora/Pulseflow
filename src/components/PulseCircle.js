import React, { useMemo } from 'react';
import { Animated } from 'react-native';
import { Circle, Rect, Polygon, G } from 'react-native-svg';

// Pre-create animated components
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);
const AnimatedG = Animated.createAnimatedComponent(G);

/**
 * Standard colors to prevent NaN errors
 */
const DEFAULT_COLOR = '#22d3ee';
const GAMEOVER_COLOR = '#ef4444';

/**
 * Optimized PulseCircle component.
 * Simplified geometry: Draws shapes at (0,0) and translates them to center.
 * Visual sizes are normalized to visually match a circle of radius 50.
 */
const PulseCircle = React.memo(({
    centerX,
    centerY,
    radius,
    color = DEFAULT_COLOR,
    strokeWidth = 2,
    shape = 'circle',
    perfectZoneAnim,
    gameOverAnim
}) => {

    // 1. Stroke Width Animation
    const animatedStrokeWidth = useMemo(() => {
        if (!perfectZoneAnim) return strokeWidth;
        return perfectZoneAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [strokeWidth, strokeWidth * 2],
        });
    }, [perfectZoneAnim, strokeWidth]);

    // 2. Base Color Animation
    const baseColor = useMemo(() => {
        if (!perfectZoneAnim) return color || DEFAULT_COLOR;
        return perfectZoneAnim.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: ['rgba(255, 255, 255, 0.2)', color, '#fff']
        });
    }, [perfectZoneAnim, color]);

    // 3. Opacity Animations
    const containerOpacity = useMemo(() => {
        if (!gameOverAnim) return 1;
        return gameOverAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0]
        });
    }, [gameOverAnim]);

    const failureOpacity = useMemo(() => {
        if (!gameOverAnim) return 0;
        return gameOverAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1]
        });
    }, [gameOverAnim]);

    // 4. Transform Animation
    const transformStyle = useMemo(() => {
        // Safety check to prevent crashing if radius isn't an Animated.Value
        const scale = radius && typeof radius === 'object' && radius.setValue
            ? Animated.divide(radius, 50)
            : (typeof radius === 'number' ? radius / 50 : 1);

        return {
            transform: [
                { translateX: centerX },
                { translateY: centerY },
                { scale: scale }
            ]
        };
    }, [radius, centerX, centerY]);

    const renderShapeLayers = (strokeColor, opacityDriver = 1) => {
        const props = {
            stroke: strokeColor,
            strokeWidth: animatedStrokeWidth,
            fill: "none",
            strokeOpacity: opacityDriver
        };

        switch (shape) {
            case 'square':
                return <AnimatedRect x={-42} y={-42} width={84} height={84} {...props} style={transformStyle} />;
            case 'triangle':
                return <AnimatedPolygon points="0,-55 -48,28 48,28" {...props} style={transformStyle} />;
            case 'pentagon':
                return <AnimatedPolygon points="0,-50 47,-15 29,40 -29,40 -47,-15" {...props} style={transformStyle} />;
            case 'hexagon':
                return <AnimatedPolygon points="0,-50 43,-25 43,25 0,50 -43,25 -43,-25" {...props} style={transformStyle} />;
            case 'star':
                return <AnimatedPolygon points="0,-55 12,-17 52,-17 20,7 32,44 0,21 -32,44 -20,7 -52,-17 -12,-17" {...props} style={transformStyle} />;
            case 'circle':
            default:
                return <AnimatedCircle cx={0} cy={0} r={50} {...props} style={transformStyle} />;
        }
    };

    return (
        <G>
            {/* Glow Layer */}
            <AnimatedG style={{ opacity: Animated.multiply(containerOpacity, 0.4) }}>
                {renderShapeLayers(baseColor, 0.4)}
            </AnimatedG>

            {/* Main Layer */}
            <AnimatedG style={{ opacity: containerOpacity }}>
                {renderShapeLayers(baseColor, 1)}
            </AnimatedG>

            {gameOverAnim && (
                <AnimatedG style={{ opacity: failureOpacity }}>
                    {renderShapeLayers(GAMEOVER_COLOR)}
                </AnimatedG>
            )}
        </G>
    );
}, (prevProps, nextProps) => {
    return (
        prevProps.radius === nextProps.radius &&
        prevProps.color === nextProps.color &&
        prevProps.shape === nextProps.shape &&
        prevProps.strokeWidth === nextProps.strokeWidth &&
        prevProps.centerX === nextProps.centerX &&
        prevProps.centerY === nextProps.centerY &&
        prevProps.perfectZoneAnim === nextProps.perfectZoneAnim &&
        prevProps.gameOverAnim === nextProps.gameOverAnim
    );
});

export default PulseCircle;
