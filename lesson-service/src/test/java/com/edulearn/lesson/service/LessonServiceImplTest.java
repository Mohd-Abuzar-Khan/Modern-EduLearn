package com.edulearn.lesson.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
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

import com.edulearn.lesson.entity.Lesson;
import com.edulearn.lesson.entity.Resource;
import com.edulearn.lesson.repository.LessonRepository;
import com.edulearn.lesson.repository.ResourceRepository;

@DisplayName("LessonServiceImpl Unit Tests")
class LessonServiceImplTest {

    @Mock
    private LessonRepository lessonRepository;

    @Mock
    private ResourceRepository resourceRepository;

    @InjectMocks
    private LessonServiceImpl lessonService;

    private Lesson testLesson;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        testLesson = new Lesson();
        testLesson.setLessonId(1);
        testLesson.setCourseId(101);
        testLesson.setTitle("Test Lesson");
        testLesson.setDescription("Test Description");
        testLesson.setContentType("VIDEO");
        testLesson.setOrderIndex(1);
        testLesson.setIsPreview(false);
    }

    @Test
    @DisplayName("Should add lesson successfully")
    void testAddLesson() {
        // Arrange
        when(lessonRepository.save(any(Lesson.class))).thenReturn(testLesson);

        // Act
        Lesson result = lessonService.addLesson(testLesson);

        // Assert
        assertNotNull(result);
        assertEquals("Test Lesson", result.getTitle());
        verify(lessonRepository, times(1)).save(testLesson);
    }

    @Test
    @DisplayName("Should get lessons by course ID")
    void testGetLessonsByCourse() {
        // Arrange
        List<Lesson> lessons = new ArrayList<>();
        lessons.add(testLesson);
        when(lessonRepository.findByCourseIdOrderByOrderIndex(101)).thenReturn(lessons);

        // Act
        List<Lesson> result = lessonService.getLessonsByCourse(101);

        // Assert
        assertEquals(1, result.size());
        assertEquals(101, result.get(0).getCourseId());
        verify(lessonRepository, times(1)).findByCourseIdOrderByOrderIndex(101);
    }

    @Test
    @DisplayName("Should get lesson by ID")
    void testGetLessonById() {
        // Arrange
        when(lessonRepository.findById(1)).thenReturn(Optional.of(testLesson));

        // Act
        Lesson result = lessonService.getLessonById(1);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getLessonId());
    }

    @Test
    @DisplayName("Should throw exception when lesson not found")
    void testGetLessonByIdNotFound() {
        // Arrange
        when(lessonRepository.findById(999)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> lessonService.getLessonById(999));
    }

    @Test
    @DisplayName("Should update lesson details")
    void testUpdateLesson() {
        // Arrange
        Lesson updateInfo = new Lesson();
        updateInfo.setTitle("Updated Title");
        updateInfo.setDescription("Updated Description");

        when(lessonRepository.findById(1)).thenReturn(Optional.of(testLesson));
        when(lessonRepository.save(any(Lesson.class))).thenReturn(testLesson);

        // Act
        Lesson result = lessonService.updateLesson(1, updateInfo);

        // Assert
        assertEquals("Updated Title", result.getTitle());
        verify(lessonRepository, times(1)).save(any(Lesson.class));
    }

    @Test
    @DisplayName("Should delete lesson and its resources")
    void testDeleteLesson() {
        // Arrange
        List<Resource> resources = new ArrayList<>();
        when(resourceRepository.findByLessonId(1)).thenReturn(resources);

        // Act
        lessonService.deleteLesson(1);

        // Assert
        verify(resourceRepository, times(1)).deleteAll(resources);
        verify(lessonRepository, times(1)).deleteById(1);
    }

    @Test
    @DisplayName("Should reorder lessons")
    void testReorderLessons() {
        // Arrange
        List<Integer> lessonIds = List.of(1, 2, 3);
        when(lessonRepository.findById(anyInt())).thenReturn(Optional.of(testLesson));

        // Act
        lessonService.reorderLessons(101, lessonIds);

        // Assert
        verify(lessonRepository, times(3)).save(any(Lesson.class));
    }

    @Test
    @DisplayName("Should add resource to lesson")
    void testAddResource() {
        // Arrange
        Resource resource = new Resource();
        resource.setName("Handout");
        when(lessonRepository.findById(1)).thenReturn(Optional.of(testLesson));
        when(resourceRepository.save(any(Resource.class))).thenReturn(resource);

        // Act
        Resource result = lessonService.addResource(1, resource);

        // Assert
        assertNotNull(result);
        assertEquals(1, resource.getLessonId());
        verify(resourceRepository, times(1)).save(resource);
    }

    @Test
    @DisplayName("Should count lessons by course")
    void testCountLessonsByCourse() {
        // Arrange
        when(lessonRepository.countByCourseId(101)).thenReturn(5);

        // Act
        int count = lessonService.countLessonsByCourse(101);

        // Assert
        assertEquals(5, count);
        verify(lessonRepository, times(1)).countByCourseId(101);
    }
}
