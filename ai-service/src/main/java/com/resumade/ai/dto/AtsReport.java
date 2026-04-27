package com.resumade.ai.dto;

import java.util.List;

public class AtsReport {
    private int score;
    private List<String> missingKeywords;
    private List<String> suggestions;

    public AtsReport() {}

    public AtsReport(int score, List<String> missingKeywords, List<String> suggestions) {
        this.score = score;
        this.missingKeywords = missingKeywords;
        this.suggestions = suggestions;
    }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }

    public List<String> getMissingKeywords() { return missingKeywords; }
    public void setMissingKeywords(List<String> missingKeywords) { this.missingKeywords = missingKeywords; }

    public List<String> getSuggestions() { return suggestions; }
    public void setSuggestions(List<String> suggestions) { this.suggestions = suggestions; }

    public static AtsReportBuilder builder() {
        return new AtsReportBuilder();
    }

    public static class AtsReportBuilder {
        private int score;
        private List<String> missingKeywords;
        private List<String> suggestions;

        public AtsReportBuilder score(int score) { this.score = score; return this; }
        public AtsReportBuilder missingKeywords(List<String> missingKeywords) { this.missingKeywords = missingKeywords; return this; }
        public AtsReportBuilder suggestions(List<String> suggestions) { this.suggestions = suggestions; return this; }
        public AtsReport build() {
            return new AtsReport(score, missingKeywords, suggestions);
        }
    }
}
