type SelectedImage = {
  base64: string;
  mimeType: string;
};

let selectedImage: SelectedImage | null = null;

export function setSelectedImage(image: SelectedImage) {
  selectedImage = image;
}

export function getSelectedImage() {
  return selectedImage;
}

export function clearSelectedImage() {
  selectedImage = null;
}
