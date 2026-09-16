package br.pucminas.ti6.waste.dto;

public record Prediction(
        String filename,
        String status,
        String label,
        Double confidence
) {}
