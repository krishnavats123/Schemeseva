package com.schemeseva.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsDTO {
    private long totalUsers;
    private long totalSchemes;
    private long activeSchemes;
    private Map<String, Long> topStatesByUsers;
    private Map<String, Long> mostBookmarkedSchemes;
}
