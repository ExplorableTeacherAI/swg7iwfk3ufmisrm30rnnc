/**
 * Variables Configuration
 * =======================
 * 
 * CENTRAL PLACE TO DEFINE ALL SHARED VARIABLES
 * 
 * This file defines all variables that can be shared across sections.
 * AI agents should read this file to understand what variables are available.
 * 
 * USAGE:
 * 1. Define variables here with their default values and metadata
 * 2. Use them in any section with: const x = useVar('variableName', defaultValue)
 * 3. Update them with: setVar('variableName', newValue)
 */

import { type VarValue } from '@/stores';

/**
 * Variable definition with metadata
 */
export interface VariableDefinition {
    /** Default value */
    defaultValue: VarValue;
    /** Human-readable label */
    label?: string;
    /** Description for AI agents */
    description?: string;
    /** Variable type hint */
    type?: 'number' | 'text' | 'boolean' | 'select' | 'array' | 'object' | 'spotColor' | 'linkedHighlight';
    /** Unit (e.g., 'Hz', '°', 'm/s') - for numbers */
    unit?: string;
    /** Minimum value (for number sliders) */
    min?: number;
    /** Maximum value (for number sliders) */
    max?: number;
    /** Step increment (for number sliders) */
    step?: number;
    /** Display color for InlineScrubbleNumber / InlineSpotColor (e.g. '#D81B60') */
    color?: string;
    /** Options for 'select' type variables */
    options?: string[];
    /** Placeholder text for text inputs */
    placeholder?: string;
    /** Correct answer for cloze input validation */
    correctAnswer?: string;
    /** Whether cloze matching is case sensitive */
    caseSensitive?: boolean;
    /** Background color for inline components */
    bgColor?: string;
    /** Schema hint for object types (for AI agents) */
    schema?: string;
}

/**
 * =====================================================
 * 🎯 DEFINE YOUR VARIABLES HERE
 * =====================================================
 * 
 * SUPPORTED TYPES:
 * 
 * 1. NUMBER (slider):
 *    { defaultValue: 5, type: 'number', min: 0, max: 10, step: 1 }
 * 
 * 2. TEXT (free text):
 *    { defaultValue: 'Hello', type: 'text', placeholder: 'Enter text...' }
 * 
 * 3. SELECT (dropdown):
 *    { defaultValue: 'sine', type: 'select', options: ['sine', 'cosine', 'tangent'] }
 * 
 * 4. BOOLEAN (toggle):
 *    { defaultValue: true, type: 'boolean' }
 * 
 * 5. ARRAY (list of numbers):
 *    { defaultValue: [1, 2, 3], type: 'array' }
 * 
 * 6. OBJECT (complex data):
 *    { defaultValue: { x: 5, y: 10 }, type: 'object', schema: '{ x: number, y: number }' }
 */
