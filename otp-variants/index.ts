import type { OtpVariant } from "../lib/types.ts";
import { basicVariants } from "./basic.ts";
import { scrollVariants } from "./scroll.ts";
import { generateMatrixVariants } from "./matrix.ts";
import { delayedVariants } from "./delayed.ts";
import { imgSourceVariants } from "./img-source.ts";
import { mxDebugVariants } from "./mx-debug.ts";
import { altBoundaryVariants } from "./alt-boundary.ts";
import { visibilityChangeVariants } from "./visibility-change.ts";

export const otpVariants: OtpVariant[] = [
  ...basicVariants,        // A-P
  ...scrollVariants,       // Q-U
  ...generateMatrixVariants(), // MX1-MX25 (matrix)
  ...delayedVariants,      // T2-T5
  ...imgSourceVariants,    // V-Z
  ...mxDebugVariants,      // MXD1-MXD10 (MX debug)
  ...altBoundaryVariants,  // ALT-1 ~ ALT-17 (alt boundary)
  ...visibilityChangeVariants, // VIS-1 ~ VIS-10 (visibility change)
];
