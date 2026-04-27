package com.resumade.resume.service;

import com.resumade.resume.dto.ResumeRequest;
import com.resumade.resume.dto.SectionRequest;
import com.resumade.resume.entity.Resume;
import com.resumade.resume.entity.ResumeSection;
import com.resumade.resume.exception.QuotaExceededException;
import com.resumade.resume.exception.ResourceNotFoundException;
import com.resumade.resume.exception.UnauthorizedAccessException;
import com.resumade.resume.repository.ResumeRepository;
import com.resumade.resume.repository.ResumeSectionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ResumeServiceImplTest {

    @Mock
    private ResumeRepository resumeRepository;

    @Mock
    private ResumeSectionRepository sectionRepository;

    @InjectMocks
    private ResumeServiceImpl resumeService;

    private Resume resume;
    private ResumeRequest resumeRequest;

    @BeforeEach
    void setUp() {
        resume = new Resume(1, "My Resume", "Software Engineer", 1);
        resume.setResumeId(101);

        resumeRequest = new ResumeRequest();
        resumeRequest.setTitle("Updated Resume");
        resumeRequest.setTargetJobTitle("Senior Engineer");
        resumeRequest.setTemplateId(2);
    }

    @Test
    void createResume_Success() {
        when(resumeRepository.save(any(Resume.class))).thenReturn(resume);
        Resume created = resumeService.createResume(1, "FREE", resumeRequest);
        assertNotNull(created);
        assertEquals("My Resume", created.getTitle());
    }

    @Test
    void createResume_QuotaExceeded_ThrowsException() {
        when(resumeRepository.countByUserId(1)).thenReturn(3L);
        assertThrows(QuotaExceededException.class, () -> resumeService.createResume(1, "FREE", resumeRequest));
    }

    @Test
    void getResumeById_Owner_Success() {
        when(resumeRepository.findById(101)).thenReturn(Optional.of(resume));
        Resume found = resumeService.getResumeById(101, 1);
        assertEquals(101, found.getResumeId());
    }

    @Test
    void getResumeById_Public_IncrementsView() {
        resume.setIsPublic(true);
        resume.setUserId(2); // Different user
        when(resumeRepository.findById(101)).thenReturn(Optional.of(resume));

        Resume found = resumeService.getResumeById(101, 1);

        assertEquals(1, found.getViewCount());
        verify(resumeRepository).save(resume);
    }

    @Test
    void getResumeById_PrivateOtherUser_ThrowsException() {
        resume.setIsPublic(false);
        resume.setUserId(2);
        when(resumeRepository.findById(101)).thenReturn(Optional.of(resume));

        assertThrows(UnauthorizedAccessException.class, () -> resumeService.getResumeById(101, 1));
    }

    @Test
    void updateResume_Success() {
        when(resumeRepository.findById(101)).thenReturn(Optional.of(resume));
        when(resumeRepository.save(any(Resume.class))).thenReturn(resume);

        Resume updated = resumeService.updateResume(101, 1, resumeRequest);

        assertEquals("Updated Resume", updated.getTitle());
        verify(resumeRepository).save(resume);
    }

    @Test
    void duplicateResume_Success() {
        when(resumeRepository.findById(101)).thenReturn(Optional.of(resume));
        when(resumeRepository.save(any(Resume.class))).thenAnswer(invocation -> {
            Resume r = invocation.getArgument(0);
            if (r.getResumeId() == null) r.setResumeId(102);
            return r;
        });
        when(resumeRepository.findById(102)).thenReturn(Optional.of(new Resume(1, "My Resume (Copy)", "Software Engineer", 1)));

        Resume copy = resumeService.duplicateResume(101, 1, "PREMIUM");

        assertNotNull(copy);
        verify(resumeRepository, atLeastOnce()).save(any(Resume.class));
    }

    @Test
    void addSection_Success() {
        SectionRequest sectionRequest = new SectionRequest();
        sectionRequest.setSectionType(ResumeSection.SectionType.EXPERIENCE);
        sectionRequest.setTitle("Work History");

        when(resumeRepository.findById(101)).thenReturn(Optional.of(resume));
        when(sectionRepository.save(any(ResumeSection.class))).thenAnswer(i -> i.getArgument(0));

        ResumeSection section = resumeService.addSection(101, 1, sectionRequest);

        assertNotNull(section);
        assertEquals("Work History", section.getTitle());
    }

    @Test
    void updateSection_Success() {
        ResumeSection section = new ResumeSection(resume, ResumeSection.SectionType.EXPERIENCE, "Old", "Content", 1);
        when(sectionRepository.findById(1)).thenReturn(Optional.of(section));
        when(sectionRepository.save(any(ResumeSection.class))).thenReturn(section);

        SectionRequest req = new SectionRequest();
        req.setTitle("New Title");

        ResumeSection updated = resumeService.updateSection(1, 1, req);

        assertEquals("New Title", updated.getTitle());
    }

    @Test
    void deleteSection_Unauthorized_ThrowsException() {
        ResumeSection section = new ResumeSection(resume, ResumeSection.SectionType.EXPERIENCE, "Title", "Content", 1);
        when(sectionRepository.findById(1)).thenReturn(Optional.of(section));

        assertThrows(UnauthorizedAccessException.class, () -> resumeService.deleteSection(1, 2));
    }
}