export const variableDefinitions: Record<string, VariableDefinition> = {
    // ========================================
    // SECTION: vectors-as-arrows
    // ========================================

    vectors_sailAngle: {
        defaultValue: 45,
        type: 'number',
        label: 'Sail Angle',
        description: 'Angle of the sail/propulsion vector in degrees (0-360)',
        unit: '°',
        min: 0,
        max: 360,
        step: 1,
        color: '#62D0AD',
    },
    vectors_sailPower: {
        defaultValue: 1.5,
        type: 'number',
        label: 'Sail Power',
        description: 'Magnitude of the propulsion vector (0-3)',
        min: 0,
        max: 3,
        step: 0.1,
        color: '#62D0AD',
    },
    vectors_windX: {
        defaultValue: -2,
        type: 'number',
        label: 'Wind X',
        description: 'X-component of the fixed wind vector',
        min: -3,
        max: 3,
        step: 0.1,
        color: '#8E90F5',
    },
    vectors_windY: {
        defaultValue: 0,
        type: 'number',
        label: 'Wind Y',
        description: 'Y-component of the fixed wind vector',
        min: -3,
        max: 3,
        step: 0.1,
        color: '#8E90F5',
    },
    vectors_propulsionX: {
        defaultValue: 0,
        type: 'number',
        label: 'Propulsion X',
        description: 'Derived: X-component of propulsion vector',
        color: '#62D0AD',
    },
    vectors_propulsionY: {
        defaultValue: 0,
        type: 'number',
        label: 'Propulsion Y',
        description: 'Derived: Y-component of propulsion vector',
        color: '#62D0AD',
    },
    vectors_resultantX: {
        defaultValue: 0,
        type: 'number',
        label: 'Resultant X',
        description: 'Derived: X-component of resultant = wind + propulsion',
        color: '#F7B23B',
    },
    vectors_resultantY: {
        defaultValue: 0,
        type: 'number',
        label: 'Resultant Y',
        description: 'Derived: Y-component of resultant = wind + propulsion',
        color: '#F7B23B',
    },
    vectors_resultantMag: {
        defaultValue: 0,
        type: 'number',
        label: 'Resultant Magnitude',
        description: 'Derived: magnitude of resultant vector',
        color: '#F7B23B',
    },
    vectors_boatX: {
        defaultValue: 280,
        type: 'number',
        label: 'Boat X',
        description: 'Current X-position of the boat in SVG coords',
    },
    vectors_boatY: {
        defaultValue: 200,
        type: 'number',
        label: 'Boat Y',
        description: 'Current Y-position of the boat in SVG coords',
    },
    vectors_targetReached: {
        defaultValue: false,
        type: 'boolean',
        label: 'Target Reached',
        description: 'True when boat is within threshold of target island',
    },
    vectors_isAnimating: {
        defaultValue: false,
        type: 'boolean',
        label: 'Is Animating',
        description: 'Whether boat is currently moving along resultant path',
    },
    vectors_showParallelogram: {
        defaultValue: true,
        type: 'boolean',
        label: 'Show Parallelogram',
        description: 'Whether to show the parallelogram rule dashed lines',
    },
    answer_vectors_resultant_type: {
        defaultValue: '',
        type: 'text',
        label: 'Answer: Resultant Type',
        description: 'Student answer for what the resultant vector represents',
        placeholder: '???',
        color: '#8E90F5',
    },

    // ========================================
    // SECTION: vector-spaces
    // ========================================

    // Test vector v1 coordinates
    vs_v1_x: {
        defaultValue: 2,
        type: 'number',
        label: 'v₁ x-coordinate',
        description: 'x-coordinate of the first test vector',
        min: -4,
        max: 4,
        step: 0.5,
        color: '#62D0AD',
    },
    vs_v1_y: {
        defaultValue: 1,
        type: 'number',
        label: 'v₁ y-coordinate',
        description: 'y-coordinate of the first test vector',
        min: -4,
        max: 4,
        step: 0.5,
        color: '#62D0AD',
    },

    // Test vector v2 coordinates
    vs_v2_x: {
        defaultValue: 1,
        type: 'number',
        label: 'v₂ x-coordinate',
        description: 'x-coordinate of the second test vector',
        min: -4,
        max: 4,
        step: 0.5,
        color: '#8E90F5',
    },
    vs_v2_y: {
        defaultValue: 2,
        type: 'number',
        label: 'v₂ y-coordinate',
        description: 'y-coordinate of the second test vector',
        min: -4,
        max: 4,
        step: 0.5,
        color: '#8E90F5',
    },

    // Scalar for axiom tests
    vs_scalar: {
        defaultValue: 2,
        type: 'number',
        label: 'Scalar c',
        description: 'Scalar multiplier for testing distributive axiom',
        min: -3,
        max: 3,
        step: 0.5,
        color: '#F7B23B',
    },

    // Animation control
    vs_step: {
        defaultValue: 0,
        type: 'number',
        label: 'Animation Step',
        description: 'Current step in the axiom test animation (0-4)',
        min: 0,
        max: 4,
        step: 1,
    },

    vs_playing: {
        defaultValue: false,
        type: 'boolean',
        label: 'Playing',
        description: 'Whether the step-by-step animation is auto-playing',
    },

    // Question answer
    vs_answer_why_axioms: {
        defaultValue: '',
        type: 'select',
        label: 'Why Axioms Matter',
        description: 'Student answer for why axioms are necessary',
        placeholder: '???',
        correctAnswer: 'prevent contradictions',
        options: ['make math look nice', 'prevent contradictions', 'confuse students', 'are just tradition'],
        color: '#62D0AD',
    },

    // ========================================
    // SECTION: inner-products
    // ========================================

    // Target angle the student drags to set
    ip_targetAngle: {
        defaultValue: 75,
        type: 'number',
        label: 'Target Angle',
        description: 'Target angle between vectors in degrees, dragged by student',
        unit: '°',
        min: 30,
        max: 150,
        step: 1,
        color: '#8E90F5',
    },

    // Derived: weight coefficients for the inner product matrix [[a, 0], [0, b]]
    ip_weightA: {
        defaultValue: 1,
        type: 'number',
        label: 'Weight a',
        description: 'Derived: weight coefficient a in the inner product matrix',
        color: '#F7B23B',
    },
    ip_weightB: {
        defaultValue: 1,
        type: 'number',
        label: 'Weight b',
        description: 'Derived: weight coefficient b in the inner product matrix',
        color: '#F7B23B',
    },

    // Derived: inner product value
    ip_innerProductValue: {
        defaultValue: 0,
        type: 'number',
        label: 'Inner Product',
        description: 'Derived: the inner product ⟨u,v⟩ under current weighting',
        color: '#62D0AD',
    },

    // Derived: norms under current inner product
    ip_normU: {
        defaultValue: 0,
        type: 'number',
        label: '||u||',
        description: 'Derived: norm of u under current inner product',
        color: '#62D0AD',
    },
    ip_normV: {
        defaultValue: 0,
        type: 'number',
        label: '||v||',
        description: 'Derived: norm of v under current inner product',
        color: '#62D0AD',
    },

    // Derived: cos(θ)
    ip_cosTheta: {
        defaultValue: 0,
        type: 'number',
        label: 'cos(θ)',
        description: 'Derived: cos(θ) = ⟨u,v⟩/(||u|| ||v||)',
        color: '#8E90F5',
    },

    // Ghost angles for trace
    ip_ghostAngles: {
        defaultValue: [],
        type: 'array',
        label: 'Ghost Angles',
        description: 'Array of previously visited angle positions for the trace',
    },

    // Standard Euclidean angle for reference
    ip_euclideanAngle: {
        defaultValue: 37,
        type: 'number',
        label: 'Euclidean Angle',
        description: 'Standard Euclidean angle between u and v (for reference)',
        color: '#64748B',
    },

    // Question answer
    ip_answer_whatChanges: {
        defaultValue: '',
        type: 'select',
        label: 'What Changes?',
        description: 'Student answer for what changes when the inner product changes',
        placeholder: '???',
        correctAnswer: 'the geometry',
        options: ['the vectors', 'the geometry', 'nothing', 'the dimensions'],
        color: '#8E90F5',
    },

    // Question answer for orthogonal
    ip_answer_orthogonal: {
        defaultValue: '',
        type: 'text',
        label: 'Orthogonal Angle',
        description: 'Student answer for the angle where vectors become orthogonal',
        placeholder: '???',
        correctAnswer: '90',
        color: '#62D0AD',
    },

    // ========================================
    // ADD YOUR VARIABLES HERE
    // ========================================

    // Uncomment and modify these examples for your lesson:

    /*
    // ─────────────────────────────────────────
    // NUMBER - Use with sliders
    // ─────────────────────────────────────────
    myValue: {
        defaultValue: 5,
        type: 'number',
        label: 'My Value',
        description: 'A number that controls something',
        unit: 'm',           // optional unit display
        min: 0,
        max: 10,
        step: 0.5,
    },

    // ─────────────────────────────────────────
    // TEXT - Free text input
    // ─────────────────────────────────────────
    lessonTitle: {
        defaultValue: 'My Lesson',
        type: 'text',
        label: 'Lesson Title',
        description: 'The title of your lesson',
        placeholder: 'Enter a title...',
    },

    // ─────────────────────────────────────────
    // SELECT - Dropdown with options
    // ─────────────────────────────────────────
    difficulty: {
        defaultValue: 'medium',
        type: 'select',
        label: 'Difficulty',
        description: 'The difficulty level of the lesson',
        options: ['easy', 'medium', 'hard', 'expert'],
    },

    // ─────────────────────────────────────────
    // BOOLEAN - Toggle switch
    // ─────────────────────────────────────────
    showHints: {
        defaultValue: true,
        type: 'boolean',
        label: 'Show Hints',
        description: 'Toggle to show or hide hints',
    },

    // ─────────────────────────────────────────
    // ARRAY - List of numbers
    // ─────────────────────────────────────────
    dataPoints: {
        defaultValue: [1, 4, 9, 16, 25],
        type: 'array',
        label: 'Data Points',
        description: 'Y-values for plotting a graph',
    },

    // ─────────────────────────────────────────
    // OBJECT - Complex structured data
    // ─────────────────────────────────────────
    graphSettings: {
        defaultValue: { 
            xMin: -10, 
            xMax: 10, 
            showGrid: true 
        },
        type: 'object',
        label: 'Graph Settings',
        description: 'Configuration for the graph display',
        schema: '{ xMin: number, xMax: number, showGrid: boolean }',
    },
    */
};

