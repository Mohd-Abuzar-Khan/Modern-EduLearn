package com.edulearn.course.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import com.edulearn.course.entity.Course;
import com.edulearn.course.repository.CourseRepository;

@DisplayName("CourseServiceImpl Unit Tests")
class CourseServiceImplTest {

    @Mock
    private CourseRepository courseRepository;

    @InjectMocks
    private CourseServiceImpl courseService;

    private Course testCourse;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        testCourse = new Course();
        testCourse.setCourseId(1);
        testCourse.setTitle("Test Course");
        testCourse.setDescription("Test Description");
        testCourse.setInstructorId(101);
        testCourse.setPrice(99.99);
        testCourse.setCategory("Programming");
        testCourse.setLevel("Beginner");
        testCourse.setIsPublished(true);
        testCourse.setApprovalStatus("APPROVED");
    }

    @Test
    @DisplayName("Should create course successfully")
    void testCreateCourseSuccess() {
        // Arrange
        Course newCourse = new Course();
        newCourse.setTitle("New Course");
        newCourse.setInstructorId(101);
        newCourse.setPrice(49.99);

        when(courseRepository.save(any(Course.class))).thenReturn(newCourse);

        // Act
        Course created = courseService.createCourse(newCourse);

        // Assert
        assertNotNull(created);
        assertEquals("New Course", created.getTitle());
        assertEquals("DRAFT", created.getApprovalStatus());
        assertFalse(created.getIsPublished());
        verify(courseRepository, times(1)).save(newCourse);
    }

    @Test
    @DisplayName("Should throw exception when creating course without title")
    void testCreateCourseNoTitle() {
        // Arrange
        Course newCourse = new Course();
        newCourse.setInstructorId(101);

        // Act & Assert
        Exception exception = assertThrows(RuntimeException.class, () -> courseService.createCourse(newCourse));
        assertEquals("Course title is required", exception.getMessage());
    }

    @Test
    @DisplayName("Should throw exception when creating course with negative price")
    void testCreateCourseNegativePrice() {
        // Arrange
        Course newCourse = new Course();
        newCourse.setTitle("Free Course");
        newCourse.setInstructorId(101);
        newCourse.setPrice(-10.0);

        // Act & Assert
        Exception exception = assertThrows(RuntimeException.class, () -> courseService.createCourse(newCourse));
        assertEquals("Course price must be non-negative", exception.getMessage());
    }

    @Test
    @DisplayName("Should get all published courses")
    void testGetAllCourses() {
        // Arrange
        List<Course> courses = new ArrayList<>();
        courses.add(testCourse);
        when(courseRepository.findByIsPublished(true)).thenReturn(courses);

        // Act
        List<Course> result = courseService.getAllCourses();

        // Assert
        assertEquals(1, result.size());
        assertTrue(result.get(0).getIsPublished());
        verify(courseRepository, times(1)).findByIsPublished(true);
    }

    @Test
    @DisplayName("Should get course by ID")
    void testGetCourseById() {
        // Arrange
        when(courseRepository.findById(1)).thenReturn(Optional.of(testCourse));

        // Act
        Optional<Course> result = courseService.getCourseById(1);

        // Assert
        assertTrue(result.isPresent());
        assertEquals(1, result.get().getCourseId());
    }

    @Test
    @DisplayName("Should update course details")
    void testUpdateCourse() {
        // Arrange
        Course updateInfo = new Course();
        updateInfo.setTitle("Updated Title");
        updateInfo.setPrice(149.99);

        when(courseRepository.findById(1)).thenReturn(Optional.of(testCourse));
        when(courseRepository.save(any(Course.class))).thenReturn(testCourse);

        // Act
        Course updated = courseService.updateCourse(1, updateInfo);

        // Assert
        assertEquals("Updated Title", updated.getTitle());
        assertEquals(149.99, updated.getPrice());
        verify(courseRepository, times(1)).save(any(Course.class));
    }

    @Test
    @DisplayName("Should approve course")
    void testApproveCourse() {
        // Arrange
        testCourse.setApprovalStatus("PENDING_APPROVAL");
        testCourse.setIsPublished(false);
        when(courseRepository.findById(1)).thenReturn(Optional.of(testCourse));
        when(courseRepository.save(any(Course.class))).thenReturn(testCourse);

        // Act
        courseService.approveCourse(1);

        // Assert
        assertEquals("APPROVED", testCourse.getApprovalStatus());
        assertTrue(testCourse.getIsPublished());
        assertNull(testCourse.getRejectionReason());
        verify(courseRepository, times(1)).save(testCourse);
    }

    @Test
    @DisplayName("Should reject course with reason")
    void testRejectCourse() {
        // Arrange
        testCourse.setApprovalStatus("PENDING_APPROVAL");
        when(courseRepository.findById(1)).thenReturn(Optional.of(testCourse));
        when(courseRepository.save(any(Course.class))).thenReturn(testCourse);

        // Act
        courseService.rejectCourse(1, "Poor content quality");

        // Assert
        assertEquals("REJECTED", testCourse.getApprovalStatus());
        assertFalse(testCourse.getIsPublished());
        assertEquals("Poor content quality", testCourse.getRejectionReason());
        verify(courseRepository, times(1)).save(testCourse);
    }

    @Test
    @DisplayName("Should search courses by keyword")
    void testSearchCourses() {
        // Arrange
        List<Course> courses = new ArrayList<>();
        courses.add(testCourse);
        when(courseRepository.searchByKeyword("Test")).thenReturn(courses);

        // Act
        List<Course> result = courseService.searchCourses("Test");

        // Assert
        assertEquals(1, result.size());
        assertTrue(result.get(0).getTitle().contains("Test"));
        verify(courseRepository, times(1)).searchByKeyword("Test");
    }

    @Test
    @DisplayName("Should delete course by ID")
    void testDeleteCourse() {
        // Arrange
        when(courseRepository.existsById(1)).thenReturn(true);

        // Act
        courseService.deleteCourse(1);

        // Assert
        verify(courseRepository, times(1)).deleteById(1);
    }

    @Test
    @DisplayName("Should throw exception when deleting non-existent course")
    void testDeleteCourseNotFound() {
        // Arrange
        when(courseRepository.existsById(999)).thenReturn(false);

        // Act & Assert
        assertThrows(RuntimeException.class, () -> courseService.deleteCourse(999));
        verify(courseRepository, never()).deleteById(999);
    }
}
