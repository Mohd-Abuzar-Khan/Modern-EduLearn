package com.edulearn.course.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.edulearn.course.entity.Course;
import com.edulearn.course.service.CourseService;
import com.fasterxml.jackson.databind.ObjectMapper;

@WebMvcTest(CourseController.class)
@AutoConfigureMockMvc(addFilters = false) // Disable security for unit tests
@DisplayName("CourseController Unit Tests")
class CourseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CourseService courseService;

    @Autowired
    private ObjectMapper objectMapper;

    private Course testCourse;

    @BeforeEach
    void setUp() {
        testCourse = new Course();
        testCourse.setCourseId(1);
        testCourse.setTitle("Test Course");
        testCourse.setDescription("Test Description");
        testCourse.setInstructorId(101);
        testCourse.setPrice(99.99);
        testCourse.setIsPublished(true);
    }

    @Test
    @DisplayName("GET /api/v1/courses - Should return all published courses")
    void testGetAllCourses() throws Exception {
        // Arrange
        List<Course> courses = new ArrayList<>();
        courses.add(testCourse);
        when(courseService.getAllCourses()).thenReturn(courses);

        // Act & Assert
        mockMvc.perform(get("/api/v1/courses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].title").value("Test Course"));
    }

    @Test
    @DisplayName("GET /api/v1/courses/{id} - Should return course by ID")
    void testGetCourseById() throws Exception {
        // Arrange
        when(courseService.getCourseById(1)).thenReturn(Optional.of(testCourse));

        // Act & Assert
        mockMvc.perform(get("/api/v1/courses/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("Test Course"));
    }

    @Test
    @DisplayName("GET /api/v1/courses/{id} - Should return 404 when not found")
    void testGetCourseByIdNotFound() throws Exception {
        // Arrange
        when(courseService.getCourseById(999)).thenReturn(Optional.empty());

        // Act & Assert
        mockMvc.perform(get("/api/v1/courses/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("POST /api/v1/courses - Should create new course")
    void testCreateCourse() throws Exception {
        // Arrange
        when(courseService.createCourse(any(Course.class))).thenReturn(testCourse);

        // Act & Assert
        mockMvc.perform(post("/api/v1/courses")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testCourse)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Course created successfully"));
    }

    @Test
    @DisplayName("GET /api/v1/courses/search - Should return matching courses")
    void testSearchCourses() throws Exception {
        // Arrange
        List<Course> courses = new ArrayList<>();
        courses.add(testCourse);
        when(courseService.searchCourses("Test")).thenReturn(courses);

        // Act & Assert
        mockMvc.perform(get("/api/v1/courses/search").param("keyword", "Test"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].title").value("Test Course"));
    }

    @Test
    @DisplayName("PUT /api/v1/courses/{id} - Should update course")
    void testUpdateCourse() throws Exception {
        // Arrange
        when(courseService.updateCourse(anyInt(), any(Course.class))).thenReturn(testCourse);

        // Act & Assert
        mockMvc.perform(put("/api/v1/courses/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testCourse)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.courseId").value(1));
    }

    @Test
    @DisplayName("PUT /api/v1/courses/{id}/approve - Should approve course")
    void testApproveCourse() throws Exception {
        // Act & Assert
        mockMvc.perform(put("/api/v1/courses/1/approve"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Course approved and published"));
    }

    @Test
    @DisplayName("DELETE /api/v1/courses/{id} - Should delete course")
    void testDeleteCourse() throws Exception {
        // Act & Assert
        mockMvc.perform(delete("/api/v1/courses/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Course deleted successfully"));
    }
}
