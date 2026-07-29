package com.schemeseva.service;

import com.schemeseva.dto.SchemeRecommendationDTO;
import com.schemeseva.model.Scheme;
import com.schemeseva.model.User;
import com.schemeseva.model.UserDocument;
import com.schemeseva.repository.SchemeRepository;
import com.schemeseva.repository.UserDocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final SchemeRepository schemeRepository;
    private final UserDocumentRepository userDocumentRepository;

    /**
     * Returns list of eligible schemes sorted by recommendation score (highest first).
     * Scoring weights:
     *   State match        → +40
     *   Occupation match   → +25
     *   Income within limit→ +20
     *   Age within range   → +15
     *
     * Only schemes where ALL hard eligibility criteria are met are included.
     */
    public List<SchemeRecommendationDTO> getRecommendations(User user) {
        List<Scheme> allSchemes = schemeRepository.findByActiveTrue();
        List<UserDocument> userDocs = userDocumentRepository.findByUserId(user.getId());

        Set<String> bookmarked = user.getBookmarkedSchemes() != null
                ? new HashSet<>(user.getBookmarkedSchemes())
                : Collections.emptySet();

        return allSchemes.stream()
                .filter(scheme -> isEligible(scheme, user))
                .map(scheme -> {
                    int score = computeScore(scheme, user);
                    double docPct = computeDocReadiness(scheme, userDocs);
                    double overall = (100.0 + docPct) / 2.0;
                    return SchemeRecommendationDTO.builder()
                            .id(scheme.getId())
                            .schemeName(scheme.getSchemeName())
                            .ministry(scheme.getMinistry())
                            .description(scheme.getDescription())
                            .requiredDocuments(scheme.getRequiredDocuments())
                            .tags(scheme.getTags())
                            .applicationUrl(scheme.getApplicationUrl())
                            .score(score)
                            .bookmarked(bookmarked.contains(scheme.getId()))
                            .docReadinessPct(docPct)
                            .overallReadiness(Math.round(overall * 10.0) / 10.0)
                            .build();
                })
                .sorted(Comparator.comparingInt(SchemeRecommendationDTO::getScore).reversed())
                .collect(Collectors.toList());
    }

    // ── Hard eligibility check ──────────────────────────────────────────────

    private boolean isEligible(Scheme scheme, User user) {
        // Age check
        if (user.getAge() < scheme.getMinAge() || user.getAge() > scheme.getMaxAge()) return false;

        // Income check
        if (scheme.getMaxIncome() > 0 && user.getAnnualIncome() > scheme.getMaxIncome()) return false;

        // Gender check
        if (scheme.getAllowedGenders() != null && !scheme.getAllowedGenders().isEmpty()
                && !scheme.getAllowedGenders().contains(user.getGender())) return false;

        // Caste category check
        if (scheme.getAllowedCategories() != null && !scheme.getAllowedCategories().isEmpty()
                && !scheme.getAllowedCategories().contains(user.getCasteCategory())) return false;

        // Occupation check
        if (scheme.getAllowedOccupations() != null && !scheme.getAllowedOccupations().isEmpty()
                && !scheme.getAllowedOccupations().contains(user.getOccupation())) return false;

        // State check
        if (scheme.getAllowedStates() != null && !scheme.getAllowedStates().isEmpty()
                && !scheme.getAllowedStates().contains(user.getState())) return false;

        // Disability check
        if (scheme.isDisabilityRequired() && !user.isDisabled()) return false;

        return true;
    }

    // ── Scoring engine ──────────────────────────────────────────────

    private int computeScore(Scheme scheme, User user) {
        int score = 0;

        // State match
        if (scheme.getAllowedStates() == null || scheme.getAllowedStates().isEmpty()
                || scheme.getAllowedStates().contains(user.getState())) {
            score += 40;
        }

        // Occupation match
        if (scheme.getAllowedOccupations() == null || scheme.getAllowedOccupations().isEmpty()
                || scheme.getAllowedOccupations().contains(user.getOccupation())) {
            score += 25;
        }

        // Income within limit
        if (scheme.getMaxIncome() == 0 || user.getAnnualIncome() <= scheme.getMaxIncome()) {
            score += 20;
        }

        // Age within range
        if (user.getAge() >= scheme.getMinAge() && user.getAge() <= scheme.getMaxAge()) {
            score += 15;
        }

        return Math.min(score, 100);
    }

    // ── Document readiness ──────────────────────────────────────────────

    private double computeDocReadiness(Scheme scheme, List<UserDocument> allUserDocs) {
        if (scheme.getRequiredDocuments() == null || scheme.getRequiredDocuments().isEmpty()) {
            return 100.0;
        }

        Optional<UserDocument> docRecord = allUserDocs.stream()
                .filter(d -> d.getSchemeId().equals(scheme.getId()))
                .findFirst();

        if (docRecord.isEmpty()) return 0.0;

        Map<String, Boolean> status = docRecord.get().getDocumentStatus();
        if (status == null || status.isEmpty()) return 0.0;

        long ready = scheme.getRequiredDocuments().stream()
                .filter(doc -> Boolean.TRUE.equals(status.get(doc)))
                .count();

        return (double) ready / scheme.getRequiredDocuments().size() * 100.0;
    }
}
