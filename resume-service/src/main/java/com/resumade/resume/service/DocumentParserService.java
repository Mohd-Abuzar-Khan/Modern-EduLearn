package com.resumade.resume.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.hwpf.HWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class DocumentParserService {

    public String extractText(MultipartFile file) throws IOException {
        String filename = file.getOriginalFilename();
        if (filename == null) {
            throw new IllegalArgumentException("File has no name.");
        }
        filename = filename.toLowerCase();

        if (filename.endsWith(".pdf")) {
            return extractFromPdf(file);
        } else if (filename.endsWith(".docx")) {
            return extractFromDocx(file);
        } else if (filename.endsWith(".doc")) {
            return extractFromDoc(file);
        }
        throw new IllegalArgumentException("Unsupported file type. Please upload PDF, DOCX, or DOC.");
    }

    private String extractFromPdf(MultipartFile file) throws IOException {
        try (PDDocument doc = Loader.loadPDF(file.getBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(doc);
        }
    }

    private String extractFromDocx(MultipartFile file) throws IOException {
        try (XWPFDocument doc = new XWPFDocument(file.getInputStream())) {
            StringBuilder sb = new StringBuilder();
            doc.getParagraphs().forEach(p -> sb.append(p.getText()).append("\n"));
            return sb.toString();
        }
    }

    private String extractFromDoc(MultipartFile file) throws IOException {
        try (HWPFDocument doc = new HWPFDocument(file.getInputStream())) {
            return doc.getRange().text();
        }
    }
}
