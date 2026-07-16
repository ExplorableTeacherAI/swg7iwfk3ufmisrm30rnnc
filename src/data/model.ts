/**
 * Hilbert Space Lesson - Domain Model
 * ====================================
 *
 * Single source of mathematical truth for the entire lesson.
 * All section visualizations compute from these functions.
 *
 * The lesson builds progressively:
 * 1. Vectors as Arrows - 2D/3D geometric vectors
 * 2. Vector Spaces - Abstract axioms
 * 3. Inner Products - Measuring angles and lengths
 * 4. Finite to Infinite - Dimension transition
 * 5. Completeness - Cauchy sequences
 * 6. Hilbert Space - Complete inner product space
 */

// ============================================
// SECTION 1: VECTORS AS ARROWS
// ============================================

/** 2D vector type */
export type Vec2 = [number, number];

/** 3D vector type */
export type Vec3 = [number, number, number];

/** Add two 2D vectors */
export const addVec2 = (a: Vec2, b: Vec2): Vec2 => [a[0] + b[0], a[1] + b[1]];

/** Subtract two 2D vectors */
export const subVec2 = (a: Vec2, b: Vec2): Vec2 => [a[0] - b[0], a[1] - b[1]];

/** Scale a 2D vector */
export const scaleVec2 = (v: Vec2, s: number): Vec2 => [v[0] * s, v[1] * s];

/** Magnitude of a 2D vector */
export const magnitudeVec2 = (v: Vec2): number => Math.sqrt(v[0] * v[0] + v[1] * v[1]);

/** Unit vector in a given direction (radians) */
export const unitVec2 = (angle: number): Vec2 => [Math.cos(angle), Math.sin(angle)];

/** Angle of a 2D vector (radians) */
export const angleVec2 = (v: Vec2): number => Math.atan2(v[1], v[0]);

/** Create a vector from magnitude and angle */
export const fromPolar = (magnitude: number, angle: number): Vec2 => [
    magnitude * Math.cos(angle),
    magnitude * Math.sin(angle)
];

/** Normalize a 2D vector to unit length */
export const normalizeVec2 = (v: Vec2): Vec2 => {
    const mag = magnitudeVec2(v);
    return mag === 0 ? [0, 0] : [v[0] / mag, v[1] / mag];
};

// ============================================
// SECTION 2: VECTOR SPACES
// ============================================

/** Check if vector addition is commutative: a + b = b + a */
export const isCommutative = (a: Vec2, b: Vec2): boolean => {
    const ab = addVec2(a, b);
    const ba = addVec2(b, a);
    return Math.abs(ab[0] - ba[0]) < 1e-10 && Math.abs(ab[1] - ba[1]) < 1e-10;
};

/** Check if scalar multiplication distributes: c(a + b) = ca + cb */
export const isDistributive = (a: Vec2, b: Vec2, c: number): boolean => {
    const left = scaleVec2(addVec2(a, b), c);
    const right = addVec2(scaleVec2(a, c), scaleVec2(b, c));
    return Math.abs(left[0] - right[0]) < 1e-10 && Math.abs(left[1] - right[1]) < 1e-10;
};

/** Zero vector - identity for addition */
export const zeroVec2: Vec2 = [0, 0];

/** Check if v + 0 = v */
export const hasAdditiveIdentity = (v: Vec2): boolean => {
    const result = addVec2(v, zeroVec2);
    return Math.abs(result[0] - v[0]) < 1e-10 && Math.abs(result[1] - v[1]) < 1e-10;
};

/** Additive inverse: -v such that v + (-v) = 0 */
export const negateVec2 = (v: Vec2): Vec2 => [-v[0], -v[1]];

// ============================================
// SECTION 2 EXTENDED: Broken Space Operations
// ============================================
// These simulate a "broken" vector space where distributivity fails.
// In the broken space, scalar multiplication has a hidden quadratic term
// that causes c(v1 + v2) ≠ cv1 + cv2 for most vectors.

/**
 * Broken scalar multiplication: adds a hidden perturbation proportional to
 * the square of the scalar, creating inconsistency with distributivity.
 * brokenScale(v, c) = c*v + 0.15*c²*(|v|, 0)
 */
