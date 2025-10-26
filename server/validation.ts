export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

const MAX_MESSAGE_LENGTH = 2000;
const MAX_THREAD_TITLE_LENGTH = 200;
const MAX_THREAD_CONTENT_LENGTH = 10000;
const MAX_COMMENT_LENGTH = 2000;
const MAX_BIO_LENGTH = 500;

export function validateMessage(content: string): { valid: boolean; error?: string } {
  if (!content || typeof content !== 'string') {
    return { valid: false, error: "Message content is required" };
  }

  const trimmed = content.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: "Message cannot be empty" };
  }

  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return { valid: false, error: `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters` };
  }

  return { valid: true };
}

export function validateThreadTitle(title: string): { valid: boolean; error?: string } {
  if (!title || typeof title !== 'string') {
    return { valid: false, error: "Thread title is required" };
  }

  const trimmed = title.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: "Thread title cannot be empty" };
  }

  if (trimmed.length < 3) {
    return { valid: false, error: "Thread title must be at least 3 characters" };
  }

  if (trimmed.length > MAX_THREAD_TITLE_LENGTH) {
    return { valid: false, error: `Thread title cannot exceed ${MAX_THREAD_TITLE_LENGTH} characters` };
  }

  return { valid: true };
}

export function validateThreadContent(content: string): { valid: boolean; error?: string } {
  if (!content || typeof content !== 'string') {
    return { valid: false, error: "Thread content is required" };
  }

  const trimmed = content.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: "Thread content cannot be empty" };
  }

  if (trimmed.length > MAX_THREAD_CONTENT_LENGTH) {
    return { valid: false, error: `Thread content cannot exceed ${MAX_THREAD_CONTENT_LENGTH} characters` };
  }

  return { valid: true };
}

export function validateComment(content: string): { valid: boolean; error?: string } {
  if (!content || typeof content !== 'string') {
    return { valid: false, error: "Comment content is required" };
  }

  const trimmed = content.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: "Comment cannot be empty" };
  }

  if (trimmed.length > MAX_COMMENT_LENGTH) {
    return { valid: false, error: `Comment cannot exceed ${MAX_COMMENT_LENGTH} characters` };
  }

  return { valid: true };
}

export function validateBio(bio: string): { valid: boolean; error?: string } {
  if (!bio || typeof bio !== 'string') {
    return { valid: true }; // Bio is optional
  }

  const trimmed = bio.trim();
  
  if (trimmed.length > MAX_BIO_LENGTH) {
    return { valid: false, error: `Bio cannot exceed ${MAX_BIO_LENGTH} characters` };
  }

  return { valid: true };
}

export function validateCategory(category: string, allowedCategories: string[]): { valid: boolean; error?: string } {
  if (!category || typeof category !== 'string') {
    return { valid: false, error: "Category is required" };
  }

  if (!allowedCategories.includes(category)) {
    return { valid: false, error: `Category must be one of: ${allowedCategories.join(', ')}` };
  }

  return { valid: true };
}

export function validateVote(vote: string): { valid: boolean; error?: string } {
  if (!vote || typeof vote !== 'string') {
    return { valid: false, error: "Vote is required" };
  }

  if (vote !== 'up' && vote !== 'down') {
    return { valid: false, error: "Vote must be 'up' or 'down'" };
  }

  return { valid: true };
}

export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ''); // Remove control characters
}

export const FORUM_CATEGORIES = ['general', 'strategies', 'kols', 'markets'] as const;
export type ForumCategory = typeof FORUM_CATEGORIES[number];
