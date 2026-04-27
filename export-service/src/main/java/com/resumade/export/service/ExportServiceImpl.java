package com.resumade.export.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfWriter;
import com.resumade.export.dto.ExportJobMessage;
import com.resumade.export.entity.ExportJob;
import com.resumade.export.repository.ExportRepository;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.File;
import java.io.FileOutputStream;
import java.io.ByteArrayOutputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ExportServiceImpl implements ExportService {

    private static final Logger log = LoggerFactory.getLogger(ExportServiceImpl.class);

    private final ExportRepository repository;
    // private final RabbitTemplate rabbitTemplate;
    private final RabbitTemplate rabbitTemplate = null;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${export.queue.exchange}")
    private String exchange;

    @Value("${export.queue.routing-key}")
    private String routingKey;

    private static final String EXPORT_DIR = "exports/";

    public ExportServiceImpl(ExportRepository repository, RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.repository = repository;
        // this.rabbitTemplate = rabbitTemplate;
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        
        // Ensure export directory exists
        File dir = new File(EXPORT_DIR);
        if (!dir.exists()) {
            dir.mkdirs();
        }
    }

    @Override
    public ExportJob createExportJob(Integer userId, Integer resumeId, ExportJob.ExportFormat format) {
        long count = repository.countByUserIdToday(userId, LocalDateTime.now().withHour(0).withMinute(0));
        if (count >= 10) {
            throw new RuntimeException("Daily export limit reached (10/day).");
        }

        ExportJob job = new ExportJob(resumeId, userId, format, ExportJob.ExportStatus.QUEUED);
        job.setExpiresAt(LocalDateTime.now().plusDays(7));
        repository.save(job);

        // ExportJobMessage message = new ExportJobMessage(job.getJobId(), userId, resumeId, format);
        // rabbitTemplate.convertAndSend(exchange, routingKey, message);
        
        log.info("Export job created. Processing synchronously (RabbitMQ disabled): {}", job.getJobId());
        this.processExport(job.getJobId());

        log.info("Export job created and queued: {}", job.getJobId());
        return job;
    }

    @Override
    public ExportJob getJobStatus(UUID jobId) {
        return repository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found: " + jobId));
    }

    @Override
    public List<ExportJob> getUserHistory(Integer userId) {
        return repository.findByUserId(userId);
    }

    @Override
    public void processExport(UUID jobId) {
        ExportJob job = repository.findById(jobId).orElse(null);
        if (job == null) return;

        job.setStatus(ExportJob.ExportStatus.PROCESSING);
        repository.save(job);

        try {
            log.info("Processing export job: {} format: {}", jobId, job.getFormat());
            
            // 1. Fetch Resume Data
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-User-Id", String.valueOf(job.getUserId()));
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                    "http://resume-service/api/v1/resumes/" + job.getResumeId(),
                    HttpMethod.GET,
                    entity,
                    String.class
            );
            
            JsonNode resumeData = objectMapper.readTree(response.getBody());
            
            // 2. Generate File
            String extension = job.getFormat().name().toLowerCase();
            String filename = jobId.toString() + "." + extension;
            File outputFile = new File(EXPORT_DIR + filename);
            
            try (FileOutputStream fos = new FileOutputStream(outputFile)) {
                switch (job.getFormat()) {
                    case PDF:
                        generatePdf(resumeData, fos);
                        break;
                    case DOCX:
                        generateDocx(resumeData, fos);
                        break;
                    case JSON:
                        generateJson(resumeData, fos);
                        break;
                }
            }

            job.setStatus(ExportJob.ExportStatus.COMPLETED);
            // In a real app, this would be an S3 URL. For now, it's an API endpoint.
            job.setFileUrl("/api/v1/exports/download/" + filename);
            job.setFileSizeKb(outputFile.length() / 1024);
            job.setCompletedAt(LocalDateTime.now());
            
            log.info("Export completed for job: {}", jobId);
        } catch (Exception e) {
            log.error("Export processing failed for job {}: {}", jobId, e.getMessage(), e);
            job.setStatus(ExportJob.ExportStatus.FAILED);
        } finally {
            repository.save(job);
        }
    }

    @Override
    public byte[] generateDirectExport(Integer userId, Integer resumeId, ExportJob.ExportFormat format) throws Exception {
        long count = repository.countByUserIdToday(userId, LocalDateTime.now().withHour(0).withMinute(0));
        if (count >= 10) {
            throw new RuntimeException("Daily export limit reached (10/day).");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-User-Id", String.valueOf(userId));
        HttpEntity<String> entity = new HttpEntity<>(headers);
        
        ResponseEntity<String> response = restTemplate.exchange(
                "http://resume-service/api/v1/resumes/" + resumeId,
                HttpMethod.GET,
                entity,
                String.class
        );
        
        JsonNode resumeData = objectMapper.readTree(response.getBody());
        
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        switch (format) {
            case PDF:
                generatePdf(resumeData, baos);
                break;
            case DOCX:
                generateDocx(resumeData, baos);
                break;
            case JSON:
                generateJson(resumeData, baos);
                break;
        }

        byte[] fileBytes = baos.toByteArray();

        ExportJob job = new ExportJob(resumeId, userId, format, ExportJob.ExportStatus.COMPLETED);
        job.setCompletedAt(LocalDateTime.now());
        job.setFileSizeKb(fileBytes.length / 1024L);
        job.setFileUrl("direct_download"); // Marker for direct download
        repository.save(job);

        log.info("Direct export completed for resume: {}", resumeId);
        return fileBytes;
    }
    
    private void generatePdf(JsonNode resumeData, OutputStream out) throws Exception {
        Document document = new Document();
        PdfWriter.getInstance(document, out);
        document.open();
        
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, BaseColor.BLACK);
        Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, BaseColor.DARK_GRAY);
        Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 12, BaseColor.BLACK);
        
        String title = resumeData.has("title") ? resumeData.get("title").asText() : "Resume";
        document.add(new Paragraph(title, titleFont));
        document.add(new Paragraph(" ")); // blank line
        
        if (resumeData.has("sections") && resumeData.get("sections").isArray()) {
            for (JsonNode section : resumeData.get("sections")) {
                if (section.has("title")) {
                    document.add(new Paragraph(section.get("title").asText().toUpperCase(), sectionFont));
                }
                
                if (section.has("content")) {
                    String contentStr = section.get("content").asText();
                    try {
                        JsonNode contentJson = objectMapper.readTree(contentStr);
                        document.add(new Paragraph(contentJson.toPrettyString().replaceAll("[{}\"]", ""), normalFont));
                    } catch (Exception e) {
                        document.add(new Paragraph(contentStr, normalFont));
                    }
                }
                document.add(new Paragraph(" "));
            }
        }
        
        document.close();
    }
    
    private void generateDocx(JsonNode resumeData, OutputStream out) throws Exception {
        try (XWPFDocument document = new XWPFDocument()) {
            
            XWPFParagraph titlePara = document.createParagraph();
            XWPFRun titleRun = titlePara.createRun();
            titleRun.setBold(true);
            titleRun.setFontSize(20);
            String title = resumeData.has("title") ? resumeData.get("title").asText() : "Resume";
            titleRun.setText(title);
            
            if (resumeData.has("sections") && resumeData.get("sections").isArray()) {
                for (JsonNode section : resumeData.get("sections")) {
                    XWPFParagraph secTitlePara = document.createParagraph();
                    XWPFRun secTitleRun = secTitlePara.createRun();
                    secTitleRun.setBold(true);
                    secTitleRun.setFontSize(14);
                    if (section.has("title")) {
                        secTitleRun.setText(section.get("title").asText().toUpperCase());
                    }
                    
                    if (section.has("content")) {
                        XWPFParagraph contentPara = document.createParagraph();
                        XWPFRun contentRun = contentPara.createRun();
                        contentRun.setFontSize(12);
                        
                        String contentStr = section.get("content").asText();
                        try {
                            JsonNode contentJson = objectMapper.readTree(contentStr);
                            contentRun.setText(contentJson.toPrettyString().replaceAll("[{}\"]", ""));
                        } catch (Exception e) {
                            contentRun.setText(contentStr);
                        }
                    }
                }
            }
            
            document.write(out);
        }
    }
    
    private void generateJson(JsonNode resumeData, OutputStream out) throws Exception {
        objectMapper.writerWithDefaultPrettyPrinter().writeValue(out, resumeData);
    }
}