export const brokenScaleVec2 = (v: Vec2, c: number): Vec2 => {
    const mag = magnitudeVec2(v);
    // Add a perturbation that depends on c² - this breaks distributivity
    const perturbation = 0.15 * c * c * mag;
    return [v[0] * c + perturbation, v[1] * c];
};

/**
 * Test distributive axiom in healed (normal) space: c(v1 + v2) vs cv1 + cv2
 * Returns both results - they should be equal in a proper vector space
 */
export const testDistributiveHealed = (
    v1: Vec2,
    v2: Vec2,
    c: number
): { pathA: Vec2; pathB: Vec2; areEqual: boolean } => {
    // Path A: c(v1 + v2) - scale the sum
    const sum = addVec2(v1, v2);
    const pathA = scaleVec2(sum, c);

    // Path B: cv1 + cv2 - sum the scaled vectors
    const cv1 = scaleVec2(v1, c);
    const cv2 = scaleVec2(v2, c);
    const pathB = addVec2(cv1, cv2);

    const areEqual =
        Math.abs(pathA[0] - pathB[0]) < 1e-10 &&
        Math.abs(pathA[1] - pathB[1]) < 1e-10;

    return { pathA, pathB, areEqual };
};

/**
 * Test distributive axiom in BROKEN space: c(v1 + v2) vs cv1 + cv2
 * Uses broken scalar multiplication - results will differ!
 */
export const testDistributiveBroken = (
    v1: Vec2,
    v2: Vec2,
    c: number
): { pathA: Vec2; pathB: Vec2; areEqual: boolean } => {
    // Path A: c(v1 + v2) - scale the sum with broken multiplication
    const sum = addVec2(v1, v2);
    const pathA = brokenScaleVec2(sum, c);

    // Path B: cv1 + cv2 - sum the scaled vectors (each scaled with broken mult)
    const cv1 = brokenScaleVec2(v1, c);
    const cv2 = brokenScaleVec2(v2, c);
    const pathB = addVec2(cv1, cv2);

    // These will NOT be equal due to the quadratic perturbation!
    const areEqual =
        Math.abs(pathA[0] - pathB[0]) < 0.01 &&
        Math.abs(pathA[1] - pathB[1]) < 0.01;

    return { pathA, pathB, areEqual };
};

/**
 * Compare healed vs broken space for the same inputs
 */
export const compareSpaces = (
    v1: Vec2,
    v2: Vec2,
    c: number
): {
    healed: { pathA: Vec2; pathB: Vec2; areEqual: boolean };
    broken: { pathA: Vec2; pathB: Vec2; areEqual: boolean };
} => {
    return {
        healed: testDistributiveHealed(v1, v2, c),
        broken: testDistributiveBroken(v1, v2, c),
    };
};

// ============================================
// SECTION 3: INNER PRODUCTS
// ============================================

/** Dot product (inner product) of two 2D vectors */
export const dotProduct = (a: Vec2, b: Vec2): number => a[0] * b[0] + a[1] * b[1];

/** Angle between two vectors (radians) */
export const angleBetween = (a: Vec2, b: Vec2): number => {
    const magA = magnitudeVec2(a);
    const magB = magnitudeVec2(b);
    if (magA === 0 || magB === 0) return 0;
    const cosTheta = Math.max(-1, Math.min(1, dotProduct(a, b) / (magA * magB)));
    return Math.acos(cosTheta);
};

/** Check orthogonality (perpendicular) */
export const areOrthogonal = (a: Vec2, b: Vec2): boolean => Math.abs(dotProduct(a, b)) < 1e-10;

/** Projection of a onto b */
export const projectOnto = (a: Vec2, b: Vec2): Vec2 => {
    const bMagSq = dotProduct(b, b);
    if (bMagSq === 0) return [0, 0];
    const scalar = dotProduct(a, b) / bMagSq;
    return scaleVec2(b, scalar);
};

/** Norm induced by the inner product */
export const norm = (v: Vec2): number => Math.sqrt(dotProduct(v, v));

/** Distance between two vectors */
export const distance = (a: Vec2, b: Vec2): number => norm(subVec2(a, b));

