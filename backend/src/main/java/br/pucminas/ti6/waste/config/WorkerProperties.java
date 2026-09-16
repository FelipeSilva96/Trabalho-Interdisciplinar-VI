package br.pucminas.ti6.waste.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.List;

@Configuration
public class WorkerProperties {
    private final List<String> urls;

    public WorkerProperties(@Value("${waste.workers}") String workers) {
        this.urls = Arrays.stream(workers.split(","))
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .toList();
    }

    public List<String> urls() {
        return urls;
    }
}
