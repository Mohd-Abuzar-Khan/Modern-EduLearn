package com.resumade.ai.controller;

import com.resumade.ai.dto.AtsReport;
import com.resumade.ai.repository.AiRequestRepository;
import com.resumade.ai.service.AiService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/ai")
public class AiController {

    private final AiService aiService;
    private final AiRequestRepository repository;

    public AiController(AiService aiService, AiRequestRepository repository) {
        this.aiService = aiService;
        this.repository = repository;
    }

    @PostMapping("/summary")
    public ResponseEntity<String> generateSummary(
            @RequestBody Map<String, Object> payload,
            HttpServletRequest request) {
        Integer userId = extractUserId(request);
        String result = aiService.generateSummary(
                userId,
                extractInt(payload, "resumeId"),
                (String) payload.get("jobTitle"),
                extractInt(payload, "yearsExp"));
        return ResponseEntity.ok(result);
    }

    @PostMapping("/bullets")
    public ResponseEntity<String> generateBullets(
            @RequestBody Map<String, Object> payload,
            HttpServletRequest request) {
        Integer userId = extractUserId(request);
        String result = aiService.generateBulletPoints(
                userId,
                extractInt(payload, "resumeId"),
                (String) payload.get("jobRole"),
                (String) payload.get("company"));
        return ResponseEntity.ok(result);
    }

    @PostMapping("/ats-check")
    public ResponseEntity<AtsReport> checkAts(
            @RequestBody Map<String, Object> payload,
            HttpServletRequest request) {
        Integer userId = extractUserId(request);
        AtsReport report = aiService.checkAtsCompatibility(
                userId,
                extractInt(payload, "resumeId"),
                (String) payload.getOrDefault("resumeContent", ""),
                (String) payload.get("jobDescription"));
        return ResponseEntity.ok(report);
    }
    
    @PostMapping("/audit")
    public ResponseEntity<AtsReport> auditResume(
            @RequestBody Map<String, Object> payload,
            HttpServletRequest request) {
        Integer userId = extractUserId(request);
        AtsReport report = aiService.auditResume(
                userId,
                extractInt(payload, "resumeId"),
                (String) payload.get("jobTitle"));
        return ResponseEntity.ok(report);
    }

    @GetMapping("/suggest-skills")
    public ResponseEntity<List<String>> suggestSkills(@RequestParam String jobTitle) {
        return ResponseEntity.ok(aiService.suggestSkills(jobTitle));
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> streamAi(@RequestParam String prompt, @RequestParam String type, HttpServletRequest request) {
        Integer userId = extractUserId(request);
        return aiService.streamAiResponse(userId, prompt, type);
    }

    @PostMapping("/cover-letter")
    public ResponseEntity<String> generateCoverLetter(
            @RequestBody Map<String, Object> payload,
            HttpServletRequest request) {
        Integer userId = extractUserId(request);
        String result = aiService.generateCoverLetter(
                userId,
                extractInt(payload, "resumeId"),
                (String) payload.get("jobDescription"));
        return ResponseEntity.ok(result);
    }

    @PostMapping("/tailor")
    public ResponseEntity<String> tailorResume(
            @RequestBody Map<String, Object> payload,
            HttpServletRequest request) {
        Integer userId = extractUserId(request);
        String result = aiService.tailorResumeForJob(
                userId,
                extractInt(payload, "resumeId"),
                (String) payload.getOrDefault("resumeContent", ""),
                (String) payload.get("jobDescription"));
        return ResponseEntity.ok(result);
    }

    @PostMapping("/test")
    public ResponseEntity<String> testAi(@RequestBody Map<String, String> payload) {
        String prompt = payload.get("prompt");
        String result = aiService.testPrompt(prompt);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/improve-section")
    public ResponseEntity<String> improveSection(
            @RequestBody Map<String, Object> payload,
            HttpServletRequest request) {
        Integer userId = extractUserId(request);
        String result = aiService.improveSection(
                userId,
                (String) payload.get("content"),
                (String) payload.getOrDefault("tone", "professional"));
        return ResponseEntity.ok(result);
    }

    @GetMapping("/history")
    public ResponseEntity<List<com.resumade.ai.entity.AiRequest>> getHistory(HttpServletRequest request) {
        Integer userId = extractUserId(request);
        return ResponseEntity.ok(aiService.getUserHistory(userId));
    }

    @GetMapping("/quota")
    public ResponseEntity<Map<String, Object>> getQuota(HttpServletRequest request) {
        Integer userId = extractUserId(request);
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime startOfNextMonth = startOfMonth.plusMonths(1);
        long used = repository.countMonthlyUsage(userId, startOfMonth, startOfNextMonth);
        Map<String, Object> result = new HashMap<>();
        result.put("used", used);
        result.put("limit", 5);
        result.put("remaining", Math.max(0, 5 - used));
        result.put("resetDate", startOfNextMonth.toString());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/parse-resume")
    public ResponseEntity<String> parseResume(
            @RequestBody Map<String, Object> payload,
            HttpServletRequest request) {
        // Document parsing does NOT count against monthly AI quota
        String text = (String) payload.get("text");
        String result = aiService.callGeminiRaw(text);
        return ResponseEntity.ok(result);
    }

    // Safe extraction helpers to handle Integer/Long from JSON
    private Integer extractUserId(HttpServletRequest request) {
        Object obj = request.getAttribute("userId");
        return (obj instanceof Number) ? ((Number) obj).intValue() : null;
    }

    private Integer extractInt(Map<String, Object> payload, String key) {
        Object obj = payload.get(key);
        return (obj instanceof Number) ? ((Number) obj).intValue() : null;
    }
}