// ============================================
// SECTION 4: FINITE TO INFINITE DIMENSIONS
// ============================================

/** Sum of first n terms of sequence 1/2^n */
export const partialSum = (n: number): number => {
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += 1 / Math.pow(2, i);
    }
    return sum;
};

/** nth term of a sequence approaching but never reaching 1 */
export const convergentSequence = (n: number): number => 1 - 1 / Math.pow(2, n);

/** Fourier series approximation - shows how infinite sums work */
export const fourierSquareWave = (x: number, terms: number): number => {
    let sum = 0;
    for (let n = 1; n <= terms; n++) {
        const k = 2 * n - 1; // Odd harmonics only
        sum += Math.sin(k * x) / k;
    }
    return (4 / Math.PI) * sum;
};

// ============================================
// SECTION 5: COMPLETENESS
// ============================================

/** Generate a Cauchy sequence converging to sqrt(2) */
export const cauchySequenceSqrt2 = (n: number): number => {
    // Newton's method sequence for sqrt(2)
    let x = 1;
    for (let i = 0; i < n; i++) {
        x = (x + 2 / x) / 2;
    }
    return x;
};

/** Check if sequence terms are getting closer (Cauchy criterion) */
export const isCauchyPair = (a: number, b: number, epsilon: number): boolean => {
    return Math.abs(a - b) < epsilon;
};

/** Rational approximations to sqrt(2) - shows rationals are incomplete */
export const rationalApproxSqrt2 = (n: number): [number, number] => {
    // Continued fraction convergents for sqrt(2)
    const convergents: [number, number][] = [
        [1, 1], [3, 2], [7, 5], [17, 12], [41, 29], [99, 70], [239, 169], [577, 408]
    ];
    const index = Math.min(n, convergents.length - 1);
    return convergents[index];
};

/** Value of a rational approximation */
export const rationalValue = (frac: [number, number]): number => frac[0] / frac[1];

// ============================================
// SECTION 6: HILBERT SPACE
// ============================================

/** Check Cauchy-Schwarz inequality: |<a,b>| <= ||a|| ||b|| */
export const cauchySchwarzHolds = (a: Vec2, b: Vec2): boolean => {
    const inner = Math.abs(dotProduct(a, b));
    const product = norm(a) * norm(b);
    return inner <= product + 1e-10;
};

/** Check triangle inequality: ||a + b|| <= ||a|| + ||b|| */
export const triangleInequalityHolds = (a: Vec2, b: Vec2): boolean => {
    const sumNorm = norm(addVec2(a, b));
    const normSum = norm(a) + norm(b);
    return sumNorm <= normSum + 1e-10;
};

/** Parallelogram law: ||a + b||² + ||a - b||² = 2(||a||² + ||b||²) */
export const parallelogramLaw = (a: Vec2, b: Vec2): { left: number; right: number } => {
    const sumNormSq = norm(addVec2(a, b)) ** 2;
    const diffNormSq = norm(subVec2(a, b)) ** 2;
    const left = sumNormSq + diffNormSq;
    const right = 2 * (norm(a) ** 2 + norm(b) ** 2);
    return { left, right };
};

// ============================================
// UTILITY: Degree/Radian conversion
// ============================================

export const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;
export const toDegrees = (radians: number): number => (radians * 180) / Math.PI;

// ============================================
// UTILITY: Clamping
// ============================================

export const clamp = (value: number, min: number, max: number): number =>
    Math.max(min, Math.min(max, value));

// ============================================
// SECTION 1 EXTENDED: Sailboat vector model
// ============================================

/**
 * Compute propulsion vector from sail angle (degrees) and power
 * Returns [x, y] components
 */
export const sailPropulsion = (angleDeg: number, power: number): Vec2 => {
    const rad = toRadians(angleDeg);
    return [power * Math.cos(rad), power * Math.sin(rad)];
};

/**
 * Compute resultant velocity vector (wind + propulsion)
 */
export const sailResultant = (wind: Vec2, propulsion: Vec2): Vec2 =>
    addVec2(wind, propulsion);

/**
 * Check if boat position is within range of target
 */
