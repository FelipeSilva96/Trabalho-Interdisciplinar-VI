package br.pucminas.ti6.waste.dto;

import java.util.List;

public record ClassificationResponse(
        String strategy,
        int imageCount,
        int workersUsed,
        double elapsedMs,
        double throughputImagesPerSecond,
        List<WorkerBatchResponse> workerResults
) {}
