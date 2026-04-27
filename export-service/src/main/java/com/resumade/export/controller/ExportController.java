package com.resumade.export.controller;

import com.resumade.export.entity.ExportJob;
import com.resumade.export.repository.ExportRepository;
import com.resumade.export.service.ExportService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/exports")
public class ExportController {

    private final ExportService exportService;
    private final ExportRepository repository;
    // private final RabbitTemplate rabbitTemplate;
    private final RabbitTemplate rabbitTemplate = null;

    public ExportController(ExportService exportService, ExportRepository repository) {
        this.exportService = exportService;
        this.repository = repository;
        // this.rabbitTemplate = rabbitTemplate;
    }

    @PostMapping
    public ResponseEntity<?> requestExport(
            @RequestBody Map<String, Object> payload,
            HttpServletRequest request) {
        Object userIdObj = request.getAttribute("userId");
        Integer userId = (userIdObj instanceof Number) ? ((Number) userIdObj).intValue() : null;
        if (userId == null && request.getHeader("X-User-Id") != null) {
            userId = Integer.parseInt(request.getHeader("X-User-Id"));
        }
        
        Object resumeIdObj = payload.get("resumeId");
        Integer resumeId = (resumeIdObj instanceof Number) ? ((Number) resumeIdObj).intValue() : null;
        
        String formatStr = (String) payload.get("format");
        ExportJob.ExportFormat format = ExportJob.ExportFormat.valueOf(formatStr.toUpperCase());

        // PDF is generated client-side — use POST /record instead
        // PDF is generated client-side — but we allow backend generation now for fallback
        // if (format == ExportJob.ExportFormat.PDF) {
        //     return ResponseEntity.badRequest()
        //         .body(Map.of("error", "PDF is generated client-side. Use POST /api/v1/exports/record instead."));
        // }

        ExportJob job = exportService.createExportJob(userId, resumeId, format);
        return ResponseEntity.ok(job);
    }

    @PostMapping("/record")
    public ResponseEntity<ExportJob> recordDownload(
            @RequestBody Map<String, Object> payload,
            HttpServletRequest request) {
        Object userIdObj = request.getAttribute("userId");
        Integer userId = (userIdObj instanceof Number) ? ((Number) userIdObj).intValue() : null;
        if (userId == null && request.getHeader("X-User-Id") != null) {
            userId = Integer.parseInt(request.getHeader("X-User-Id"));
        }
        Integer resumeId = payload.get("resumeId") != null ? ((Number) payload.get("resumeId")).intValue() : null;
        String format = (String) payload.getOrDefault("format", "PDF");
        Long fileSizeKb = payload.get("fileSizeKb") != null ? ((Number) payload.get("fileSizeKb")).longValue() : null;

        ExportJob job = new ExportJob(resumeId, userId,
            ExportJob.ExportFormat.valueOf(format.toUpperCase()),
            ExportJob.ExportStatus.COMPLETED);
        job.setCompletedAt(LocalDateTime.now());
        job.setFileSizeKb(fileSizeKb);
        job.setExpiresAt(LocalDateTime.now().plusDays(30));
        repository.save(job);

        return ResponseEntity.ok(job);
    }

    @GetMapping("/status/{jobId}")
    public ResponseEntity<ExportJob> getStatus(@PathVariable UUID jobId) {
        return ResponseEntity.ok(exportService.getJobStatus(jobId));
    }

    @GetMapping("/history")
    public ResponseEntity<List<ExportJob>> getHistory(HttpServletRequest request) {
        Object userIdObj = request.getAttribute("userId");
        Integer userId = (userIdObj instanceof Number) ? ((Number) userIdObj).intValue() : null;
        if (userId == null && request.getHeader("X-User-Id") != null) {
            userId = Integer.parseInt(request.getHeader("X-User-Id"));
        }
        return ResponseEntity.ok(exportService.getUserHistory(userId));
    }

    @GetMapping("/direct/{resumeId}")
    public ResponseEntity<Resource> directDownload(
            @PathVariable Integer resumeId,
            @RequestParam String format,
            HttpServletRequest request) {
        try {
            Object userIdObj = request.getAttribute("userId");
            Integer userId = (userIdObj instanceof Number) ? ((Number) userIdObj).intValue() : null;
            if (userId == null && request.getHeader("X-User-Id") != null) {
                userId = Integer.parseInt(request.getHeader("X-User-Id"));
            }

            ExportJob.ExportFormat exportFormat = ExportJob.ExportFormat.valueOf(format.toUpperCase());
            byte[] fileBytes = exportService.generateDirectExport(userId, resumeId, exportFormat);
            
            ByteArrayResource resource = new ByteArrayResource(fileBytes);
            
            String extension = exportFormat.name().toLowerCase();
            String contentType = extension.equals("pdf") ? "application/pdf"
                    : extension.equals("docx") ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    : "application/json";
                    
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"resume_" + resumeId + "." + extension + "\"")
                    .header(HttpHeaders.CONTENT_TYPE, contentType)
                    .contentLength(fileBytes.length)
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/download/{filename}")
    public ResponseEntity<org.springframework.core.io.Resource> downloadFile(
            @PathVariable String filename) {
        // Path traversal guard
        if (filename.contains("..") || filename.contains("/")) {
            return ResponseEntity.badRequest().build();
        }
        try {
            java.nio.file.Path baseDir = java.nio.file.Paths.get("exports").toAbsolutePath().normalize();
            java.nio.file.Path file = baseDir.resolve(filename).normalize();
            if (!file.startsWith(baseDir)) {
                return ResponseEntity.badRequest().build();
            }
            org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(file.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }
            String contentType = filename.endsWith(".pdf") ? "application/pdf"
                    : filename.endsWith(".docx") ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    : filename.endsWith(".json") ? "application/json"
                    : "application/octet-stream";
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .header(HttpHeaders.CONTENT_TYPE, contentType)
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/health/rabbitmq")
    public ResponseEntity<Map<String, Object>> checkRabbitHealth() {
        return ResponseEntity.ok(Map.of("status", "DISABLED", "message", "RabbitMQ is commented out for testing"));
    }
}
