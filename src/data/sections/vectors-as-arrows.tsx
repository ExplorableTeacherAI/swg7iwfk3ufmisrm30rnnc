/**
 * Vectors as Arrows — Section 1 of Hilbert Space Lesson
 * ======================================================
 *
 * Opening section building concrete geometric intuition for vectors
 * through a sailboat navigation challenge. Students learn that vectors
 * are geometric objects with magnitude and direction, and that vector
 * addition determines what's possible — not just numbers, but geometry.
 *
 * The aha moment: sailing directly into the wind is impossible, but
 * angled approaches let you reach upwind destinations.
 */

import React, { useRef, useState, useCallback, useEffect, type ReactElement } from "react";
import { StackLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import {
    EditableH2,
    EditableH3,
    EditableParagraph,
    InlineScrubbleNumber,
    InlineSpotColor,
    InlineLinkedHighlight,
    InlineClozeChoice,
    InlineFeedback,
    InteractionHintSequence,
    InlineTrigger,
} from "@/components/atoms";
import { Figure, FigureSlider } from "@/components/molecules";
import { useVar, useSetVar } from "@/stores";
import { useSpring, vec2, clamp, lerp, useRafLoop } from "@/lib/motion";
import { sailPropulsion, sailResultant, magnitudeVec2, isWithinTarget } from "@/data/model";
import { numberPropsFromDefinition, getVariableInfo } from "@/data/variables";

// ── Colors (from lesson design brief) ────────────────────────────────────────

const TEAL = "#62D0AD";       // primary - propulsion vector & sail handle
const INDIGO = "#8E90F5";     // secondary - wind vector
const AMBER = "#F7B23B";      // highlight - resultant vector
const INK = "#334155";        // labels
const INK_STRUCTURE = "#64748B";
const INK_QUIET = "#CBD5E1";
const PAPER = "#F8FAFC";

// ── View constants ───────────────────────────────────────────────────────────

const VIEW_WIDTH = 600;
const VIEW_HEIGHT = 400;
const BOAT_START = { x: 420, y: 260 };
const TARGET_ISLAND = { x: 140, y: 120 };
const TARGET_RADIUS = 35;
const VECTOR_SCALE = 45; // pixels per unit magnitude
const HANDLE_RADIUS = 60; // distance of rotation handle from boat

// ── Bespoke SVG Drawing ──────────────────────────────────────────────────────

function SailboatNavigationDrawing() {
    const setVar = useSetVar();
    const svgRef = useRef<SVGSVGElement>(null);

    // Read variables from store
    const sailAngle = useVar<number>("vectors_sailAngle", 45);
    const sailPower = useVar<number>("vectors_sailPower", 1.5);
    const windX = useVar<number>("vectors_windX", -2);
    const windY = useVar<number>("vectors_windY", 0);
    const boatX = useVar<number>("vectors_boatX", BOAT_START.x);
    const boatY = useVar<number>("vectors_boatY", BOAT_START.y);
    const isAnimating = useVar<boolean>("vectors_isAnimating", false);
    const showParallelogram = useVar<boolean>("vectors_showParallelogram", true);

    // Local state
    const [dragging, setDragging] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [trails, setTrails] = useState<Array<{ x: number; y: number }[]>>([]);
    const [currentTrail, setCurrentTrail] = useState<Array<{ x: number; y: number }>>([]);

    // Compute derived vectors using model functions
    const propulsion = sailPropulsion(sailAngle, sailPower);
    const wind = [windX, windY] as [number, number];
    const resultant = sailResultant(wind, propulsion);
    const resultantMag = magnitudeVec2(resultant);

    // Write derived values to store for verification
    useEffect(() => {
        setVar("vectors_propulsionX", propulsion[0]);
        setVar("vectors_propulsionY", propulsion[1]);
        setVar("vectors_resultantX", resultant[0]);
        setVar("vectors_resultantY", resultant[1]);
        setVar("vectors_resultantMag", resultantMag);
        setVar("vectors_targetReached", isWithinTarget(boatX, boatY, TARGET_ISLAND.x, TARGET_ISLAND.y, TARGET_RADIUS));
    }, [propulsion, resultant, resultantMag, boatX, boatY, setVar]);

    // Spring-settled handle scale for affordance
    const handleScale = useSpring(dragging || hovered ? 1.2 : 1, {
        stiffness: 400,
        damping: 26,
    });

    // Animation loop for boat movement
    useRafLoop(
        (dt) => {
            if (!isAnimating) return;

            const speed = 80; // pixels per second
            const dx = resultant[0] * speed * dt;
            const dy = -resultant[1] * speed * dt; // SVG y is inverted

            const newX = clamp(boatX + dx, 40, VIEW_WIDTH - 40);
            const newY = clamp(boatY + dy, 40, VIEW_HEIGHT - 40);

            // Record trail
            setCurrentTrail(prev => [...prev, { x: newX, y: newY }]);

            setVar("vectors_boatX", newX);
            setVar("vectors_boatY", newY);

            // Check if reached target
            if (isWithinTarget(newX, newY, TARGET_ISLAND.x, TARGET_ISLAND.y, TARGET_RADIUS)) {
                setVar("vectors_isAnimating", false);
                setVar("vectors_targetReached", true);
                // Save trail
                setTrails(prev => [...prev, currentTrail]);
                setCurrentTrail([]);
            }

            // Stop if out of reasonable bounds or taking too long
            if (currentTrail.length > 300) {
                setVar("vectors_isAnimating", false);
                setTrails(prev => [...prev, currentTrail]);
                setCurrentTrail([]);
            }
        },
        { paused: !isAnimating }
    );

    // Pointer handling for sail rotation
    const svgPointFromEvent = useCallback((event: React.PointerEvent): { x: number; y: number } => {
        const svg = svgRef.current;
        if (!svg) return { x: 0, y: 0 };
        const rect = svg.getBoundingClientRect();
        return {
            x: ((event.clientX - rect.left) / rect.width) * VIEW_WIDTH,
            y: ((event.clientY - rect.top) / rect.height) * VIEW_HEIGHT,
        };
    }, []);

    const handlePointerMove = useCallback((event: React.PointerEvent) => {
        if (!dragging) return;
        const point = svgPointFromEvent(event);
        const dx = point.x - boatX;
        const dy = -(point.y - boatY); // Invert for math coords
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        setVar("vectors_sailAngle", ((angle % 360) + 360) % 360);
    }, [dragging, boatX, boatY, svgPointFromEvent, setVar]);

    // Arrow endpoint calculations
    const windEndX = boatX + windX * VECTOR_SCALE;
    const windEndY = boatY - windY * VECTOR_SCALE; // SVG y inverted

    const propEndX = boatX + propulsion[0] * VECTOR_SCALE;
    const propEndY = boatY - propulsion[1] * VECTOR_SCALE;

    const resultEndX = boatX + resultant[0] * VECTOR_SCALE;
    const resultEndY = boatY - resultant[1] * VECTOR_SCALE;

    // Parallelogram fourth point
    const paraX = windEndX + propulsion[0] * VECTOR_SCALE;
    const paraY = windEndY - propulsion[1] * VECTOR_SCALE;

    // Handle position (for dragging)
    const handleAngleRad = sailAngle * (Math.PI / 180);
    const handleX = boatX + Math.cos(handleAngleRad) * HANDLE_RADIUS;
    const handleY = boatY - Math.sin(handleAngleRad) * HANDLE_RADIUS;

    // Check if target reached
    const targetReached = isWithinTarget(boatX, boatY, TARGET_ISLAND.x, TARGET_ISLAND.y, TARGET_RADIUS);

    return (
        <svg
            ref={svgRef}
            viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
            className="block w-full"
            role="img"
            aria-label="Sailboat navigation with wind, propulsion, and resultant vectors"
            style={{ touchAction: "none" }}
            onPointerMove={handlePointerMove}
            onPointerUp={() => setDragging(false)}
            onPointerCancel={() => setDragging(false)}
        >
            <defs>
                {/* Arrowhead markers */}
                <marker id="arrow-wind" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill={INDIGO} />
                </marker>
                <marker id="arrow-prop" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill={TEAL} />
                </marker>
                <marker id="arrow-result" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill={AMBER} />
                </marker>

                {/* Handle shadow */}
                <filter id="handle-shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#0F172A" floodOpacity="0.2" />
                </filter>

                {/* Island gradient */}
                <radialGradient id="island-grad" cx="40%" cy="40%">
                    <stop offset="0%" stopColor="#86EFAC" />
                    <stop offset="100%" stopColor="#22C55E" />
                </radialGradient>

                {/* Water pattern */}
                <pattern id="water-pattern" patternUnits="userSpaceOnUse" width="60" height="60">
                    <path d="M0 30 Q15 25 30 30 T60 30" stroke={INK_QUIET} strokeWidth="1" fill="none" opacity="0.3" />
                </pattern>
            </defs>

            {/* Background water */}
            <rect x="0" y="0" width={VIEW_WIDTH} height={VIEW_HEIGHT} fill={PAPER} />
            <rect x="0" y="0" width={VIEW_WIDTH} height={VIEW_HEIGHT} fill="url(#water-pattern)" />

            {/* Wake trails from previous attempts */}
            {trails.map((trail, i) => (
                <polyline
                    key={i}
                    points={trail.map(p => `${p.x},${p.y}`).join(" ")}
                    stroke={INK_QUIET}
                    strokeWidth="2"
                    fill="none"
                    opacity="0.4"
                    strokeDasharray="4 4"
                />
            ))}

            {/* Current trail */}
            {currentTrail.length > 1 && (
                <polyline
                    points={currentTrail.map(p => `${p.x},${p.y}`).join(" ")}
                    stroke={AMBER}
                    strokeWidth="2.5"
                    fill="none"
                    opacity="0.6"
                />
            )}

            {/* Target Island */}
            <g data-concept="target-island">
                <circle
                    cx={TARGET_ISLAND.x}
                    cy={TARGET_ISLAND.y}
                    r={TARGET_RADIUS}
                    fill="url(#island-grad)"
                    stroke={targetReached ? "#16A34A" : INK_STRUCTURE}
                    strokeWidth={targetReached ? 3 : 2}
                />
                {/* Palm tree simple icon */}
                <path
                    d={`M${TARGET_ISLAND.x} ${TARGET_ISLAND.y + 10} L${TARGET_ISLAND.x} ${TARGET_ISLAND.y - 15}`}
                    stroke="#92400E"
                    strokeWidth="3"
                    strokeLinecap="round"
                />
                <ellipse
                    cx={TARGET_ISLAND.x - 8}
                    cy={TARGET_ISLAND.y - 18}
                    rx="12"
                    ry="6"
                    fill="#15803D"
                    transform={`rotate(-30 ${TARGET_ISLAND.x - 8} ${TARGET_ISLAND.y - 18})`}
                />
                <ellipse
                    cx={TARGET_ISLAND.x + 8}
                    cy={TARGET_ISLAND.y - 18}
                    rx="12"
                    ry="6"
                    fill="#15803D"
                    transform={`rotate(30 ${TARGET_ISLAND.x + 8} ${TARGET_ISLAND.y - 18})`}
                />
                <text
                    x={TARGET_ISLAND.x}
                    y={TARGET_ISLAND.y + TARGET_RADIUS + 16}
                    fill={INK}
                    fontSize="12"
                    textAnchor="middle"
                    fontWeight="500"
                >
                    Target
                </text>
            </g>

            {/* Parallelogram dashed lines (vector addition visualization) */}
            {showParallelogram && sailPower > 0.1 && (
                <g data-concept="parallelogram" opacity="0.5">
                    {/* From wind tip to parallelogram corner */}
                    <line
                        x1={windEndX}
                        y1={windEndY}
                        x2={paraX}
                        y2={paraY}
                        stroke={TEAL}
                        strokeWidth="1.5"
                        strokeDasharray="6 4"
                    />
                    {/* From propulsion tip to parallelogram corner */}
                    <line
                        x1={propEndX}
                        y1={propEndY}
                        x2={paraX}
                        y2={paraY}
                        stroke={INDIGO}
                        strokeWidth="1.5"
                        strokeDasharray="6 4"
                    />
                </g>
            )}

            {/* Wind Vector (fixed, coming from right) */}
            <g data-concept="vectors_windVector">
                <line
                    x1={boatX}
                    y1={boatY}
                    x2={windEndX}
                    y2={windEndY}
                    stroke={INDIGO}
                    strokeWidth="3"
                    markerEnd="url(#arrow-wind)"
                />
                <text
                    x={(boatX + windEndX) / 2}
                    y={(boatY + windEndY) / 2 - 12}
                    fill={INDIGO}
                    fontSize="13"
                    fontWeight="600"
                    textAnchor="middle"
                >
                    wind
                </text>
            </g>

            {/* Propulsion Vector (controlled by sail angle and power) */}
            {sailPower > 0.1 && (
                <g data-concept="vectors_propulsionVector">
                    <line
                        x1={boatX}
                        y1={boatY}
                        x2={propEndX}
                        y2={propEndY}
                        stroke={TEAL}
                        strokeWidth="3"
                        markerEnd="url(#arrow-prop)"
                    />
                    <text
                        x={(boatX + propEndX) / 2 + 8}
                        y={(boatY + propEndY) / 2 - 8}
                        fill={TEAL}
                        fontSize="13"
                        fontWeight="600"
                        textAnchor="middle"
                    >
                        sail
                    </text>
                </g>
            )}

            {/* Resultant Vector (sum of wind and propulsion) */}
            {resultantMag > 0.1 && (
                <g data-concept="vectors_resultantVector">
                    <line
                        x1={boatX}
                        y1={boatY}
                        x2={resultEndX}
                        y2={resultEndY}
                        stroke={AMBER}
                        strokeWidth="4"
                        markerEnd="url(#arrow-result)"
                    />
                    <text
                        x={resultEndX + 12}
                        y={resultEndY}
                        fill={AMBER}
                        fontSize="13"
                        fontWeight="700"
                        textAnchor="start"
                    >
                        motion
                    </text>
                </g>
            )}

            {/* Boat */}
            <g data-concept="vectors_boat" transform={`translate(${boatX}, ${boatY})`}>
                {/* Hull */}
                <ellipse
                    cx="0"
                    cy="0"
                    rx="18"
                    ry="10"
                    fill="#F1F5F9"
                    stroke={INK_STRUCTURE}
                    strokeWidth="2"
                />
                {/* Mast */}
                <line x1="0" y1="0" x2="0" y2="-20" stroke={INK_STRUCTURE} strokeWidth="2" />
            </g>

            {/* Rotation Handle (draggable) */}
            <g
                transform={`translate(${handleX}, ${handleY}) scale(${handleScale})`}
                style={{ cursor: dragging ? "grabbing" : "grab" }}
            >
                <circle
                    r="12"
                    fill={TEAL}
                    filter="url(#handle-shadow)"
                    data-concept="vectors_sailAngle"
                />
                {/* Direction indicator */}
                <line x1="-6" y1="0" x2="6" y2="0" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </g>

            {/* Invisible hit area for handle */}
            <circle
                cx={handleX}
                cy={handleY}
                r="24"
                fill="transparent"
                style={{ cursor: dragging ? "grabbing" : "grab", touchAction: "none" }}
                onPointerDown={(e) => {
                    e.currentTarget.setPointerCapture(e.pointerId);
                    setDragging(true);
                }}
                onPointerEnter={() => setHovered(true)}
                onPointerLeave={() => setHovered(false)}
            />

            {/* Readouts panel */}
            <g fontSize="12" style={{ fontVariantNumeric: "tabular-nums" }}>
                <rect x="10" y="10" width="160" height="80" rx="6" fill="white" fillOpacity="0.9" stroke={INK_QUIET} strokeWidth="1" />
                <text x="20" y="30" fill={INDIGO} fontWeight="600">Wind: ({windX.toFixed(1)}, {windY.toFixed(1)})</text>
                <text x="20" y="48" fill={TEAL} fontWeight="600">Sail: ({propulsion[0].toFixed(1)}, {propulsion[1].toFixed(1)})</text>
                <text x="20" y="66" fill={AMBER} fontWeight="700">Motion: ({resultant[0].toFixed(1)}, {resultant[1].toFixed(1)})</text>
                <text x="20" y="82" fill={INK} fontSize="11">|motion| = {resultantMag.toFixed(2)}</text>
            </g>

            {/* Success message */}
            {targetReached && (
                <g>
                    <rect x={VIEW_WIDTH / 2 - 80} y={VIEW_HEIGHT - 50} width="160" height="36" rx="8" fill="#22C55E" />
                    <text x={VIEW_WIDTH / 2} y={VIEW_HEIGHT - 26} fill="white" fontSize="16" fontWeight="700" textAnchor="middle">
                        🎉 Target Reached!
                    </text>
                </g>
            )}
        </svg>
    );
}

// ── Figure composition ───────────────────────────────────────────────────────

function SailboatNavigationFigure() {
    const setVar = useSetVar();
    const isAnimating = useVar<boolean>("vectors_isAnimating", false);

    const handleGo = () => {
        if (!isAnimating) {
            setVar("vectors_isAnimating", true);
        }
    };

    const handleReset = () => {
        setVar("vectors_boatX", BOAT_START.x);
        setVar("vectors_boatY", BOAT_START.y);
        setVar("vectors_isAnimating", false);
        setVar("vectors_targetReached", false);
        setVar("vectors_sailAngle", 45);
        setVar("vectors_sailPower", 1.5);
    };

    return (
        <Figure
            id="vectors-sailboat-navigation"
            onReset={handleReset}
            caption="Drag the teal handle to rotate your sail direction. Adjust sail power below, then press 'Sail!' to see where the combined vectors take you."
        >
            <SailboatNavigationDrawing />

            {/* Controls */}
            <div className="px-6 pb-4 space-y-3">
                <FigureSlider
                    varName="vectors_sailPower"
                    label="Sail power"
                    {...numberPropsFromDefinition(getVariableInfo("vectors_sailPower"))}
                    formatValue={(v) => v.toFixed(1)}
                />

                <div className="flex gap-3">
                    <button
                        onClick={handleGo}
                        disabled={isAnimating}
                        className="flex-1 py-2 px-4 rounded-lg font-semibold text-white transition-all"
                        style={{
                            backgroundColor: isAnimating ? INK_QUIET : AMBER,
                            cursor: isAnimating ? "not-allowed" : "pointer",
                        }}
                    >
                        {isAnimating ? "Sailing..." : "Sail!"}
                    </button>
                    <button
                        onClick={handleReset}
                        className="py-2 px-4 rounded-lg font-medium border-2 transition-all hover:bg-slate-50"
                        style={{ borderColor: INK_QUIET, color: INK_STRUCTURE }}
                    >
                        Reset
                    </button>
                </div>
            </div>

            <InteractionHintSequence
                hintKey="vectors-sailboat-hint"
                steps={[
                    {
                        gesture: "drag-circular",
                        label: "Rotate the teal handle to aim your sail",
                        position: { x: "75%", y: "55%" },
                        dragPath: {
                            type: "arc",
                            startAngle: 45,
                            endAngle: 135,
                            radius: 35,
                        },
                    },
                ]}
            />
        </Figure>
    );
}

// ── Exported section blocks ──────────────────────────────────────────────────

export const vectorsAsArrowsBlocks: ReactElement[] = [
    // ─── Section Title ───
    <StackLayout key="layout-vectors-title" maxWidth="xl">
        <Block id="vectors-title" padding="lg">
            <EditableH2 id="h2-vectors-title" blockId="vectors-title">
                Vectors: More Than Just Numbers
            </EditableH2>
        </Block>
    </StackLayout>,

    // ─── Opening Hook ───
    <StackLayout key="layout-vectors-hook" maxWidth="xl">
        <Block id="vectors-hook" padding="sm">
            <EditableParagraph id="para-vectors-hook" blockId="vectors-hook">
                Here's a puzzle that stumped sailors for centuries: if the wind is blowing straight at you,
                can you sail directly into it? Your instinct might say "just push harder!" But no amount
                of effort lets a sailboat travel straight upwind. The geometry of vectors explains why.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ─── What is a Vector ───
    <StackLayout key="layout-vectors-definition" maxWidth="xl">
        <Block id="vectors-definition" padding="sm">
            <EditableParagraph id="para-vectors-definition" blockId="vectors-definition">
                A{" "}
                <InlineLinkedHighlight
                    varName="vectors_highlight"
                    highlightId="vector-concept"
                    color={TEAL}
                >
                    vector
                </InlineLinkedHighlight>{" "}
                isn't just a pair of numbers — it's a geometric object with both{" "}
                <InlineSpotColor varName="vectors_magnitude" color={AMBER}>magnitude</InlineSpotColor>{" "}
                (how long it is) and{" "}
                <InlineSpotColor varName="vectors_direction" color={INDIGO}>direction</InlineSpotColor>{" "}
                (where it points). Think of it as an arrow: the arrow's length tells you how much,
                and where it points tells you which way.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ─── The Challenge Setup ───
    <StackLayout key="layout-vectors-challenge-intro" maxWidth="xl">
        <Block id="vectors-challenge-intro" padding="sm">
            <EditableH3 id="h3-vectors-challenge" blockId="vectors-challenge-intro">
                The Sailboat Challenge
            </EditableH3>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-vectors-challenge-desc" maxWidth="xl">
        <Block id="vectors-challenge-desc" padding="sm">
            <EditableParagraph id="para-vectors-challenge" blockId="vectors-challenge-desc">
                You're sailing a boat. A constant{" "}
                <InlineSpotColor varName="vectors_wind_color" color={INDIGO}>wind</InlineSpotColor>{" "}
                blows from the right, pushing your boat leftward. You control your{" "}
                <InlineSpotColor varName="vectors_sail_color" color={TEAL}>sail</InlineSpotColor>{" "}
                — rotating it to any angle and adjusting its power. The{" "}
                <InlineSpotColor varName="vectors_result_color" color={AMBER}>actual motion</InlineSpotColor>{" "}
                of your boat is determined by adding these two vectors together.
                Can you reach the target island?
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ─── Main Visualization ───
    <StackLayout key="layout-vectors-viz" maxWidth="xl">
        <Block id="vectors-viz" padding="sm" hasVisualization>
            <SailboatNavigationFigure />
        </Block>
    </StackLayout>,

    // ─── Guided Exploration ───
    <StackLayout key="layout-vectors-explore" maxWidth="xl">
        <Block id="vectors-explore" padding="sm">
            <EditableParagraph id="para-vectors-explore" blockId="vectors-explore">
                Drag the{" "}
                <InlineSpotColor varName="vectors_handle_color" color={TEAL}>teal handle</InlineSpotColor>{" "}
                around the boat to rotate your sail direction. Notice how the three arrows change:
                the{" "}
                <InlineSpotColor varName="vectors_wind_label" color={INDIGO}>wind</InlineSpotColor>{" "}
                stays fixed, your{" "}
                <InlineSpotColor varName="vectors_sail_label" color={TEAL}>sail</InlineSpotColor>{" "}
                rotates with the handle, and the{" "}
                <InlineSpotColor varName="vectors_motion_label" color={AMBER}>motion</InlineSpotColor>{" "}
                arrow shows their sum — where you'll actually go.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ─── Key Insight: Parallelogram ───
    <StackLayout key="layout-vectors-parallelogram" maxWidth="xl">
        <Block id="vectors-parallelogram" padding="sm">
            <EditableParagraph id="para-vectors-parallelogram" blockId="vectors-parallelogram">
                The dashed lines show the{" "}
                <InlineLinkedHighlight varName="vectors_para_highlight" highlightId="parallelogram" color={INK_STRUCTURE}>
                    parallelogram rule
                </InlineLinkedHighlight>{" "}
                for vector addition. To add two vectors, place them tail-to-tip and draw the diagonal of the
                parallelogram they form. This diagonal is the resultant — the net effect of both forces combined.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ─── The Aha Moment ───
    <StackLayout key="layout-vectors-aha-setup" maxWidth="xl">
        <Block id="vectors-aha-setup" padding="sm">
            <EditableH3 id="h3-vectors-aha" blockId="vectors-aha-setup">
                Why You Can't Sail Directly Upwind
            </EditableH3>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-vectors-aha" maxWidth="xl">
        <Block id="vectors-aha" padding="sm">
            <EditableParagraph id="para-vectors-aha" blockId="vectors-aha">
                Try pointing your sail directly into the wind (to the right). No matter how much power you use,
                you can only reduce the leftward motion — never reverse it. To make progress toward an upwind
                target, you need to{" "}
                <InlineTrigger varName="vectors_sailAngle" value={120} color={TEAL}>
                    sail at an angle
                </InlineTrigger>{" "}
                where your sail vector has a component perpendicular to the wind. This is called "tacking" —
                zigzagging your way upwind using the geometry of vector addition.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ─── Assessment Question ───
    <StackLayout key="layout-vectors-question" maxWidth="xl">
        <Block id="vectors-question" padding="md">
            <EditableParagraph id="para-vectors-question" blockId="vectors-question">
                When two vectors are added, the resulting{" "}
                <InlineFeedback
                    varName="answer_vectors_resultant_type"
                    correctValue="resultant"
                    successMessage="— exactly! The resultant captures both magnitude and direction of the combined effect"
                    failureMessage="— not quite."
                    hint="It's the single vector that replaces two combined vectors."
                    reviewBlockId="vectors-parallelogram"
                    reviewLabel="Review vector addition"
                    visualizationHint={{
                        blockId: "vectors-viz",
                        hintKey: "vectors-resultant-hint",
                        steps: [
                            {
                                gesture: "drag-circular",
                                label: "Rotate the sail and watch how the amber 'motion' arrow changes",
                                position: { x: "75%", y: "55%" },
                            },
                        ],
                        label: "Explore it yourself",
                        resetVars: { vectors_sailAngle: 45, vectors_sailPower: 2 },
                    }}
                >
                    <InlineClozeChoice
                        varName="answer_vectors_resultant_type"
                        correctAnswer="resultant"
                        options={["scalar", "resultant", "magnitude", "component"]}
                        placeholder="???"
                        color={INDIGO}
                    />
                </InlineFeedback>{" "}
                vector shows the net effect of both original vectors combined.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ─── Summary ───
    <StackLayout key="layout-vectors-summary" maxWidth="xl">
        <Block id="vectors-summary" padding="md">
            <EditableParagraph id="para-vectors-summary" blockId="vectors-summary">
                Vectors aren't just lists of numbers to compute with — they're geometric objects whose
                directions and magnitudes determine what's physically possible. This geometric perspective
                will be essential as we build toward more abstract vector spaces and, eventually, the
                infinite-dimensional Hilbert spaces at the heart of quantum mechanics.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
