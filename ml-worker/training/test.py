import argparse
import csv
from pathlib import Path
import time

import torch
from torch import nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
from torchvision.models import EfficientNet_V2_S_Weights, efficientnet_v2_s

# Para medida de tempo
def evaluate_checkpoint(model, loader, device, class_count):
    matrix = [[0] * class_count for _ in range(class_count)]
    correct = 0
    total = 0
    start = time.perf_counter()
    model.eval()
    with torch.inference_mode():
        for images, labels in loader:
            images = images.to(device)
            predictions = model(images).argmax(dim=1).cpu().tolist()
            labels = labels.tolist()
            for true_label, predicted_label in zip(labels, predictions):
                matrix[true_label][predicted_label] += 1
                correct += true_label == predicted_label
            total += len(labels)
    elapsed = time.perf_counter() - start
    return correct / total if total else 0.0, matrix, total, elapsed


# Escrever no arquivo .csv a matriz de confusão para visualização
def write_confusion_matrix(matrix, class_names, output):
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open("w", newline="", encoding="utf-8") as csv_file:
        writer = csv.writer(csv_file)
        writer.writerow(["true_predicted", *class_names])
        for class_name, row in zip(class_names, matrix):
            writer.writerow([class_name, *row])


def main():
    # python training/test.py --test-data ../dataset/Test_base --checkpoint models/waste_efficientnet_v2_s.pt
    parser = argparse.ArgumentParser()
    parser.add_argument("--test-data", required=True)
    parser.add_argument("--checkpoint", default="models/waste_efficientnet_v2_s.pt")
    parser.add_argument("--checkpoint-results", default="checkpoint_results.csv")
    parser.add_argument("--batch-size", type=int, default=4)
    parser.add_argument("--no-pretrained", action="store_true")
    args = parser.parse_args()

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    checkpoint = torch.load(
        args.checkpoint,
        map_location=device,
        weights_only=False,
    )
    checkpoint_classes = checkpoint["class_names"]
    weights = None if args.no_pretrained else EfficientNet_V2_S_Weights.DEFAULT
    model = efficientnet_v2_s(weights=weights)
    model.classifier[1] = nn.Linear(
        model.classifier[1].in_features,
        len(checkpoint_classes),
    )
    model.load_state_dict(checkpoint["state_dict"])
    model.to(device)

    # Teste do checkpoint
    test_transform = transforms.Compose([
        transforms.Resize((384, 384)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ])
    external_test = datasets.ImageFolder(args.test_data, transform=test_transform)
    external_classes = set(external_test.classes)
    expected_classes = set(checkpoint_classes)
    if external_classes != expected_classes:
        missing = sorted(expected_classes - external_classes)
        unexpected = sorted(external_classes - expected_classes)
        raise ValueError(
            "Mismatch de nome de classes. "
            f"Faltando: {missing}; Não previsto: {unexpected}."
        )

    checkpoint_index = {
        class_name: index for index, class_name in enumerate(checkpoint_classes)
    }
    remapped_labels = [
        checkpoint_index[external_test.classes[label]]
        for _, label in external_test.samples
    ]
    external_test.targets = remapped_labels
    external_test.class_to_idx = checkpoint_index
    external_loader = DataLoader(
        external_test,
        batch_size=args.batch_size,
        shuffle=False,
        num_workers=2,
    )
    (external_accuracy, matrix, image_count,
     elapsed_seconds) = evaluate_checkpoint( model, external_loader, device, len(checkpoint_classes))
    results_path = Path(args.checkpoint_results)
    write_confusion_matrix(matrix, checkpoint_classes, results_path)
    print(f"test_accuracy={external_accuracy:.4f}")
    print(f"test_images={image_count}")
    print(f"test_time_seconds={elapsed_seconds:.4f}")
    seconds_per_image = elapsed_seconds / image_count
    print(f"test_seconds_per_image={seconds_per_image:.6f}")
    print(f"confusion_matrix={results_path}")


if __name__ == "__main__":
    main()
