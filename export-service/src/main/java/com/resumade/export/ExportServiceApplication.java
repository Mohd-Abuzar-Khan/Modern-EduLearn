package com.resumade.export;

import jakarta.annotation.PostConstruct;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.scheduling.annotation.EnableScheduling;


import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

@SpringBootApplication
@EnableDiscoveryClient
@EnableScheduling
public class ExportServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(ExportServiceApplication.class, args);
    }


    @PostConstruct
    public void init() throws IOException {
        Files.createDirectories(Paths.get("exports"));
    }
}
