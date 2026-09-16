package br.pucminas.ti6.waste.client;

import br.pucminas.ti6.waste.dto.WorkerBatchResponse;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Component
public class WorkerClient {
    private final RestClient restClient = RestClient.create();

    public WorkerBatchResponse classify(String workerUrl, List<MultipartFile> files) {
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        for (MultipartFile file : files) {
            try {
                body.add("files", new NamedByteArrayResource(file.getBytes(), file.getOriginalFilename()));
            } catch (IOException e) {
                throw new IllegalArgumentException("Não foi possível ler o arquivo " + file.getOriginalFilename(), e);
            }
        }

        return restClient.post()
                .uri(workerUrl + "/predict/batch")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(body)
                .retrieve()
                .body(WorkerBatchResponse.class);
    }

    public String health(String workerUrl) {
        return restClient.get()
                .uri(workerUrl + "/health")
                .retrieve()
                .body(String.class);
    }

    private static class NamedByteArrayResource extends ByteArrayResource {
        private final String filename;

        NamedByteArrayResource(byte[] byteArray, String filename) {
            super(byteArray);
            this.filename = filename == null ? "image.jpg" : filename;
        }

        @Override
        public String getFilename() {
            return filename;
        }
    }
}
