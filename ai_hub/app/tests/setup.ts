import '@testing-library/jest-dom';

// Tests exercise the Google provider even though it's hidden on the public
// demo deployment (see NEXT_PUBLIC_ENABLE_GOOGLE_PROVIDER in constants.ts).
process.env.NEXT_PUBLIC_ENABLE_GOOGLE_PROVIDER = 'true';
