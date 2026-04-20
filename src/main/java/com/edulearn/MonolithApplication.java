package com.edulearn;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.FullyQualifiedAnnotationBeanNameGenerator;
import org.springframework.web.client.RestTemplate;

@SpringBootApplication(
        scanBasePackages = "com.edulearn",
        nameGenerator = FullyQualifiedAnnotationBeanNameGenerator.class
)
@ComponentScan(
        basePackages = "com.edulearn",
        nameGenerator = FullyQualifiedAnnotationBeanNameGenerator.class,
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.REGEX,
                pattern = "com\\.edulearn\\..*\\.config\\.SecurityConfig"
        )
)
@EnableFeignClients(basePackages = "com.edulearn")
@OpenAPIDefinition(
        info = @Info(
                title = "EduLearn Monolith API",
                version = "1.0.0",
                description = "Single-process backend merged from EduLearn microservices"
        )
)
public class MonolithApplication {

    public static void main(String[] args) {
        SpringApplication.run(MonolithApplication.class, args);
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}

