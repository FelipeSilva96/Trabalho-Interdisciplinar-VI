from pathlib import Path
import os

import torch
from PIL import Image
from torchvision import transforms
from torchvision.models import efficientnet_v2_s


EXPECTED_CLASSES = {"battery", "glass", "metal", "organic", "paper", "plastic"}


class WasteModel:
    def __init__(self):
        self.path = Path(os.getenv("MODEL_PATH", "/app/models/waste_efficientnet_v2_s.pt"))
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = None
        self.class_names = []
        self.transform = transforms.Compose([
            transforms.Resize((384, 384)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
        ])
        self._load()

    @property
    def loaded(self):
        return self.model is not None

    def _load(self):
        if not self.path.exists():
            return

        checkpoint = torch.load(self.path, map_location="cpu", weights_only=True)
        if checkpoint.get("architecture") != "efficientnet_v2_s":
            raise ValueError("Checkpoint incompatível: esperado EfficientNetV2-S")

        self.class_names = checkpoint["class_names"]
        if set(self.class_names) != EXPECTED_CLASSES or len(self.class_names) != 6:
            raise ValueError("O checkpoint deve conter exatamente as seis classes do projeto")

        model = efficientnet_v2_s(weights=None)
        model.classifier[1] = torch.nn.Linear(
            model.classifier[1].in_features,
            len(self.class_names),
        )
        model.load_state_dict(checkpoint["state_dict"])
        model.to(self.device)
        model.eval()
        self.model = model

    @torch.inference_mode()
    def predict(self, image: Image.Image):
        if not self.loaded:
            return None

        tensor = self.transform(image.convert("RGB")).unsqueeze(0).to(self.device)
        logits = self.model(tensor)
        probabilities = torch.softmax(logits, dim=1)[0]
        confidence, index = torch.max(probabilities, dim=0)
        return self.class_names[index.item()], float(confidence.item())
