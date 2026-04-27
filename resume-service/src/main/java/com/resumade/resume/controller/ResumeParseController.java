package com.resumade.resume.controller;

import com.resumade.resume.service.DocumentParserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/resumes")
@Tag(name = "Resume Parsing", description = "Document upload and auto-fill endpoints")
public class ResumeParseController {

    private static final Logger log = LoggerFactory.getLogger(ResumeParseController.class);

    private final DocumentParserService parserService;
    private final WebClient.Builder webClientBuilder;

    public ResumeParseController(DocumentParserService parserService, WebClient.Builder webClientBuilder) {
        this.parserService = parserService;
        this.webClientBuilder = webClientBuilder;
    }

    @Operation(summary = "Parse an uploaded document (PDF/DOCX/DOC) and extract resume data via AI")
    @PostMapping("/parse-document")
    public ResponseEntity<?> parseDocument(
            @RequestHeader("X-User-Id") Integer userId,
            @RequestPart("file") MultipartFile file) {
        try {
            // Validate file size (5MB max)
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(Map.of("error", "File too large. Maximum 5MB."));
            }
            String filename = file.getOriginalFilename();
            if (filename == null || !filename.toLowerCase().matches(".*\\.(pdf|docx|doc)$")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Unsupported file type. Please upload PDF, DOCX, or DOC."));
            }

            // 1. Extract raw text from file
            String rawText = parserService.extractText(file);

            // 2. Truncate to 12,000 chars to stay within Gemini context
            if (rawText.length() > 12000) {
                rawText = rawText.substring(0, 12000);
            }

            // 3. Call ai-service /api/v1/ai/parse-resume with the raw text
            String prompt = buildExtractionPrompt(rawText);
            String aiResponse = webClientBuilder.build()
                .post()
                .uri("http://ai-service/api/v1/ai/parse-resume")
                .bodyValue(Map.of("text", prompt))
                .retrieve()
                .bodyToMono(String.class)
                .block();

            // 4. Return structured JSON to frontend
            return ResponseEntity.ok(Map.of("parsedData", aiResponse, "rawTextLength", rawText.length()));

        } catch (Exception e) {
            log.error("Document parsing failed: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to parse document: " + e.getMessage()));
        }
    }

    private String buildExtractionPrompt(String text) {
        return "You are a resume parser. Extract all information from the following resume text and return ONLY a valid JSON object (no markdown, no explanation) with this exact structure:\n" +
               "{\n" +
               "  \"title\": \"Job title from resume\",\n" +
               "  \"targetJobTitle\": \"Most recent or desired job title\",\n" +
               "  \"sections\": [\n" +
               "    { \"sectionType\": \"PERSONAL_INFO\", \"title\": \"Contact Information\",\n" +
               "      \"content\": {\"name\":\"\",\"email\":\"\",\"phone\":\"\",\"location\":\"\",\"linkedin\":\"\",\"website\":\"\"} },\n" +
               "    { \"sectionType\": \"SUMMARY\", \"title\": \"Professional Summary\", \"content\": \"...\" },\n" +
               "    { \"sectionType\": \"EXPERIENCE\", \"title\": \"Work Experience\",\n" +
               "      \"content\": [{\"company\":\"\",\"role\":\"\",\"startDate\":\"\",\"endDate\":\"\",\"bullets\":[]}] },\n" +
               "    { \"sectionType\": \"EDUCATION\", \"title\": \"Education\",\n" +
               "      \"content\": [{\"school\":\"\",\"degree\":\"\",\"field\":\"\",\"startDate\":\"\",\"endDate\":\"\"}] },\n" +
               "    { \"sectionType\": \"SKILLS\", \"title\": \"Skills\", \"content\": {\"skills\":[]} }\n" +
               "  ]\n" +
               "}\n\nResume text:\n" + text;
    }
}
