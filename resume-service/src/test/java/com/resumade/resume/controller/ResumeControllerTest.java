package com.resumade.resume.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumade.resume.dto.ResumeRequest;
import com.resumade.resume.entity.Resume;
import com.resumade.resume.service.ResumeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ResumeController.class)
@AutoConfigureMockMvc(addFilters = false)
class ResumeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ResumeService resumeService;

    @Autowired
    private ObjectMapper objectMapper;

    private Resume resume;

    @BeforeEach
    void setUp() {
        resume = new Resume(1, "Test Resume", "Engineer", 1);
        resume.setResumeId(101);
    }

    @Test
    void createResume_ReturnsCreated() throws Exception {
        ResumeRequest request = new ResumeRequest();
        request.setTitle("Test Resume");
        request.setTemplateId(1);

        when(resumeService.createResume(anyInt(), anyString(), any(ResumeRequest.class))).thenReturn(resume);

        mockMvc.perform(post("/api/v1/resumes")
                .header("X-User-Id", 1)
                .header("X-User-Plan", "FREE")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Test Resume"));
    }

    @Test
    void getUserResumes_ReturnsOk() throws Exception {
        when(resumeService.getUserResumes(1)).thenReturn(Collections.singletonList(resume));

        mockMvc.perform(get("/api/v1/resumes")
                .header("X-User-Id", 1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Test Resume"));
    }

    @Test
    void getResumeById_ReturnsOk() throws Exception {
        when(resumeService.getResumeById(101, 1)).thenReturn(resume);

        mockMvc.perform(get("/api/v1/resumes/101")
                .header("X-User-Id", 1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.resumeId").value(101));
    }

    @Test
    void deleteResume_ReturnsNoContent() throws Exception {
        mockMvc.perform(delete("/api/v1/resumes/101")
                .header("X-User-Id", 1))
                .andExpect(status().isNoContent());
    }

    @Test
    void duplicateResume_ReturnsCreated() throws Exception {
        when(resumeService.duplicateResume(eq(101), eq(1), anyString())).thenReturn(resume);

        mockMvc.perform(post("/api/v1/resumes/101/duplicate")
                .header("X-User-Id", 1))
                .andExpect(status().isCreated());
    }

    @Test
    void getPublicResumes_ReturnsOk() throws Exception {
        when(resumeService.getPublicResumes(anyString())).thenReturn(Collections.singletonList(resume));

        mockMvc.perform(get("/api/v1/resumes/public")
                .param("q", "search"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Test Resume"));
    }
}