export const isWithinTarget = (
    boatX: number,
    boatY: number,
    targetX: number,
    targetY: number,
    threshold: number
): boolean => {
    const dx = boatX - targetX;
    const dy = boatY - targetY;
    return Math.sqrt(dx * dx + dy * dy) <= threshold;
};

// ============================================
// SECTION 3b: WEIGHTED INNER PRODUCTS
// ============================================

/**
 * Weighted inner product: ⟨u,v⟩_M = u^T M v where M = [[a,0],[0,b]]
 * This generalizes the dot product by weighting x and y components differently
 */
export const weightedInnerProduct = (
    u: Vec2,
    v: Vec2,
    weightA: number,
    weightB: number
): number => weightA * u[0] * v[0] + weightB * u[1] * v[1];

/**
 * Norm under weighted inner product: ||u||_M = sqrt(⟨u,u⟩_M)
 */
export const weightedNorm = (v: Vec2, weightA: number, weightB: number): number =>
    Math.sqrt(weightedInnerProduct(v, v, weightA, weightB));

/**
 * Angle between vectors under weighted inner product (radians)
 * cos(θ) = ⟨u,v⟩_M / (||u||_M ||v||_M)
 */
export const weightedAngleBetween = (
    u: Vec2,
    v: Vec2,
    weightA: number,
    weightB: number
): number => {
    const ip = weightedInnerProduct(u, v, weightA, weightB);
    const normU = weightedNorm(u, weightA, weightB);
    const normV = weightedNorm(v, weightA, weightB);
    if (normU === 0 || normV === 0) return 0;
    const cosTheta = Math.max(-1, Math.min(1, ip / (normU * normV)));
    return Math.acos(cosTheta);
};

/**
 * Given two fixed vectors and a target angle, find the weight ratio b/a
 * that produces that angle under the weighted inner product.
 *
 * For vectors u=(u1,u2) and v=(v1,v2) with inner product ⟨u,v⟩ = a*u1*v1 + b*u2*v2
 * and target cos(θ), we solve for the ratio r = b/a:
 *
 * cos(θ) = (u1*v1 + r*u2*v2) / sqrt((u1² + r*u2²)(v1² + r*v2²))
 *
 * This is solved numerically via bisection.
 */
export const findWeightRatioForAngle = (
    u: Vec2,
    v: Vec2,
    targetAngleRad: number
): number => {
    const targetCos = Math.cos(targetAngleRad);

    // For a diagonal matrix M = [[1, 0], [0, r]], find r that gives target angle
    const computeCos = (r: number): number => {
        const ip = u[0] * v[0] + r * u[1] * v[1];
        const normUSq = u[0] * u[0] + r * u[1] * u[1];
        const normVSq = v[0] * v[0] + r * v[1] * v[1];
        if (normUSq <= 0 || normVSq <= 0) return 0;
        return ip / Math.sqrt(normUSq * normVSq);
    };

    // Binary search for the ratio
    // The ratio can range from very small (compressing y) to very large (stretching y)
    let lo = 0.01;
    let hi = 100;

    // Check if target is achievable
    const cosLo = computeCos(lo);
    const cosHi = computeCos(hi);

    // Determine search direction based on monotonicity
    const increasing = cosHi > cosLo;

    for (let i = 0; i < 50; i++) {
        const mid = Math.sqrt(lo * hi); // geometric mean for better numerical behavior
        const cosMid = computeCos(mid);

        if (Math.abs(cosMid - targetCos) < 0.0001) {
            return mid;
        }

        if ((cosMid < targetCos) === increasing) {
            lo = mid;
        } else {
            hi = mid;
        }
    }

    return Math.sqrt(lo * hi);
};

/**
 * Compute the full inner product weights (a, b) given a target angle.
 * We normalize so that a = 1 and return (1, r) where r is the ratio.
 */
export const computeInnerProductWeights = (
    u: Vec2,
    v: Vec2,
    targetAngleDeg: number
): { a: number; b: number } => {
    const targetAngleRad = toRadians(targetAngleDeg);
    const ratio = findWeightRatioForAngle(u, v, targetAngleRad);
    return { a: 1, b: ratio };
};
