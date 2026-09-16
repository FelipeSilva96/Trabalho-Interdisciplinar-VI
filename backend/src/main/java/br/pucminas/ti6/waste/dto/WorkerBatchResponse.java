package br.pucminas.ti6.waste.dto;

import java.util.List;

public record WorkerBatchResponse(
        String workerId,
        boolean modelLoaded,
        double elapsedMs,
        List<Prediction> predictions
) {}
