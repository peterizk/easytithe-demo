import { expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';

// add jest‑dom's custom matchers to Vitest's global expect
expect.extend(matchers);
