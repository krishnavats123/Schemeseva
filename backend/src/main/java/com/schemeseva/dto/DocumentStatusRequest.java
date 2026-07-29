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
public class DocumentStatusRequest {
    private String schemeId;
    private Map<String, Boolean> documentStatus;
}
