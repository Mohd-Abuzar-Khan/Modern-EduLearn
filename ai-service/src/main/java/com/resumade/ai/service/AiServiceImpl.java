package com.resumade.ai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumade.ai.dto.AtsReport;
import com.resumade.ai.entity.AiRequest;
import com.resumade.ai.exception.QuotaExceededException;
import com.resumade.ai.repository.AiRequestRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class AiServiceImpl implements AiService {

    private static final Logger log = LoggerFactory.getLogger(AiServiceImpl.class);

    private final AiRequestRepository repository;
    private final WebClient.Builder webClientBuilder;
    private final HttpServletRequest currentRequest;
    private final ObjectMapper objectMapper;

    public AiServiceImpl(AiRequestRepository repository, WebClient.Builder webClientBuilder,
            HttpServletRequest currentRequest, ObjectMapper objectMapper) {
        this.repository = repository;
        this.webClientBuilder = webClientBuilder;
        this.currentRequest = currentRequest;
        this.objectMapper = objectMapper;
    }

    @Value("${ai.gemini.api-key}")
    private String geminiKey;

    @Value("${ai.gemini.model:gemini-1.5-flash}")
    private String geminiModel;

    @Override
    public String generateSummary(Integer userId, Integer resumeId, String jobTitle, int yearsExp) {
        enforceQuota(userId, AiRequest.RequestType.SUMMARY);
        String resumeContext = fetchResumeText(userId, resumeId);
        String prompt = String.format(
                "Based on the following resume context:\n%s\n\n" +
                "Generate 3 diverse, short, impactful professional summary options (max 3-4 lines each) for a %s with %d years of experience. " +
                "Return ONLY a valid JSON object (no markdown, no explanation) with exactly this structure: " +
                "{\"options\": [\"Option 1 text\", \"Option 2 text\", \"Option 3 text\"]}",
                resumeContext, jobTitle, yearsExp);
        String aiResponse = callAiWithFailover(userId, resumeId, AiRequest.RequestType.SUMMARY, prompt);
        return cleanJsonResponse(aiResponse);
    }

    @Override
    public String generateBulletPoints(Integer userId, Integer resumeId, String jobRole, String company) {
        enforceQuota(userId, AiRequest.RequestType.BULLETS);
        String resumeContext = fetchResumeText(userId, resumeId);
        String prompt = String.format(
                "Based on the following resume context:\n%s\n\n" +
                "Generate 4-5 high-impact bullet points for a %s role at %s, focusing on achievements and quantifiable metrics.",
                resumeContext, jobRole, company);
        return callAiWithFailover(userId, resumeId, AiRequest.RequestType.BULLETS, prompt);
    }

    @Override
    public AtsReport checkAtsCompatibility(Integer userId, Integer resumeId, String resumeContent,
            String jobDescription) {
        enforceQuota(userId, AiRequest.RequestType.ATS);
        String prompt = """
                You are an ATS (Applicant Tracking System) expert. Analyze the compatibility between the resume and job description below.

                RESUME CONTENT:
                %s

                JOB DESCRIPTION:
                %s

                Return ONLY a valid JSON object (no markdown, no explanation) with exactly these fields:
                {
                  "score": <integer 0-100>,
                  "missingKeywords": [<list of missing keywords as strings>],
                  "suggestions": [<list of 3-5 improvement suggestions as strings>]
                }
                """
                .formatted(resumeContent, jobDescription);

        try {
            String aiResponse = callAiWithFailover(userId, resumeId, AiRequest.RequestType.ATS, prompt);

            String cleaned = cleanJsonResponse(aiResponse);
            return objectMapper.readValue(cleaned, AtsReport.class);
        } catch (Exception e) {
            log.error("ATS Check failed: {}", e.getMessage());
            return AtsReport.builder()
                    .score(0)
                    .missingKeywords(new ArrayList<>())
                    .suggestions(List.of("AI service error: " + e.getMessage(), "Please try again later."))
                    .build();
        }
    }

    @Override
    public List<String> suggestSkills(String jobTitle) {
        String prompt = String.format("Suggest the top 10 most important technical skills for a %s. Return only a comma-separated list of skills.", jobTitle);
        try {
            String aiResponse = callGemini(prompt);
            return List.of(aiResponse.split(","));
        } catch (Exception e) {
            log.warn("Failed to suggest skills with AI: {}", e.getMessage());
            return List.of("Communication", "Teamwork", "Problem Solving", "Adaptability");
        }
    }

    @Override
    public String generateCoverLetter(Integer userId, Integer resumeId, String jobDescription) {
        enforcePremium(userId, "Cover Letter Generation");
        enforceQuota(userId, AiRequest.RequestType.COVER_LETTER);
        String resumeContext = fetchResumeText(userId, resumeId);
        String prompt = String.format("Based on the following resume:\n%s\n\nGenerate a personalized cover letter based on this job description: %s", resumeContext, jobDescription);
        return callAiWithFailover(userId, resumeId, AiRequest.RequestType.COVER_LETTER, prompt);
    }

    @Override
    public String improveSection(Integer userId, String sectionContent, String tone) {
        enforcePremium(userId, "Section Improvement");
        enforceQuota(userId, AiRequest.RequestType.IMPROVE);
        String prompt = String.format(
                "Rewrite the following resume section to sound more %s: \"%s\". " +
                "Provide 3 diverse, high-impact, and professional versions. " +
                "Return ONLY a valid JSON object (no markdown, no explanation) with exactly this structure: " +
                "{\"options\": [\"Option 1 text\", \"Option 2 text\", \"Option 3 text\"]}",
                tone, sectionContent);
        String aiResponse = callAiWithFailover(userId, null, AiRequest.RequestType.IMPROVE, prompt);
        return cleanJsonResponse(aiResponse);
    }

    @Override
    public String tailorResumeForJob(Integer userId, Integer resumeId, String resumeContent, String jobDescription) {
        enforcePremium(userId, "Resume Tailoring");
        enforceQuota(userId, AiRequest.RequestType.TAILOR);
        String prompt = String.format("""
                You are an expert ATS-optimized resume writer. Your task is to tailor a resume for a specific job description.

                You will be given:
                1. The candidate's CURRENT RESUME DATA (as JSON)
                2. The TARGET JOB DESCRIPTION

                Your output must be a VALID JSON object only — no markdown, no explanation, no preamble, no backticks.

                Return exactly this structure:
                {
                  "summary": "Rewritten professional summary tailored to the job (2-3 sentences max)",
                  "skills": ["skill1", "skill2", "skill3"],
                  "experience": [
                    {
                      "company": "Exact company name from resume",
                      "title": "Job title (update if needed to better match JD)",
                      "bullets": [
                        "Rewritten bullet point 1 — quantified, action verb, relevant to JD",
                        "Rewritten bullet point 2",
                        "Rewritten bullet point 3"
                      ]
                    }
                  ],
                  "changes_made": [
                    "Short description of change 1",
                    "Short description of change 2"
                  ]
                }

                Rules:
                - ONLY use information already present in the resume. Do NOT invent companies, degrees, or technologies not mentioned.
                - Do NOT use placeholder text like [Your Name] or [X years].
                - Every bullet must start with a strong action verb.
                - Prioritize keywords from the job description naturally.
                - Keep bullets concise: max 20 words each.
                - Return ONLY the JSON. Nothing else.

                CURRENT RESUME:
                %s

                JOB DESCRIPTION:
                %s
                """, resumeContent, jobDescription);
        return callAiWithFailover(userId, resumeId, AiRequest.RequestType.TAILOR, prompt);
    }

    @Override
    public AtsReport auditResume(Integer userId, Integer resumeId, String jobTitle) {
        enforceQuota(userId, AiRequest.RequestType.ATS);
        String prompt = String.format("""
                You are a professional resume auditor. Analyze the following resume against the general requirements for a '%s' position.
                
                Evaluate the overall quality, keyword density, and structural effectiveness.
                
                Return ONLY a valid JSON object (no markdown, no explanation) with exactly these fields:
                {
                  "score": <integer 0-100>,
                  "missingKeywords": [<list of missing industry-standard keywords as strings>],
                  "suggestions": [<list of 3-5 specific improvement suggestions as strings>]
                }
                """, jobTitle);

        try {
            String resumeContext = "";
            if (resumeId != null) {
                resumeContext = fetchResumeText(userId, resumeId);
                prompt = prompt + "\n\nRESUME CONTENT:\n" + resumeContext;
            }
            
            String aiResponse = callAiWithFailover(userId, resumeId, AiRequest.RequestType.ATS, prompt);
            String cleaned = cleanJsonResponse(aiResponse);
            return objectMapper.readValue(cleaned, AtsReport.class);
        } catch (Exception e) {
            log.error("Resume Audit failed: {}", e.getMessage());
            return AtsReport.builder()
                    .score(0)
                    .missingKeywords(new ArrayList<>())
                    .suggestions(List.of("AI audit error: " + e.getMessage()))
                    .build();
        }
    }

    @Override
    public String translateResume(Integer userId, Integer resumeId, String targetLanguage) {
        enforcePremium(userId, "Resume Translation");
        enforceQuota(userId, AiRequest.RequestType.TRANSLATE);
        String prompt = "Translate this resume content into " + targetLanguage;
        return callAiWithFailover(userId, resumeId, AiRequest.RequestType.TRANSLATE, prompt);
    }

    @Override
    public String testPrompt(String prompt) {
        return callGemini(prompt);
    }

    @Override
    public Flux<String> streamAiResponse(Integer userId, String prompt, String requestType) {
        // Gemini does not support true streaming in the current integration.
        // Return the response as a single Flux item.
        String response = callAiWithFailover(userId, null, AiRequest.RequestType.valueOf(requestType), prompt);
        return Flux.just(response);
    }

    private void enforceQuota(Integer userId, AiRequest.RequestType type) {
        if (userId == null) return; // Bypass if no user identified
        String plan = getUserPlan(userId);
        if ("PREMIUM".equalsIgnoreCase(plan)) return;

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime monthStart = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime nextMonthStart = monthStart.plusMonths(1);
        long count = repository.countMonthlyUsage(userId, monthStart, nextMonthStart);

        if (count >= 5) {
            throw new QuotaExceededException("FREE plan limit reached for AI features (5/month).");
        }
    }

    private void enforcePremium(Integer userId, String feature) {
        if (userId == null) return; // Bypass if no user identified
        String plan = getUserPlan(userId);
        if (!"PREMIUM".equalsIgnoreCase(plan)) {
            throw new RuntimeException(feature + " is a PREMIUM feature. Please upgrade your plan.");
        }
    }

    private String getUserPlan(Integer userId) {
        String plan = (String) currentRequest.getAttribute("plan");
        if (plan != null) return plan;
        
        try {
            // Fetch from auth-service if not in request
            return webClientBuilder.build()
                .get()
                .uri("http://auth-service/api/v1/auth/plan/" + userId)
                .retrieve()
                .bodyToMono(String.class)
                .block();
        } catch (Exception e) {
            log.warn("Could not fetch plan for user {}, assuming FREE", userId);
            return "FREE";
        }
    }

    private String fetchResumeText(Integer userId, Integer resumeId) {
        if (resumeId == null) return "";
        try {
            Map response = webClientBuilder.build()
                .get()
                .uri("http://resume-service/api/v1/resumes/" + resumeId + "/text")
                .header("X-User-Id", String.valueOf(userId))
                .retrieve()
                .bodyToMono(Map.class)
                .block();
            if (response != null && response.containsKey("text")) {
                return (String) response.get("text");
            }
        } catch (Exception e) {
            log.warn("Failed to fetch resume text for resume {}: {}", resumeId, e.getMessage());
        }
        return "";
    }

    private String callAiWithFailover(Integer userId, Integer resumeId, AiRequest.RequestType type, String prompt) {
        AiRequest request = AiRequest.builder()
                .userId(userId)
                .resumeId(resumeId)
                .requestType(type)
                .inputPrompt(prompt)
                .status(AiRequest.RequestStatus.QUEUED)
                .model(AiRequest.ModelType.GEMINI)
                .build();
        repository.save(request);

        try {
            String response = callGemini(prompt);
            updateRequest(request, response, AiRequest.ModelType.GEMINI, AiRequest.RequestStatus.COMPLETED);
            return response;
        } catch (Exception e) {
            log.error("Gemini API call failed: {}", e.getMessage());
            updateRequest(request, null, AiRequest.ModelType.GEMINI, AiRequest.RequestStatus.FAILED);
            throw new RuntimeException("AI service error: " + e.getMessage());
        }
    }

    private String callGemini(String prompt) {
        if (geminiKey == null || geminiKey.isEmpty() || geminiKey.contains("your_gemini_key")) {
            return "Gemini API key is not configured. Please check your environment variables.";
        }

        String url = "https://generativelanguage.googleapis.com/v1/models/" + geminiModel + ":generateContent?key="
                + geminiKey;

        Map<String, Object> body = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", prompt)))));

        try {
            Map response = webClientBuilder.build()
                    .post()
                    .uri(url)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response != null && response.containsKey("candidates")) {
                List candidates = (List) response.get("candidates");
                if (!candidates.isEmpty()) {
                    Map candidate = (Map) candidates.get(0);
                    Map content = (Map) candidate.get("content");
                    List parts = (List) content.get("parts");
                    if (!parts.isEmpty()) {
                        Map part = (Map) parts.get(0);
                        return (String) part.get("text");
                    }
                }
            }
            return "No content received from Gemini.";
        } catch (Exception e) {
            log.error("Error calling Gemini API: {}", e.getMessage());
            throw new RuntimeException("Gemini API call failed: " + e.getMessage());
        }
    }

    private String cleanJsonResponse(String response) {
        if (response == null) return "{}";
        // Handle Gemini markdown formatting
        String cleaned = response.replaceAll("(?s)```json(.*?)```", "$1").trim();
        if (cleaned.contains("{")) {
            cleaned = cleaned.substring(cleaned.indexOf("{"), cleaned.lastIndexOf("}") + 1);
        } else if (cleaned.contains("[")) {
            cleaned = cleaned.substring(cleaned.indexOf("["), cleaned.lastIndexOf("]") + 1);
        }
        return cleaned;
    }

    @Override
    public List<AiRequest> getUserHistory(Integer userId) {
        if (userId == null) return List.of();
        return repository.findByUserId(userId);
    }

    private void updateRequest(AiRequest request, String response, AiRequest.ModelType model,
            AiRequest.RequestStatus status) {
        request.setAiResponse(response);
        request.setModel(model);
        request.setStatus(status);
        request.setTokensUsed(100); // Dummy count
        request.setCompletedAt(LocalDateTime.now());
        repository.save(request);
    }

    @Override
    public String callGeminiRaw(String prompt) {
        return callGemini(prompt);
    }
}
