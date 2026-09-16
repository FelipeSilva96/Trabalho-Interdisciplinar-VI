package br.pucminas.ti6.waste.service;

import br.pucminas.ti6.waste.client.WorkerClient;
import br.pucminas.ti6.waste.config.WorkerProperties;
import br.pucminas.ti6.waste.dto.ClassificationResponse;
import br.pucminas.ti6.waste.dto.ExperimentResponse;
import br.pucminas.ti6.waste.dto.WorkerBatchResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
public class ClassificationService {
    private final WorkerClient workerClient;
    private final WorkerProperties workerProperties;

    public ClassificationService(WorkerClient workerClient, WorkerProperties workerProperties) {
        this.workerClient = workerClient;
        this.workerProperties = workerProperties;
    }

    public ClassificationResponse singleWorker(List<MultipartFile> files) {
        if (workerProperties.urls().isEmpty()) {
            throw new IllegalStateException("Nenhum worker configurado");
        }
        long start = System.nanoTime();
        WorkerBatchResponse result = workerClient.classify(workerProperties.urls().get(0), files);
        return buildResponse("single-worker", files.size(), List.of(result), start);
    }

    public ClassificationResponse distributed(List<MultipartFile> files) {
        if (workerProperties.urls().isEmpty()) {
            throw new IllegalStateException("Nenhum worker configurado");
        }
        long start = System.nanoTime();
        List<List<MultipartFile>> partitions = partition(files, workerProperties.urls().size());
        List<CompletableFuture<WorkerBatchResponse>> futures = new ArrayList<>();

        for (int i = 0; i < partitions.size(); i++) {
            if (partitions.get(i).isEmpty()) {
                continue;
            }
            String workerUrl = workerProperties.urls().get(i);
            List<MultipartFile> batch = partitions.get(i);
            futures.add(CompletableFuture.supplyAsync(() -> workerClient.classify(workerUrl, batch)));
        }

        List<WorkerBatchResponse> results = futures.stream().map(CompletableFuture::join).toList();
        return buildResponse("distributed", files.size(), results, start);
    }

    public ExperimentResponse compare(List<MultipartFile> files) {
        ClassificationResponse baseline = singleWorker(files);
        ClassificationResponse distributed = distributed(files);
        double speedup = distributed.elapsedMs() == 0 ? 0 : baseline.elapsedMs() / distributed.elapsedMs();
        return new ExperimentResponse(baseline, distributed, speedup);
    }

    private ClassificationResponse buildResponse(
            String strategy,
            int imageCount,
            List<WorkerBatchResponse> results,
            long start
    ) {
        double elapsedMs = (System.nanoTime() - start) / 1_000_000.0;
        double throughput = elapsedMs == 0 ? 0 : imageCount / (elapsedMs / 1000.0);
        return new ClassificationResponse(strategy, imageCount, results.size(), elapsedMs, throughput, results);
    }

    private List<List<MultipartFile>> partition(List<MultipartFile> files, int workers) {
        List<List<MultipartFile>> partitions = new ArrayList<>();
        for (int i = 0; i < workers; i++) {
            partitions.add(new ArrayList<>());
        }
        for (int i = 0; i < files.size(); i++) {
            partitions.get(i % workers).add(files.get(i));
        }
        return partitions;
    }
}
