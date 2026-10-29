export function imageFileError(file: { size: number; type: string }): string | undefined {
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type))
    return 'Choose a PNG, JPEG, or WebP image.'
  if (file.size === 0 || file.size > 5 * 1024 * 1024)
    return 'Choose a non-empty image no larger than 5 MB.'
}
