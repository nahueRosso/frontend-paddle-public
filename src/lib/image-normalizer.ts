"use client";

type NormalizeImageOptions = {
  width: number;
  height: number;
  fileName?: string;
  mimeType?: string;
  quality?: number;
};

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("No se pudo procesar la imagen seleccionada."));
    };

    image.src = objectUrl;
  });
}

export async function normalizeImageFile(
  file: File,
  options: NormalizeImageOptions,
): Promise<File> {
  const {
    width,
    height,
    fileName = file.name.replace(/\.[^/.]+$/, "") || "image",
    mimeType = "image/png",
    quality = 0.92,
  } = options;

  const image = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("No se pudo preparar la imagen.");
  }

  const targetRatio = width / height;
  const sourceRatio = image.width / image.height;

  let sourceWidth = image.width;
  let sourceHeight = image.height;
  let sourceX = 0;
  let sourceY = 0;

  if (sourceRatio > targetRatio) {
    sourceWidth = image.height * targetRatio;
    sourceX = (image.width - sourceWidth) / 2;
  } else if (sourceRatio < targetRatio) {
    sourceHeight = image.width / targetRatio;
    sourceY = (image.height - sourceHeight) / 2;
  }

  context.clearRect(0, 0, width, height);
  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    width,
    height,
  );

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, mimeType, quality);
  });

  if (!blob) {
    throw new Error("No se pudo exportar la imagen.");
  }

  const extension = mimeType === "image/jpeg" ? "jpg" : "png";

  return new File([blob], `${fileName}.${extension}`, {
    type: mimeType,
    lastModified: Date.now(),
  });
}
