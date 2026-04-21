package com.edulearn.course.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
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
import com.edulearn.course.entity.Review;
import com.edulearn.course.repository.CourseRepository;
import com.edulearn.course.repository.ReviewRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

@WebMvcTest(ReviewController.class)
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("ReviewController Unit Tests")
class ReviewControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ReviewRepository reviewRepository;

    @MockBean
    private CourseRepository courseRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private Review testReview;
    private Course testCourse;

    @BeforeEach
    void setUp() {
        testReview = new Review();
        testReview.setReviewId(1);
        testReview.setCourseId(1);
        testReview.setStudentId(1);
        testReview.setRating(5);
        testReview.setComment("Great course!");

        testCourse = new Course();
        testCourse.setCourseId(1);
        testCourse.setTitle("Test Course");
    }

    @Test
    @DisplayName("POST /courses/{courseId}/reviews - Should submit review successfully")
    void testSubmitReviewSuccess() throws Exception {
        // Arrange
        when(reviewRepository.findByStudentIdAndCourseId(anyInt(), anyInt())).thenReturn(Optional.empty());
        when(reviewRepository.save(any(Review.class))).thenReturn(testReview);
        when(courseRepository.findById(1)).thenReturn(Optional.of(testCourse));
        when(reviewRepository.findAverageRatingByCourseId(1)).thenReturn(5.0);
        when(reviewRepository.countByCourseId(1)).thenReturn(1L);

        // Act & Assert
        mockMvc.perform(post("/courses/1/reviews")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testReview)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Review submitted successfully"));
    }

    @Test
    @DisplayName("POST /courses/{courseId}/reviews - Should return 409 if already reviewed")
    void testSubmitReviewAlreadyExists() throws Exception {
        // Arrange
        when(reviewRepository.findByStudentIdAndCourseId(anyInt(), anyInt())).thenReturn(Optional.of(testReview));

        // Act & Assert
        mockMvc.perform(post("/courses/1/reviews")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testReview)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("You have already reviewed this course"));
    }

    @Test
    @DisplayName("GET /courses/{courseId}/reviews - Should return course reviews")
    void testGetCourseReviews() throws Exception {
        // Arrange
        List<Review> reviews = new ArrayList<>();
        reviews.add(testReview);
        when(reviewRepository.findByCourseId(1)).thenReturn(reviews);

        // Act & Assert
        mockMvc.perform(get("/courses/1/reviews"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(1));
    }

    @Test
    @DisplayName("GET /courses/{courseId}/rating - Should return average rating")
    void testGetCourseRating() throws Exception {
        // Arrange
        when(reviewRepository.findAverageRatingByCourseId(1)).thenReturn(4.5);
        when(reviewRepository.countByCourseId(1)).thenReturn(10L);

        // Act & Assert
        mockMvc.perform(get("/courses/1/rating"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.averageRating").value(4.5))
                .andExpect(jsonPath("$.ratingCount").value(10));
    }
}