/**
 * Get all variable names (for AI agents to discover)
 */
export const getVariableNames = (): string[] => {
    return Object.keys(variableDefinitions);
};

/**
 * Get a variable's default value
 */
export const getDefaultValue = (name: string): VarValue => {
    return variableDefinitions[name]?.defaultValue ?? 0;
};

/**
 * Get a variable's metadata
 */
export const getVariableInfo = (name: string): VariableDefinition | undefined => {
    return variableDefinitions[name];
};

/**
 * Get all default values as a record (for initialization)
 */
export const getDefaultValues = (): Record<string, VarValue> => {
    const defaults: Record<string, VarValue> = {};
    for (const [name, def] of Object.entries(variableDefinitions)) {
        defaults[name] = def.defaultValue;
    }
    return defaults;
};

/**
 * Get number props for InlineScrubbleNumber from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx, or getExampleVariableInfo(name) in exampleBlocks.tsx.
 */
export function numberPropsFromDefinition(def: VariableDefinition | undefined): {
    defaultValue?: number;
    min?: number;
    max?: number;
    step?: number;
    color?: string;
} {
    if (!def || def.type !== 'number') return {};
    return {
        defaultValue: def.defaultValue as number,
        min: def.min,
        max: def.max,
        step: def.step,
        ...(def.color ? { color: def.color } : {}),
    };
}

