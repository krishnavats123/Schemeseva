package com.schemeseva.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SchemeRecommendationDTO {
    private String id;
    private String schemeName;
    private String ministry;
    private String description;
    private List<String> requiredDocuments;
    private List<String> tags;
    private String applicationUrl;
    private int score;
    private boolean bookmarked;
    private double docReadinessPct;
    private double overallReadiness;
}
