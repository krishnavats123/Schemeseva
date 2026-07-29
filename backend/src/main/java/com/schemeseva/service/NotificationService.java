package com.schemeseva.service;

import com.schemeseva.model.Notification;
import com.schemeseva.model.Scheme;
import com.schemeseva.model.User;
import com.schemeseva.repository.NotificationRepository;
import com.schemeseva.repository.SchemeRepository;
import com.schemeseva.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SchemeRepository schemeRepository;
    private final UserRepository userRepository;
    private final RecommendationService recommendationService;
    private final JavaMailSender mailSender;

    // Run daily at 9am to check for new schemes added in last 24h
    @Scheduled(cron = "0 0 9 * * *")
    public void notifyUsersAboutNewSchemes() {
        log.info("Running daily notification scheduler...");

        LocalDateTime since = LocalDateTime.now().minusDays(1);
        List<Scheme> newSchemes = schemeRepository.findTop10ByActiveTrueOrderByCreatedAtDesc()
                .stream()
                .filter(s -> s.getCreatedAt() != null && s.getCreatedAt().isAfter(since))
                .toList();

        if (newSchemes.isEmpty()) return;

        List<User> users = userRepository.findAll().stream()
                .filter(User::isNotificationsEnabled)
                .toList();

        for (User user : users) {
            for (Scheme scheme : newSchemes) {
                // Check if user is eligible for this new scheme
                List<com.schemeseva.dto.SchemeRecommendationDTO> recs =
                        recommendationService.getRecommendations(user);

                boolean eligible = recs.stream()
                        .anyMatch(r -> r.getId().equals(scheme.getId()));

                if (eligible) {
                    saveNotification(user, scheme);
                    sendEmailNotification(user, scheme);
                }
            }
        }
    }

    private void saveNotification(User user, Scheme scheme) {
        Notification notification = Notification.builder()
                .userId(user.getId())
                .schemeId(scheme.getId())
                .message("You may be eligible for: " + scheme.getSchemeName()
                         + " by " + scheme.getMinistry())
                .read(false)
                .createdAt(LocalDateTime.now())
                .build();
        notificationRepository.save(notification);
    }

    private void sendEmailNotification(User user, Scheme scheme) {
        try {
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setTo(user.getEmail());
            mail.setSubject("New Scheme Alert: " + scheme.getSchemeName());
            mail.setText("Dear " + user.getName() + ",\n\n"
                    + "A new government scheme has been added that you may be eligible for:\n\n"
                    + "Scheme: " + scheme.getSchemeName() + "\n"
                    + "Ministry: " + scheme.getMinistry() + "\n"
                    + "Description: " + scheme.getDescription() + "\n\n"
                    + "Log in to SchemeSeva to check your eligibility and required documents.\n\n"
                    + "Regards,\nSchemeSeva Team");
            mailSender.send(mail);
        } catch (Exception e) {
            log.warn("Failed to send email to {}: {}", user.getEmail(), e.getMessage());
        }
    }

    public List<Notification> getUserNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    public void markAllRead(String userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndReadFalse(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }
}
