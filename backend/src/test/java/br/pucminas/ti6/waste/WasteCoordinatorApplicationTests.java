package br.pucminas.ti6.waste;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = "waste.workers=http://localhost:8001")
class WasteCoordinatorApplicationTests {
    @Test
    void contextLoads() {
    }
}
