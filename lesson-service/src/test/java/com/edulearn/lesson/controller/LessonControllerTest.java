package com.edulearn.lesson.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.edulearn.lesson.entity.Lesson;
import com.edulearn.lesson.entity.Resource;
import com.edulearn.lesson.service.FileStorageService;
import com.edulearn.lesson.service.LessonService;
import com.edulearn.lesson.config.JwtUtil;
import com.fasterxml.jackson.databind.ObjectMapper;

@WebMvcTest(LessonController.class)
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("LessonController Unit Tests")
class LessonControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private LessonService lessonService;

    @MockBean
    private FileStorageService fileStorageService;

    @MockBean
    private JwtUtil jwtUtil;

    @Autowired
    private ObjectMapper objectMapper;

    private Lesson testLesson;

    @BeforeEach
    void setUp() {
        testLesson = new Lesson();
        testLesson.setLessonId(1);
        testLesson.setCourseId(101);
        testLesson.setTitle("Test Lesson");
        testLesson.setContentType("VIDEO");
    }

    @Test
    @DisplayName("POST /api/v1/lessons - Should create new lesson")
    void testAddLesson() throws Exception {
        // Arrange
        when(lessonService.addLesson(any(Lesson.class))).thenReturn(testLesson);

        // Act & Assert
        mockMvc.perform(post("/api/v1/lessons")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testLesson)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("Test Lesson"));
    }

    @Test
    @DisplayName("GET /api/v1/lessons/course/{courseId} - Should return course lessons")
    void testGetLessonsByCourse() throws Exception {
        // Arrange
        List<Lesson> lessons = new ArrayList<>();
        lessons.add(testLesson);
        when(lessonService.getLessonsByCourse(101)).thenReturn(lessons);

        // Act & Assert
        mockMvc.perform(get("/api/v1/lessons/course/101"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(1));
    }

    @Test
    @DisplayName("GET /api/v1/lessons/{lessonId} - Should return lesson by ID")
    void testGetLessonById() throws Exception {
        // Arrange
        when(lessonService.getLessonById(1)).thenReturn(testLesson);

        // Act & Assert
        mockMvc.perform(get("/api/v1/lessons/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("Test Lesson"));
    }

    @Test
    @DisplayName("PUT /api/v1/lessons/{lessonId} - Should update lesson")
    void testUpdateLesson() throws Exception {
        // Arrange
        when(lessonService.updateLesson(anyInt(), any(Lesson.class))).thenReturn(testLesson);

        // Act & Assert
        mockMvc.perform(put("/api/v1/lessons/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testLesson)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Lesson updated successfully"));
    }

    @Test
    @DisplayName("DELETE /api/v1/lessons/{lessonId} - Should delete lesson")
    void testDeleteLesson() throws Exception {
        // Act & Assert
        mockMvc.perform(delete("/api/v1/lessons/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Lesson deleted successfully"));
    }

    @Test
    @DisplayName("POST /api/v1/lessons/{lessonId}/resources - Should add resource")
    void testAddResource() throws Exception {
        // Arrange
        Resource resource = new Resource();
        resource.setName("PDF Guide");
        when(lessonService.addResource(anyInt(), any(Resource.class))).thenReturn(resource);

        // Act & Assert
        mockMvc.perform(post("/api/v1/lessons/1/resources")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(resource)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("PDF Guide"));
    }

    @Test
    @DisplayName("GET /api/v1/lessons/count/{courseId} - Should return lesson count")
    void testGetLessonCount() throws Exception {
        // Arrange
        when(lessonService.countLessonsByCourse(101)).thenReturn(5);

        // Act & Assert
        mockMvc.perform(get("/api/v1/lessons/count/101"))
                .andExpect(status().isOk())
                .andExpect(content().string("5"));
    }
}
