package com.resumade.export.service;

import com.resumade.export.dto.ExportJobMessage;
import com.resumade.export.entity.ExportJob;
import com.resumade.export.repository.ExportRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExportServiceImplTest {

    @Mock
    private ExportRepository repository;

    @Mock
    private RabbitTemplate rabbitTemplate;

    @InjectMocks
    private ExportServiceImpl exportService;

    private UUID jobId;
    private ExportJob job;

    @BeforeEach
    void setUp() {
        jobId = UUID.randomUUID();
        job = new ExportJob(101, 1, ExportJob.ExportFormat.PDF, ExportJob.ExportStatus.QUEUED);
        job.setJobId(jobId);

        ReflectionTestUtils.setField(exportService, "exchange", "test-exchange");
        ReflectionTestUtils.setField(exportService, "routingKey", "test-key");
    }

    @Test
    void createExportJob_Success() {
        when(repository.countByUserIdToday(anyInt(), any())).thenReturn(5L);
        when(repository.save(any(ExportJob.class))).thenReturn(job);

        ExportJob created = exportService.createExportJob(1, 101, ExportJob.ExportFormat.PDF);

        assertNotNull(created);
        verify(rabbitTemplate).convertAndSend(eq("test-exchange"), eq("test-key"), any(ExportJobMessage.class));
        verify(repository).save(any(ExportJob.class));
    }

    @Test
    void createExportJob_RateLimitReached_ThrowsException() {
        when(repository.countByUserIdToday(anyInt(), any())).thenReturn(10L);

        assertThrows(RuntimeException.class, () -> exportService.createExportJob(1, 101, ExportJob.ExportFormat.PDF));
    }

    @Test
    void getJobStatus_Success() {
        when(repository.findById(jobId)).thenReturn(Optional.of(job));
        ExportJob found = exportService.getJobStatus(jobId);
        assertEquals(jobId, found.getJobId());
    }

    @Test
    void processExport_CompletesJob() {
        when(repository.findById(jobId)).thenReturn(Optional.of(job));

        exportService.processExport(jobId);

        assertEquals(ExportJob.ExportStatus.COMPLETED, job.getStatus());
        assertNotNull(job.getFileUrl());
        verify(repository, atLeast(2)).save(job);
    }

    @Test
    void processExport_HandlesJobNotFound() {
        when(repository.findById(jobId)).thenReturn(Optional.empty());
        exportService.processExport(jobId);
        verify(repository, never()).save(any());
    }
}
