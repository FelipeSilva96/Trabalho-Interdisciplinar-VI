package br.pucminas.ti6.waste.dto;

public record ExperimentResponse(
        ClassificationResponse baseline,
        ClassificationResponse distributed,
        double speedup
) {}
