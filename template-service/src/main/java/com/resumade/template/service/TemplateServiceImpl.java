package com.resumade.template.service;

import com.resumade.template.dto.TemplateRequest;
import com.resumade.template.entity.Template;
import com.resumade.template.repository.TemplateRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TemplateServiceImpl implements TemplateService {

    private final TemplateRepository templateRepository;

    public TemplateServiceImpl(TemplateRepository templateRepository) {
        this.templateRepository = templateRepository;
    }

    @Override
    public List<Template> getAllActiveTemplates() {
        return templateRepository.findByIsActiveTrue();
    }

    @Override
    public List<Template> getFreeTemplates() {
        return templateRepository.findByIsActiveTrueAndIsPremiumFalse();
    }

    @Override
    public List<Template> getPremiumTemplates() {
        return templateRepository.findByIsActiveTrueAndIsPremiumTrue();
    }

    @Override
    public List<Template> getTemplatesByCategory(String categoryStr) {
        Template.Category category = Template.Category.valueOf(categoryStr.toUpperCase());
        return templateRepository.findByIsActiveTrueAndCategory(category);
    }

    @Override
    public List<Template> getPopularTemplates() {
        return templateRepository.findByIsActiveTrueOrderByUsageCountDesc();
    }

    @Override
    public Template getTemplateById(Integer id) {
        return templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template not found with id: " + id));
    }

    @Override
    @Transactional
    public Template createTemplate(TemplateRequest request, String role) {
        checkAdminAccess(role);
        Template template = new Template(
                request.getName(),
                request.getDescription(),
                request.getThumbnailUrl(),
                request.getHtmlLayout(),
                request.getCssStyles(),
                request.getCategory(),
                request.getIsPremium()
        );
        
        // Map aesthetic metadata
        template.setColorScheme(request.getColorScheme());
        template.setFontFamily(request.getFontFamily());
        template.setLayout(request.getLayout());
        template.setHasPhoto(request.getHasPhoto() != null ? request.getHasPhoto() : false);
        template.setHasSkillBars(request.getHasSkillBars() != null ? request.getHasSkillBars() : false);
        template.setPreviewData(request.getPreviewData());
        
        return templateRepository.save(template);
    }

    @Override
    @Transactional
    public Template updateTemplate(Integer id, TemplateRequest request, String role) {
        checkAdminAccess(role);
        Template template = getTemplateById(id);
        
        template.setName(request.getName());
        template.setDescription(request.getDescription());
        template.setThumbnailUrl(request.getThumbnailUrl());
        template.setHtmlLayout(request.getHtmlLayout());
        template.setCssStyles(request.getCssStyles());
        
        if (request.getCategory() != null) {
            template.setCategory(request.getCategory());
        }
        if (request.getIsPremium() != null) {
            template.setIsPremium(request.getIsPremium());
        }

        // Update aesthetic metadata
        template.setColorScheme(request.getColorScheme());
        template.setFontFamily(request.getFontFamily());
        template.setLayout(request.getLayout());
        template.setHasPhoto(request.getHasPhoto() != null ? request.getHasPhoto() : template.getHasPhoto());
        template.setHasSkillBars(request.getHasSkillBars() != null ? request.getHasSkillBars() : template.getHasSkillBars());
        template.setPreviewData(request.getPreviewData());

        return templateRepository.save(template);
    }

    @Override
    @Transactional
    public void deactivateTemplate(Integer id, String role) {
        checkAdminAccess(role);
        Template template = getTemplateById(id);
        template.setIsActive(false);
        templateRepository.save(template);
    }

    @Override
    @Transactional
    public void incrementUsage(Integer id) {
        Template template = getTemplateById(id);
        template.setUsageCount(template.getUsageCount() + 1);
        templateRepository.save(template);
    }

    private void checkAdminAccess(String role) {
        if (!"ADMIN".equalsIgnoreCase(role)) {
            throw new RuntimeException("Access Denied: Admin role required");
        }
    }
}
