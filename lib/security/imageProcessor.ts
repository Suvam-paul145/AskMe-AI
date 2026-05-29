/**
 * Processes and compresses uploaded images on the client side before backend upload.
 * Reduces raw file sizes to prevent serverless payload timeout or size limit errors.
 * If the file is not an image, it returns the original file.
 */
export async function optimizeUploadImage(
  file: File,
  maxDimension = 1200,
  compressionQuality = 0.8
): Promise<Blob | File> {
  // If not an image, return the original file immediately
  if (!file.type.startsWith("image/")) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let currentWidth = img.width;
        let currentHeight = img.height;

        // Calculate new dimensions while preserving aspect ratios
        if (currentWidth > currentHeight) {
          if (currentWidth > maxDimension) {
            currentHeight = Math.round((currentHeight * maxDimension) / currentWidth);
            currentWidth = maxDimension;
          }
        } else {
          if (currentHeight > maxDimension) {
            currentWidth = Math.round((currentWidth * maxDimension) / currentHeight);
            currentHeight = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = currentWidth;
        canvas.height = currentHeight;

        const context2D = canvas.getContext("2d");
        if (!context2D) {
          // Fallback if canvas context is not supported
          resolve(file);
          return;
        }

        // Draw image onto canvas utilizing linear resampling techniques
        context2D.drawImage(img, 0, 0, currentWidth, currentHeight);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Convert blob to File to preserve name and metadata
              const compressedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          "image/jpeg",
          compressionQuality
        );
      };

      img.onerror = () => resolve(file);
    };

    reader.onerror = () => resolve(file);
  });
}