/**
 * Get cloze input props for InlineClozeInput from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx, or getExampleVariableInfo(name) in exampleBlocks.tsx.
 */
/**
 * Get cloze choice props for InlineClozeChoice from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx.
 */
export function choicePropsFromDefinition(def: VariableDefinition | undefined): {
    placeholder?: string;
    color?: string;
    bgColor?: string;
} {
    if (!def || def.type !== 'select') return {};
    return {
        ...(def.placeholder ? { placeholder: def.placeholder } : {}),
        ...(def.color ? { color: def.color } : {}),
        ...(def.bgColor ? { bgColor: def.bgColor } : {}),
    };
}

/**
 * Get toggle props for InlineToggle from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx.
 */
export function togglePropsFromDefinition(def: VariableDefinition | undefined): {
    color?: string;
    bgColor?: string;
} {
    if (!def || def.type !== 'select') return {};
    return {
        ...(def.color ? { color: def.color } : {}),
        ...(def.bgColor ? { bgColor: def.bgColor } : {}),
    };
}

export function clozePropsFromDefinition(def: VariableDefinition | undefined): {
    placeholder?: string;
    color?: string;
    bgColor?: string;
    caseSensitive?: boolean;
} {
    if (!def || def.type !== 'text') return {};
    return {
        ...(def.placeholder ? { placeholder: def.placeholder } : {}),
        ...(def.color ? { color: def.color } : {}),
        ...(def.bgColor ? { bgColor: def.bgColor } : {}),
        ...(def.caseSensitive !== undefined ? { caseSensitive: def.caseSensitive } : {}),
    };
}

/**
 * Get spot-color props for InlineSpotColor from a variable definition.
 * Extracts the `color` field.
 *
 * @example
 * <InlineSpotColor
 *     varName="radius"
 *     {...spotColorPropsFromDefinition(getVariableInfo('radius'))}
 * >
 *     radius
 * </InlineSpotColor>
 */
export function spotColorPropsFromDefinition(def: VariableDefinition | undefined): {
    color: string;
} {
    return {
        color: def?.color ?? '#8B5CF6',
    };
}

/**
 * Get linked-highlight props for InlineLinkedHighlight from a variable definition.
 * Extracts the `color` and `bgColor` fields.
 *
 * @example
 * <InlineLinkedHighlight
 *     varName="activeHighlight"
 *     highlightId="radius"
 *     {...linkedHighlightPropsFromDefinition(getVariableInfo('activeHighlight'))}
 * >
 *     radius
 * </InlineLinkedHighlight>
 */
export function linkedHighlightPropsFromDefinition(def: VariableDefinition | undefined): {
    color?: string;
    bgColor?: string;
} {
    return {
        ...(def?.color ? { color: def.color } : {}),
        ...(def?.bgColor ? { bgColor: def.bgColor } : {}),
    };
}

/**
 * Build the `variables` prop for FormulaBlock from variable definitions.
 *
 * Takes an array of variable names and returns the config map expected by
 * `<FormulaBlock variables={...} />`.
 *
 * @example
 * import { scrubVarsFromDefinitions } from './variables';
 *
 * <FormulaBlock
 *     latex="\scrub{mass} \times \scrub{accel}"
 *     variables={scrubVarsFromDefinitions(['mass', 'accel'])}
 * />
 */
export function scrubVarsFromDefinitions(
    varNames: string[],
): Record<string, { min?: number; max?: number; step?: number; color?: string }> {
    const result: Record<string, { min?: number; max?: number; step?: number; color?: string }> = {};
    for (const name of varNames) {
        const def = variableDefinitions[name];
        if (!def) continue;
        result[name] = {
            ...(def.min !== undefined ? { min: def.min } : {}),
            ...(def.max !== undefined ? { max: def.max } : {}),
            ...(def.step !== undefined ? { step: def.step } : {}),
            ...(def.color ? { color: def.color } : {}),
        };
    }
    return result;
}
