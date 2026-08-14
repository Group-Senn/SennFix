/**
 * Compresses an image file using HTML5 Canvas.
 * Returns the original file if it is not an image (e.g., PDF) or if compression fails.
 * 
 * @param {File} file The original file object.
 * @param {Object} options Config options (maxWidth, maxHeight, quality).
 * @returns {Promise<File>} A promise resolving to the compressed File object.
 */
export function compressImage(file, { maxWidth = 1200, maxHeight = 1200, quality = 0.7 } = {}) {
  return new Promise((resolve) => {
    // If the file is not an image, return it immediately (useful for PDF certificates)
    if (!file || !file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions preserving aspect ratio
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file); // Fallback to original file on failure
              return;
            }

            // Create a new File object from the compressed blob
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });

            console.log(`[ImageCompressor] Compressed "${file.name}" from ${(file.size / 1024).toFixed(1)}KB to ${(compressedFile.size / 1024).toFixed(1)}KB`);
            resolve(compressedFile);
          },
          file.type,
          quality
        );
      };
      img.onerror = () => {
        resolve(file); // Fallback on image load error
      };
      img.src = event.target.result;
    };
    reader.onerror = () => {
      resolve(file); // Fallback on file read error
    };
    reader.readAsDataURL(file);
  });
}
