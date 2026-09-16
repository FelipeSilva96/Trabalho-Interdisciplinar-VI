package br.pucminas.ti6.waste.controller;

import br.pucminas.ti6.waste.client.WorkerClient;
import br.pucminas.ti6.waste.config.WorkerProperties;
import br.pucminas.ti6.waste.dto.ClassificationResponse;
import br.pucminas.ti6.waste.dto.ExperimentResponse;
import br.pucminas.ti6.waste.service.ClassificationService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class ApiController {
    private static final List<String> CATEGORIES = List.of(
            "battery", "glass", "metal", "organic", "paper", "plastic"
    );

    private final ClassificationService classificationService;
    private final WorkerClient workerClient;
    private final WorkerProperties workerProperties;

    public ApiController(
            ClassificationService classificationService,
            WorkerClient workerClient,
            WorkerProperties workerProperties
    ) {
        this.classificationService = classificationService;
        this.workerClient = workerClient;
        this.workerProperties = workerProperties;
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of("status", "UP", "service", "waste-coordinator", "workers", workerProperties.urls().size());
    }

    @GetMapping("/categories")
    public List<String> categories() {
        return CATEGORIES;
    }

    @GetMapping("/workers/health")
    public Map<String, String> workersHealth() {
        return workerProperties.urls().stream().collect(java.util.stream.Collectors.toMap(
                url -> url,
                url -> {
                    try {
                        return workerClient.health(url);
                    } catch (Exception e) {
                        return "UNAVAILABLE";
                    }
                }
        ));
    }

    @PostMapping(value = "/classifications", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ClassificationResponse classify(
            @RequestPart("files") List<MultipartFile> files,
            @RequestParam(defaultValue = "distributed") String strategy
    ) {
        if (files.isEmpty()) {
            throw new IllegalArgumentException("Envie pelo menos uma imagem");
        }
        return switch (strategy) {
            case "single-worker" -> classificationService.singleWorker(files);
            case "distributed" -> classificationService.distributed(files);
            default -> throw new IllegalArgumentException("Estratégia inválida: " + strategy);
        };
    }

    @PostMapping(value = "/experiments/compare", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ExperimentResponse compare(@RequestPart("files") List<MultipartFile> files) {
        if (files.isEmpty()) {
            throw new IllegalArgumentException("Envie pelo menos uma imagem");
        }
        return classificationService.compare(files);
    }
}
