import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { Circle, Rect, Polygon, Path } from 'react-native-svg';
import { SHAPES } from '../utils/constants';

const PulseCircle = React.memo(({
    radius,
    centerX,
    centerY,
    color,
    strokeWidth = 2,
    inPerfectZone = false,
    shape = SHAPES.CIRCLE,
}) => {
    const glowAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (inPerfectZone) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(glowAnim, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: false,
                    }),
                    Animated.timing(glowAnim, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: false,
                    }),
                ])
            ).start();
        } else {
            glowAnim.setValue(0);
        }
    }, [inPerfectZone]);

    const glowOpacity = glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.6],
    });

    const renderShape = () => {
        const size = radius;

        switch (shape) {
            case SHAPES.SQUARE:
                const squareSize = size * 1.7; // Adjust to match circle area
                return (
                    <>
                        {inPerfectZone && (
                            <Rect
                                x={centerX - squareSize / 2}
                                y={centerY - squareSize / 2}
                                width={squareSize}
                                height={squareSize}
                                stroke={color}
                                strokeWidth={strokeWidth + 8}
                                fill="none"
                                opacity={glowOpacity}
                            />
                        )}
                        <Rect
                            x={centerX - squareSize / 2}
                            y={centerY - squareSize / 2}
                            width={squareSize}
                            height={squareSize}
                            stroke={color}
                            strokeWidth={inPerfectZone ? strokeWidth + 2 : strokeWidth}
                            fill="none"
                            opacity={inPerfectZone ? 1 : 0.8}
                        />
                    </>
                );

            case SHAPES.TRIANGLE:
                const triSize = size * 1.8;
                const height = (triSize * Math.sqrt(3)) / 2;
                const points = `${centerX},${centerY - height / 1.5} ${centerX - triSize / 2},${centerY + height / 3} ${centerX + triSize / 2},${centerY + height / 3}`;
                return (
                    <>
                        {inPerfectZone && (
                            <Polygon
                                points={points}
                                stroke={color}
                                strokeWidth={strokeWidth + 8}
                                fill="none"
                                opacity={glowOpacity}
                            />
                        )}
                        <Polygon
                            points={points}
                            stroke={color}
                            strokeWidth={inPerfectZone ? strokeWidth + 2 : strokeWidth}
                            fill="none"
                            opacity={inPerfectZone ? 1 : 0.8}
                        />
                    </>
                );

            case SHAPES.HEXAGON:
                const hexSize = size * 1.2;
                const hexPoints = Array.from({ length: 6 }, (_, i) => {
                    const angle = (Math.PI / 3) * i - Math.PI / 2;
                    return `${centerX + hexSize * Math.cos(angle)},${centerY + hexSize * Math.sin(angle)}`;
                }).join(' ');
                return (
                    <>
                        {inPerfectZone && (
                            <Polygon
                                points={hexPoints}
                                stroke={color}
                                strokeWidth={strokeWidth + 8}
                                fill="none"
                                opacity={glowOpacity}
                            />
                        )}
                        <Polygon
                            points={hexPoints}
                            stroke={color}
                            strokeWidth={inPerfectZone ? strokeWidth + 2 : strokeWidth}
                            fill="none"
                            opacity={inPerfectZone ? 1 : 0.8}
                        />
                    </>
                );

            case SHAPES.PENTAGON:
                const pentSize = size * 1.3;
                const pentPoints = Array.from({ length: 5 }, (_, i) => {
                    const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
                    return `${centerX + pentSize * Math.cos(angle)},${centerY + pentSize * Math.sin(angle)}`;
                }).join(' ');
                return (
                    <>
                        {inPerfectZone && (
                            <Polygon
                                points={pentPoints}
                                stroke={color}
                                strokeWidth={strokeWidth + 8}
                                fill="none"
                                opacity={glowOpacity}
                            />
                        )}
                        <Polygon
                            points={pentPoints}
                            stroke={color}
                            strokeWidth={inPerfectZone ? strokeWidth + 2 : strokeWidth}
                            fill="none"
                            opacity={inPerfectZone ? 1 : 0.8}
                        />
                    </>
                );

            case SHAPES.STAR:
                const starSize = size * 1.3;
                const outerRadius = starSize;
                const innerRadius = starSize * 0.5;
                const starPoints = Array.from({ length: 10 }, (_, i) => {
                    const angle = (Math.PI * 2 / 10) * i - Math.PI / 2;
                    const r = i % 2 === 0 ? outerRadius : innerRadius;
                    return `${centerX + r * Math.cos(angle)},${centerY + r * Math.sin(angle)}`;
                }).join(' ');
                return (
                    <>
                        {inPerfectZone && (
                            <Polygon
                                points={starPoints}
                                stroke={color}
                                strokeWidth={strokeWidth + 8}
                                fill="none"
                                opacity={glowOpacity}
                            />
                        )}
                        <Polygon
                            points={starPoints}
                            stroke={color}
                            strokeWidth={inPerfectZone ? strokeWidth + 2 : strokeWidth}
                            fill="none"
                            opacity={inPerfectZone ? 1 : 0.8}
                        />
                    </>
                );

            case SHAPES.CIRCLE:
            default:
                return (
                    <Circle
                        cx={centerX}
                        cy={centerY}
                        r={radius}
                        stroke={color}
                        strokeWidth={strokeWidth}
                        fill="none"
                    />
                );
        }
    };

    return renderShape();
}, (prevProps, nextProps) => {
    // Only re-render if meaningful props change
    return (
        prevProps.radius === nextProps.radius &&
        prevProps.color === nextProps.color &&
        prevProps.inPerfectZone === nextProps.inPerfectZone &&
        prevProps.shape === nextProps.shape &&
        prevProps.strokeWidth === nextProps.strokeWidth
    );
});

export default PulseCircle;
