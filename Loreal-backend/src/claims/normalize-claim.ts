/** "Reduces  Wrinkles by 20%" and "reduces wrinkles by 20%" are the same claim. */
export const normalizeClaim = (text: string) => text.trim().replace(/\s+/g, ' ').toLowerCase();
